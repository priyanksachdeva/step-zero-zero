@echo off
echo 🚀 Setting up Nothing Health Mobile App...

echo 📱 Installing Capacitor...
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

echo ⚙️ Initializing Capacitor...
npx cap init "Nothing Health" "com.nothing.health" --web-dir=dist

echo 📱 Adding mobile platforms...
npx cap add android
npx cap add ios

echo 🔨 Building app...
npm run build

echo 📋 Copying web assets...
npx cap copy

echo ✅ Setup complete!
echo.
echo To open in development environment:
echo   Android: npx cap open android
echo   iOS: npx cap open ios
echo.
echo Make sure you have:
echo   - Android Studio (for Android)
echo   - Xcode (for iOS, macOS only)
pause
