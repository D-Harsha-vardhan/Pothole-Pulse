import { useState, useEffect } from 'react';
import Login from './components/Login';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issues in React
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const socket = io('http://10.53.105.17:3000'); // Update with backend IP if needed

const translations: any = {
  English: {
    // Profile
    settingsTitle: "Settings & Profile", name: "Name", location: "Location",
    shareData: "Share Anonymous Data", shareDataDesc: "Help civic authorities by sharing generic telemetry.",
    nearbyAlerts: "Nearby Hazard Alerts", nearbyAlertsDesc: "Get notified of potholes in your path.",
    sensitivity: "Detection Sensitivity", sensitivityDesc: "How aggressive the IMU triggers Drive Mode camera.",
    language: "Language", advSettings: "Advanced Settings", modelPref: "Model Preference",
    captureTitle: "Capture & Diagnostics", debugMode: "Debug mode: keep the drive video after analysing it",
    debugDesc: "Retain full drive video for offline benchmarking", recordLocal: "Record local video during a drive (no audio; off by default)",
    recordDesc: "Record local background video clip during drive sweeps", saveFrames: "Save every analysed frame to the device",
    saveFramesDesc: "Cache inspected defect images in device storage", datasetTitle: "Dataset & Storage",
    reviewFrames: "Review and label frames", exportData: "Export labelled dataset",
    deleteData: "Delete all app data", privacy: "Privacy policy", sources: "Data sources and limits",
    back: "Back", save: "Save",
    // App Wide
    liveDetection: "Live Detection", liveScanner: "LIVE SCANNER", ready: "READY",
    driveModeTitle: "Drive Mode", driveModeDesc: "Auto-detect road damage continuously",
    manualReport: "MANUAL REPORT", manualModeTitle: "Manual Mode", manualModeDesc: "Upload an existing photo to report",
    services: "Services", reportsTitle: "Reports", submittedLabel: "submitted",
    mapTitle: "Map", hazardsLabel: "hazards", settingsTitleSmall: "Settings", rewardsTitle: "Rewards",
    recentReports: "Recent Reports", noReports: "No reports yet.", startDriveMode: "Start Drive Mode to detect road damage.",
    yourReports: "Your reports", totalReports: "Total Reports", submitted: "Submitted", underReview: "Under Review", unrouted: "Unrouted",
    activeCoverage: "Active Coverage", events: "Events", mappedRegion: "mapped in this region",
    addLocation: "Add Location", reviewReport: "Review Report", sent: "Sent", locLandmark: "Location / Landmark",
    locPlaceholder: "e.g. Mg Road near Metro", proceedToAnalysis: "Proceed to Analysis", aiAnalyzing: "AI Vision is analyzing the image...",
    severityLabel: "Severity", aiGenComplaint: "AI Generated Complaint", regenerate: "Regenerate",
    saveDraft: "Save draft", sendReport: "Send report", reportSent: "Report Sent!",
    complaintDispatched: "Your complaint has been dispatched via share sheet.", close: "Close"
  },
  Telugu: {
    // Profile
    settingsTitle: "సెట్టింగులు & ప్రొఫైల్", name: "పేరు", location: "స్థానం",
    shareData: "అనామక డేటాను భాగస్వామ్యం చేయండి", shareDataDesc: "సాధారణ టెలిమెట్రీని పంచుకోవడం ద్వారా పౌర అధికారులకు సహాయం చేయండి.",
    nearbyAlerts: "సమీప ప్రమాద హెచ్చరికలు", nearbyAlertsDesc: "మీ మార్గంలో గుంతల గురించి తెలియజేయండి.",
    sensitivity: "గుర్తింపు సున్నితత్వం", sensitivityDesc: "IMU ఎంత తీవ్రంగా డ్రైవ్ మోడ్ కెమెరాను ప్రేరేపిస్తుంది.",
    language: "భాష", advSettings: "అధునాతన సెట్టింగ్‌లు", modelPref: "మోడల్ ప్రాధాన్యత",
    captureTitle: "క్యాప్చర్ & డయాగ్నోస్టిక్స్", debugMode: "డీబగ్ మోడ్: విశ్లేషించిన తర్వాత డ్రైవ్ వీడియోను ఉంచండి",
    debugDesc: "ఆఫ్‌లైన్ బెంచ్‌మార్కింగ్ కోసం పూర్తి డ్రైవ్ వీడియోను ఉంచండి", recordLocal: "డ్రైవ్ సమయంలో స్థానిక వీడియోను రికార్డ్ చేయండి",
    recordDesc: "డ్రైవ్ స్వీప్‌ల సమయంలో స్థానిక నేపథ్య వీడియో క్లిప్‌ను రికార్డ్ చేయండి", saveFrames: "ప్రతి విశ్లేషించిన ఫ్రేమ్‌ను పరికరంలో సేవ్ చేయండి",
    saveFramesDesc: "పరికర నిల్వలో తనిఖీ చేయబడిన లోపం చిత్రాలను కాష్ చేయండి", datasetTitle: "డేటాసెట్ & నిల్వ",
    reviewFrames: "ఫ్రేమ్‌లను సమీక్షించండి మరియు లేబుల్ చేయండి", exportData: "లేబుల్ చేయబడిన డేటాసెట్‌ను ఎగుమతి చేయండి",
    deleteData: "అన్ని యాప్ డేటాను తొలగించండి", privacy: "గోప్యతా విధానం", sources: "డేటా మూలాలు మరియు పరిమితులు",
    back: "వెనుకకు", save: "సేవ్ చేయండి",
    // App Wide
    liveDetection: "లైవ్ డిటెక్షన్", liveScanner: "లైవ్ స్కానర్", ready: "సిద్ధంగా ఉంది",
    driveModeTitle: "డ్రైవ్ మోడ్", driveModeDesc: "రహదారి నష్టాన్ని నిరంతరం స్వయంచాలకంగా గుర్తించండి",
    manualReport: "మాన్యువల్ నివేదిక", manualModeTitle: "మాన్యువల్ మోడ్", manualModeDesc: "నివేదించడానికి ఫోటోను అప్‌లోడ్ చేయండి",
    services: "సేవలు", reportsTitle: "నివేదికలు", submittedLabel: "సమర్పించబడింది",
    mapTitle: "మ్యాప్", hazardsLabel: "ప్రమాదాలు", settingsTitleSmall: "సెట్టింగ్‌లు", rewardsTitle: "బహుమతులు",
    recentReports: "ఇటీవలి నివేదికలు", noReports: "ఇంకా నివేదికలు లేవు.", startDriveMode: "రహదారి నష్టాన్ని గుర్తించడానికి డ్రైవ్ మోడ్‌ను ప్రారంభించండి.",
    yourReports: "మీ నివేదికలు", totalReports: "మొత్తం నివేదికలు", submitted: "సమర్పించబడింది", underReview: "సమీక్షలో ఉంది", unrouted: "అన్‌రూట్ చేయబడింది",
    activeCoverage: "క్రియాశీల కవరేజ్", events: "ఈవెంట్స్", mappedRegion: "ఈ ప్రాంతంలో మ్యాప్ చేయబడింది",
    addLocation: "స్థానాన్ని జోడించండి", reviewReport: "నివేదికను సమీక్షించండి", sent: "పంపబడింది", locLandmark: "స్థానం / ల్యాండ్‌మార్క్",
    locPlaceholder: "ఉదా. మెట్రో దగ్గర MG రోడ్", proceedToAnalysis: "విశ్లేషణకు వెళ్లండి", aiAnalyzing: "AI విజన్ చిత్రాన్ని విశ్లేషిస్తోంది...",
    severityLabel: "తీవ్రత", aiGenComplaint: "AI రూపొందించిన ఫిర్యాదు", regenerate: "పునరుత్పత్తి",
    saveDraft: "డ్రాఫ్ట్ సేవ్ చేయండి", sendReport: "నివేదిక పంపండి", reportSent: "నివేదిక పంపబడింది!",
    complaintDispatched: "మీ ఫిర్యాదు షేర్ షీట్ ద్వారా పంపబడింది.", close: "మూసివేయి"
  },
  Hindi: {
    // Profile
    settingsTitle: "सेटिंग्स और प्रोफाइल", name: "नाम", location: "स्थान",
    shareData: "अनाम डेटा साझा करें", shareDataDesc: "सामान्य टेलीमेट्री साझा करके नागरिक अधिकारियों की मदद करें।",
    nearbyAlerts: "आसपास के खतरे की चेतावनी", nearbyAlertsDesc: "अपने रास्ते में गड्ढों के बारे में सूचित करें।",
    sensitivity: "पहचान संवेदनशीलता", sensitivityDesc: "IMU ड्राइव मोड कैमरा को कितनी आक्रामकता से ट्रिगर करता है।",
    language: "भाषा", advSettings: "उन्नत सेटिंग्स", modelPref: "मॉडल प्राथमिकता",
    captureTitle: "कैप्चर और डायग्नोस्टिक्स", debugMode: "डिबग मोड: विश्लेषण के बाद ड्राइव वीडियो रखें",
    debugDesc: "ऑफ़लाइन बेंचमार्किंग के लिए पूर्ण ड्राइव वीडियो रखें", recordLocal: "ड्राइव के दौरान स्थानीय वीडियो रिकॉर्ड करें",
    recordDesc: "ड्राइव स्वीप के दौरान स्थानीय पृष्ठभूमि वीडियो क्लिप रिकॉर्ड करें", saveFrames: "प्रत्येक विश्लेषण किए गए फ्रेम को डिवाइस में सहेजें",
    saveFramesDesc: "डिवाइस स्टोरेज में निरीक्षण किए गए दोष छवियों को कैश करें", datasetTitle: "डेटासेट और स्टोरेज",
    reviewFrames: "फ़्रेम की समीक्षा करें और लेबल करें", exportData: "लेबल किए गए डेटासेट को निर्यात करें",
    deleteData: "सभी ऐप डेटा हटाएं", privacy: "गोपनीयता नीति", sources: "डेटा स्रोत और सीमाएं",
    back: "पीछे", save: "सहेजें",
    // App Wide
    liveDetection: "लाइव डिटेक्शन", liveScanner: "लाइव स्कैनर", ready: "तैयार",
    driveModeTitle: "ड्राइव मोड", driveModeDesc: "सड़क की क्षति का निरंतर पता लगाएं",
    manualReport: "मैन्युअल रिपोर्ट", manualModeTitle: "मैनुअल मोड", manualModeDesc: "रिपोर्ट करने के लिए फ़ोटो अपलोड करें",
    services: "सेवाएं", reportsTitle: "रिपोर्ट्स", submittedLabel: "जमा किया गया",
    mapTitle: "नक्शा", hazardsLabel: "खतरे", settingsTitleSmall: "सेटिंग्स", rewardsTitle: "पुरस्कार",
    recentReports: "हाल की रिपोर्टें", noReports: "अभी तक कोई रिपोर्ट नहीं।", startDriveMode: "सड़क के नुकसान का पता लगाने के लिए ड्राइव मोड शुरू करें।",
    yourReports: "आपकी रिपोर्टें", totalReports: "कुल रिपोर्ट", submitted: "जमा किया गया", underReview: "समीक्षाधीन", unrouted: "अन-रूट किया गया",
    activeCoverage: "सक्रिय कवरेज", events: "घटनाएँ", mappedRegion: "इस क्षेत्र में मैप किया गया",
    addLocation: "स्थान जोड़ें", reviewReport: "रिपोर्ट की समीक्षा करें", sent: "भेजा गया", locLandmark: "स्थान / लैंडमार्क",
    locPlaceholder: "उदा. मेट्रो के पास एमजी रोड", proceedToAnalysis: "विश्लेषण के लिए आगे बढ़ें", aiAnalyzing: "AI विजन छवि का विश्लेषण कर रहा है...",
    severityLabel: "गंभीरता", aiGenComplaint: "AI जेनरेट की गई शिकायत", regenerate: "पुनर्जीवित",
    saveDraft: "ड्राफ्ट सहेजें", sendReport: "रिपोर्ट भेजें", reportSent: "रिपोर्ट भेजी गई!",
    complaintDispatched: "आपकी शिकायत शेयर शीट के माध्यम से भेज दी गई है।", close: "बंद करें"
  },
  Kannada: {
    // Profile
    settingsTitle: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಮತ್ತು ಪ್ರೊಫೈಲ್", name: "ಹೆಸರು", location: "ಸ್ಥಳ",
    shareData: "ಅನಾಮಧೇಯ ಡೇಟಾವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ", shareDataDesc: "ಸಾಮಾನ್ಯ ಟೆಲಿಮೆಟ್ರಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳುವ ಮೂಲಕ ನಾಗರಿಕ ಅಧಿಕಾರಿಗಳಿಗೆ ಸಹಾಯ ಮಾಡಿ.",
    nearbyAlerts: "ಹತ್ತಿರದ ಅಪಾಯದ ಎಚ್ಚರಿಕೆಗಳು", nearbyAlertsDesc: "ನಿಮ್ಮ ಹಾದಿಯಲ್ಲಿರುವ ಗುಂಡಿಗಳ ಬಗ್ಗೆ ಸೂಚನೆ ಪಡೆಯಿರಿ.",
    sensitivity: "ಪತ್ತೆ ಸಂವೇದನೆ", sensitivityDesc: "IMU ಡ್ರೈವ್ ಮೋಡ್ ಕ್ಯಾಮೆರಾವನ್ನು ಎಷ್ಟು ಆಕ್ರಮಣಕಾರಿಯಾಗಿ ಪ್ರಚೋದಿಸುತ್ತದೆ.",
    language: "ಭಾಷೆ", advSettings: "ಸುಧಾರಿತ ಸೆಟ್ಟಿಂಗ್‌ಗಳು", modelPref: "ಮಾದರಿ ಆದ್ಯತೆ",
    captureTitle: "ಕ್ಯಾಪ್ಚರ್ ಮತ್ತು ಡಯಾಗ್ನೋಸ್ಟಿಕ್ಸ್", debugMode: "ಡಿಬಗ್ ಮೋಡ್: ವಿಶ್ಲೇಷಿಸಿದ ನಂತರ ಡ್ರೈವ್ ವೀಡಿಯೊವನ್ನು ಇರಿಸಿ",
    debugDesc: "ಆಫ್‌ಲೈನ್ ಬೆಂಚ್‌ಮಾರ್ಕಿಂಗ್‌ಗಾಗಿ ಪೂರ್ಣ ಡ್ರೈವ್ ವೀಡಿಯೊವನ್ನು ಇರಿಸಿ", recordLocal: "ಡ್ರೈವ್ ಸಮಯದಲ್ಲಿ ಸ್ಥಳೀಯ ವೀಡಿಯೊವನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಿ",
    recordDesc: "ಡ್ರೈವ್ ಸ್ವೀಪ್‌ಗಳ ಸಮಯದಲ್ಲಿ ಸ್ಥಳೀಯ ಹಿನ್ನೆಲೆ ವೀಡಿಯೊ ಕ್ಲಿಪ್ ಅನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಿ", saveFrames: "ಪ್ರತಿ ವಿಶ್ಲೇಷಿಸಿದ ಫ್ರೇಮ್ ಅನ್ನು ಸಾಧನಕ್ಕೆ ಉಳಿಸಿ",
    saveFramesDesc: "ಸಾಧನದ ಸಂಗ್ರಹಣೆಯಲ್ಲಿ ಪರಿಶೀಲಿಸಿದ ದೋಷದ ಚಿತ್ರಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ", datasetTitle: "ಡೇಟಾಸೆಟ್ ಮತ್ತು ಸಂಗ್ರಹಣೆ",
    reviewFrames: "ಫ್ರೇಮ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಲೇಬಲ್ ಮಾಡಿ", exportData: "ಲೇಬಲ್ ಮಾಡಲಾದ ಡೇಟಾಸೆಟ್ ಅನ್ನು ರಫ್ತು ಮಾಡಿ",
    deleteData: "ಎಲ್ಲಾ ಅಪ್ಲಿಕೇಶನ್ ಡೇಟಾವನ್ನು ಅಳಿಸಿ", privacy: "ಗೌಪ್ಯತಾ ನೀತಿ", sources: "ಡೇಟಾ ಮೂಲಗಳು ಮತ್ತು ಮಿತಿಗಳು",
    back: "ಹಿಂದೆ", save: "ಉಳಿಸಿ",
    // App Wide
    liveDetection: "ಲೈವ್ ಪತ್ತೆ", liveScanner: "ಲೈವ್ ಸ್ಕ್ಯಾನರ್", ready: "ಸಿದ್ಧವಾಗಿದೆ",
    driveModeTitle: "ಡ್ರೈವ್ ಮೋಡ್", driveModeDesc: "ರಸ್ತೆ ಹಾನಿಯನ್ನು ನಿರಂತರವಾಗಿ ಪತ್ತೆಹಚ್ಚಿ",
    manualReport: "ಹಸ್ತಚಾಲಿತ ವರದಿ", manualModeTitle: "ಹಸ್ತಚಾಲಿತ ಮೋಡ್", manualModeDesc: "ವರದಿ ಮಾಡಲು ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ",
    services: "ಸೇವೆಗಳು", reportsTitle: "ವರದಿಗಳು", submittedLabel: "ಸಲ್ಲಿಸಲಾಗಿದೆ",
    mapTitle: "ನಕ್ಷೆ", hazardsLabel: "ಅಪಾಯಗಳು", settingsTitleSmall: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", rewardsTitle: "ಬಹುಮಾನಗಳು",
    recentReports: "ಇತ್ತೀಚಿನ ವರದಿಗಳು", noReports: "ಇನ್ನೂ ಯಾವುದೇ ವರದಿಗಳಿಲ್ಲ.", startDriveMode: "ರಸ್ತೆ ಹಾನಿಯನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಡ್ರೈವ್ ಮೋಡ್ ಪ್ರಾರಂಭಿಸಿ.",
    yourReports: "ನಿಮ್ಮ ವರದಿಗಳು", totalReports: "ಒಟ್ಟು ವರದಿಗಳು", submitted: "ಸಲ್ಲಿಸಲಾಗಿದೆ", underReview: "ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ", unrouted: "ಮಾರ್ಗವಿಲ್ಲದ",
    activeCoverage: "ಸಕ್ರಿಯ ಕವರೇಜ್", events: "ಈವೆಂಟ್‌ಗಳು", mappedRegion: "ಈ ಪ್ರದೇಶದಲ್ಲಿ ಮ್ಯಾಪ್ ಮಾಡಲಾಗಿದೆ",
    addLocation: "ಸ್ಥಳವನ್ನು ಸೇರಿಸಿ", reviewReport: "ವರದಿಯನ್ನು ಪರಿಶೀಲಿಸಿ", sent: "ಕಳುಹಿಸಲಾಗಿದೆ", locLandmark: "ಸ್ಥಳ / ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್",
    locPlaceholder: "ಉದಾ. ಮೆಟ್ರೋ ಬಳಿ ಎಂಜಿ ರಸ್ತೆ", proceedToAnalysis: "ವಿಶ್ಲೇಷಣೆಗೆ ಮುಂದುವರಿಯಿರಿ", aiAnalyzing: "AI ದೃಷ್ಟಿ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
    severityLabel: "ತೀವ್ರತೆ", aiGenComplaint: "AI ರಚಿಸಿದ ದೂರು", regenerate: "ಪುನರುತ್ಪಾದಿಸಿ",
    saveDraft: "ಕರಡು ಉಳಿಸಿ", sendReport: "ವರದಿ ಕಳುಹಿಸಿ", reportSent: "ವರದಿ ಕಳುಹಿಸಲಾಗಿದೆ!",
    complaintDispatched: "ನಿಮ್ಮ ದೂರನ್ನು ಶೇರ್ ಶೀಟ್ ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ.", close: "ಮುಚ್ಚಿ"
  }
};

// Map auto-center component
const MapBounds = ({ clusters }: { clusters: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (clusters.length > 0) {
      const bounds = L.latLngBounds(clusters.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [clusters, map]);
  return null;
};

// Map marker color logic
const createCustomIcon = (severity: string) => {
  let color = '#3b82f6'; // default blue
  if (severity === 'Critical') color = '#ef4444'; // red
  else if (severity === 'Large') color = '#f97316'; // orange
  else if (severity === 'Medium') color = '#eab308'; // amber
  else if (severity === 'Small') color = '#22c55e'; // green

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};


const ReportCard = ({ cluster, onClick }: { cluster: any, onClick?: () => void }) => {
  const statusClass = `status-${cluster.status?.toLowerCase().replace(' ', '-') || 'draft'}`;
  const sevClass = `sev-${cluster.severityLevel?.toLowerCase() || 'medium'}`;
  return (
    <div className="list-card v-press" onClick={onClick} style={{display:'flex', gap:'12px', padding:'16px', borderRadius:'16px', border:'1px solid #e2e8f0', background:'var(--card)', cursor:'pointer'}}>
      <div style={{flexShrink:0}}>
        {cluster.thumbnailUrl ? (
           <img src={cluster.thumbnailUrl} alt="Report" style={{width:'80px', height:'80px', objectFit:'cover', borderRadius:'12px'}} />
        ) : (
           <div style={{width:'80px', height:'80px', background:'#f1f5f9', borderRadius:'12px'}}></div>
        )}
      </div>
      <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', overflow:'hidden'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px'}}>
          <div style={{fontSize:'15px', fontWeight:700, color:'var(--text-main)', lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{cluster.label || 'Road Issue'}</div>
          <div className={`status-badge ${statusClass}`} style={{fontSize:'11px', padding:'4px 8px', textTransform:'capitalize', flexShrink:0}}>{cluster.status || 'Submitted'}</div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:'4px', marginTop:'8px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'6px', color:'var(--text-mut)', fontSize:'12px'}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1}}>{cluster.locationName || `${cluster.lat.toFixed(4)}, ${cluster.lng.toFixed(4)}`}</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'6px', color:'var(--text-mut)', fontSize:'12px'}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>{new Date(cluster.lastUpdated).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }).replace(',', '')}</span>
          </div>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'12px'}}>
          <div style={{display:'flex', gap:'8px', overflow:'hidden'}}>
            <span className={`sev-badge ${sevClass}`} style={{fontSize:'10px', padding:'2px 8px', flexShrink:0}}>{cluster.severityLevel || 'Medium'}</span>
            <span style={{fontSize:'10px', background:'#f1f5f9', color:'#334155', padding:'2px 8px', borderRadius:'12px', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{cluster.label || 'Pothole'}</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');
  
  const [clusters, setClusters] = useState<any[]>([]);
  const validClusters = clusters.filter((c: any) => c.label !== 'Unknown Hazard');

  // Profile / Settings State
  const [draftName, setDraftName] = useState('Harshavardhan');
  const [draftLoc, setDraftLoc] = useState('India');
  const [savedName, setSavedName] = useState('Harshavardhan');
  const [savedLoc, setSavedLoc] = useState('India');
  
  const [modelPref, setModelPref] = useState('NVIDIA Llama 3.2 11B Vision');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [sensitivity, setSensitivity] = useState(50);
  
  const [draftLanguage, setDraftLanguage] = useState('English');
  const [savedLanguage, setSavedLanguage] = useState('English');
  
  const [debugMode, setDebugMode] = useState(false);
  const [recordLocal, setRecordLocal] = useState(false);
  const [saveFrames, setSaveFrames] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const t = (key: string) => translations[savedLanguage]?.[key] || translations['English'][key];

  // Manual Mode State Flow
  const [manualStep, setManualStep] = useState(0); // 0 = closed, 1 = upload, 2 = location, 3 = review, 4 = sent
  const [manualPhoto, setManualPhoto] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  
  // AI Results
  const [isDrafting, setIsDrafting] = useState(false);
  const [hazardType, setHazardType] = useState('');
  const [severityBucket, setSeverityBucket] = useState('');
  const [severityReason, setSeverityReason] = useState('');
  const [manualDraft, setManualDraft] = useState('');
    const [selectedReport, setSelectedReport] = useState<any>(null);
  const [manualCoords, setManualCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (manualStep === 2) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setManualCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setManualLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
          },
          (err) => console.log("Geolocation error:", err),
          { enableHighAccuracy: true }
        );
      }
    }
  }, [manualStep]);

  // Handle Initial Photo Upload (Step 1 -> Step 2/3)
  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setManualPhoto(ev.target?.result as string);
        setManualStep(2); // Go to location step
      };
      reader.readAsDataURL(file);
    }
  };

  const proceedToAnalysis = async () => {
    if (!manualPhoto) return;
    setManualStep(3); // Go to review step
    setIsDrafting(true);
    
    try {
      const res = await fetch("http://10.53.105.17:3000/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo: manualPhoto,
          location_hint: manualLocation,
          saved_name: savedName
        })
      });

      if (!res.ok) throw new Error("Backend failed to process image");
      const data = await res.json();
      
      setHazardType(data.hazard_type);
      setSeverityBucket(data.severity_bucket);
      setSeverityReason(data.severity_reason);
      setManualDraft(data.drafted_complaint);
    } catch (e: any) {
      console.error(e);
      setHazardType("Unverified Road Issue");
      setSeverityBucket("Medium");
      setSeverityReason("Image sent for manual review.");
      setManualDraft(`To the Civic Authority,\n\nI am reporting a severe road hazard located at ${manualLocation || 'the location in the attached image'}. This pothole poses a significant risk to motorists and requires immediate attention to prevent vehicle damage or accidents.\n\nPlease find the visual evidence attached.\n\nRegards,\n${savedName}`);
    } finally {
      setIsDrafting(false);
    }
  };

  const regenerateDraft = async () => {
    proceedToAnalysis(); // Re-run analysis
  };

  const submitManualReport = async () => {
    try {
      // Submit to backend
      const reportJson = {
        lat: manualCoords ? manualCoords.lat : 12.9716 + (Math.random() * 0.005),
        lng: manualCoords ? manualCoords.lng : 77.5946 + (Math.random() * 0.005),
        severity: severityBucket === 'Critical' ? 95 : severityBucket === 'Large' ? 75 : severityBucket === 'Medium' ? 55 : 30,
        label: hazardType || 'Road Issue',
        thumbnailUrl: manualPhoto,
        complaint: manualDraft,
        locationName: manualLocation,
        reporter: savedName
      };

      const res = await fetch("http://10.53.105.17:3000/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportJson)
      });
      if (!res.ok) console.error("Failed to submit to backend");
    } catch (e) {
      console.error("Backend error:", e);
    }

    setManualStep(4); // Mark as sent immediately

    if (navigator.share) {
      navigator.share({
        title: 'Pothole Report',
        text: manualDraft,
      }).catch(console.error);
    }
  };

  const saveProfile = () => {
    setSavedName(draftName);
    setSavedLoc(draftLoc);
    setSavedLanguage(draftLanguage);
    alert("Settings Saved!");
  };

  useEffect(() => {
    socket.on('reports_update', (data) => {
      
      setClusters(data.clusters);
    });
    return () => {
      socket.off('reports_update');
    };
  }, []);

  const handleDriveMode = () => {
    if (typeof window !== 'undefined' && (window as any).Android) {
      (window as any).Android.startCamera();
    } else {
      alert("Drive Mode is only available in the native Android App.");
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <>
      <div className={`v-enter ${activeTab === 'home' ? '' : 'v-enter-1'}`}>
        
        {/* TOP HEADER */}
        <div className="top-header">
          <div className="user-profile">
            <div className="avatar" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#64748b', overflow: 'hidden'}}>
              {user?.avatar ? (
                 <img src={user.avatar} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
               ) : (
                 <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                   <circle cx="12" cy="7" r="4"></circle>
                 </svg>
               )}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || savedName}</span>
              <span className="user-loc" style={{fontSize:'12px'}}>{user?.email || savedLoc}</span>
            </div>
          </div>
          <button className="header-btn v-press" aria-label="Notifications" onClick={() => setActiveTab('profile')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
        </div>

        {activeTab === 'home' && (
          <div>
            <h2 className="section-title">{t('liveDetection')}</h2>

            {/* HERO CARD */}
            <div className="hero-card v-press" role="button" onClick={handleDriveMode}>
              <div className="hero-top">
                <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div className="hero-badge-black">
                      <div className="pulse-dot-green"></div> {t('liveScanner')}
                    </div>
                    <span style={{fontSize: '11px', fontWeight: 600, color: '#fff', opacity: 0.9}}>● {t('ready')}</span>
                  </div>
                </div>
                <div className="circle-btn-white">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
              
              <div style={{marginTop: '20px'}}>
                <div className="hero-title">{t('driveModeTitle')}</div>
                <div className="hero-subtitle">{t('driveModeDesc')}</div>
              </div>
            </div>

            {/* MANUAL MODE CARD */}
            <div className="hero-card v-press" style={{position: 'relative', marginTop: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, zIndex: 10}} />
              <div className="hero-top">
                <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                  <div className="hero-badge-black">{t('manualReport')}</div>
                </div>
                <div className="circle-btn-white">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
              <div style={{marginTop: '20px'}}>
                <div className="hero-title" style={{color: '#fff'}}>{t('manualModeTitle')}</div>
                <div className="hero-subtitle" style={{color: 'rgba(255,255,255,0.7)'}}>{t('manualModeDesc')}</div>
              </div>
            </div>

            <h2 className="section-title">Services</h2>

            <div className="secondary-grid">
              <div className="grid-item v-press" onClick={() => setActiveTab('reports')}>
                <div className="grid-icon-box">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </div>
                <span className="grid-label" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'}}>
                  <span>Reports</span>
                  <span style={{fontSize: '11px', color: 'var(--text-mut)'}}>{validClusters.length} submitted</span>
                </span>
              </div>
              <div className="grid-item v-press" onClick={() => setActiveTab('map')}>
                <div className="grid-icon-box">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                    <line x1="8" y1="2" x2="8" y2="18"></line>
                    <line x1="16" y1="6" x2="16" y2="22"></line>
                  </svg>
                </div>
                <span className="grid-label" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'}}>
                  <span>Map</span>
                  <span style={{fontSize: '11px', color: 'var(--text-mut)'}}>{validClusters.length} hazards</span>
                </span>
              </div>
              <div className="grid-item v-press" onClick={() => setActiveTab('profile')}>
                <div className="grid-icon-box">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </div>
                <span className="grid-label">Settings</span>
              </div>
              <div className="grid-item v-press" onClick={() => alert('Rewards coming soon!')}>
                <div className="grid-icon-box">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <span className="grid-label">Rewards</span>
              </div>
            </div>

            {/* RECENT REPORTS */}
            <h2 className="section-title" style={{marginTop: '24px'}}>Recent Reports</h2>
            {clusters.length === 0 ? (
              <div style={{background: 'var(--card)', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center'}}>
                <p style={{fontSize: '13px', color: 'var(--text-mut)', margin: 0}}>No reports yet.<br/>Start Drive Mode to detect road damage.</p>
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px'}}>
                {validClusters.slice(0, 3).map((item: any, idx: number) => (
                  <ReportCard key={item.id || idx} cluster={item} onClick={() => setSelectedReport(item)} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="v-enter-2">
            <div className="search-action-bar" style={{marginBottom: '16px'}}>
              <div className="search-text">{t('yourReports')} ({validClusters.length})</div>
            </div>

            {/* STATS ROW */}
            <div className="stats-row">
              <div className="stat-col">
                <div className="icon-box orange">
                   <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                </div>
                <span className="stat-num">{validClusters.length}</span>
                <span className="stat-label">{t('totalReports')}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-col">
                <div className="icon-box green">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="stat-num">{validClusters.filter((c: any) => (c.status === 'Sent' || c.status === 'Submitted' || c.status === 'Fixed')).length}</span>
                <span className="stat-label">{t('submitted')}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-col">
                <div className="icon-box yellow">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <span className="stat-num">{validClusters.filter((c: any) => (c.status === 'Acknowledged' || c.status === 'Under Review')).length}</span>
                <span className="stat-label">{t('underReview')}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-col">
                <div className="icon-box red">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <span className="stat-num">{validClusters.filter((c: any) => (c.status === 'Draft' || c.status === 'Unrouted')).length}</span>
                <span className="stat-label">{t('unrouted')}</span>
              </div>
            </div>

            {validClusters.map((cluster: any) => (
              <ReportCard key={cluster.id} cluster={cluster} onClick={() => setSelectedReport(cluster)} />
            ))}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="v-enter-2">
            <div className="hero-card v-press" style={{background: 'var(--card)'}}>
               <div className="hero-top" style={{marginBottom:0}}>
                  <div className="hero-badge-black" style={{background: '#34d399', color: '#fff'}}>
                    {t('activeCoverage')}
                  </div>
               </div>
               <div style={{marginTop: '16px'}}>
                 <div className="hero-title" style={{color: '#111'}}>{validClusters.length} {t('events')}</div>
                 <div className="hero-subtitle" style={{color: 'var(--text-mut)'}}>{t('mappedRegion')}</div>
               </div>
            </div>

            <div className="map-container">
               <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '100%', width: '100%' }}>
                 <TileLayer
                   attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 />
                 <MapBounds clusters={validClusters} />
                 {validClusters.map((cluster) => (
                   <Marker key={cluster.id} position={[cluster.lat, cluster.lng]} icon={createCustomIcon(cluster.severityLevel)}>
                     <Popup>
                       <div style={{fontWeight: 700}}>{cluster.label}</div>
                       <div style={{fontSize: '12px'}}>{cluster.locationName}</div>
                       <div className={`status-badge status-${cluster.status?.toLowerCase()}`} style={{marginTop: '4px', display: 'inline-block'}}>{cluster.status}</div>
                     </Popup>
                   </Marker>
                 ))}
               </MapContainer>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="v-enter-2" style={{paddingBottom: '100px'}}>
            <h2 className="section-title">{t('settingsTitle')}</h2>
            
            <div className="form-card">
              <label className="form-label">{t('name')}</label>
              <input type="text" className="form-input" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
              
              <label className="form-label" style={{marginTop:'10px'}}>{t('location')}</label>
              <input type="text" className="form-input" value={draftLoc} onChange={(e) => setDraftLoc(e.target.value)} />

              <div className="settings-row" style={{marginTop: '10px'}}>
                 <div>
                   <div className="settings-label">Dark Theme</div>
                   <div className="settings-desc">Switch to dark mode for comfortable night usage.</div>
                 </div>
                 <div className={`toggle-switch ${darkMode ? 'active' : ''}`} onClick={() => setDarkMode(!darkMode)}>
                    <div className="toggle-knob"></div>
                 </div>
              </div>

              <div className="settings-row">
                 <div>
                   <div className="settings-label">{t('shareData')}</div>
                   <div className="settings-desc">{t('shareDataDesc')}</div>
                 </div>
                 <div className={`toggle-switch ${dataSharing ? 'active' : ''}`} onClick={() => setDataSharing(!dataSharing)}>
                    <div className="toggle-knob"></div>
                 </div>
              </div>

              <div className="settings-row">
                 <div>
                   <div className="settings-label">{t('nearbyAlerts')}</div>
                   <div className="settings-desc">{t('nearbyAlertsDesc')}</div>
                 </div>
                 <div className={`toggle-switch ${notifications ? 'active' : ''}`} onClick={() => setNotifications(!notifications)}>
                    <div className="toggle-knob"></div>
                 </div>
              </div>

              <div className="settings-row" style={{display:'block'}}>
                <div className="settings-label">{t('sensitivity')}</div>
                <div className="settings-desc">{t('sensitivityDesc')}</div>
                <input type="range" min="1" max="100" value={sensitivity} onChange={(e) => setSensitivity(parseInt(e.target.value))} />
              </div>

              <div className="settings-row">
                <div className="settings-label">{t('language')}</div>
                <select className="form-input" style={{margin:0, width: 'auto'}} value={draftLanguage} onChange={(e) => setDraftLanguage(e.target.value)}>
                  <option value="English">English</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Telugu">Telugu</option>
                </select>
              </div>

              <div className="accordion-header" onClick={() => setShowAdvanced(!showAdvanced)} style={{marginTop:'16px'}}>
                <span>{t('advSettings')}</span>
                <span style={{fontSize:'12px', color:'var(--text-mut)'}}>{showAdvanced ? '▲' : '▼'}</span>
              </div>
              {showAdvanced && (
                <div className="accordion-content">
                  <label className="form-label">{t('modelPref')}</label>
                  <select className="form-input" value={modelPref} onChange={(e) => setModelPref(e.target.value)}>
                    <option value="NVIDIA Llama 3.2 11B Vision">NVIDIA Llama 3.2 11B Vision (Default)</option>
                    <option value="OpenAI GPT-4o Mini">OpenAI GPT-4o Mini</option>
                  </select>
                </div>
              )}
            </div>

            {/* Capture & Diagnostics */}
            <div className="form-card" style={{marginTop: '16px'}}>
               <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px'}}>
                  <div style={{background: '#f1f5f9', padding:'6px', borderRadius:'8px'}}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  </div>
                  <strong style={{color: 'var(--text-main)'}}>{t('captureTitle')}</strong>
               </div>
               
               <div className="settings-row">
                 <div>
                   <div className="settings-label">{t('debugMode')}</div>
                   <div className="settings-desc">{t('debugDesc')}</div>
                 </div>
                 <div className={`toggle-switch ${debugMode ? 'active' : ''}`} onClick={() => setDebugMode(!debugMode)}>
                    <div className="toggle-knob"></div>
                 </div>
               </div>
               <div className="settings-row">
                 <div>
                   <div className="settings-label">{t('recordLocal')}</div>
                   <div className="settings-desc">{t('recordDesc')}</div>
                 </div>
                 <div className={`toggle-switch ${recordLocal ? 'active' : ''}`} onClick={() => setRecordLocal(!recordLocal)}>
                    <div className="toggle-knob"></div>
                 </div>
               </div>
               <div className="settings-row">
                 <div>
                   <div className="settings-label">{t('saveFrames')}</div>
                   <div className="settings-desc">{t('saveFramesDesc')}</div>
                 </div>
                 <div className={`toggle-switch ${saveFrames ? 'active' : ''}`} onClick={() => setSaveFrames(!saveFrames)}>
                    <div className="toggle-knob"></div>
                 </div>
               </div>

               <p style={{fontSize: '11px', color: 'var(--text-mut)', lineHeight: '1.5', marginTop: '16px'}}>
                 Photos and video-derived frames are sent to OpenAI for detection and can contain number plates or faces. Exact location is sent to OpenStreetMap/Nominatim; Karnataka points also use Karnataka GIS. A verified state pack or 2° National Highway tile is downloaded from GitHub Pages and cached here; that request reveals the state or approximate tile and ordinary connection metadata, not exact coordinates. Your API key is sent only to OpenAI. The app never submits automatically.
                 <br/><br/>
                 Independent, unofficial app. It is not affiliated with or endorsed by any government body. Routing is best-effort and must be reviewed before sending.
               </p>
            </div>

            {/* Dataset & Storage */}
            <div className="form-card" style={{marginTop: '16px'}}>
               <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px'}}>
                  <div style={{background: '#f1f5f9', padding:'6px', borderRadius:'8px'}}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </div>
                  <strong style={{color: 'var(--text-main)'}}>{t('datasetTitle')}</strong>
                  <span style={{marginLeft: 'auto', fontSize: '12px', color: 'var(--text-mut)', fontWeight: 500}}>{validClusters.length} reports</span>
               </div>

               <button className="header-btn" onClick={() => setActiveTab('reports')} style={{width:'100%', background:'#f8fafc', color:'var(--text-main)', padding:'14px', borderRadius:'10px', fontWeight:600, fontSize:'14px', border:'1px solid #e2e8f0', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px', justifyContent:'center'}}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                 {t('reviewFrames')}
               </button>
               <button className="header-btn" onClick={() => {
                 const exportData = {
                   exportDate: new Date().toISOString(),
                   totalReports: validClusters.length,
                   reports: validClusters.map((c: any) => ({
                     id: c.id, lat: c.lat, lng: c.lng, label: c.label,
                     severityLevel: c.severityLevel, status: c.status,
                     locationName: c.locationName, complaint: c.complaint,
                     reporter: c.reporter, createdAt: c.createdAt
                   }))
                 };
                 const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                 const url = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url;
                 a.download = `pothole_pulse_export_${new Date().toISOString().slice(0,10)}.json`;
                 a.click();
                 URL.revokeObjectURL(url);
               }} style={{width:'100%', background:'#f8fafc', color:'var(--text-main)', padding:'14px', borderRadius:'10px', fontWeight:600, fontSize:'14px', border:'1px solid #e2e8f0', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px', justifyContent:'center'}}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                 {t('exportData')}
               </button>
               <button className="header-btn" onClick={() => {
                 if (confirm('Are you sure you want to delete ALL app data? This cannot be undone.')) {
                   fetch('http://10.53.105.17:3000/api/reports', { method: 'DELETE' })
                     .then(r => r.json())
                     .then(() => {
                       setClusters([]);
                       alert('All data has been deleted.');
                     })
                     .catch(() => {
                       setClusters([]);
                       alert('Local data cleared.');
                     });
                 }
               }} style={{width:'100%', background:'#fef2f2', color:'#ef4444', padding:'14px', borderRadius:'10px', fontWeight:600, fontSize:'14px', border:'1px solid #fca5a5', display:'flex', alignItems:'center', gap:'8px', justifyContent:'center'}}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                 {t('deleteData')}
               </button>

               <div style={{display: 'flex', gap: '16px', marginTop: '16px'}}>
                 <a href="#" style={{fontSize: '12px', color: '#f97316', textDecoration: 'none'}}>{t('privacy')}</a>
                 <a href="#" style={{fontSize: '12px', color: '#f97316', textDecoration: 'none'}}>{t('sources')}</a>
               </div>
            </div>

            {/* Actions */}
            <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
              <button className="header-btn" style={{flex: 1, background: '#f1f5f9', color: 'var(--text-main)', padding: '16px', borderRadius: '14px', fontWeight: 700, fontSize: '16px', border: 'none'}} onClick={() => setActiveTab('home')}>
                {t('back')}
              </button>
              <button className="header-btn" style={{flex: 1, background: '#10b981', color: '#fff', padding: '16px', borderRadius: '14px', fontWeight: 700, fontSize: '16px', border: 'none'}} onClick={saveProfile}>
                {t('save')}
              </button>
            </div>

            <button onClick={() => setUser(null)} className="header-btn v-press" style={{width: '100%', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '16px', borderRadius: '14px', fontSize: '16px', fontWeight: 700, marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Sign Out
            </button>

          </div>
        )}

        {/* 4-STEP MANUAL MODE MODAL */}
        {manualStep > 0 && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                  {manualStep > 1 && <button onClick={() => setManualStep(manualStep - 1)} style={{background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'var(--text-main)', padding:0}}>&larr;</button>}
                  <h2 style={{margin:0, fontSize:'20px', fontWeight:800}}>
                    {manualStep === 2 ? t('addLocation') : manualStep === 3 ? t('reviewReport') : t('sent')}
                  </h2>
                </div>
                <button onClick={() => setManualStep(0)} style={{background:'none',border:'none',fontSize:'24px',cursor:'pointer',color:'var(--text-main)'}}>&times;</button>
              </div>
              
              {/* Step indicator */}
              <div className="step-indicator">
                <div className={`step-dot ${manualStep >= 1 ? 'active' : ''}`}>1</div>
                <div className={`step-line ${manualStep >= 2 ? 'active' : ''}`}></div>
                <div className={`step-dot ${manualStep >= 2 ? 'active' : ''}`}>2</div>
                <div className={`step-line ${manualStep >= 3 ? 'active' : ''}`}></div>
                <div className={`step-dot ${manualStep >= 3 ? 'active' : ''}`}>3</div>
              </div>

              {manualStep === 2 && (
                <div>
                  {manualPhoto && <img src={manualPhoto} alt="Upload" className="preview-img" style={{height:'140px'}} />}
                  <label className="form-label">{t('locLandmark')}</label>
                  <input type="text" className="form-input" placeholder={t('locPlaceholder')} value={manualLocation} onChange={e => setManualLocation(e.target.value)} />
                  <button className="header-btn" style={{width:'100%', background:'#10b981', color:'#fff', padding:'16px', borderRadius:'14px', fontWeight:700, fontSize:'16px', border:'none', marginTop:'12px'}} onClick={proceedToAnalysis}>
                    {t('proceedToAnalysis')}
                  </button>
                </div>
              )}
              
              {manualStep === 3 && (
                <div>
                  {isDrafting ? (
                    <div style={{textAlign: 'center', padding: '40px 0'}}>
                       <div className="pulse-dot-green" style={{margin:'0 auto', width:'12px', height:'12px'}}></div>
                       <p style={{marginTop:'12px', fontWeight:600, color:'var(--text-mut)'}}>{t('aiAnalyzing')}</p>
                    </div>
                  ) : (
                    <>
                      <div style={{position: 'relative'}}>
                        {manualPhoto && <img src={manualPhoto} alt="Evidence" className="preview-img" style={{marginBottom:'8px'}} />}
                        <div className={`sev-badge sev-${severityBucket?.toLowerCase() || 'medium'}`} style={{position:'absolute', top:'10px', left:'10px', padding:'4px 8px', fontSize:'12px', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
                          {severityBucket || 'Medium'} {t('severityLabel')}
                        </div>
                      </div>
                      
                      <div style={{marginBottom:'16px', fontSize:'14px', fontWeight:500, color:'var(--text-main)'}}>
                        <select className="form-input" style={{marginBottom: '8px', fontWeight: 600}} value={hazardType} onChange={e => setHazardType(e.target.value)}>
                          <option value="Pothole Cavity">Pothole Cavity</option>
                          <option value="Surface Breakup">Surface Breakup</option>
                          <option value="Failed Patch">Failed Patch</option>
                          <option value="Cracked Road">Cracked Road</option>
                          <option value="Unverified Road Issue">Unverified Road Issue</option>
                        </select>
                        <div style={{color:'var(--text-mut)', fontSize: '13px'}}>{severityReason}</div>
                      </div>
                      
                      <label className="form-label">{t('locLandmark')}</label>
                      <input type="text" className="form-input" value={manualLocation} onChange={e => setManualLocation(e.target.value)} />
                      
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px'}}>
                        <label className="form-label" style={{margin:0}}>{t('aiGenComplaint')}</label>
                        <button onClick={regenerateDraft} style={{background:'none', border:'none', color:'#10b981', fontSize:'12px', fontWeight:600, cursor:'pointer'}}>{t('regenerate')}</button>
                      </div>
                      
                      <textarea className="draft-textarea" value={manualDraft} onChange={e => setManualDraft(e.target.value)} />
                      
                      <div style={{display:'flex', gap:'12px', marginTop:'12px'}}>
                        <button className="header-btn" style={{flex: 1, background:'#f1f5f9', color:'var(--text-main)', padding:'16px', borderRadius:'14px', fontWeight:700, fontSize:'16px', border:'none'}} onClick={() => alert("Draft saved!")}>
                          {t('saveDraft')}
                        </button>
                        <button className="header-btn" style={{flex: 2, background:'#10b981', color:'#fff', padding:'16px', borderRadius:'14px', fontWeight:700, fontSize:'16px', border:'none'}} onClick={submitManualReport}>
                          {t('sendReport')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {manualStep === 4 && (
                <div style={{textAlign: 'center', padding: '30px 0'}}>
                   <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{margin:'0 auto'}}>
                     <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                   </svg>
                   <h3 style={{marginTop: '16px', fontSize:'20px'}}>{t('reportSent')}</h3>
                   <p style={{color: 'var(--text-mut)', marginTop: '8px', fontSize:'14px'}}>{t('complaintDispatched')}</p>
                   <button className="header-btn" style={{width:'100%', background:'#f1f5f9', color:'var(--text-main)', padding:'16px', borderRadius:'14px', fontWeight:700, fontSize:'16px', border:'none', marginTop:'24px'}} onClick={() => setManualStep(0)}>
                     {t('close')}
                   </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* FLOATING BLACK PILL NAV */}
      <div className="floating-nav-wrap">
        <div className="floating-nav">
          <button className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
             <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </button>
          <button className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </button>
          <button className={`nav-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
              <line x1="8" y1="2" x2="8" y2="18"></line>
              <line x1="16" y1="6" x2="16" y2="22"></line>
            </svg>
          </button>
          <button className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
             <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
               <circle cx="12" cy="7" r="4"></circle>
             </svg>
          </button>
        </div>
      </div>

      {selectedReport && (
        <div className="full-screen-view-overlay">
          <div className="full-screen-view-content" style={{background:'#f4f5f4'}}>
            
            {/* IMAGE HEADER - Edge to edge */}
            <div style={{position:'relative', width:'100%', height:'300px', flexShrink:0}}>
                {selectedReport.thumbnailUrl ? (
                  <img src={selectedReport.thumbnailUrl} alt="Report" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                  <div style={{width:'100%', height:'100%', background:'#cbd5e1'}} />
                )}
                {/* Back button overlay */}
                <div style={{position:'absolute', top: 'calc(env(safe-area-inset-top) + 16px)', left:'16px', zIndex: 100}}>
                  <button onClick={() => setSelectedReport(null)} style={{background:'rgba(255,255,255,0.9)', border:'none', borderRadius:'50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  </button>
                </div>
              </div>

              <div style={{padding:'24px 20px', flex:1, display:'flex', flexDirection:'column', gap:'20px'}}>
                 <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                   <div>
                     <div style={{fontSize:'26px', fontWeight:800, color:'#111827', marginBottom:'4px', letterSpacing:'-0.5px'}}>{selectedReport.label || 'Road Hazard'}</div>
                     <div style={{color:'#64748b', fontSize:'14px', fontWeight:500}}>{new Date(selectedReport.lastUpdated || selectedReport.timestamp).toLocaleString()}</div>
                   </div>
                   <div className={`status-badge status-${selectedReport.status?.toLowerCase().replace(' ', '-') || 'draft'}`} style={{textTransform:'capitalize', fontSize:'13px', padding:'6px 14px', borderRadius:'99px', fontWeight:700}}>{selectedReport.status || 'Submitted'}</div>
                 </div>

                 <div style={{display:'flex', gap:'10px'}}>
                    <span className={`sev-badge sev-${selectedReport.severityLevel?.toLowerCase() || 'medium'}`} style={{fontSize:'12px', padding:'6px 12px', borderRadius:'8px', fontWeight:700}}>{selectedReport.severityLevel || 'Medium'} Severity</span>
                    {selectedReport.reporter && (
                      <span style={{fontSize:'12px', background:'#e2e8f0', color:'#334155', padding:'6px 12px', borderRadius:'8px', fontWeight:700}}>Reported by {selectedReport.reporter}</span>
                    )}
                 </div>

                 <div style={{background:'#ffffff', padding:'16px', borderRadius:'16px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'12px', boxShadow:'0 2px 4px rgba(0,0,0,0.02)'}}>
                   <div style={{background:'#fce7f3', padding:'10px', borderRadius:'12px'}}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                   </div>
                   <div style={{flex:1}}>
                     <div style={{fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'2px'}}>Verified Location</div>
                     <div style={{fontSize:'15px', color:'#111827', fontWeight:600}}>{selectedReport.locationName || `${selectedReport.lat.toFixed(5)}, ${selectedReport.lng.toFixed(5)}`}</div>
                   </div>
                 </div>

                 <div style={{background:'#ffffff', padding:'24px', borderRadius:'16px', border:'1px solid #e2e8f0', boxShadow:'0 4px 12px rgba(0,0,0,0.03)', marginTop:'8px'}}>
                   <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #f1f5f9', paddingBottom:'12px', marginBottom:'16px'}}>
                     <div style={{fontSize:'13px', fontWeight:800, color:'#0f172a', textTransform:'uppercase', letterSpacing:'1px'}}>Official Complaint Letter</div>
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                   </div>
                   <p style={{fontSize:'15px', color:'#334155', lineHeight:1.7, margin:0, whiteSpace:'pre-wrap', fontFamily:'Georgia, serif'}}>
                     {selectedReport.complaint || "No detailed complaint letter was generated for this report."}
                   </p>
                 </div>
                 
                 <div style={{height:'100px'}} /> {/* spacer for scroll */}
              </div>
            </div>
        </div>
      )}
    </>
  );
}
