# Installation Guide

This guide will walk you through setting up the Nothing Health Step Zero Zero development environment and building the Android app.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Environment](#development-environment)
- [Android Setup](#android-setup)
- [Building the App](#building-the-app)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 10GB free space
- **Internet**: Required for initial setup and dependencies

### Required Software

#### 1. Node.js and npm

```bash
# Download from https://nodejs.org (LTS version)
# Verify installation
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

#### 2. Git

```bash
# Download from https://git-scm.com
# Verify installation
git --version
```

#### 3. Java Development Kit (JDK) 11

```bash
# Download from https://adoptopenjdk.net or use OpenJDK
# Verify installation
java -version
javac -version
```

#### 4. Android Studio

- Download from [developer.android.com](https://developer.android.com/studio)
- Install with default settings
- Install Android SDK (API level 33 or higher)

## Development Environment

### 1. Clone the Repository

```bash
git clone https://github.com/priyanksachdeva/step-zero-zero.git
cd step-zero-zero
```

### 2. Install Dependencies

```bash
# Install npm dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Development
VITE_APP_NAME="Nothing Health"
VITE_APP_VERSION="1.0.0"

# Health Connect (optional)
VITE_HEALTH_CONNECT_PACKAGE="com.google.android.apps.healthdata"

# Debug (development only)
VITE_DEBUG_MODE=true
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Android Setup

### 1. Android Studio Configuration

#### SDK Manager

1. Open Android Studio
2. Go to **Tools > SDK Manager**
3. Install the following:
   - Android SDK Platform 33 (API Level 33)
   - Android SDK Platform 34 (API Level 34)
   - Android SDK Build-Tools 34.0.0
   - Android Emulator
   - Android SDK Platform-Tools

#### Environment Variables

Add to your system PATH:

```bash
# Windows (add to System Environment Variables)
ANDROID_HOME=C:\Users\{username}\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\OpenJDK\openjdk-11.0.2

# macOS/Linux (add to ~/.bashrc or ~/.zshrc)
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 2. Capacitor Setup

```bash
# Install Capacitor CLI globally
npm install -g @capacitor/cli

# Add Android platform
npx cap add android

# Initial sync
npx cap sync
```

### 3. Verify Android Setup

```bash
# Check Capacitor configuration
npx cap doctor

# Should show green checkmarks for:
# ✅ Capacitor CLI
# ✅ Android SDK
# ✅ Java
```

## Building the App

### 1. Development Build

```bash
# Build web assets
npm run build

# Sync with Android
npx cap sync

# Open in Android Studio
npx cap open android
```

### 2. Creating APK

In Android Studio:

1. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Wait for build to complete
3. APK will be in `android/app/build/outputs/apk/debug/`

### 3. Release Build

```bash
# Build for production
npm run build

# Sync production build
npx cap sync

# Generate signed APK in Android Studio
# Build > Generate Signed Bundle / APK
```

## Device Testing

### 1. Android Emulator

```bash
# List available emulators
emulator -list-avds

# Start emulator
emulator -avd {AVD_NAME}

# Run app on emulator
npx cap run android
```

### 2. Physical Device

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect device via USB
4. Run: `npx cap run android --target {DEVICE_ID}`

## Troubleshooting

### Common Issues

#### Node.js Version Issues

```bash
# Use nvm to manage Node versions
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Android SDK Not Found

```bash
# Verify ANDROID_HOME
echo $ANDROID_HOME

# Install SDK via command line
sdkmanager "platforms;android-33" "build-tools;34.0.0"
```

#### Capacitor Sync Issues

```bash
# Clean and rebuild
rm -rf node_modules
npm install
npx cap clean android
npx cap add android
npx cap sync
```

#### Build Failures

```bash
# Clean Android build
cd android
./gradlew clean

# Return to root and sync
cd ..
npx cap sync
```

#### Permission Issues (Linux/macOS)

```bash
# Fix permission for gradlew
chmod +x android/gradlew

# Fix Android SDK permissions
sudo chown -R $(whoami) $ANDROID_HOME
```

### Health Connect Setup

For Health Connect integration:

1. Install Health Connect app from Play Store
2. Grant health permissions in app settings
3. Enable Health Connect in app preferences

### Performance Issues

- Ensure minimum 8GB RAM for Android Studio
- Close unnecessary applications during build
- Use SSD storage for better performance
- Increase JVM heap size if needed:
  ```bash
  export GRADLE_OPTS="-Xmx4096m -XX:MaxPermSize=512m"
  ```

## Next Steps

After successful installation:

1. Read the [Android Development Guide](ANDROID.md)
2. Review the [Architecture Documentation](ARCHITECTURE.md)
3. Check the [API Reference](API.md)
4. See [Contributing Guidelines](CONTRIBUTING.md)

## Support

If you encounter issues:

1. Check [GitHub Issues](https://github.com/priyanksachdeva/step-zero-zero/issues)
2. Review [Capacitor Documentation](https://capacitorjs.com/docs)
3. Consult [Android Developer Guide](https://developer.android.com/guide)

---

> **Note**: This installation guide is specifically for the Nothing Health Step Zero Zero project. Some steps may vary depending on your system configuration.
