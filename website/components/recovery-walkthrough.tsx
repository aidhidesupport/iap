'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, FileText, Hash, Terminal } from 'lucide-react';
import evidence from '../public/cases/slack-recovery/evidence.json';

const steps = [
  { name: '依頼をそろえる', place: 'Slack', title: '直すのは、CSVの金額エラー。', caption: '本人と依頼者が、戻る先を先に共有します。' },
  { name: '本人の作業がそれる', place: '作業の途中', title: 'ログイン画面の設計に入り込む。', caption: '本人の「気づいたら相談」を、確認の起点にしない。' },
  { name: 'AIから軌道修正', place: 'Codex ＋ IAP', title: '外から、止める作業と戻る一手を示す。', caption: '合意した目的、観測した差、次の作業をセットにします。' },
  { name: '修正して確かめる', place: '開発者 ＋ Codex', title: 'CSVの修正へ戻り、同じ入力で再確認。', caption: '「作業した」だけで終えず、依頼の条件まで戻ります。' },
  { name: '結果をSlackへ返す', place: 'Slack', title: 'どこまで直ったか、相手にも伝わる。', caption: 'IAPの共有下書きを確認し、本人がSlackへ貼り付けます。' },
];
function Message({ who, subtitle, children, ai = false }: { who: string; subtitle: string; children: React.ReactNode; ai?: boolean }) {
  return <div className={`case-message${ai ? ' case-message-ai' : ''}`}><span className={`case-avatar${ai ? ' ai-avatar' : ''}`} aria-hidden="true">{ai ? 'ia' : who.slice(0, 1)}</span><div className="case-message-body"><div className="case-author"><strong>{who}</strong><span>{subtitle}</span></div>{children}</div></div>;
}
export function RecoveryWalkthrough() {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const stageTitle = useRef<HTMLHeadingElement>(null);
  function showStep(next: number) {
    setStep(next);
    requestAnimationFrame(() => {
      stageTitle.current?.focus({ preventScroll: true });
      stageTitle.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }
  return <div className="recovery-walkthrough">
    <nav className="case-steps" aria-label="利用場面の5つの段階">{steps.map((s, i) => <button key={s.name} type="button" aria-pressed={step === i} onClick={() => showStep(i)}><span className="case-step-number">0{i + 1}</span><span>{s.name}</span>{i < step && <Check size={15} aria-hidden="true"/>}</button>)}</nav>
    <div className="case-stage" id="case-stage" aria-live="polite" aria-atomic="true">
      <div className="case-stage-top"><span>{current.place}</span><span>場面 {step + 1} / 5</span></div>
      <div className="case-stage-title"><h3 ref={stageTitle} tabIndex={-1}>{current.title}</h3><p>{current.caption}</p></div>
      <div className="case-window">
        <div className="case-channel"><Hash size={17} aria-hidden="true"/><strong>CSV集計の修正</strong><span>{step === 0 || step === 4 ? 'Slackの会話を再現' : '再現例 ＋ 架空案件の実行記録'}</span></div>
        {step === 0 && <div className="case-messages">
          <Message who="依頼者" subtitle="PM"><p>CSVの金額エラーを直してください。</p><ul><li>100・200・300なら、合計600円。</li><li>金額が「abc」の行は、行番号付きのエラーで停止。</li><li>不正な入力があれば、合計は出さない。</li></ul><p>ログインやDBは、今回は作りません。</p></Message>
          <Message who="本人" subtitle="開発者"><p>この条件で進めます。途中で別の作業に入り込んだら、AI側から指摘して、戻る作業を示してほしいです。</p></Message>
          <div className="case-context"><FileText size={17} aria-hidden="true"/><span>目的・完成条件・対象外をIAPの作業記録へ。</span></div>
        </div>}
        {step === 1 && <div className="case-messages">
          <Message who="本人" subtitle="作業メモの再現"><p>先に管理画面を整えたい。ログイン画面の設計を進めよう。</p></Message>
          <div className="case-observation"><span className="case-label">観測した作業と、残っているエラー</span><p>作業メモ：ログイン画面の設計を優先。<br/>不正な金額の処理は、まだ未修正。</p><div className="case-terminal"><span><Terminal size={14} aria-hidden="true"/> invalid.csv を実行</span><code>{evidence.before[1].stdout}<br/>終了コード: {evidence.before[1].exitCode}（成功扱い）</code></div><p className="case-error">「abc」を0円に置き換えて、処理が通ってしまう。</p></div>
          <div className="case-context"><span>合意した仕事はCSVの修正。作業量は増えても、未達の条件が残っています。</span></div>
        </div>}
        {step === 2 && <div className="case-messages">
          <Message who="AIから本人へ" subtitle="照合結果に基づく指摘例" ai><p><strong>ログイン画面の設計を、いったん止めましょう。</strong></p><p>今回の目的はCSVの金額エラーを直すことです。ログインは対象外。実行結果では「abc」が0円扱いになっています。</p><div className="case-next"><span>いま戻る一手</span><strong>不正な金額を見つけたら、行番号付きのエラーで止める。修正後、同じ2つの入力を試す。</strong></div></Message>
          <div className="case-checks"><div><span className="case-tag warn">対象外の作業あり</span><strong>完成条件 {evidence.beforeSummary.counts.met} / {evidence.beforeSummary.counts.total}</strong></div><p><Check size={16} aria-hidden="true"/> 正常入力の合計600円</p><p><span className="case-missing" aria-hidden="true">!</span> 不正入力で停止し、合計を出さない</p></div>
        </div>}
        {step === 3 && <div className="case-messages">
          <Message who="本人" subtitle="開発者・会話の再現"><p>ログインの設計は保留。指摘された不正値の処理へ戻って、Codexと修正します。</p></Message>
          <div className="case-result-pair"><div><span className="case-label">正常入力</span><strong>{evidence.after[0].stdout}</strong><small>終了コード {evidence.after[0].exitCode}</small></div><div><span className="case-label">不正入力</span><strong>{evidence.after[1].stderr}</strong><small>終了コード {evidence.after[1].exitCode} ／ 合計の出力なし</small></div></div>
          <div className="case-context"><span><strong>変更後は、いったん「未評価」。</strong><br/>最新の結果を照合し直して、条件2/2達成を記録しました。</span></div>
        </div>}
        {step === 4 && <div className="case-messages">
          <Message who="本人" subtitle="IAPの共有文を確認して投稿する例"><p>CSVの金額チェックを修正しました。</p><div className="case-share"><span className="case-label">IAPが生成した共有文から抜粋</span><p>状態：条件達成の評価あり<br/>依頼の範囲：対象内<br/>完成条件：達成 2/2・未達 0・未確認 0</p><p>達成：100・200・300の合計が600円になる。<br/>達成：abcを含むデータ2行目をエラーにし、合計を出さない。</p></div><p>正常・不正の入力で確認済みです。成果の受け入れ確認をお願いします。</p></Message>
          <div className="case-context"><Check size={17} aria-hidden="true"/><span>依頼者は、この共有文と成果を見て受け入れを判断します。</span></div>
        </div>}
      </div>
    </div>
    <div className="case-controls"><button type="button" onClick={() => showStep(step - 1)} disabled={step === 0}><ArrowLeft size={17} aria-hidden="true"/>前の場面</button><span>{step + 1} / 5</span><button type="button" onClick={() => showStep(step === 4 ? 0 : step + 1)}>{step === 4 ? '最初から見る' : '次の場面'}<ArrowRight size={17} aria-hidden="true"/></button></div>
    <noscript><p>5場面の切り替えにはJavaScriptを使います。流れは「依頼の合意→本人が対象外の作業へ→AIから指摘→元の修正・テストへ復帰→共有」です。下の実行記録から、修正前後の結果と共有文を読めます。</p></noscript>
  </div>;
}
