import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://sympatica.studio',
  integrations: [preact(), mdx()],
  output: 'static',
});
