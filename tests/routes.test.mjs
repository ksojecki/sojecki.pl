import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const files = [
  'index.html', 'blog/index.html', 'projekty/index.html', 'raporty/index.html',
  'raporty/zagrozenia-hybrydowe/index.html', 'raporty/zagrozenia-hybrydowe/metodologia/index.html',
  'raporty/zagrozenia-hybrydowe/tygodniowe/index.html', 'raporty/zagrozenia-hybrydowe/miesieczne/index.html', 'raporty/zagrozenia-hybrydowe/roczne/index.html',
  'raporty/zagrozenia-hybrydowe/tygodniowe/2026-09-w03/index.html', 'raporty/zagrozenia-hybrydowe/miesieczne/2026-08/index.html', 'raporty/zagrozenia-hybrydowe/roczne/2025/index.html', '404.html'
];

test('build contains required Polish routes', async () => {
  for (const file of files) await access(path.join('dist', file));
});

test('dashboard links to lowercase reports and includes chart data', async () => {
  const page = await readFile('dist/raporty/zagrozenia-hybrydowe/index.html', 'utf8');
  assert.match(page, /2026-09-w03/);
  assert.doesNotMatch(page, /href="[^\"]*2026-09-W03/);
  assert.match(page, /chart-data/);
  assert.match(page, /Aktualna intensywność/);
  assert.match(page, /Najnowszy: tygodniowe/);
  assert.match(page, /Najnowszy: miesięczne/);
  assert.match(page, /Najnowszy: roczne/);
});

test('shared navigation is present outside the root page only', async () => {
  const [root, blog] = await Promise.all([readFile('dist/index.html', 'utf8'), readFile('dist/blog/index.html', 'utf8')]);
  assert.doesNotMatch(root, /data-page-navigation/);
  assert.match(blog, /data-page-navigation/);
  assert.match(blog, /Strona główna/);
  assert.ok(blog.indexOf('data-page-navigation') > blog.indexOf('<h1>Blog'));
  assert.match(blog, /site-navigation[\s\S]*text-decoration:none/);
  assert.match(blog, /footer\{[^}]*background:0 0/);
});

test('reports listing contains the series description without a thumbnail', async () => {
  const page = await readFile('dist/raporty/index.html', 'utf8');
  assert.match(page, /Zagrożenia hybrydowe Rosji/);
  assert.match(page, /Regularny przegląd udokumentowanych działań/);
  assert.doesNotMatch(page, /raporty-hero-zolnierz\.png|class="report-image"/);
});

test('report includes breadcrumbs and adjacent-report navigation', async () => {
  const page = await readFile('dist/raporty/zagrozenia-hybrydowe/tygodniowe/2026-09-w02/index.html', 'utf8');
  assert.match(page, /Strona główna/);
  assert.match(page, /<a href="\/raporty"[^>]*>Raporty<\/a>/);
  assert.match(page, /Strona główna[\s\S]*Raporty[\s\S]*Tygodniowe/);
  assert.match(page, /Tygodniowe/);
  assert.match(page, /aria-current="page"[^>]*>Tydzień 37/);
  assert.match(page, /Nowszy/);
  assert.match(page, /Starszy/);
  assert.ok(page.indexOf('Starszy') < page.indexOf('Nowszy'));
  assert.match(page, /data-page-navigation/);
  assert.match(page, /is-scrolled/);
  assert.match(page, /position:sticky/);
});

test('archives link to reports without embedding report bodies', async () => {
  const weekly = await readFile('dist/raporty/zagrozenia-hybrydowe/tygodniowe/index.html', 'utf8');
  const monthly = await readFile('dist/raporty/zagrozenia-hybrydowe/miesieczne/index.html', 'utf8');
  const annual = await readFile('dist/raporty/zagrozenia-hybrydowe/roczne/index.html', 'utf8');
  assert.match(weekly, /Tydzień 38/);
  assert.match(weekly, /2026-09-w03/);
  assert.match(monthly, /2026-08/);
  assert.match(annual, /2025/);
  assert.doesNotMatch(weekly, /Materiał z tego okresu składa się/);
});

test('static build contains no private workspace paths', async () => {
  const pages = await htmlFiles('dist');
  const output = await Promise.all(pages.map((file) => readFile(file, 'utf8')));
  assert.doesNotMatch(output.join('\n'), /knowledge_base|Baza Wiedzy|_context|\/Users\/kamilsojecki/i);
});

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? htmlFiles(path.join(directory, entry.name)) : entry.name.endsWith('.html') ? [path.join(directory, entry.name)] : []));
  return nested.flat();
}
