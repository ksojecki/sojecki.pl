import { readdirSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const reportSeriesDirectory = path.join(process.cwd(), 'src/content/docs/raporty/zagrozenia-hybrydowe');
const reportSeriesRoute = '/raporty/zagrozenia-hybrydowe';

function walkMarkdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkMarkdownFiles(entryPath) : entry.name.endsWith('.md') ? [entryPath] : [];
  });
}

function normalizePath(filePath) {
  return filePath.replaceAll(path.sep, '/');
}

function nestedReportRedirects() {
  return Object.fromEntries(
    walkMarkdownFiles(reportSeriesDirectory)
      .map((filePath) => normalizePath(path.relative(reportSeriesDirectory, filePath)))
      .flatMap((relativePath) => {
        if (relativePath === 'index.md' || relativePath === 'metodologia.md') return [];
        const lowerCasePath = relativePath.toLowerCase();
        if (/^\d{4}\/index\.md$/.test(lowerCasePath)) {
          const year = lowerCasePath.slice(0, 4);
          return [[`${reportSeriesRoute}/roczne/${year}`, `${reportSeriesRoute}/${year}`]];
        }
        if (/^\d{4}\/\d{2}\/index\.md$/.test(lowerCasePath)) {
          const [year, month] = relativePath.split('/');
          return [[`${reportSeriesRoute}/miesieczne/${year}-${month}`, `${reportSeriesRoute}/${year}/${month}`]];
        }
        if (/^\d{4}\/\d{2}\/\d{4}-\d{2}-w\d{2}\.md$/.test(lowerCasePath)) {
          const [year, month, filename] = relativePath.split('/');
          const slug = filename.replace(/\.md$/, '');
          return [[`${reportSeriesRoute}/tygodniowe/${slug.toLowerCase()}`, `${reportSeriesRoute}/${year}/${month}/${slug}`]];
        }
        return [];
      }),
  );
}

export default defineConfig({
  site: 'https://sojecki.pl',
  output: 'static',
  redirects: {
    '/reports': '/raporty',
    '/reports/hybrid-threats': '/raporty/zagrozenia-hybrydowe',
    '/projects': '/projekty',
    '/raporty/zagrozenia-hybrydowe/tygodniowe': '/raporty/zagrozenia-hybrydowe',
    '/raporty/zagrozenia-hybrydowe/miesieczne': '/raporty/zagrozenia-hybrydowe',
    '/raporty/zagrozenia-hybrydowe/roczne': '/raporty/zagrozenia-hybrydowe',
    ...nestedReportRedirects(),
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
            { autogenerate: { directory: 'raporty/zagrozenia-hybrydowe' } },
          ],
        },
        { slug: 'blog', label: 'Blog' },
        { slug: 'projekty', label: 'Projekty' },
      ],
    }),
  ],
});
