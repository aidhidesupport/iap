# フィードバックと寄稿

窓口：[aidhidesupport/iap のIssue](https://github.com/aidhidesupport/iap/issues)。仕様の質問、架空の反証ケース、導入時の困りごと、文章・コードの改善案を受け付けます。診断名、本名、勤務先の開示は不要です。

## 試して報告する

1. 使った版と、仕様の章・要件番号またはコマンドを書く。
2. 期待した結果と実際の結果を書く。
3. 再現に必要な小さな架空例を添える。
4. 改善案があれば、目的を変えずに済む最小の変更を書く。

顧客資料、個人情報、診断情報、資格情報、`.iap`の実案件記録、ローカル絶対パスをそのまま投稿しないでください。実案件の生ログは必須ではありません。

## 文章・コードを寄稿する

対象の公開ライセンスと同じ条件で提供できる変更に限ります。対象は[LICENSE.md](LICENSE.md)を確認してください。文書はCC BY 4.0、基本実装のコード・同梱資料はApache-2.0です。第三者素材は出典と元の条件を添え、勤務先・顧客等の権利に関係するものは提供する権限を確認してください。

PRや採用を希望するパッチには、次の確認文と希望するクレジット名を記載してください。公開用ハンドルで構いません。

> この変更を提供する権限を持ち、対象ファイルと同じ公開ライセンスで提供します。第三者素材とAI支援の利用について、把握している出典・条件を記載しました。

AI支援を使ったことだけで寄稿を拒否しません。内容を確認し、第三者のコード等が含まれると分かる場合は出典を明示してください。根拠なく自分だけの著作物だと宣言する必要はありません。

Issueで相談しただけで、著作権が自動譲渡されたり、投稿全体が別の商用条件へ変更できたりする扱いにはしません。公開条件への同意がない文章を、そのまま仕様へ取り込むこともしません。改善案を採用するときは提供条件を確認します。

コードは[基本実装](codex/)と[サイト](website/)の通常ファイルを編集し、対象版を示してPRで提案できます。配布済みのtar.gzだけを直接差し替えないでください。維持者が再現・検査し、次の配布版へ反映します。[PRテンプレート](.github/PULL_REQUEST_TEMPLATE.md)にも既存の提供条件と確認結果の欄があります。

## 開発時の確認

基本実装はmacOS/Linux、Node.js 22.13以降。npmの追加依存はありません。Python 3.9以降は配布物の再現検査に使います。リポジトリ直下から実行します。

```sh
cd codex
npm test
cd ..
python3 scripts/package-codex.py --check
python3 scripts/package-codex.test.py
```

`--check`はcodex/から作ったアーカイブが、ルートとサイト内の配布物・チェックサムに一致することを確認します。MANIFEST.jsonは生成物です。公開済み0.2.5のコード・同梱文書・テストを変える場合は、`codex/package.json`の版を更新し、新版のアーカイブとサイト内の配布物・案内を揃えてください。詳細は[配布手順](RELEASING.md#ソースから配布物を作る)を参照します。

サイトは[website/README.md](website/README.md)に従って編集します。PRでは型検査・ビルド・参照先確認が動き、公開はmainへの反映後です。英語の入口を直す場合はREADME.en.mdとQUICKSTART.en.md、日本語の対応箇所も確認してください。

ルートのガイドは現行の案内、`codex/`内の同梱ガイドはその配布版の一部です。ルートの文章を直すだけで旧配布物を再作成しません。配布版に手順の修正を届けるときは、同梱ガイドも更新して新しい版に含めます。

0.2.5の`codex/example/paired-session.md`には、配布物に含まれない開発用の測定文書への相対リンクが1件残っています。現在の公開手順は[試用手順](PILOT_RUNBOOK.md)と[基本実装の測定コマンド](codex/README.md#実案件の測定を残す)を参照してください。既存0.2.5は保持し、同梱リンク自体の訂正は次の配布版に含めます。

## Development and contributions

Use Node.js 22.13 or later on macOS/Linux. The implementation in [codex/](codex/) needs no additional npm packages. Run the commands above from the repository root; Python 3.9 or later is needed to reproduce the distribution. Website changes use [website/](website/): run `npm ci`, `npx tsc --noEmit`, `npm run build`, and `node scripts/check-export.mjs` there.

Edit the normal source files and submit a PR describing the target version, the problem, the change, and checks performed. Keep published archives unchanged. A change to bundled files requires a new implementation version and matching distribution files; the root guides can be updated independently. Examples should be fictional and contain no private project records.

The 0.2.5 fixture `codex/example/paired-session.md` retains one relative link to a development-only measurement document that is not bundled. Use the published [trial runbook](PILOT_RUNBOOK.md) and [measurement commands](codex/README.md#実案件の測定を残す) instead (Japanese). Correct the bundled link in the next distribution version; keep 0.2.5 unchanged.

Contribute under the existing license of each affected file, only where you are authorized to do so. The [PR template](.github/PULL_REQUEST_TEMPLATE.md) asks for your preferred credit (a handle is enough), known third-party sources and terms, and AI assistance. This does not transfer your copyright. No additional commercial relicensing permission is requested. Reporting an issue alone is not agreement to incorporate its text under another license.

## 判断の進め方

維持者が、本人の意思、PMと開発者の役割分担、互換性、実際の確認負担を基準に変更を判断し、理由を公開します。協賛額で仕様の採否を決めません。現時点では複数組織による標準化団体ではありません。
