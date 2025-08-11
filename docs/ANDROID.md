# Android Development Guide

This guide covers Android-specific development for the Nothing Health Step Zero Zero app, including native code, sensors, Health Connect integration, and Play Store preparation.

## Table of Contents

- [Project Structure](#project-structure)
- [Native Android Code](#native-android-code)
- [Health Connect Integration](#health-connect-integration)
- [Sensors and Permissions](#sensors-and-permissions)
- [Build Configuration](#build-configuration)
- [Testing](#testing)
- [Play Store Preparation](#play-store-preparation)

## Project Structure

### Android Directory Layout

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/nothing/health/
│   │   │   ├── MainActivity.java                # Main Capacitor activity
│   │   │   ├── StepTrackingService.java        # Background step tracking
│   │   │   ├── plugin/
│   │   │   │   └── StepServicePlugin.java      # Capacitor plugin
│   │   │   └── health/
│   │   │       ├── HealthConnectManager.kt     # Health Connect integration
│   │   │       ├── HealthConnectExtensions.kt  # Kotlin extensions
│   │   │       └── StepPermissionHelper.kt     # Permission handling
│   │   ├── res/                                # Android resources
│   │   └── AndroidManifest.xml                 # App permissions and config
│   ├── build.gradle                            # App-level build configuration
│   └── proguard-rules.pro                      # Code obfuscation rules
├── gradle/                                     # Gradle wrapper
├── build.gradle                                # Project-level build config
└── variables.gradle                            # Version and SDK configuration
```

## Native Android Code

### Main Components

#### 1. MainActivity.java

Main Capacitor activity with notification channel setup:

```java
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(StepServicePlugin.class);
        createNotificationChannel();
        super.onCreate(savedInstanceState);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                "step_tracking",
                "Step Tracking",
                NotificationManager.IMPORTANCE_LOW
            );
            // Configure channel...
        }
    }
}
```

#### 2. StepTrackingService.java

Foreground service for continuous step tracking:

```java
public class StepTrackingService extends Service implements SensorEventListener {
    private SensorManager sensorManager;
    private Sensor stepCounterSensor;
    private Sensor stepDetectorSensor;
    private Sensor accelerometerSensor;

    // Hardware sensors priority, accelerometer fallback
    // Adaptive threshold detection
    // Battery optimization
}
```

#### 3. StepServicePlugin.java

Capacitor plugin bridging web and native:

```java
@CapacitorPlugin(name = "StepService")
public class StepServicePlugin extends Plugin {
    @PluginMethod
    public void startService(PluginCall call);

    @PluginMethod
    public void getStepCount(PluginCall call);

    @PluginMethod
    public void requestHealthPermissions(PluginCall call);

    @PluginMethod
    public void getHealthStepsToday(PluginCall call);
}
```

### Development Workflow

#### 1. Making Changes to Native Code

```bash
# 1. Edit Java/Kotlin files in android/app/src/main/java/
# 2. Sync changes
npx cap sync

# 3. Build and test
npx cap run android
```

#### 2. Adding New Capacitor Plugins

```bash
# 1. Create plugin class in com.nothing.health.plugin package
# 2. Register in MainActivity.java
registerPlugin(YourNewPlugin.class);

# 3. Sync and rebuild
npx cap sync
```

#### 3. Debugging Native Code

```bash
# View logs
npx cap run android --livereload --external

# Android Studio debugger
# Set breakpoints in Java/Kotlin code
# Use "Attach to Process" in Android Studio
```

## Health Connect Integration

### Setup and Configuration

#### 1. Dependencies (build.gradle)

```gradle
dependencies {
    implementation "androidx.health.connect:connect-client:1.1.0-rc03"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.6.4"
}
```

#### 2. Manifest Permissions

```xml
<!-- Health Connect permissions -->
<uses-permission android:name="android.permission.health.READ_STEPS" />

<!-- Health Connect provider query -->
<queries>
    <package android:name="com.google.android.apps.healthdata" />
</queries>
```

#### 3. HealthConnectManager.kt

```kotlin
object HealthConnectManager {
    fun isAvailable(context: Context): Boolean =
        HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE

    suspend fun hasPermissions(context: Context): Boolean
    suspend fun stepsToday(context: Context): Long
}
```

### Integration Steps

#### 1. Check Availability

```javascript
const { available } = await StepService.isHealthConnectAvailable();
```

#### 2. Request Permissions

```javascript
const { granted } = await StepService.requestHealthPermissions();
```

#### 3. Fetch Data

```javascript
const { steps } = await StepService.getHealthStepsToday();
```

## Sensors and Permissions

### Required Permissions

#### 1. AndroidManifest.xml

```xml
<!-- Motion and activity -->
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />

<!-- Foreground service -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_HEALTH" />

<!-- Notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Camera for heart rate (optional) -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Vibration for feedback -->
<uses-permission android:name="android.permission.VIBRATE" />
```

#### 2. Runtime Permission Handling

```java
// In StepServicePlugin.java
@PluginMethod
public void requestPermissions(PluginCall call) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        requestPermissionForAlias("activity", call, "permissionCallback");
    }
}

@PermissionCallback
private void permissionCallback(PluginCall call) {
    if (getPermissionState("activity") == PermissionState.GRANTED) {
        // Start step tracking
    }
}
```

### Sensor Integration

#### 1. Hardware Step Sensors (Preferred)

```java
// TYPE_STEP_COUNTER - cumulative steps since reboot
stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);

// TYPE_STEP_DETECTOR - step event detection
stepDetectorSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR);
```

#### 2. Accelerometer Fallback

```java
// When hardware step sensors unavailable
accelerometerSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);

// Implement step detection algorithm
private void detectStepFromAccelerometer(float x, float y, float z) {
    float magnitude = (float) Math.sqrt(x*x + y*y + z*z);
    // Adaptive threshold algorithm
}
```

## Build Configuration

### Gradle Configuration

#### 1. variables.gradle

```gradle
ext {
    compileSdkVersion = 36
    targetSdkVersion = 35
    minSdkVersion = 26
    androidxActivityVersion = '1.8.0'
    androidxAppCompatVersion = '1.6.1'
    capacitorVersion = '6.0.0'
}
```

#### 2. app/build.gradle

```gradle
android {
    namespace "com.nothing.health"
    compileSdk rootProject.ext.compileSdkVersion

    defaultConfig {
        applicationId "com.nothing.health"
        minSdk rootProject.ext.minSdkVersion
        targetSdk rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    // Capacitor
    implementation project(':capacitor-android')
    implementation project(':capacitor-haptics')

    // Health Connect
    implementation "androidx.health.connect:connect-client:1.1.0-rc03"

    // Kotlin
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.6.4"
}
```

### ProGuard Configuration

#### proguard-rules.pro

```proguard
# Capacitor
-keep class com.getcapacitor.** { *; }
-keep class com.nothing.health.plugin.** { *; }

# Health Connect
-keep class androidx.health.connect.** { *; }

# Kotlin Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
```

## Testing

### Unit Testing

#### 1. Java/Kotlin Tests

```bash
# Run unit tests
cd android
./gradlew test

# Run with coverage
./gradlew testDebugUnitTestCoverage
```

#### 2. Test Structure

```
android/app/src/test/java/
├── com/nothing/health/
│   ├── StepDetectionTest.java
│   ├── HealthConnectTest.kt
│   └── plugin/StepServicePluginTest.java
```

### Integration Testing

#### 1. Instrumented Tests

```bash
# Run on device/emulator
./gradlew connectedAndroidTest
```

#### 2. Manual Testing Checklist

- [ ] Step detection accuracy
- [ ] Background service persistence
- [ ] Health Connect permissions
- [ ] Battery optimization
- [ ] Notification functionality
- [ ] App lifecycle handling

### Debug Builds

#### 1. Debug APK

```bash
# Build debug APK
npx cap build android

# Install on device
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

#### 2. Logging

```java
// Use Android Log for debugging
Log.d("StepTracking", "Step detected: " + stepCount);
Log.e("HealthConnect", "Permission denied", exception);
```

## Play Store Preparation

### App Signing

#### 1. Generate Keystore

```bash
keytool -genkey -v -keystore nothing-health-release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias nothing-health
```

#### 2. Configure Signing (gradle.properties)

```properties
NOTHING_HEALTH_RELEASE_STORE_FILE=nothing-health-release.keystore
NOTHING_HEALTH_RELEASE_KEY_ALIAS=nothing-health
NOTHING_HEALTH_RELEASE_STORE_PASSWORD=***
NOTHING_HEALTH_RELEASE_KEY_PASSWORD=***
```

#### 3. Build Configuration

```gradle
android {
    signingConfigs {
        release {
            storeFile file(NOTHING_HEALTH_RELEASE_STORE_FILE)
            storePassword NOTHING_HEALTH_RELEASE_STORE_PASSWORD
            keyAlias NOTHING_HEALTH_RELEASE_KEY_ALIAS
            keyPassword NOTHING_HEALTH_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### App Bundle Generation

#### 1. Build AAB

```bash
# Generate App Bundle
cd android
./gradlew bundleRelease

# Output: app/build/outputs/bundle/release/app-release.aab
```

#### 2. Upload to Play Console

1. Create app in Google Play Console
2. Upload AAB file
3. Configure store listing
4. Set up health data permissions
5. Submit for review

### Play Store Requirements

#### 1. Health Data Declaration

- Declare Health Connect usage in Play Console
- Provide privacy policy for health data
- Complete Data Safety section

#### 2. Target API Requirements

- Target API 34+ for new apps
- Update target API annually

#### 3. App Content Rating

- Complete content rating questionnaire
- Health and fitness category

### Release Process

#### 1. Pre-release Checklist

- [ ] Version bumped in build.gradle
- [ ] Changelog updated
- [ ] Screenshots captured
- [ ] Store description updated
- [ ] Privacy policy reviewed
- [ ] Health permissions tested

#### 2. Release Pipeline

```bash
# 1. Build release
npm run build
npx cap sync

# 2. Generate signed AAB
cd android
./gradlew bundleRelease

# 3. Upload to Play Console
# 4. Configure release
# 5. Submit for review
```

## Common Issues and Solutions

### Build Issues

```bash
# Clean build
./gradlew clean
rm -rf node_modules
npm install
npx cap sync
```

### Health Connect Issues

- Ensure Health Connect app is installed
- Check minimum API level (26+)
- Verify permissions in manifest

### Sensor Issues

- Test on physical device
- Check sensor availability
- Implement fallback mechanisms

---

For more information, see:

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Developer Guide](https://developer.android.com/guide)
- [Health Connect Documentation](https://developer.android.com/health-and-fitness/guides/health-connect)
