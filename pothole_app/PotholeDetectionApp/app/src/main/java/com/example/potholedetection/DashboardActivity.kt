package com.example.potholedetection

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import android.app.Activity
import android.net.Uri
import android.webkit.ValueCallback
import androidx.activity.result.contract.ActivityResultContracts

class DashboardActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data: Intent? = result.data
            val results = if (data == null || data.data == null) null else arrayOf(data.data!!)
            filePathCallback?.onReceiveValue(results)
        } else {
            filePathCallback?.onReceiveValue(null)
        }
        filePathCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        webView = findViewById(R.id.dashboardWebView)
        
        // Configure WebView for React app
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.cacheMode = android.webkit.WebSettings.LOAD_NO_CACHE
        webView.webViewClient = WebViewClient()
        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@DashboardActivity.filePathCallback?.onReceiveValue(null)
                this@DashboardActivity.filePathCallback = filePathCallback
                
                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "image/*"
                }
                fileChooserLauncher.launch(Intent.createChooser(intent, "Select Picture"))
                return true
            }
        }
        
        // Add JS Interface to allow React to trigger Native Camera
        webView.addJavascriptInterface(WebAppInterface(this), "Android")

        // Load the React dashboard (ensure PC and phone are on same Wi-Fi)
        webView.loadUrl(DASHBOARD_URL)
    }

    inner class WebAppInterface(private val mContext: Context) {
        @JavascriptInterface
        @Suppress("unused")
        fun startCamera() {
            val intent = Intent(mContext, MainActivity::class.java)
            mContext.startActivity(intent)
        }
    }
    
    // Handle back button for web navigation
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    companion object {
        private const val DASHBOARD_URL = "http://10.53.105.17:5173"
    }
}
