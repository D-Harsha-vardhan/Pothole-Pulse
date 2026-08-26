# Pothole Detection Android App 🛣️📱

A real-time, on-device pothole detection application built natively for Android. This app utilizes a custom-trained YOLOv8 model, optimized via TensorFlow Lite, to detect and highlight potholes using the device's live camera feed.

## Features ✨
- **Real-Time Inference:** Processes live camera frames seamlessly without cloud dependencies.
- **On-Device Machine Learning:** Leverages a custom YOLOv8 object detection model converted to `TFLite`.
- **Dynamic UI Overlays:** Draws perfectly scaled, green bounding boxes and confidence scores directly over potholes in the camera preview.
- **Custom NMS:** Built-in Non-Maximum Suppression ensures clean detections by filtering out duplicate bounding boxes.

## Tech Stack 🛠️
- **Language:** Kotlin
- **Camera:** AndroidX CameraX API
- **Machine Learning:** TensorFlow Lite (TFLite)
- **Architecture:** Native Android App (`minSdk` 24, `targetSdk` 33)

## How It Works 🧠
1. **Camera Feed:** `CameraX` captures frames from the back camera using an ImageAnalyzer.
2. **Pre-processing:** Each frame is converted to an RGBA Bitmap, rotated to match the screen orientation, and resized to `640x640`.
3. **Inference:** The TensorFlow Lite Interpreter runs the YOLOv8 model against the processed frame.
4. **Post-processing:** The app scales the model's normalized `[x1, y1, x2, y2]` output coordinates to the exact dimensions of the screen and applies NMS to clean up the output.
5. **Rendering:** The custom `OverlayView` visually draws the resulting bounding boxes in real-time.

---

## Setup Instructions 🚀

Follow these steps to run the app on your own Android device or emulator.

### Prerequisites
- [Android Studio](https://developer.android.com/studio) installed on your machine.
- An Android Device or Emulator running Android 7.0 (API Level 24) or higher.

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kartikey-varshney206/pothole-detention-android-app.git
   ```
2. **Open the Project:**
   - Launch Android Studio.
   - Select **File > Open...** and select the `PotholeDetectionApp` folder from the cloned repository.

3. **Sync Gradle:**
   - Wait for Android Studio to index the project.
   - If prompted, click **Sync Project with Gradle Files** (or click the Elephant icon in the top right).
   - *(Note: Ensure you are using a compatible JDK version, e.g., Java 17, which can be configured via `Settings > Build, Execution, Deployment > Build Tools > Gradle`)*.

4. **Run the App:**
   - Connect your Android phone via USB (Ensure **Developer Options** and **USB Debugging** are enabled).
   - *Troubleshooting:* If you face an `INSTALL_FAILED_VERIFICATION_FAILURE` error, ensure "Verify apps over USB" is turned OFF in your phone's Developer Options.
   - Click the Green **Run** (Play) button in Android Studio.

### Permissions
The app will request Camera permissions upon launch, which are required for the live detection feed.

---

## Model Information
The ML model `pothole_model.tflite` is bundled directly within the app's `assets` folder. It was trained using Ultralytics YOLOv8 and exported to TFLite `float32` format for optimal mobile edge deployment.