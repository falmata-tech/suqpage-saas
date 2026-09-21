import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CategoryIllustration from '../components/CategoryIllustration';
import { BUSINESS_CATEGORY_OPTIONS } from '../lib/business-categories';

function render(name: string) {
  return renderToStaticMarkup(createElement(CategoryIllustration, { name }));
}
function artwork(name: string) {
  return render(name).replace(/data-category-illustration="[^"]*"/, '');
}
const known = BUSINESS_CATEGORY_OPTIONS.slice(0, 7).map(({ key }) => artwork(key));
assert.equal(new Set(known).size, 7, 'Each primary category has distinct artwork');
assert.equal(artwork('unknown-category'), artwork('all'), 'Unknown categories use the shop fallback');
assert.equal(artwork('other-manufacturing'), artwork('all'));
for (const { key } of BUSINESS_CATEGORY_OPTIONS) {
  const svg = render(key);
  assert.match(svg, /aria-hidden="true"/);
  assert.match(svg, /focusable="false"/);
  assert.doesNotMatch(svg, /<image|href=|<script/);
}
console.log('Category artwork, fallback and decorative accessibility tests passed.');
