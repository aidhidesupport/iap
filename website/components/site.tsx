import Link from '@/components/site-link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

export function Header() {
  return <header className="site-header wrap"><Link href="/" className="brand" aria-label="IAP ホーム"><span className="brand-mark">ia</span><span>IAP<span className="brand-sub">PARTIAL-STANDARDS</span></span></Link><nav aria-label="メインナビゲーション"><Link href="/proposal">IAPの提案</Link><Link href="/guide/developer">開発者ガイド</Link><Link href="/guide/pm">PMガイド</Link><Link href="/status">現在地</Link><Link href="/participate">利用条件・参加</Link></nav></header>;
}
export function Footer() {
  return <footer className="site-footer wrap"><div><Link href="/" className="footer-brand">IAP</Link><p>Interaction Accommodation Protocol<br/>対話・協働の条件調整プロトコル<br/>A proposal from partial-standards</p></div><div><a href="https://github.com/aidhidesupport/iap">仕様草案・GitHub <ArrowUpRight size={15}/></a><nav className="footer-links" aria-label="補足ガイド"><Link href="/faq">よくある質問</Link><Link href="/updates">配布・更新と活動報告</Link></nav><p>維持・編集：aidhidesupport<br/>ローカル連携版 0.2.6 · 2026.09.24</p></div></footer>;
}
export function TextLink({href,children}:{href:string;children:React.ReactNode}) { return <Link className="text-link" href={href}>{children}<ArrowRight size={18}/></Link>; }
