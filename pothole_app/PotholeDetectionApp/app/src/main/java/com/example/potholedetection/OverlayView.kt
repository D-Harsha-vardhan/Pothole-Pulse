package com.example.potholedetection

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import java.util.Locale
import kotlin.math.max

class OverlayView(context: Context?, attrs: AttributeSet?) : View(context, attrs) {

    private var results: List<DetectionResult> = emptyList()
    private val boxPaint = Paint()
    private val textBackgroundPaint = Paint()
    private val textPaint = Paint()
    private val boundsRect = RectF()
    private val textBackgroundRect = RectF()

    init {
        boxPaint.color = Color.GREEN
        boxPaint.style = Paint.Style.STROKE
        boxPaint.strokeWidth = 8f

        textBackgroundPaint.color = Color.GREEN
        textBackgroundPaint.style = Paint.Style.FILL

        textPaint.color = Color.BLACK
        textPaint.style = Paint.Style.FILL
        textPaint.textSize = 40f
    }

    fun setResults(results: List<DetectionResult>) {
        this.results = results
        postInvalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        for ((index, result) in results.withIndex()) {
            val boundingBox = result.boundingBox

            // Scale normalized coordinates (0 to 1) to the actual view dimensions
            val top = max(0f, boundingBox.top * height)
            val bottom = max(0f, boundingBox.bottom * height)
            val left = max(0f, boundingBox.left * width)
            val right = max(0f, boundingBox.right * width)

            boundsRect.left = left
            boundsRect.top = top
            boundsRect.right = right
            boundsRect.bottom = bottom
            canvas.drawRect(boundsRect, boxPaint)

            val scoreStr = String.format(Locale.US, "%.2f", result.score)
            val drawableText = context.getString(R.string.pothole_label, index + 1, scoreStr)
            val textWidth = textPaint.measureText(drawableText)
            val textHeight = textPaint.descent() - textPaint.ascent()

            textBackgroundRect.left = left
            textBackgroundRect.top = top
            textBackgroundRect.right = left + textWidth + 8f
            textBackgroundRect.bottom = top + textHeight + 8f
            
            canvas.drawRect(textBackgroundRect, textBackgroundPaint)

            canvas.drawText(drawableText, left + 4f, top + textHeight, textPaint)
        }
    }
}
