import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const files = [
  'index.html', '404.html', 'blog/index.html', 'projekty/index.html', 'raporty/index.html',
  'raporty/zagrozenia-hybrydowe/index.html', 'raporty/zagrozenia-hybrydowe/metodologia/index.html',
  'raporty/zagrozenia-hybrydowe/tygodniowe/index.html', 'raporty/zagrozenia-hybrydowe/miesieczne/index.html', 'raporty/zagrozenia-hybrydowe/roczne/index.html',
  'raporty/zagrozenia-hybrydowe/tygodniowe/2026-09-w03/index.html', 'raporty/zagrozenia-hybrydowe/miesieczne/2026-08/index.html', 'raporty/zagrozenia-hybrydowe/roczne/2025/index.html',
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

test('archives and reports keep Starlight pagination', async () => {
  const [archive, report] = await Promise.all([
    readFile('dist/raporty/zagrozenia-hybrydowe/tygodniowe/index.html', 'utf8'),
    readFile('dist/raporty/zagrozenia-hybrydowe/tygodniowe/2026-09-w02/index.html', 'utf8'),
  ]);
  assert.match(archive, /Tydzień 38/);
  assert.match(archive, /Napięcie/);
  assert.match(report, /Nowszy: Tydzień 38/);
  assert.match(report, /Starszy: Tydzień 36/);
  assert.match(report, /Metodologia/);
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
