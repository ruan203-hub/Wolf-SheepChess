import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('page includes a day and night board background toggle', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
  const js = await readFile(new URL('../game.js', import.meta.url), 'utf8');

  assert.match(html, /id="themeToggle"/);
  assert.match(html, />晚上模式</);
  assert.match(css, /body\[data-theme="night"\]/);
  assert.match(css, /--board-bg:/);
  assert.match(css, /--button-bg:/);
  assert.match(css, /--button-ink:/);
  assert.match(css, /button\s*\{[\s\S]*color: var\(--button-ink\)/);
  assert.match(js, /themeToggle/);
  assert.match(js, /dataset\.theme/);
  assert.match(js, /try \{/);
  assert.match(js, /catch/);
});
