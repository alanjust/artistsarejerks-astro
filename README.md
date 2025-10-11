# Artists Are Jerks - Astro Migration

This is an Astro version of the Hugo site at `artistsarejerks-site.pages.dev`.

## Setup Instructions

### 1. Install Dependencies

```bash
cd /Users/alanjust/artistsarejerks-astro
npm install
```

### 2. Copy Data Files

The data files need to be copied from the Hugo site:

```bash
# Copy data files
cp /Users/alanjust/artistsarejerks-site/data/art_history_movements.json ./src/data/
cp /Users/alanjust/artistsarejerks-site/data/artists.json ./src/data/
```

### 3. Copy Static Assets

```bash
# Create public directories
mkdir -p public/images/artists
mkdir -p public/styles
mkdir -p public/scripts

# Copy the art wheel SVG
cp /Users/alanjust/artistsarejerks-site/static/images/art-wheel.svg ./public/images/

# Copy all artist images
cp -r /Users/alanjust/artistsarejerks-site/static/images/artists/* ./public/images/artists/

# Copy CSS
cp /Users/alanjust/artistsarejerks-site/assets/css/components/art-wheel.css ./public/styles/

# Copy JavaScript
cp /Users/alanjust/artistsarejerks-site/assets/js/art-wheel.js ./public/scripts/
```

### 4. Test Locally

```bash
npm run dev
```

Visit `http://localhost:4321` to see your site.

### 5. Build for Production

```bash
npm run build
```

## Deployment to Cloudflare Pages

### Option 1: Using Cloudflare Dashboard

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/)
2. Click "Create a project"
3. Connect to your GitHub repository
4. Use these build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
   - **Environment variables**: None needed

### Option 2: Using Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run build
wrangler pages deploy dist --project-name=artistsarejerks-astro
```

## GitHub Setup

### Initialize Git Repository

```bash
cd /Users/alanjust/artistsarejerks-astro

# Initialize git
git init

# Add .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json

# Build output
dist/
.astro/

# Environment files
.env
.env.*

# macOS
.DS_Store

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
EOF

# Add files
git add .
git commit -m "Initial Astro migration from Hugo"
```

### Create GitHub Repository

1. Go to GitHub and create a new repository named `artistsarejerks-astro`
2. Don't initialize with README (you already have files)
3. Run these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/artistsarejerks-astro.git
git branch -M main
git push -u origin main
```

## Directory Structure

```
artistsarejerks-astro/
├── public/              # Static assets
│   ├── images/
│   │   ├── art-wheel.svg
│   │   └── artists/     # All artist images
│   ├── styles/
│   │   └── art-wheel.css
│   └── scripts/
│       └── art-wheel.js
├── src/
│   ├── components/      # Astro components
│   │   ├── Header.astro
│   │   └── Footer.astro
│   ├── data/           # JSON data files
│   │   ├── art_history_movements.json
│   │   └── artists.json
│   ├── layouts/        # Layout components
│   │   └── BaseLayout.astro
│   ├── pages/          # Page routes
│   │   ├── index.astro
│   │   └── art-wheel.astro
│   ├── scripts/        # Additional scripts
│   └── styles/         # Additional styles
├── astro.config.mjs    # Astro configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Key Differences from Hugo

1. **File organization**: Astro uses `src/pages` for routing instead of Hugo's `content/` directory
2. **Components**: Astro components (.astro files) replace Hugo partials
3. **Data**: JSON data is imported directly in Astro instead of using Hugo's data directory
4. **Static assets**: Files in `public/` are served at the root URL
5. **Styling**: CSS can be scoped to components or kept in public folder

## Next Steps

After setup, you should:

1. Create additional pages for the other menu items:
   - `/src/pages/whats-a-jerk.astro`
   - `/src/pages/artist-studio-guide.astro`
   - `/src/pages/how-art-works.astro`
   - `/src/pages/gatekeepers.astro`
   - `/src/pages/class-room.astro`
   - `/src/pages/attention-lab.astro`

2. Review and update the menu dropdown logic in `Header.astro` if you have submenu items

3. Test the art wheel functionality thoroughly

4. Set up Cloudflare Pages deployment

## Troubleshooting

### Art Wheel Not Loading
- Check browser console for JavaScript errors
- Verify data files are in `src/data/`
- Ensure art-wheel.svg is in `public/images/`

### Images Not Showing
- Verify all images are in `public/images/artists/`
- Check image paths in artists.json start with `/images/artists/`

### Build Errors
- Run `npm run astro check` to identify TypeScript errors
- Clear the Astro cache: `rm -rf .astro`

## Support

For Astro-specific questions, see the [Astro documentation](https://docs.astro.build).
