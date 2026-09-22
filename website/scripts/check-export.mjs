import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const output = resolve('dist/client');
const prefix = '/iap/';
const pages = JSON.parse(await readFile('site-pages.json', 'utf8'));
const routes = pages.map(page => page.path.slice(1, -1));
let checked = 0;
for (const route of routes) {
  const filename = join(output, route, 'index.html');
  const html = await readFile(filename, 'utf8');
  assert.match(html, /<html[^>]+lang="ja"/);
  assert.match(html, /<main\b/);
  const expected = pages.find(page => page.path === `/${route ? `${route}/` : ''}`);
  const canonical = `https://aidhidesupport.github.io/iap${expected.path}`;
  const metadata = [...html.matchAll(/<meta\s[^>]*>/g)].map(([tag]) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value])));
  const field = name => metadata.find(meta => meta.name === name || meta.property === name)?.content;
  const links = [...html.matchAll(/<link\s[^>]*>/g)].map(([tag]) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value])));
  assert.equal(links.find(link => link.rel === 'canonical')?.href, canonical);
  assert.equal(field('description'), expected.description);
  assert.equal(field('og:url'), canonical);
  assert.equal(field('og:description'), expected.description);
  assert.equal(field('twitter:description'), expected.description);
  assert.equal(field('og:image'), 'https://aidhidesupport.github.io/iap/og.png');
  assert.equal(field('twitter:image'), 'https://aidhidesupport.github.io/iap/og.png');
  assert.equal(field('twitter:card'), 'summary_large_image');
  assert(field('og:title')?.startsWith(expected.title));
  assert.equal(field('twitter:title'), field('og:title'));
  for (const [, value] of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
    if (/^(?:https?:|data:|mailto:|tel:|\/\/)/.test(value)) continue;
    const url = new URL(value.replaceAll('&amp;', '&'), `https://aidhidesupport.github.io/iap/${route ? `${route}/` : ''}`);
    assert(url.pathname.startsWith(prefix), `${route}: missing project prefix: ${value}`);
    const pathname = decodeURIComponent(url.pathname.slice(prefix.length));
    let target = join(output, pathname);
    if (url.pathname.endsWith('/')) target = join(target, 'index.html');
    assert((await stat(target)).isFile(), `${route}: missing ${value}`);
    if (url.hash && target.endsWith('.html')) {
      const content = target === filename ? html : await readFile(target, 'utf8');
      const id = decodeURIComponent(url.hash.slice(1));
      assert(content.includes(`id="${id}"`), `${route}: missing fragment ${value}`);
    }
    checked++;
  }
}
const vtt = await readFile(join(output, 'media/iap-demo.vtt'), 'utf8');
assert(vtt.startsWith('WEBVTT\n'));
assert((await stat(join(output, 'media/iap-demo.mp4'))).size > 1_000_000);
assert((await readdir(output)).includes('.nojekyll'));
assert(!(await readdir(output)).includes('server'));
const sitemap = await readFile(join(output, 'sitemap.xml'), 'utf8');
assert.equal([...sitemap.matchAll(/<loc>/g)].length, pages.length);
for (const page of pages) assert(sitemap.includes(`<loc>https://aidhidesupport.github.io/iap${page.path}</loc>`));
assert((await readFile(join(output, 'robots.txt'), 'utf8')).includes('Sitemap: https://aidhidesupport.github.io/iap/sitemap.xml'));
assert((await readFile(join(output, 'og.png'))).subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
console.log(`Static export OK: ${routes.length} pages, ${checked} local references, video and captions.`);
