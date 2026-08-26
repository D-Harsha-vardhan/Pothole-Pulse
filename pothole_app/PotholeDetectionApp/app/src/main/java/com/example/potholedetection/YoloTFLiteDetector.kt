package com.example.potholedetection

import android.content.Context
import android.graphics.Bitmap
import android.graphics.RectF
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.support.common.FileUtil
import org.tensorflow.lite.support.common.ops.NormalizeOp
import org.tensorflow.lite.support.image.ImageProcessor
import org.tensorflow.lite.support.image.TensorImage
import org.tensorflow.lite.support.image.ops.ResizeOp

class YoloTFLiteDetector(context: Context) {

    private var interpreter: Interpreter? = null
    private val modelInputSize = 640
    private val numElements = 300
    private val numChannels = 6

    private val imageProcessor = ImageProcessor.Builder()
        .add(ResizeOp(modelInputSize, modelInputSize, ResizeOp.ResizeMethod.BILINEAR))
        .add(NormalizeOp(0f, 255f))
        .build()

    init {
        val model = FileUtil.loadMappedFile(context, "pothole_model.tflite")
        val options = Interpreter.Options().apply {
            setNumThreads(4)
        }
        interpreter = Interpreter(model, options)
    }

    fun detect(bitmap: Bitmap): List<DetectionResult> {
        val tensorImage = TensorImage(org.tensorflow.lite.DataType.FLOAT32)
        tensorImage.load(bitmap)
        val processedImage = imageProcessor.process(tensorImage)

        // Output shape is [1, 300, 6]
        val output = Array(1) { Array(numElements) { FloatArray(numChannels) } }

        interpreter?.run(processedImage.buffer, output)

        return parseOutput(output[0])
    }

    private fun parseOutput(output: Array<FloatArray>): List<DetectionResult> {
        val results = mutableListOf<DetectionResult>()
        val confThreshold = 0.4f

        for (i in 0 until numElements) {
            val conf = output[i][4]
            if (conf > confThreshold) {
                // The model actually outputs [x1, y1, x2, y2] natively!
                val x1 = output[i][0]
                val y1 = output[i][1]
                val x2 = output[i][2]
                val y2 = output[i][3]

                val left: Float
                val top: Float
                val right: Float
                val bottom: Float

                // Return normalized coordinates (0 to 1) for the View to scale
                if ((x1 <= 1.5f) && (y1 <= 1.5f) && (x2 <= 1.5f) && (y2 <= 1.5f)) {
                    left = x1
                    top = y1
                    right = x2
                    bottom = y2
                } else {
                    left = (x1 / modelInputSize)
                    top = (y1 / modelInputSize)
                    right = (x2 / modelInputSize)
                    bottom = (y2 / modelInputSize)
                }

                // In case the model exports [cx, cy, w, h] instead of [x1, y1, x2, y2]
                // We can detect this if the "left" coordinate is greater than "right" 
                // (which shouldn't happen), or if it's the standard YOLO format without NMS.
                // But since shape is [1, 300, 6], it's almost certainly [x1, y1, x2, y2].

                val rect = RectF(left, top, right, bottom)
                results.add(DetectionResult(rect, conf, 0))
            }
        }

        return nonMaxSuppression(results)
    }

    private fun nonMaxSuppression(boxes: List<DetectionResult>): List<DetectionResult> {
        val iouThreshold = 0.3f
        val sortedBoxes = boxes.asSequence().sortedByDescending { it.score }.toMutableList()
        val selectedBoxes = mutableListOf<DetectionResult>()

        while (sortedBoxes.isNotEmpty()) {
            val bestBox = sortedBoxes.removeAt(0)
            selectedBoxes.add(bestBox)

            val iterator = sortedBoxes.iterator()
            while (iterator.hasNext()) {
                val box = iterator.next()
                if (calculateIoU(bestBox.boundingBox, box.boundingBox) >= iouThreshold) {
                    iterator.remove()
                }
            }
        }
        return selectedBoxes
    }

    private fun calculateIoU(box1: RectF, box2: RectF): Float {
        val x1 = maxOf(box1.left, box2.left)
        val y1 = maxOf(box1.top, box2.top)
        val x2 = minOf(box1.right, box2.right)
        val y2 = minOf(box1.bottom, box2.bottom)

        val intersectionArea = maxOf(0f, x2 - x1) * maxOf(0f, y2 - y1)
        val box1Area = (box1.right - box1.left) * (box1.bottom - box1.top)
        val box2Area = (box2.right - box2.left) * (box2.bottom - box2.top)

        if (((box1Area + box2Area) - intersectionArea) <= 0f) return 0f
        return intersectionArea / ((box1Area + box2Area) - intersectionArea)
    }

    fun close() {
        interpreter?.close()
    }
}
