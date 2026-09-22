import type { Metadata } from 'next';
import pages from '../site-pages.json';
const origin = 'https://aidhidesupport.github.io';
const image = { url: `${origin}/iap/og.png`, width: 1730, height: 909, alt: 'IAP — 協働の条件を、持ち運べる形に。partial-standardsによる仕様草案・ガイド・基本実装。' };
export function pageMetadata(path: string): Metadata {
  const page = pages.find(item => item.path === path);
  if (!page) throw new Error(`Unknown public page: ${path}`);
  const title = `${page.title} | ${path === '/' ? 'partial-standards' : 'IAP'}`;
  const url = `${origin}/iap${path}`;
  return { title: { absolute: title }, description: page.description,
    alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'ja_JP', siteName: 'IAP / partial-standards', title, description: page.description, url, images: [image] },
    twitter: { card: 'summary_large_image', title, description: page.description, images: [image] },
  };
}
