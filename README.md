# Text2QR Mobile

Mobile app for offline text encryption and QR code tools. Built with React, Capacitor, and TypeScript.

## Features

- **Text to QR** — Encrypt text with a password and generate a QR code
- **QR to Text** — Scan QR code with camera or upload image, then decrypt
- **Encrypt Text** — Convert plain text to an encrypted string using AES-256
- **Decrypt Text** — Restore encrypted text to its original form

All operations are performed **entirely offline** — no internet connection required.

## Development

```bash
npm install
npm run dev
```

## Build for Android

```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```

Then build the APK/AAB in Android Studio.

## Build for iOS

```bash
npm run build
npx cap add ios
npx cap sync
npx cap open ios
```

Then build in Xcode (requires macOS).

## Encryption

Uses AES-256-CBC encryption via CryptoJS with deterministic key derivation (EVP-KDF + SHA256 salt). Fully compatible with the [text2qr.com](https://text2qr.com) web version and the desktop app.

## License

MIT
