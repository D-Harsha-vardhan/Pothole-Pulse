package com.example.potholedetection

import android.graphics.RectF

data class DetectionResult(
    val boundingBox: RectF,
    val score: Float,
    val classIndex: Int,
)
