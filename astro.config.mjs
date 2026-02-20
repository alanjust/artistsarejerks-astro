import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://artistsarejerks-astro.pages.dev',
  server: { port: 4324 },
  output: 'static', // Astro v5: static with per-route SSR via prerender = false
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
