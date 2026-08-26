package com.example.potholedetection

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Matrix
import android.os.Bundle
import android.util.Base64
import org.json.JSONObject
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.ByteArrayOutputStream
import java.io.IOException
import android.util.Log
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.graphics.createBitmap
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {

    private var lastReportTime: Long = 0
    private val client = OkHttpClient()
    private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaType()
    private val BACKEND_URL = "http://10.53.105.17:3000"

    private lateinit var viewFinder: PreviewView
    private lateinit var overlayView: OverlayView
    private lateinit var inferenceTimeTextView: TextView
    private lateinit var cameraExecutor: ExecutorService
    private lateinit var detector: YoloTFLiteDetector

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        viewFinder = findViewById(R.id.viewFinder)
        overlayView = findViewById(R.id.overlayView)
        inferenceTimeTextView = findViewById(R.id.inferenceTime)

        detector = YoloTFLiteDetector(this)
        cameraExecutor = Executors.newSingleThreadExecutor()

        if (allPermissionsGranted()) {
            startCamera()
        } else {
            ActivityCompat.requestPermissions(
                this,
                REQUIRED_PERMISSIONS,
                REQUEST_CODE_PERMISSIONS,
            )
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)

        cameraProviderFuture.addListener(
            {
                val cameraProvider: ProcessCameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder()
                .build()
                .also {
                    it.setSurfaceProvider(viewFinder.surfaceProvider)
                }

            val imageAnalyzer = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
                .build()
                .also {
                    it.setAnalyzer(cameraExecutor) { imageProxy ->
                        processImageProxy(imageProxy)
                    }
                }

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    this,
                    cameraSelector,
                    preview,
                    imageAnalyzer,
                )
            } catch (exc: Exception) {
                Log.e(TAG, "Use case binding failed", exc)
                Toast.makeText(this, R.string.camera_binding_failed, Toast.LENGTH_SHORT).show()
            }

        },
            ContextCompat.getMainExecutor(this),
        )
    }

    private fun processImageProxy(imageProxy: ImageProxy) {
        val bitmap = createBitmap(
            imageProxy.width,
            imageProxy.height,
            Bitmap.Config.ARGB_8888,
        )
        imageProxy.planes[0].buffer.rewind()
        bitmap.copyPixelsFromBuffer(imageProxy.planes[0].buffer)
        
        // Handle rotation
        val rotationDegrees = imageProxy.imageInfo.rotationDegrees
        val matrix = Matrix()
        matrix.postRotate(rotationDegrees.toFloat())
        
        val rotatedBitmap = Bitmap.createBitmap(
            bitmap,
            0,
            0,
            bitmap.width,
            bitmap.height,
            matrix,
            true,
        )

        val startTime = System.currentTimeMillis()
        val results = detector.detect(rotatedBitmap)
        val inferenceTime = System.currentTimeMillis() - startTime

        // Automated Reporting Pipeline
        if (results.isNotEmpty()) {
            val currentTime = System.currentTimeMillis()
            if (currentTime - lastReportTime > 15000) { // 15s cooldown
                lastReportTime = currentTime
                reportPothole(rotatedBitmap)
            }
        }

        runOnUiThread {
            overlayView.setResults(results)
            inferenceTimeTextView.text = getString(R.string.inference_time, inferenceTime)
        }

        imageProxy.close()
    }


    private fun reportPothole(bitmap: Bitmap) {
        Executors.newSingleThreadExecutor().execute {
            try {
                // 1. Convert to Base64
                val outputStream = ByteArrayOutputStream()
                bitmap.compress(Bitmap.CompressFormat.JPEG, 60, outputStream)
                val byteArray = outputStream.toByteArray()
                val base64Image = Base64.encodeToString(byteArray, Base64.NO_WRAP)
                val dataUrl = "data:image/jpeg;base64,$base64Image"

                Log.i(TAG, "Starting automated AI report...")

                // 2. Hit /analyze-photo
                val analyzeJson = JSONObject().apply {
                    put("photo", dataUrl)
                    put("location_hint", "12.9716, 77.5946 (Mock GPS)")
                    put("saved_name", "Drive Mode Scanner")
                }
                
                val analyzeReq = Request.Builder()
                    .url("$BACKEND_URL/analyze-photo")
                    .post(analyzeJson.toString().toRequestBody(JSON_MEDIA_TYPE))
                    .build()

                client.newCall(analyzeReq).execute().use { analyzeRes ->
                    if (!analyzeRes.isSuccessful) {
                        Log.e(TAG, "Analyze API failed")
                        return@use
                    }
                    val bodyStr = analyzeRes.body?.string() ?: return@use
                    val analyzeObj = JSONObject(bodyStr)
                    
                    val hazardType = analyzeObj.optString("hazard_type", "Pothole")
                    val severityBucket = analyzeObj.optString("severity_bucket", "Medium")
                    val complaint = analyzeObj.optString("drafted_complaint", "")
                    
                    val score = when (severityBucket.uppercase()) {
                        "CRITICAL" -> 95
                        "LARGE" -> 75
                        "MEDIUM" -> 55
                        else -> 30
                    }

                    // 3. Hit /api/reports
                    val reportJson = JSONObject().apply {
                        put("lat", 12.9716 + (Math.random() * 0.005))
                        put("lng", 77.5946 + (Math.random() * 0.005))
                        put("severity", score)
                        put("label", hazardType)
                        put("thumbnailUrl", dataUrl)
                        put("complaint", complaint)
                    }

                    val reportReq = Request.Builder()
                        .url("$BACKEND_URL/api/reports")
                        .post(reportJson.toString().toRequestBody(JSON_MEDIA_TYPE))
                        .build()

                    client.newCall(reportReq).execute().use { reportRes ->
                        if (reportRes.isSuccessful) {
                            Log.i(TAG, "Successfully reported hazard!")
                        } else {
                            Log.e(TAG, "Report API failed")
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Reporting exception", e)
            }
        }
    }

    private fun allPermissionsGranted() = REQUIRED_PERMISSIONS.all {
        ContextCompat.checkSelfPermission(
            baseContext,
            it,
        ) == PackageManager.PERMISSION_GRANTED
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray,
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            if (allPermissionsGranted()) {
                startCamera()
            } else {
                Toast.makeText(
                    this,
                    R.string.permissions_not_granted,
                    Toast.LENGTH_SHORT,
                ).show()
                finish()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraExecutor.shutdown()
        detector.close()
    }

    companion object {
        private const val TAG = "MainActivity"
        private const val REQUEST_CODE_PERMISSIONS = 10
        private val REQUIRED_PERMISSIONS = arrayOf(Manifest.permission.CAMERA)
    }
}
