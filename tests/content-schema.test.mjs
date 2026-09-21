import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import test from 'node:test';

const execFile = promisify(execFileCallback);
const fixture = 'src/content/docs/raporty/inna-seria/tygodniowe/2099-01-W01.md';

async function passesContentCheck(content) {
  await writeFile(fixture, content);
  try {
    await execFile('./node_modules/.bin/astro', ['check']);
    return true;
  } catch {
    return false;
  }
}

test('report schema requires period metadata and handles incomplete periods', async (t) => {
  const report = await readFile(fixture, 'utf8');
  const incomplete = report.replace('periodComplete: true', 'periodComplete: false');

  try {
    for (const field of ['periodStart', 'periodEnd', 'knowledgeDate', 'periodComplete']) {
      await t.test(`report without ${field} fails validation`, async () => {
        assert.equal(await passesContentCheck(report.replace(new RegExp(`^${field}:.*\\n`, 'm'), '')), false);
      });
    }

    await t.test('incomplete report with numeric intensityChange fails validation', async () => {
      assert.equal(await passesContentCheck(incomplete.replace('intensityChange: null', 'intensityChange: 1')), false);
    });

    await t.test('incomplete report with null intensityChange passes validation', async () => {
      assert.equal(await passesContentCheck(incomplete), true);
    });
  } finally {
    await writeFile(fixture, report);
  }
});
