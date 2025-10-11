# Cloudflare Pages Deployment Guide

## Method 1: Deploy via Cloudflare Dashboard (Recommended)

### Step 1: Push to GitHub

1. Create a new repository on GitHub named `artistsarejerks-astro`
2. In your local project:

```bash
cd /Users/alanjust/artistsarejerks-astro
git init
git add .
git commit -m "Initial Astro site"
git remote add origin https://github.com/YOUR_USERNAME/artistsarejerks-astro.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account
3. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
4. Select your GitHub account and the `artistsarejerks-astro` repository
5. Click **Begin setup**

### Step 3: Configure Build Settings

Use these exact settings:

- **Project name**: `artistsarejerks-astro` (or your preferred name)
- **Production branch**: `main`
- **Framework preset**: `Astro`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Environment variables**: None needed

### Step 4: Deploy

1. Click **Save and Deploy**
2. Wait for the build to complete (usually 1-2 minutes)
3. Your site will be available at: `https://artistsarejerks-astro.pages.dev`

## Method 2: Deploy via Wrangler CLI

### Prerequisites

```bash
npm install -g wrangler
```

### Steps

1. **Login to Cloudflare**:
```bash
wrangler login
```

2. **Build your site**:
```bash
npm run build
```

3. **Deploy**:
```bash
wrangler pages deploy dist --project-name=artistsarejerks-astro
```

4. **Follow the prompts to create the project**

## Custom Domain Setup

After deploying, you can add a custom domain:

1. Go to your Pages project in Cloudflare Dashboard
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain name
5. Follow the DNS configuration instructions

## Continuous Deployment

Once connected to GitHub, Cloudflare Pages will automatically deploy:
- **Production**: Commits to `main` branch
- **Preview**: Commits to any other branch or pull requests

## Build Configuration File (Optional)

You can also create a `wrangler.toml` in your project root:

```toml
name = "artistsarejerks-astro"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"

[build]
command = "npm run build"
```

## Troubleshooting

### Build Fails

Check these common issues:
1. Ensure all dependencies are in `package.json`
2. Check build logs for specific errors
3. Verify Node.js version (Astro requires Node.js 18+)

### Images Not Loading

1. Ensure all images are in the `public/` directory
2. Check that image paths in your data files are correct
3. Verify images were included in the git commit

### Data Files Missing

1. Ensure `src/data/` files are committed to git
2. Check that JSON files are valid
3. Verify imports in page files

## Environment Variables

If you need environment variables:

1. In Cloudflare Dashboard → Your Project → **Settings** → **Environment variables**
2. Add variables for production and/or preview
3. Rebuild the project

## Rollback

To rollback to a previous deployment:

1. Go to your project in Cloudflare Dashboard
2. Click **Deployments**
3. Find the deployment you want to rollback to
4. Click **...** → **Rollback to this deployment**

## Monitoring

View your deployment status and logs:
1. Cloudflare Dashboard → Your Project
2. Click **Deployments** to see all deployments
3. Click on any deployment to see detailed logs

## Support

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/cloudflare/)
