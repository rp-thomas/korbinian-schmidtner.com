import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import app from '../.vercel/output/_functions/entry.mjs';

const config = JSON.parse(readFileSync(new URL('../.vercel/output/config.json', import.meta.url)));
const hero = { width: 1920, widths: [800, 1200, 1920] };
const homepageCard = { width: 1200, widths: [600, 1200] };
const activityCard = { width: 800, widths: [400, 800] };
const pages = [
  ['/', [hero, homepageCard, homepageCard, homepageCard, homepageCard]],
  ['/sommer', [hero, activityCard, activityCard]],
  ['/winter', [hero, activityCard, activityCard]],
  ['/ueber-mich', [hero, { width: 125 }, { width: 150 }]],
  ['/kontakt', [hero]],
  ['/angebote/hochtouren', [hero]],
  ['/angebote/felsklettern', [hero]],
  ['/angebote/eisklettern', [hero]],
  ['/angebote/skitouren', [hero]],
];

function attribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1]?.replaceAll('&amp;', '&');
}

function imageWidth(url) {
  const { searchParams } = new URL(url, 'https://example.com');
  assert.equal(searchParams.get('q'), '80', 'image quality must remain 80');
  const width = Number(searchParams.get('w'));
  assert.ok(config.images.sizes.includes(width), `width ${width} must be allowed by Vercel`);
  return width;
}

for (const [path, expectedImages] of pages) {
  test(`${path} renders correctly sized image fallbacks and responsive candidates`, async () => {
    const response = await app.fetch(new Request(`https://example.com${path}`));
    assert.equal(response.status, 200);
    const html = await response.text();
    const images = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
    assert.equal(images.length, expectedImages.length);

    for (const [index, expected] of expectedImages.entries()) {
      assert.equal(imageWidth(attribute(images[index], 'src')), expected.width, `image ${index} fallback`);
      if (expected.widths) {
        const srcset = attribute(images[index], 'srcset');
        assert.ok(srcset, `image ${index} must have responsive candidates`);
        const widths = srcset.split(',').map((candidate) => {
          const [url, descriptor] = candidate.trim().split(/\s+/);
          const width = imageWidth(url);
          assert.equal(descriptor, `${width}w`);
          return width;
        });
        assert.deepEqual(widths, expected.widths, `image ${index} responsive widths`);
      }
    }
  });
}
