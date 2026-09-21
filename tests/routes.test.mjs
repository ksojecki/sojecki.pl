import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const files = [
  'index.html', '404.html', 'blog/index.html', 'projekty/index.html', 'raporty/index.html',
  'raporty/zagrozenia-hybrydowe/index.html', 'raporty/zagrozenia-hybrydowe/metodologia/index.html',
  'raporty/zagrozenia-hybrydowe/tygodniowe/index.html', 'raporty/zagrozenia-hybrydowe/miesieczne/index.html', 'raporty/zagrozenia-hybrydowe/roczne/index.html',
  'raporty/zagrozenia-hybrydowe/tygodniowe/2026-09-w03/index.html', 'raporty/zagrozenia-hybrydowe/miesieczne/2026-04/index.html', 'raporty/zagrozenia-hybrydowe/miesieczne/2026-08/index.html', 'raporty/zagrozenia-hybrydowe/roczne/2025/index.html',
];

test('build preserves public Polish routes', async () => {
  for (const file of files) await access(path.join('dist', file));
});

test('Starlight owns the site shell', async () => {
  const page = await readFile('dist/raporty/zagrozenia-hybrydowe/index.html', 'utf8');
  assert.match(page, /starlight/);
  assert.match(page, /Szukaj/);
  assert.match(page, /Monitoring zagrożeń hybrydowych Rosji/);
  assert.doesNotMatch(page, /site-navigation|page-navigation/);
});

test('dashboard retains report metrics and lowercase links', async () => {
  const page = await readFile('dist/raporty/zagrozenia-hybrydowe/index.html', 'utf8');
  assert.match(page, /chart-data/);
  assert.match(page, /Aktualna intensywność/);
  assert.match(page, /Najnowszy raport tygodniowe/);
  assert.match(page, /2026-09-w03/);
  assert.doesNotMatch(page, /href="[^\"]*2026-09-W03/);
});

test('dashboard and archives exclude reports from other series', async () => {
  const [dashboard, archive] = await Promise.all([
    readFile('dist/raporty/zagrozenia-hybrydowe/index.html', 'utf8'),
    readFile('dist/raporty/zagrozenia-hybrydowe/tygodniowe/index.html', 'utf8'),
  ]);
  assert.doesNotMatch(`${dashboard}\n${archive}`, /Fixture: inna seria|2099-01-W01|10\/10|Atak/);
});

test('dashboard reads the intensity trend from frontmatter', async () => {
  const dashboard = await readFile('src/components/ReportDashboard.astro', 'utf8');
  assert.match(dashboard, /latest\?\.data\.intensityChange/);
  assert.doesNotMatch(dashboard, /latest\.data\.intensity\s*-/);
});

test('archives and reports keep derived Starlight pagination', async () => {
  const [archive, report] = await Promise.all([
    readFile('dist/raporty/zagrozenia-hybrydowe/tygodniowe/index.html', 'utf8'),
    readFile('dist/raporty/zagrozenia-hybrydowe/tygodniowe/2026-09-w02/index.html', 'utf8'),
  ]);
  assert.match(archive, /Tydzień 38/);
  assert.match(archive, /Napięcie/);
  assert.match(report, /<strong[^>]*>Starszy/);
  assert.match(report, /Tydzień 36/);
  assert.match(report, /<strong[^>]*>Nowszy/);
  assert.match(report, /Tydzień 38/);
  assert.match(report, /href="\/raporty\/zagrozenia-hybrydowe\/tygodniowe\/2026-09-w01\/"/);
  assert.match(report, /href="\/raporty\/zagrozenia-hybrydowe\/tygodniowe\/2026-09-w03\/"/);
  assert.match(report, /Metodologia/);
});

test('report navigation is derived from the collection', async () => {
  const [pagination, reports] = await Promise.all([
    readFile('src/components/ReportPagination.astro', 'utf8'),
    Promise.all((await markdownFiles('src/content/docs/raporty/zagrozenia-hybrydowe')).map((file) => readFile(file, 'utf8'))),
  ]);
  assert.match(pagination, /getCollection\('docs'\)/);
  assert.match(pagination, /data\.series === current\.data\.series/);
  assert.match(pagination, /data\.reportType === current\.data\.reportType/);
  assert.match(pagination, /data\.period\.localeCompare/);
  assert.doesNotMatch(reports.join('\n'), /^(?:prev|next):/m);
});

test('static output contains no private workspace paths', async () => {
  const pages = await htmlFiles('dist');
  const output = await Promise.all(pages.map((file) => readFile(file, 'utf8')));
  assert.doesNotMatch(output.join('\n'), /knowledge_base|Baza Wiedzy|_context|\/Users\/kamilsojecki/i);
});

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? htmlFiles(path.join(directory, entry.name)) : entry.name.endsWith('.html') ? [path.join(directory, entry.name)] : []))).flat();
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? markdownFiles(path.join(directory, entry.name)) : entry.name.endsWith('.md') ? [path.join(directory, entry.name)] : []))).flat();
}
