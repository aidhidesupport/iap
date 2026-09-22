import type { ComponentProps } from 'react';

// Native navigation works on static hosts without an RSC request handler.
type Props = ComponentProps<'a'> & { href: string; prefetch?: boolean };
export default function SiteLink({ href, prefetch: _prefetch, children, ...props }: Props) {
  if (href.startsWith('/') && !href.startsWith('//')) {
    const url = new URL(href, 'https://aidhidesupport.github.io');
    const isAsset = /\.[a-z0-9]+$/i.test(url.pathname);
    const pathname = isAsset ? url.pathname : `${url.pathname.replace(/\/$/, '')}/`;
    href = `/iap${pathname}${url.search}${url.hash}`;
  }
  return <a {...props} href={href}>{children}</a>;
}
