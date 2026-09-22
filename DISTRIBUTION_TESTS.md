# 基本配布物の自動検証

2026-09-22。公開済みの `iap-codex-0.2.5.tar.gz` をGitHub Actionsの隔離環境で展開し、全ファイルのハッシュと同梱テストを確認しました。

| 実行環境 | 実際のNode.js | 結果 |
|---|---|---|
| ubuntu-latest | 22.13.0 | 80件成功、失敗0 |
| ubuntu-latest | 22.23.2 | 80件成功、失敗0 |
| macos-latest | 22.13.0 | 80件成功、失敗0 |
| macos-latest | 22.23.2 | 80件成功、失敗0 |

[実行記録](https://github.com/aidhidesupport/iap/actions/runs/35728437035) / [自動検証の設定](.github/workflows/distribution.yml)。配布物のSHA-256は `db5e06af7de92e4ac3751d68183575237a3b731182095bbef9a0fac59df2d82a` です。

検証では圧縮ファイルのチェックサム、MANIFEST内の19ファイルのサイズ・SHA-256、余分なファイルやシンボリックリンクがないことを確認してから80テストを実行します。契約と評価の整合性、古い評価の失効、共有文、試用記録、導入・競合検出・取り外し・記録保持を架空データで検査します。

配布物・チェックサム・このワークフローを変更したpushとPull Requestで自動実行し、Actions画面から手動でも実行できます。最低版22.13.0と22系の最新版を使用するため、後者の実際のバージョンは実行ごとのログを参照してください。通常ソース構成では、ワークフローは`codex/package.json`から対象版を読み、ソース・ルートの配布物・サイト内コピーの一致を先に検査します。新版へ切り替える手順は[配布手順](RELEASING.md#ソースから配布物を作る)を参照してください。

これは、一般利用者の端末における導入、Codexのログイン・フック信頼設定、実Codexとの連携、PMと開発者の実案件での効果を検証したものではありません。Windowsと他のNodeメジャーバージョンもこの試験の対象外です。

手元で再現する手順は[開発者ガイド](CODEX_GUIDE.md)、試験全体の範囲は[現在地](STATUS.md)を参照してください。

## 2026-09-23：ソース公開構成での再確認

[PR #1の配布検査](https://github.com/aidhidesupport/iap/actions/runs/35765620244)でも、上表と同じ4環境でそれぞれ80テスト成功・失敗0を確認しました。配布再現処理の7テストも成功し、0.2.5のバイト列は保持しています。[main反映後の配布検査](https://github.com/aidhidesupport/iap/actions/runs/35765892833)も成功しました。

サイトについても[PR時の型検査・ビルド・参照先検査](https://github.com/aidhidesupport/iap/actions/runs/35765620328)が成功し、公開処理はスキップされました。[main反映後のPages公開](https://github.com/aidhidesupport/iap/actions/runs/35765892899)は成功しています。
