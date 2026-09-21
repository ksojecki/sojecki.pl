import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({ site: 'https://sojecki.pl', output: 'static', redirects: { '/reports': '/raporty', '/reports/hybrid-threats': '/raporty/zagrozenia-hybrydowe', '/projects': '/projekty' }, vite: { resolve: { tsconfigPaths: false, alias: { 'astro/tsconfigs/strict': fileURLToPath(new URL('./node_modules/astro/tsconfigs/strict.json', import.meta.url)) } } } });
