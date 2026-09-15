import { defineConfig } from 'astro/config';
import { webcore } from 'webcoreui/integration';

// https://astro.build/config
export default defineConfig({
  site: 'https://artistsarejerks-astro.pages.dev',
  server: { port: 4326 },
  output: 'static',
  integrations: [webcore()],
  build: {
    assets: '_assets'
  },
  vite: {
    build: {
      cssCodeSplit: false
    }
  }
});
