import type { Metadata } from 'next';
import './globals.css';
import { publicAsset } from '@/lib/site-path';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  metadataBase: new URL('https://aidhidesupport.github.io/iap/'),
  icons: { icon: publicAsset('/favicon.svg') },
  title: { default: 'IAP — 協働の条件を、持ち運べる形に。 | partial-standards', template: '%s | IAP' },
  description: 'partial-standardsの活動として提案する、対話・協働の条件調整プロトコルIAP。考え方、仕様草案、Codex連携の実装例と立場別のガイド。',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja"><body><a className="skip" href="#main">本文へ移動</a>{children}</body></html>;
}
