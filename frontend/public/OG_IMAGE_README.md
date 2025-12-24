# Open Graph Image

## Current Status

The `og-image.svg` file is currently an SVG placeholder. For optimal social media sharing, this should be converted to PNG format (1200x630px).

## How to Convert SVG to PNG

### Option 1: Using Online Tools
1. Open https://cloudconvert.com/svg-to-png
2. Upload `og-image.svg`
3. Set dimensions to 1200x630
4. Download as `og-image.png`

### Option 2: Using ImageMagick (CLI)
```bash
# Install ImageMagick if needed
brew install imagemagick  # macOS
sudo apt-get install imagemagick  # Ubuntu/Debian

# Convert SVG to PNG
convert og-image.svg -resize 1200x630 og-image.png
```

### Option 3: Using Node.js (sharp)
```bash
npm install sharp
node -e "require('sharp')('og-image.svg').png().resize(1200, 630).toFile('og-image.png')"
```

## Verification

After creating the PNG, test it with:
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

## SEO Meta Tags

The following meta tags reference this image:
- `<meta property="og:image" content="https://mx-error-guide.pages.dev/og-image.png" />`
- `<meta name="twitter:image" content="https://mx-error-guide.pages.dev/og-image.png" />`

Make sure the PNG file is named `og-image.png` and placed in the `/public` directory.
