import { pageMetadata } from '@/lib/site-metadata';
import { Guide, Section } from '@/components/guide';
import { TextLink } from '@/components/site';
export const metadata = pageMetadata('/faq/');
export default function FAQ() {
  return <Guide title="試す前に、知っておきたいこと。" label="FAQ" lead="IAPはpartial-standardsの活動として提案している仕様草案です。最初の実装例であるCodex連携を中心に、役割・できること・利用条件をまとめました。" sections={[
    ['start','誰が、どう試すか'],['roles','PM・開発者・AI'],['limits','自動化と記録'],['terms','費用・利用条件']
  ]}>
    <Section id="start" title="01 — 誰が、どう試すか">
      <h3>どんな人に向いていますか？</h3><p>依頼の目的を取り違える、途中で範囲が広がる、進捗の説明に手間がかかる、といった協働の困りごとを持つ人を想定しています。最初の実装例は、文章で依頼を受ける開発者と、別の人が担当するPMの協働です。診断の開示は利用条件ではありません。</p>
      <h3>ひとりでも、実案件がなくても試せますか？</h3><p>同梱の架空例で、成果の観測・設定の検証・共有文の生成を試せます。最初のお試しはNode.js 22.13以降のmacOS/Linux環境が対象で、PMの参加やCodexへのログインは不要です。Codex連携の導入は、その後の段階です。</p><TextLink href="/guide/developer#before">ひとりで試す手順</TextLink>
      <h3>GUIで使いますか？どこを開けばよいですか？</h3><p>このサイトでは説明とデモを見られます。架空例は自分の端末のターミナルで試します。その後のCodex連携は、案件フォルダーへ初期設定し、Codex CLIで作業する手順を確認済みです。専用GUIだけで導入から共有まで完結する実装ではありません。手入力のWeb先行試作との同期もありません。</p><TextLink href="/guide/developer#use">使う場所と手順の違い</TextLink>
      <h3>完成した標準や、OpenAIの公式機能ですか？</h3><p>どちらでもありません。IAPは独立した仕様草案で、Codex連携はその一つの実装例です。実案件での時間削減や負担軽減は、これから確かめる段階です。</p>
    </Section>
    <Section id="roles" title="02 — PM・開発者・AIの役割">
      <h3>PMと開発者は同じ人ですか？</h3><p>基本の利用場面では別々の人です。PMは目的と完成条件を伝え、条件変更や成果の受け入れを判断します。開発者はCodexと作業・修正・テスト・再確認を進めます。</p>
      <h3>修正のたびにPMの承認が必要ですか？</h3><p>合意した範囲内の修正は開発者側で続けます。目的・完成条件・対象範囲を変える必要があるときに、判断事項をPMへ伝えます。進捗共有だけを理由に毎回作業を止める運用ではありません。</p>
      <h3>PMにもインストールやJSON編集が必要ですか？</h3><p>現在の手順では不要です。普段のチャット等で依頼を渡し、届いた共有文と成果を確認します。作業記録への反映は開発者とCodexが担当します。</p><TextLink href="/guide/pm">PMの依頼・確認のしかた</TextLink>
    </Section>
    <Section id="limits" title="03 — 自動化と記録の範囲">
      <h3>AIが自動で正しく修正し続けますか？</h3><p>作業の節目に指定成果を照合し、範囲内の修正と再確認を支援します。同じCodexが作業と評価を行うため、誤読や誤判定は残ります。無人の常時監視や、独立した第三者レビューを保証するものではありません。</p>
      <h3>外部の人へ自動送信されますか？</h3><p>現在は共有文の生成までです。開発者が内容と宛先を確認し、普段のチャット等へ渡します。共有URL、外部への自動送信、PMの返答の自動回収は未実装です。</p>
      <h3>案件の資料はどこに残りますか？</h3><p>基本実装は案件フォルダー内に記録を保存します。IAPサイトへ案件資料をアップロードする手順はありません。ただし、Codexへ渡す情報は利用しているCodex環境の設定・条件に従います。「端末の外へ一切送られない」とは扱わないでください。公開Issueには顧客資料や資格情報を書かず、架空例に置き換えてください。</p>
      <h3>評価がreadyならPMの承認も済んでいますか？</h3><p>readyは条件達成の評価がある状態です。PMによる成果の受け入れは別の判断です。成果や条件を変えると古い評価が失効するため、共有直前に最新の状態を取り直します。</p><TextLink href="/status">検証済みの範囲と限界</TextLink>
    </Section>
    <Section id="terms" title="04 — 費用・利用条件・支援">
      <h3>仕事で使えますか？寄付は必須ですか？</h3><p>公開条件に従って商用でも利用できます。仕様・ガイドはCC BY 4.0、基本実装はApache-2.0です。寄付・入会・個別許可は利用条件ではありません。Codex等の利用環境の費用は、各提供者の条件を確認してください。</p>
      <h3>支援すると優先対応や認定を受けられますか？</h3><p>活動への任意の支援は、仕様の決定権・認定・納期・優先対応を購入するものではありません。金銭の受付はまだ設けていません。有料の個別作業を引き受ける場合は、内容と条件を別途合意します。</p>
      <h3>困った点や改善案はどこへ？</h3><p><a href="https://github.com/aidhidesupport/iap/issues/new?template=installation.md">導入相談</a>または<a href="https://github.com/aidhidesupport/iap/issues/new?template=feedback.md">仕様・手順のフィードバック</a>へ、使った版と小さな架空例を書いてください。公開される場所なので、私的な情報は含めないでください。</p>
      <div className="guide-next"><TextLink href="/participate">利用条件・参加</TextLink><TextLink href="/updates">配布・更新と活動報告</TextLink></div>
    </Section>
  </Guide>;
}
