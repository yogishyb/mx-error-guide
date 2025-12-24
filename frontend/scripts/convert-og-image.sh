#!/bin/bash

# Convert OG Image from SVG to PNG
# Usage: ./scripts/convert-og-image.sh

set -e

echo "Converting og-image.svg to og-image.png..."

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    convert public/og-image.svg -resize 1200x630 public/og-image.png
    echo "✅ Converted using ImageMagick"
elif command -v node &> /dev/null; then
    echo "ImageMagick not found. Trying Node.js with sharp..."

    # Check if sharp is installed
    if npm list sharp &> /dev/null; then
        node -e "
        const sharp = require('sharp');
        const fs = require('fs');

        fs.readFile('public/og-image.svg', (err, data) => {
          if (err) throw err;
          sharp(data)
            .png()
            .resize(1200, 630)
            .toFile('public/og-image.png', (err, info) => {
              if (err) throw err;
              console.log('✅ Converted using sharp:', info);
            });
        });
        "
    else
        echo "Installing sharp..."
        npm install --save-dev sharp
        node -e "
        const sharp = require('sharp');
        const fs = require('fs');

        fs.readFile('public/og-image.svg', (err, data) => {
          if (err) throw err;
          sharp(data)
            .png()
            .resize(1200, 630)
            .toFile('public/og-image.png', (err, info) => {
              if (err) throw err;
              console.log('✅ Converted using sharp:', info);
            });
        });
        "
    fi
else
    echo "❌ Error: Neither ImageMagick nor Node.js found."
    echo "Please install one of the following:"
    echo "  - ImageMagick: brew install imagemagick"
    echo "  - Use online converter: https://cloudconvert.com/svg-to-png"
    exit 1
fi

# Verify the file was created
if [ -f "public/og-image.png" ]; then
    echo "✅ Success! og-image.png created"
    ls -lh public/og-image.png
    echo ""
    echo "Next steps:"
    echo "1. Verify the image looks correct"
    echo "2. Run: npm run build"
    echo "3. Deploy to Cloudflare Pages"
    echo "4. Test social sharing:"
    echo "   - Facebook: https://developers.facebook.com/tools/debug/"
    echo "   - Twitter: https://cards-dev.twitter.com/validator"
else
    echo "❌ Error: og-image.png was not created"
    exit 1
fi
