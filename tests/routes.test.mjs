import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
const files = ['index.html', 'blog/index.html', 'projekty/index.html', 'raporty/index.html', 'raporty/zagrozenia-hybrydowe/index.html', 'raporty/zagrozenia-hybrydowe/metodologia/index.html', 'raporty/zagrozenia-hybrydowe/tygodniowe/2026-09-W03/index.html', 'raporty/zagrozenia-hybrydowe/miesieczne/2026-08/index.html', 'raporty/zagrozenia-hybrydowe/roczne/2025/index.html', '404.html'];
test('build contains core Polish routes', async () => { for (const file of files) await access(`dist/${file}`); });
test('build contains no private workspace path', async () => { const page = await readFile('dist/raporty/zagrozenia-hybrydowe/index.html', 'utf8'); assert.doesNotMatch(page, /knowledge_base|Baza Wiedzy|_context/); });
