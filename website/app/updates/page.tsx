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
        ['GitHub Releases','準備中。現在は下記の配布ファイルを利用できます。']
      ]}/>
      <p><a href={publicAsset('/downloads/iap-codex-0.2.5.tar.gz')} download="iap-codex-0.2.5.tar.gz">基本実装0.2.5をダウンロード</a> / <a href={publicAsset('/downloads/iap-codex-0.2.5.sha256')}>SHA-256を確認</a> / <a href="https://github.com/aidhidesupport/iap/blob/main/RELEASE_NOTES.md">0.2.5の変更内容</a></p>
      <p>同じ版の配布内容を後から差し替えず、コードや同梱手順を変更した場合は新しい版として案内します。サイトの説明の更新だけで、基本実装の版が変わることはありません。</p>
    </Section>
    <Section id="upgrade" title="02 — 更新する前と、更新した後">
      <ol><li><strong>利用中の版と記録を残す。</strong>対象のCodexセッションを閉じ、契約・案件記録・既存設定を含む案件フォルダーを、アクセスを限定した場所へ退避します。</li>
      <li><strong>新版の変更点を読む。</strong>対応環境、互換性、移行が必要な記録を確認します。現在より新しい基本実装は、このページでは案内していません。</li>
      <li><strong>別フォルダーで新版を検証する。</strong>配布物のSHA-256、同梱テスト、架空例を確認してから導入します。</li>
      <li><strong>導入して小さく動かす。</strong>新版の同梱手順に従い、配置確認と実際の照合・共有を別々に確認します。競合が出たら止め、手作業の変更を上書きしません。</li></ol>
      <p>問題があれば作業を止め、どの版からどの版へ変更したかを導入相談に記載してください。記録形式が変わる場合、旧コードだけを戻しても復元できるとは限りません。退避した案件一式と新版の移行案内に沿って戻します。</p><TextLink href="/guide/developer#pause">停止・取り外しの手順</TextLink>
    </Section>
    <Section id="news" title="03 — 活動報告 · 2026年9月22日">
      <h3>架空例から試し、改善を持ち寄れる入口を整えました。</h3>
      <ul><li>基本実装0.2.5の配布、役割別ガイド、ひとりで試す手順を公開。</li><li>Linux・macOSの4環境で、配布物の80テストがそれぞれ成功。</li><li>紹介文、導入相談、FAQと更新案内を整備。</li><li>実案件での時間削減や負担軽減、他の人の端末での試用は未確認。</li></ul>
      <p>次は、架空例で見つかった手順の不明点や反証を改善へ戻します。支援金の受付はまだ設けていません。</p>
      <p><a href="https://github.com/aidhidesupport/iap/blob/main/ACTIVITY.md">活動報告と根拠を読む</a> / <a href={publicAsset('/downloads/activity-report-template.md')} download>活動報告のひな型を保存</a></p>
      <p>報告には改善点、確認方法、未解決事項、次の予定を残します。支援受付を始めた後は、確認できた期間・金額・使途を記録します。支援者の名前・口座・取引明細は公開しません。</p>
    </Section>
    <Section id="follow" title="04 — 更新を知る">
      <p>当面はこのページと<a href="https://github.com/aidhidesupport/iap/blob/main/ACTIVITY.md">活動報告</a>で変更を案内します。GitHub Releasesの公開を始めた後は、リポジトリの「Watch」→「Custom」で「Releases」を選ぶとリリース通知を購読できます。通知の受け取り方は、ご自身のGitHub設定に従います。</p>
      <p><a href="https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications">GitHub公式の通知設定</a> / <a href="https://github.com/aidhidesupport/iap/releases">リリース一覧</a></p>
      <div className="guide-next"><TextLink href="/faq">よくある質問</TextLink><TextLink href="/participate">参加・改善の窓口</TextLink></div>
    </Section>
  </Guide>;
}
