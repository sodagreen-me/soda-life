import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    port: 5399,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
