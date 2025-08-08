#!/bin/bash
# Mobile App Setup Script

echo "🚀 Setting up Nothing Health Mobile App..."

# Install Capacitor
echo "📱 Installing Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Initialize Capacitor
echo "⚙️ Initializing Capacitor..."
npx cap init "Nothing Health" "com.nothing.health" --web-dir=dist

# Add platforms
echo "📱 Adding mobile platforms..."
npx cap add android
npx cap add ios

# Build the app
echo "🔨 Building app..."
npm run build

# Copy web assets
echo "📋 Copying web assets..."
npx cap copy

echo "✅ Setup complete!"
echo ""
echo "To open in development environment:"
echo "  Android: npx cap open android"
echo "  iOS: npx cap open ios"
echo ""
echo "Make sure you have:"
echo "  - Android Studio (for Android)"
echo "  - Xcode (for iOS, macOS only)"
