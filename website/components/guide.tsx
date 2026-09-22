import Link from '@/components/site-link';
import { Header, Footer } from './site';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function Guide({ title, label, lead, sections, children }: { title:string; label:string; lead:string; sections:[string,string][]; children:React.ReactNode }) {
  return <><Header/><main id="main" tabIndex={-1} className="wrap guide-shell"><aside className="guide-sidebar"><p className="eyebrow">ON THIS PAGE</p><nav aria-label="このページの目次">{sections.map(([id,name])=><a key={id} href={`#${id}`}>{name}</a>)}</nav></aside><article className="guide-content"><div className="breadcrumb"><Link href="/">IAP</Link><span> / {label}</span></div><p className="eyebrow">{label}</p><h1>{title}</h1><p className="lead">{lead}</p>{children}</article></main><Footer/></>;
}
export function Section({ id, title, children }: { id:string; title:string; children:React.ReactNode }) {return <section className="guide-section" id={id}><h2>{title}</h2>{children}</section>;}
export function DataTable({headings,rows}:{headings:string[];rows:React.ReactNode[][]}) {return <div className="prose-table-wrap"><Table className="prose-table" scrollLabel={`${headings.join('・')}の表`}><TableHeader><TableRow>{headings.map(h=><TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row,i)=><TableRow key={i}>{row.map((value,j)=><TableCell key={j} className="whitespace-normal">{value}</TableCell>)}</TableRow>)}</TableBody></Table></div>;}
