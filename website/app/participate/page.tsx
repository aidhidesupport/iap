import { pageMetadata } from '@/lib/site-metadata';
import { Guide, Section, DataTable } from '@/components/guide';
import { TextLink } from '@/components/site';
import { publicAsset } from '@/lib/site-path';

export const metadata = pageMetadata('/participate/');
export default function Participate() {
  return <Guide title="使って、確かめて、改善を持ち寄る。" label="PARTICIPATE" lead="IAPはpartial-standardsの活動として提案しています。企業でも個人でも、公開条件を守って利用できます。寄付や参加費は利用条件ではありません。" sections={[
    ['use', '利用条件'], ['try', '試す・改善する'], ['support', '導入相談・支援'], ['credits', '出典と公式表示']
  ]}>
    <Section id="use" title="01 — 商用でも試せる公開条件">
      <DataTable headings={['対象', '条件']} rows={[
        ['仕様・ガイド・説明文', 'CC BY 4.0。共有時のクレジット、ライセンス、変更表示などを付けて利用できます。'],
        ['基本実装・コード例', 'Apache-2.0。所定の表示を残して、仕事での利用、改変、製品への組込みができます。'],
        ['自分の案件と成果', '利用者のものです。案件資料や成果を公開する条件はありません。']
      ]}/>
      <p>対象範囲は<a href="https://github.com/aidhidesupport/iap/blob/main/RIGHTS.md">利用条件</a>を確認してください。本文は<a href={publicAsset('/licenses/LICENSE-CC-BY-4.0.txt')}>CC BY 4.0</a>と<a href={publicAsset('/licenses/LICENSE-APACHE-2.0.txt')}>Apache-2.0</a>です。条件を守って受けた許諾を、後から協賛者限定へ変更する前提はありません。</p>
      <p>IAP側の基本実装の利用料はありません。Codex等の利用環境の費用は、各提供者の条件に従います。</p>
    </Section>
    <Section id="try" title="02 — 実案件がなくても、試して参加できる">
      <p><a href={publicAsset('/downloads/iap-codex-0.2.6.tar.gz')} download="iap-codex-0.2.6.tar.gz">基本実装0.2.6を入手</a>し、同梱の架空例で照合と共有文を確認できます。この最初のお試しにはPMの参加やCodexのログインは不要です。Node.js 22.13以降のmacOS/Linux環境を用意してください。</p>
      <p>Linux・macOSと2つのNode.js環境で、配布物の80テストがそれぞれ成功しています。<a href="https://github.com/aidhidesupport/iap/blob/main/DISTRIBUTION_TESTS.md">検証結果と対象範囲</a>。実案件での負担軽減は、これから確かめる段階です。</p>
      <p>便利だった点だけでなく、入力の手間、誤警告、分かりにくい共有も改善材料になります。小さな架空例を<a href="https://github.com/aidhidesupport/iap/issues">GitHubのIssue</a>へ。文章・コードの改善や翻訳は<a href="https://github.com/aidhidesupport/iap/blob/main/CONTRIBUTING.md">寄稿の案内</a>を確認してください。</p>
      <p>活動を紹介するときは、<a href="https://github.com/aidhidesupport/iap/blob/main/SHARE.md">そのまま使える紹介文と出典表記</a>も利用できます。</p>
      <TextLink href="/guide/developer#before">ひとりで試す手順</TextLink>
    </Section>
    <Section id="support" title="03 — 導入の相談と、活動への支援">
      <p><a href="https://github.com/aidhidesupport/iap/issues/new?template=installation.md">導入相談の記入用紙</a>から、用途、実行環境、困っている点を一般化して記載できます。公開の場所なので、顧客資料・個人情報・資格情報・決済情報は含めないでください。</p>
      <p>活動への協賛、時間と範囲を限定した導入支援、公式の運用サービスを将来の候補としています。金銭の支援窓口・決済・有料サービスはまだ設けていません。相談への対応時間や受注を保証するものではありません。</p>
      <p>有料支援を行う場合は作業内容・時間・料金・記録の扱いを別途合意します。協賛額で仕様の採否や公式認証を決めません。<a href="https://github.com/aidhidesupport/iap/blob/main/SUPPORT.md">参加・支援の詳しい案内</a></p>
    </Section>
    <Section id="credits" title="04 — 出典と公式表示">
      <p>維持・編集はaidhidesupportです。起草と実装にはAI支援を利用しています。ライセンスは許諾する権限のある部分に適用し、第三者素材や利用者の記録を自分の権利にはしません。</p>
      <p><a href="https://github.com/aidhidesupport/iap/blob/main/PROVENANCE.md">出典の一覧</a> / <a href="https://github.com/aidhidesupport/iap/blob/main/THIRD_PARTY_NOTICES.md">第三者表示</a> / <a href={publicAsset('/licenses/LICENSES-dependencies.txt')}>ライブラリのライセンス本文</a></p>
      <p>名称を使った正確な紹介・出典表示に個別の連絡は不要です。第三者のサービスは提供主体と変更点を示し、公式・認定済みと誤認させないでください。商標の一次検索は実施済みですが、利用可否・登録可能性の判断と出願・登録は未了です。<a href="https://github.com/aidhidesupport/iap/blob/main/BRAND.md">ブランド方針</a></p>
      <div className="guide-next"><TextLink href="/faq">よくある質問</TextLink><TextLink href="/updates">更新と活動報告</TextLink><TextLink href="/status">実装と検証の現在地</TextLink><TextLink href="/guide/pm">PM側の使い方</TextLink></div>
    </Section>
  </Guide>;
}
