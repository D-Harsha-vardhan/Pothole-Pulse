const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory data store for the prototype
let clusters = [];
let totalReports = 0;

// Hardcoded API Key for hackathon demo per requirement
const NVIDIA_NIM_API_KEY = "53FM9Sc31FDoOgbV2rnt9LrbsEVl5g_JTBCSmxr_M_8vZ32oF8lB40gei6JV5npG";

// Haversine formula to calculate distance in meters
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radius of the earth in m
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
}

// Get severity string based on score
function getSeverityLevel(score) {
  if (score >= 90) return 'Critical';
  if (score >= 70) return 'Large';
  if (score >= 40) return 'Medium';
  return 'Small';
}

// POST endpoint for AI Photo Analysis Proxy
app.post('/analyze-photo', async (req, res) => {
  const { photo, location_hint, saved_name } = req.body;
  if (!photo) return res.status(400).json({ error: 'Photo is required' });

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_NIM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta/llama-3.2-11b-vision-instruct",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Analyze this image of a road hazard located at ${location_hint || 'the location in the image'}.
Please provide a JSON response (without markdown code blocks) with the following exact keys:
- "hazard_type": A short 1-3 word description of the hazard (e.g., "Deep Pothole", "Cracked Pavement").
- "severity_bucket": Must be exactly one of: "Small", "Medium", "Large", "Critical".
- "severity_reason": A one-line justification for the severity rating based on what you see.
- "drafted_complaint": A formal drafted complaint paragraph to the Civic Authority requesting repairs. Sign the complaint off as ${saved_name || 'A Concerned Citizen'}.` 
              },
              { type: "image_url", image_url: { url: photo } }
            ]
          }
        ],
        max_tokens: 512,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      console.error("NVIDIA API returned status:", response.status);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Attempt to parse the JSON output from the model
    try {
        // Strip markdown if the model hallucinated it
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(content);
        return res.json(parsed);
    } catch (parseError) {
        console.error("Failed to parse VLM JSON output", content);
        // Fallback response if JSON parsing fails
        return res.json({
            hazard_type: "Road Hazard",
            severity_bucket: "Medium",
            severity_reason: "Model analysis succeeded but failed structured parsing.",
            drafted_complaint: content
        });
    }

  } catch (err) {
    console.error("Error analyzing photo:", err);
    res.status(500).json({ error: 'Failed to analyze photo' });
  }
});

// POST endpoint for Android app to report a pothole
app.post('/api/reports', (req, res) => {
  console.log('RECEIVED BODY thumbnailUrl length:', req.body.thumbnailUrl ? req.body.thumbnailUrl.length : 'NONE');
  const { lat, lng, severity, label, thumbnailUrl, complaint, locationName, reporter } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

  totalReports++;

  // Find existing cluster within 20 meters
  let foundCluster = null;
  for (let cluster of clusters) {
    const dist = getDistanceFromLatLonInM(lat, lng, cluster.lat, cluster.lng);
    if (dist <= 20) {
      foundCluster = cluster;
      break;
    }
  }

  if (foundCluster) {
    // Update existing cluster
    foundCluster.reportCount++;
    // Keep the highest severity
    if (severity > foundCluster.maxSeverity) {
      foundCluster.maxSeverity = severity;
      foundCluster.severityLevel = getSeverityLevel(severity);
    }
    foundCluster.lastUpdated = new Date().toISOString();
  } else {
    // Create new cluster
    const pipelineStatuses = ['Draft', 'Sent', 'Acknowledged', 'Fixed'];
    
    

    const newCluster = {
      id: Date.now().toString(),
      lat,
      lng,
      label: label || 'Pothole',
      reportCount: 1,
      maxSeverity: severity || 50,
      severityLevel: getSeverityLevel(severity || 50),
      status: 'Submitted',
      locationName: locationName || 'Unknown Location',
      thumbnailUrl: thumbnailUrl || '',
      complaint: complaint || '',
      reporter: reporter || '',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    clusters.unshift(newCluster); // Add to beginning
  }

  // Broadcast to all connected web clients
  io.emit('reports_update', {
    totalReports,
    clusters
  });

  res.json({ success: true, clusterId: foundCluster ? foundCluster.id : clusters[0].id });
});

// GET endpoint to fetch initial state
app.get('/api/reports', (req, res) => {
  res.json({
    totalReports,
    clusters
  });
});

// DELETE endpoint to clear all data
app.delete('/api/reports', (req, res) => {
  clusters = [];
  totalReports = 0;
  // Broadcast the empty state to all clients
  io.emit('reports_update', { totalReports, clusters });
  res.json({ success: true, message: 'All data deleted' });
});

// DELETE single report by ID
app.delete('/api/reports/:id', (req, res) => {
  const id = req.params.id;
  const idx = clusters.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Report not found' });
  clusters.splice(idx, 1);
  totalReports = Math.max(0, totalReports - 1);
  io.emit('reports_update', { totalReports, clusters });
  res.json({ success: true, message: 'Report deleted' });
});

// GET export endpoint
app.get('/api/reports/export', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename=pothole_pulse_data.json');
  res.setHeader('Content-Type', 'application/json');
  res.json({
    exportDate: new Date().toISOString(),
    totalReports,
    reports: clusters.map(c => ({
      id: c.id,
      latitude: c.lat,
      longitude: c.lng,
      label: c.label,
      severityLevel: c.severityLevel,
      status: c.status,
      locationName: c.locationName,
      complaint: c.complaint,
      reporter: c.reporter,
      createdAt: c.createdAt,
      lastUpdated: c.lastUpdated,
      reportCount: c.reportCount
    }))
  });
});

io.on('connection', (socket) => {
  console.log('A dashboard client connected');
  // Send initial data to the new client
  socket.emit('reports_update', {
    totalReports,
    clusters
  });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Pothole backend listening on port ${PORT}`);
});
