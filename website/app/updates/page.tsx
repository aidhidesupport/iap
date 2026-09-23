import { pageMetadata } from '@/lib/site-metadata';
import { Guide, Section, DataTable } from '@/components/guide';
import { TextLink } from '@/components/site';
import { publicAsset } from '@/lib/site-path';
export const metadata = pageMetadata('/updates/');
export default function Updates() {
  return <Guide title="更新を知る。変わったことを確かめる。" label="UPDATES" lead="仕様草案と基本実装は別々の版で管理します。利用中の版を残し、変更内容と互換性を確認してから更新してください。" sections={[
    ['download','現在の配布'],['upgrade','更新時の確認'],['news','活動報告'],['follow','更新を知る']
  ]}>
    <Section id="download" title="01 — 現在の配布">
      <DataTable headings={['対象','現在の版・状態']} rows={[
        ['IAPの仕様','0.2-draft。試行と反証から見直す草案。'],
        ['Codex連携の基本実装','0.2.5。ソース・テスト・架空例を含む試験配布。'],
        ['GitHub Releases','codex-v0.2.5をpre-releaseとして公開。下記と同じ配布物です。']
      ]}/>
      <p><a href={publicAsset('/downloads/iap-codex-0.2.5.tar.gz')} download="iap-codex-0.2.5.tar.gz">基本実装0.2.5をダウンロード</a> / <a href={publicAsset('/downloads/iap-codex-0.2.5.sha256')}>SHA-256を確認</a> / <a href="https://github.com/aidhidesupport/iap/blob/main/RELEASE_NOTES.md">0.2.5の変更内容</a></p>
      <p><a href="https://github.com/aidhidesupport/iap/releases/tag/codex-v0.2.5">GitHub Release 0.2.5を確認</a>。添付のtar.gzとSHA-256が手順付きの基本実装です。GitHubの「Source code」はリポジトリ全体のアーカイブです。</p>
      <p>同じ版の配布内容を後から差し替えず、コードや同梱手順を変更した場合は新しい版として案内します。サイトの説明の更新だけで、基本実装の版が変わることはありません。</p>
    </Section>
    <Section id="upgrade" title="02 — 更新する前と、更新した後">
      <ol><li><strong>利用中の版と記録を残す。</strong>対象のCodexセッションを閉じ、契約・案件記録・既存設定を含む案件フォルダーを、アクセスを限定した場所へ退避します。</li>
      <li><strong>新版の変更点を読む。</strong>対応環境、互換性、移行が必要な記録を確認します。現在より新しい基本実装は、このページでは案内していません。</li>
      <li><strong>別フォルダーで新版を検証する。</strong>配布物のSHA-256、同梱テスト、架空例を確認してから導入します。</li>
      <li><strong>導入して小さく動かす。</strong>新版の同梱手順に従い、配置確認と実際の照合・共有を別々に確認します。競合が出たら止め、手作業の変更を上書きしません。</li></ol>
      <p>問題があれば作業を止め、どの版からどの版へ変更したかを導入相談に記載してください。記録形式が変わる場合、旧コードだけを戻しても復元できるとは限りません。退避した案件一式と新版の移行案内に沿って戻します。</p><TextLink href="/guide/developer#pause">停止・取り外しの手順</TextLink>
    </Section>
    <Section id="news" title="03 — 活動報告 · 2026年9月23日">
      <h3>試験版の対象と、確認できた範囲を明確にしました。</h3>
      <p>中核機能を実装した試験版として、ターミナルを使える方に架空例から試してもらう位置づけを、ホーム・ガイド・紹介文に揃えました。実装済みの機能と、他の人の導入・実利用の効果を分けて案内しています。</p>
      <p>配布物0.2.5の自動テストと、0.2.4の実Codexによる一連の動作は別の記録です。最新配布版での実動作の再確認を、次の技術確認として明記しました。今回の変更は説明の更新で、新しい動作試験や機能追加ではありません。</p>
      <h3>ひとりで試す入口と、使う場所の説明を揃えました。</h3>
      <p>ホームから架空例へ直接進めるようにし、説明サイト・ターミナルでのお試し・Codex連携の違いをガイドとFAQに追加しました。まずはネットで内容を知り、架空例を試し、疑問を改善へ戻す順序で進めます。企業での導入や実案件の確保は、公開活動を始める条件にしていません。</p>
      <p>基本実装0.2.5の配布内容は変更していません。個人開発での継続利用、第三者の導入、実際の負担軽減の検証は、説明の更新とは別に扱います。</p>
      <h3>ソースと英語の入口、最初のReleaseを公開しました。</h3>
      <ul><li>GitHub上で読めるソース、英語README・Quickstart、PR時の検査を公開。</li><li>日英の導入・休止・取り外し手順と、サイトの見出し構造を改善。</li><li>Linux・macOSの4環境で各80テスト成功を再確認し、同じ0.2.5をpre-releaseとして公開。</li><li>実案件での負担軽減、他の人の端末での導入、実機の文字拡大・読み上げは未確認。</li></ul>
      <p>次は、架空例で見つかった手順の不明点や反証を改善へ戻します。支援金の受付はまだ設けていません。</p>
      <p><a href="https://github.com/aidhidesupport/iap/blob/main/ACTIVITY.md">活動報告と根拠を読む</a> / <a href={publicAsset('/downloads/activity-report-template.md')} download>活動報告のひな型を保存</a></p>
      <p>報告には改善点、確認方法、未解決事項、次の予定を残します。支援受付を始めた後は、確認できた期間・金額・使途を記録します。支援者の名前・口座・取引明細は公開しません。</p>
    </Section>
    <Section id="follow" title="04 — 更新を知る">
      <p>このページと<a href="https://github.com/aidhidesupport/iap/blob/main/ACTIVITY.md">活動報告</a>で変更を案内します。リポジトリの「Watch」→「Custom」で「Releases」を選ぶとリリース通知を購読できます。通知の受け取り方は、ご自身のGitHub設定に従います。</p>
      <p><a href="https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications">GitHub公式の通知設定</a> / <a href="https://github.com/aidhidesupport/iap/releases">リリース一覧</a></p>
      <div className="guide-next"><TextLink href="/faq">よくある質問</TextLink><TextLink href="/participate">参加・改善の窓口</TextLink></div>
    </Section>
  </Guide>;
}
