import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://sojecki.pl',
  output: 'static',
  redirects: {
    '/reports': '/raporty',
    '/reports/hybrid-threats': '/raporty/zagrozenia-hybrydowe',
    '/projects': '/projekty',
  },
  integrations: [
    starlight({
      title: 'sojecki.pl',
      description: 'Publiczna strona Kamila Sojeckiego.',
      defaultLocale: 'root',
      locales: { root: { label: 'Polski', lang: 'pl' } },
      components: { PageTitle: './src/components/PageTitle.astro', Pagination: './src/components/ReportPagination.astro' },
      sidebar: [
        { label: 'Start', link: '/' },
        {
          label: 'Raporty',
          items: [
            { slug: 'raporty/zagrozenia-hybrydowe', label: 'Monitoring zagrożeń hybrydowych Rosji' },
            { slug: 'raporty/zagrozenia-hybrydowe/metodologia', label: 'Metodologia' },
            { label: 'Tygodniowe', items: [{ slug: 'raporty/zagrozenia-hybrydowe/tygodniowe' }, { autogenerate: { directory: 'raporty/zagrozenia-hybrydowe/tygodniowe' } }] },
            { label: 'Miesięczne', items: [{ slug: 'raporty/zagrozenia-hybrydowe/miesieczne' }, { autogenerate: { directory: 'raporty/zagrozenia-hybrydowe/miesieczne' } }] },
            { label: 'Roczne', items: [{ slug: 'raporty/zagrozenia-hybrydowe/roczne' }, { autogenerate: { directory: 'raporty/zagrozenia-hybrydowe/roczne' } }] },
          ],
        },
        { slug: 'blog', label: 'Blog' },
        { slug: 'projekty', label: 'Projekty' },
      ],
    }),
  ],
});
