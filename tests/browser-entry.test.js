import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('browser entry uses a classic script so file opening works', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const browserScript = await readFile(new URL('../game.js', import.meta.url), 'utf8');

  assert.match(html, /<script src="game\.js\?v=20260516-capture-rule"><\/script>/);
  assert.doesNotMatch(html, /type="module"/);
  assert.doesNotMatch(browserScript, /^\s*import\s/m);
});

test('browser script renders wolf pieces with an inline cartoon icon', async () => {
  const browserScript = await readFile(new URL('../game.js', import.meta.url), 'utf8');

  assert.match(browserScript, /const WOLF_ICON_SVG = `/);
  assert.match(browserScript, /class="wolf-icon"/);
  assert.match(browserScript, /pieceEl\.innerHTML = WOLF_ICON_SVG/);
  assert.doesNotMatch(browserScript, /pieceEl\.textContent = piece === WOLF \? '狼' : '羊'/);
});
