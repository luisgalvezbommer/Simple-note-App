# Convert to APK with Capacitor

```bash
# Initialize npm project
npm init -y

# Install Capacitor CLI and core locally
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor in project
# App Name: Click App, App ID:  com.luisgalvezbommer.clickapp, Web Dir: src or www !!!!

# Important: webDir must be the folder where index.html is located !!!
npx cap init

# Add Android platform
npm install @capacitor/android
npx cap add android

# Copy web assets
npx cap sync android

# Option 1Android studio
cd android
./gradlew assembleDebug

# the apk will be in android/app/build/outputs/apk/debug/app-debug.apk
```

Everytime after updating code, run:

```bash
npx cap sync android
cd android
./gradlew assembleDebug
cd ..
```

cp apk in project root:

```bash
cp android/app/build/outputs/apk/debug/app-debug.apk clickapp.apk
```

Serve to device:

```bash
python3 -m http.server 8000
```

# How to add icon to app

Go to [https://www.recraft.ai/projects](https://www.recraft.ai/projects) to create icon
```bash
npm install @capacitor/assets --save-dev

# in project root
mkdir resources

cp ~/Downloads/icon.png resources/icon.png # must be icon.png

# Generate icons
npx capacitor-assets generate --android

# then build again
cd android
./gradlew assembleDebug
cd ..