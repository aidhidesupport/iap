import { pageMetadata } from '@/lib/site-metadata';
import { Guide, Section, DataTable } from '@/components/guide';
import { CodeBlock } from '@/components/code-block';
import { TextLink } from '@/components/site';
export const metadata = pageMetadata('/guide/pm/');
export default function PM(){return <Guide title="目的を伝え、要点を受け取る。" label="PM GUIDE" lead="PMは目的と完成条件を伝え、必要な変更や成果の受け入れを判断します。専用ツールの導入や、Codexの評価JSONの編集は必要ありません。" sections={ [['request','最初の依頼'],['read','共有文の読み方'],['decide','判断する場面'],['trial','小さく試す']] }>
<Section id="request" title="01 — 何ができれば完成かを伝える"><p>開発者とは別の立場として、目的、渡してほしい成果、完成条件、対象外を伝えます。連絡は普段のチャット等で構いません。形式に合わせるために、長い仕様を一から書く必要はありません。</p><CodeBlock label="依頼のひな形">{`目的：誰の、どの困りごとを解決したいか
成果：何を受け取りたいか
完成条件：どの入力・操作・結果で確認するか
対象外：今回は何をしないか
連絡：共有先と、返答できる時間の目安`}</CodeBlock><p>開発者とCodexがこの内容を作業記録にします。曖昧な完成条件は、着手前に短くすり合わせます。</p></Section>
<Section id="read" title="02 — 届くのは、短い進捗共有"><div className="quote-box"><span className="role-tag">架空の共有文・抜粋</span><p><strong>目的：</strong>CSV集計の検証報告を作る。<br/><strong>完成条件：</strong>達成1/2・未達1・未確認0。<br/><strong>次の一手：</strong>不正入力の行番号を確認する。<br/><strong>確認事項：</strong>現時点でPMの判断が必要な項目なし。</p><p className="caption">この時点では開発者側で作業継続。PMの受け入れ判断は別に扱います。</p></div><DataTable headings={['見るところ','読み方']} rows={ [['達成・未達・未確認','根拠付きで達成と評価した条件、未達の条件、まだ確認できない条件。'],['次の一手','開発者が次に何をするか。'],['確認事項','PMの判断や追加情報が必要か。通常の進捗報告なら返答を待たずに進める。'],['生成時点・版','どの時点の成果の報告か。古い報告が自動で書き換わることはない。']]}/><p>要約だけで足りなければ、その条件の根拠や実際の成果を開発者に確認します。</p></Section>
<Section id="decide" title="03 — 必要な変更と、成果の受け入れを判断する"><DataTable headings={['場面','担当する判断']} rows={ [['通常の実装・修正・テスト','開発者とCodexが、合意した範囲内で進める。'],['目的・完成条件・対象範囲の変更','PMが影響と選択肢を確認し、変更するか決める。'],['成果を受け取る段階','PMが実際の成果を確認して、受け入れを判断する。']]}/><CodeBlock label="範囲変更への返答例">{`今回のv2では、認証機能は対象に追加しません。
合意済みのCSV検証を先に完了してください。
認証は別の依頼として検討します。`}</CodeBlock><p>変更や受け入れへの返答では、対象の版や成果を明確にします。内容が変わった後に、以前の返答を新しい成果の承認として使わないようにします。</p><div className="callout"><p>Codexの<code>ready</code>と、PMの「受け入れました」は別の記録です。現在、PMの回答を自動で回収・反映する機能はありません。</p></div></Section>
<Section id="trial" title="04 — まずは一案件で、両者の負担を確かめる"><p>初回は、30〜60分で途中成果を確認できる案件を一つ選びます。PMと開発者は別の人が担当し、既存のチャットで共有します。</p><ul><li>PMが共有文を読んで確認した時間。</li><li>説明が足りず、聞き返した点や判断しづらかった点。</li><li>次も使いたいか、使いたくないか。その理由。</li></ul><p>時間が分からなければ「不明」のまま残します。返信までの時間を、PMが作業した時間として数えません。目的は、仕組みの効果と負担を確かめ、IAPの提案を改善することです。</p><div className="guide-next"><TextLink href="/proposal">IAPの提案を読む</TextLink><TextLink href="/guide/developer">開発者側の作業を見る</TextLink></div></Section>
</Guide>;}
