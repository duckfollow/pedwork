# Photo Stamp PWA Icons

This folder contains the icons for the Photo Stamp Progressive Web App.

## Required Icons

Generate these PNG icons from the `stamp-icon.svg` file:

### Standard Icons (any purpose)
- `stamp-icon-72.png` - 72x72
- `stamp-icon-96.png` - 96x96
- `stamp-icon-128.png` - 128x128
- `stamp-icon-144.png` - 144x144
- `stamp-icon-152.png` - 152x152
- `stamp-icon-167.png` - 167x167 (iPad Pro)
- `stamp-icon-180.png` - 180x180 (iPhone)
- `stamp-icon-192.png` - 192x192
- `stamp-icon-384.png` - 384x384
- `stamp-icon-512.png` - 512x512

### Maskable Icons (for adaptive icons on Android)
- `stamp-icon-maskable-192.png` - 192x192 (with safe zone padding)
- `stamp-icon-maskable-512.png` - 512x512 (with safe zone padding)

### Shortcut Icons
- `camera-shortcut.png` - 96x96 (camera icon)
- `upload-shortcut.png` - 96x96 (upload icon)

### Screenshots (for app store listings)
- `screenshot-wide.png` - 1280x720 (desktop)
- `screenshot-narrow.png` - 540x720 (mobile)

### Open Graph Image
- `og-stamp.png` - 1200x630

### iOS Splash Screens
- `splash-640x1136.png` - iPhone 5
- `splash-750x1334.png` - iPhone 6/7/8
- `splash-1242x2208.png` - iPhone 6/7/8 Plus
- `splash-1125x2436.png` - iPhone X/XS
- `splash-1170x2532.png` - iPhone 12/13
- `splash-1284x2778.png` - iPhone 12/13 Pro Max

## Generating Icons

You can use tools like:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/nicnocquee/pwa-asset-generator)
- [Sharp](https://sharp.pixelplumbing.com/) - Node.js image processing

### Quick Generation with Sharp (Node.js)

```bash
npm install sharp
```

```javascript
const sharp = require('sharp');
const sizes = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512];

sizes.forEach(size => {
  sharp('stamp-icon.svg')
    .resize(size, size)
    .png()
    .toFile(`stamp-icon-${size}.png`);
});
```

## Maskable Icon Guidelines

For maskable icons, ensure important content is within the "safe zone" - a circle with diameter equal to 80% of the icon size, centered in the icon.

