'use client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CodeBlock({children,label='ターミナル'}:{children:string;label?:string}) {
  const [state,setState]=useState<'idle'|'copied'|'failed'>('idle');
  const [attempt,setAttempt]=useState(0);
  async function copy(){try{await navigator.clipboard.writeText(children);setState('copied');}catch{setState('failed');}finally{setAttempt(count=>count+1);}}
  return <div className="code-box"><div className="code-top"><span>{label}</span><Button variant="ghost" size="sm" onClick={copy} className="text-[#d6eee5] hover:bg-[#28464b] hover:text-white" aria-label={`${label}をコピー`}>{state==='copied'?<Check/>:<Copy/>}<span>{state==='copied'?'コピーしました':'コピー'}</span></Button></div><pre><code>{children}</code></pre><span className="sr-only" aria-live="polite" aria-atomic="true">{state==='copied'?'コピーしました。':state==='failed'?'コピーできませんでした。テキストを選択してコピーしてください。':''}{attempt>1?`（${attempt}回目）`:''}</span>{state==='failed'&&<p className="copy-error">コピーできませんでした。テキストを選択してコピーしてください。</p>}</div>;
}
