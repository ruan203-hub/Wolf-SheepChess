import test from 'node:test';
import assert from 'node:assert/strict';

import { WOLF_ICON_SVG } from '../piece-icons.js';

test('wolf piece icon is an accessible decorative SVG', () => {
  assert.match(WOLF_ICON_SVG, /<svg\b/);
  assert.match(WOLF_ICON_SVG, /class="wolf-icon"/);
  assert.match(WOLF_ICON_SVG, /viewBox="0 0 64 64"/);
  assert.match(WOLF_ICON_SVG, /aria-hidden="true"/);
});
