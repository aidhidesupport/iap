import { access, mkdir, rename, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// vinext's current prerenderer follows slash redirects before exporting.
// Render without redirects, then use directory indexes for GitHub Pages.
const output = 'dist/client';
const pages = JSON.parse(await readFile('site-pages.json', 'utf8'));
const routes = pages.map(page => page.path.slice(1, -1)).filter(Boolean);
for (const route of routes) {
  const source = join(output, `${route}.html`);
  await access(source);
  await mkdir(join(output, route), { recursive: true });
  await rename(source, join(output, route, 'index.html'));
}
// assetPrefix is a URL prefix; Pages itself supplies the repository prefix.
await rename(join(output, 'iap', '_next'), join(output, '_next'));
await access(join(output, 'index.html'));
await writeFile(join(output, '.nojekyll'), '');
const origin = 'https://aidhidesupport.github.io/iap';
await writeFile(join(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + pages.map(page => `  <url><loc>${origin}${page.path}</loc></url>`).join('\n') + '\n</urlset>\n');
await writeFile(join(output, 'robots.txt'), `User-agent: *\nAllow: /iap/\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Prepared ${pages.length} static pages, sitemap and robots for /iap/.`);
