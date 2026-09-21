import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://sojecki.pl',
  output: 'static',
  redirects: {
    '/reports': '/raporty',
    '/reports/hybrid-threats': '/raporty/zagrozenia-hybrydowe',
    '/projects': '/projekty'
  }
});
