#!/bin/bash

# Artists Are Jerks - Astro Migration Setup Script
# This script copies all necessary files from the Hugo site to the Astro site

set -e  # Exit on error

echo "🎨 Artists Are Jerks - Astro Migration Setup"
echo "=============================================="
echo ""

# Define paths
HUGO_PATH="/Users/alanjust/artistsarejerks-site"
ASTRO_PATH="/Users/alanjust/artistsarejerks-astro"

# Check if Hugo site exists
if [ ! -d "$HUGO_PATH" ]; then
    echo "❌ Error: Hugo site not found at $HUGO_PATH"
    exit 1
fi

# Check if Astro site exists
if [ ! -d "$ASTRO_PATH" ]; then
    echo "❌ Error: Astro site not found at $ASTRO_PATH"
    exit 1
fi

cd "$ASTRO_PATH"

echo "📁 Creating necessary directories..."
mkdir -p public/images/artists
mkdir -p public/styles
mkdir -p public/scripts
mkdir -p src/data

echo "📊 Copying data files..."
cp "$HUGO_PATH/data/art_history_movements.json" "./src/data/"
cp "$HUGO_PATH/data/artists.json" "./src/data/"
echo "✅ Data files copied"

echo "🖼️  Copying art wheel SVG..."
cp "$HUGO_PATH/static/images/art-wheel.svg" "./public/images/"
echo "✅ Art wheel SVG copied"

echo "🎭 Copying artist images..."
cp -r "$HUGO_PATH/static/images/artists/"* "./public/images/artists/"
echo "✅ Artist images copied ($(ls -1 ./public/images/artists/ | wc -l) files)"

echo "🎨 Copying CSS files..."
cp "$HUGO_PATH/assets/css/components/art-wheel.css" "./public/styles/"
echo "✅ CSS files copied"

echo "📜 Copying JavaScript files..."
cp "$HUGO_PATH/assets/js/art-wheel.js" "./public/scripts/"
echo "✅ JavaScript files copied"

echo ""
echo "✨ Migration setup complete!"
echo ""
echo "Next steps:"
echo "1. cd $ASTRO_PATH"
echo "2. npm install"
echo "3. npm run dev"
echo ""
echo "Then visit http://localhost:4321 to see your site!"
