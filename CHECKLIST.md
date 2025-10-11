# Migration Checklist

Use this checklist to track your progress migrating from Hugo to Astro.

## Initial Setup ✓
- [x] Astro project created
- [x] Directory structure established
- [x] Configuration files created
- [x] BaseLayout component created
- [x] Header component created
- [x] Footer component created
- [x] Art wheel page created
- [x] Setup script created
- [x] Documentation written

## Your Tasks

### Phase 1: Local Setup
- [ ] Run `./setup.sh` to copy files from Hugo site
- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run dev` to start development server
- [ ] Visit `http://localhost:4321` to verify home page
- [ ] Visit `http://localhost:4321/art-wheel` to verify art wheel
- [ ] Test navigation menu
- [ ] Test dropdown menus
- [ ] Test art wheel rotation
- [ ] Test art wheel artist selection
- [ ] Verify all artist images load

### Phase 2: Content Migration
- [ ] Create `/whats-a-jerk` page
- [ ] Create `/artist-studio-guide` page
- [ ] Create `/how-art-works` page
- [ ] Create `/gatekeepers` page
- [ ] Create `/class-room` page
- [ ] Create `/attention-lab` page
- [ ] Copy any additional content from Hugo site
- [ ] Verify all internal links work
- [ ] Add any missing images
- [ ] Update menu if needed (submenus, etc.)

### Phase 3: Testing
- [ ] Test on desktop Chrome
- [ ] Test on desktop Firefox
- [ ] Test on desktop Safari
- [ ] Test on mobile Chrome
- [ ] Test on mobile Safari
- [ ] Test on tablet
- [ ] Verify responsive design
- [ ] Check all images load
- [ ] Verify no console errors
- [ ] Test all navigation
- [ ] Verify footer appears correctly
- [ ] Test art wheel on all devices

### Phase 4: GitHub Setup
- [ ] Create GitHub repository `artistsarejerks-astro`
- [ ] Run `git init` in project directory
- [ ] Run `git add .`
- [ ] Run `git commit -m "Initial Astro site"`
- [ ] Add GitHub remote
- [ ] Push to GitHub main branch
- [ ] Verify all files are in repository
- [ ] Check that .gitignore is working

### Phase 5: Cloudflare Deployment
- [ ] Log into Cloudflare Dashboard
- [ ] Navigate to Workers & Pages
- [ ] Click "Create application" → "Pages"
- [ ] Connect to GitHub
- [ ] Select `artistsarejerks-astro` repository
- [ ] Configure build settings:
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`
  - [ ] Framework preset: Astro
- [ ] Deploy site
- [ ] Wait for build to complete
- [ ] Visit deployed site URL
- [ ] Verify site works in production

### Phase 6: Production Verification
- [ ] Test all pages on production site
- [ ] Verify art wheel works
- [ ] Check all images load
- [ ] Test navigation
- [ ] Verify responsive design
- [ ] Check console for errors
- [ ] Test on mobile devices
- [ ] Verify performance (site should be fast)

### Phase 7: Domain & DNS (Optional)
- [ ] Add custom domain in Cloudflare (if desired)
- [ ] Update DNS settings
- [ ] Verify SSL certificate
- [ ] Test domain access
- [ ] Update any external links

### Phase 8: Maintenance Setup
- [ ] Set up automatic deployments (push to main = deploy)
- [ ] Configure any analytics
- [ ] Set up any monitoring
- [ ] Document any custom workflows
- [ ] Archive Hugo site (keep as backup)

## Troubleshooting Log

If you encounter issues, document them here:

### Issue 1
- **Problem**: 
- **Solution**: 

### Issue 2
- **Problem**: 
- **Solution**: 

### Issue 3
- **Problem**: 
- **Solution**: 

## Notes

Any additional notes or observations about the migration:

---

## Completion

When all tasks are checked off:
- [ ] Astro site fully functional
- [ ] All content migrated
- [ ] Deployed to Cloudflare Pages
- [ ] Custom domain configured (if applicable)
- [ ] Hugo site archived

Migration completed on: _______________

Deployed URL: _________________________

Custom domain: ________________________
