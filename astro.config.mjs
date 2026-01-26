import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://artistsarejerks-astro.pages.dev',
  output: 'static', // Static output now supports API endpoints by default
  build: {
    assets: '_assets'
  },
  vite: {
    build: {
      cssCodeSplit: false
    }
  }
});
