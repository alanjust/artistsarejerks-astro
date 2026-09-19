import node from '@astrojs/node';
import clerk from '@clerk/astro';
import { defineConfig } from 'astro/config';
import { webcore } from 'webcoreui/integration';

// https://astro.build/config
export default defineConfig({
  site: 'https://artistsarejerks-astro.pages.dev',
  server: { port: 4326 },
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [clerk(), webcore()],
  build: {
    assets: '_assets'
  },
  vite: {
    build: {
      target: "esnext",
      cssCodeSplit: false
    }
  }
});