import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://artistsarejerks-astro.pages.dev',
  output: 'hybrid', // Hybrid mode: static by default, opt-in to SSR for API routes
  adapter: cloudflare({
    imageService: 'passthrough'
  }),
  build: {
    assets: '_assets'
  },
  vite: {
    build: {
      cssCodeSplit: false
    }
  }
});
