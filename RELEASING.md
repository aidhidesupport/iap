# 配布・更新の運用

仕様草案とCodex連携の基本実装は別々の版で管理します。現在は仕様0.2-draft、基本実装0.2.6。[GitHub Release codex-v0.2.6](https://github.com/aidhidesupport/iap/releases/tag/codex-v0.2.6)をpre-releaseとして公開しています。

## 利用者への案内

- 入手と更新時の確認：[Webの配布・更新案内](https://aidhidesupport.github.io/iap/updates/)
- 現在の配布物：[iap-codex-0.2.6.tar.gz](iap-codex-0.2.6.tar.gz) / [SHA-256](iap-codex-0.2.6.sha256)
- 以前の配布物：[0.2.5](https://github.com/aidhidesupport/iap/releases/tag/codex-v0.2.5)は内容を変えず保持。0.2.6は文書修正のみで、導入済み案件の移行は不要
- 変更内容：[RELEASE_NOTES.md](RELEASE_NOTES.md)
- 検証条件：[DISTRIBUTION_TESTS.md](DISTRIBUTION_TESTS.md)

同じ版の配布ファイルを差し替えません。コード・同梱手順・ライセンス表示を直す場合も新しい配布版を作り、元の版を保持します。サイトの説明だけの更新は、基本実装の版とは区別します。

## ソースから配布物を作る

今後の基本実装の編集元は`codex/`、サイトの編集元は`website/`です。`scripts/package-codex.py`は隣の私用チェックアウトに依存せず、このリポジトリ内の明示したファイルだけから配布物を作ります。MANIFEST.jsonとSHA-256は生成し、端末上の実案件記録・追加ファイルは取り込みません。

```sh
python3 scripts/package-codex.py --check
python3 scripts/package-codex.test.py
```

`--check`（引数なしも同じ）は書き込まず、ソースから再現したバイト列をルートと`website/public/downloads/`の両方と照合します。現在のソースから対象版を再現し、以前の配布物は変更せず保持します。

新しい配布版では`codex/package.json`の版を上げ、同梱手順・テストと変更履歴を更新します。リポジトリ直下から、出力先の例を使って実行します。

```sh
release_dir=$(mktemp -d)
python3 scripts/package-codex.py --output "$release_dir"
```

同名の出力が異なる内容で存在する場合は上書きを拒否します。生成した新版のtar.gzとsha256をルートと`website/public/downloads/`へ追加し、`--check`を再実行します。新しい同梱ファイルを追加する場合はスクリプトの公開用一覧にも明示してください。

配布CIは`codex/package.json`から対象版を読みます。サイト・README・ガイド・変更履歴の版とダウンロード先も更新し、実際に配布するアーカイブをCIで検査します。Releaseとタグの公開は下記の条件に従います。

`website-source.tar.gz`は2026-09-22時点の保存用スナップショットです。現在の通常ファイルを編集元とし、サイト更新のたびに圧縮版へ書き戻す運用は行いません。

## 版と互換性の方針

- 基本実装のタグ名は `codex-v0.2.6` の形式を使用。IAP仕様の版番号と混同させません。
- 0.xの試験配布でも、互換性を壊す変更、対象環境、既存記録への影響を変更履歴に明記します。
- 記録形式を変える場合は、移行前の退避、移行方法、戻せる範囲、未対応時の動作を記載します。旧記録を黙って新形式と解釈しません。
- 公開済みのタグは別コミットへ移動せず、訂正は新しい版と訂正理由で扱います。

## GitHub Releaseの公開手順

公開mainの履歴整理と最初の0.2.5 Releaseは2026-09-23に完了しています。以後は整理後の公開履歴を使い、旧ローカル履歴をmerge・pushしません。

1. 対象コミット、配布版、ファイル一覧、LICENSE・NOTICE、SHA-256を照合する。
2. 実際に添付する配布物を展開し、テストと架空例を確認する。Linux・macOSとNode.jsの最低版・22系のCI結果を確認する。
3. 変更内容・互換性・検証した版を明記し、対象コミットを指定したタグとpre-releaseを作る。タグを別コミットへ移動しない。
4. 手順入りtar.gzとsha256を添付する。GitHubの自動生成「Source code」と配布用アーカイブを区別する。
5. 匿名で添付物とサイトの配布物を取得し、検証済みバイト列との完全一致とリンクを確認する。
6. 変更履歴・活動報告・現在の案内へ実際の結果を残す。

0.2.6のチェックサムは[配布ファイル](iap-codex-0.2.6.sha256)を参照。保持する0.2.5のSHA-256は`db5e06af7de92e4ac3751d68183575237a3b731182095bbef9a0fac59df2d82a`です。

## 更新通知

Release公開開始後、利用者がGitHubのWatch → Custom → Releasesから購読できます。サイトの案内を置くだけで利用者を自動登録しません。[GitHub公式・通知設定](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications)

## 公開後に不具合が分かった場合

影響する版、症状、回避策、修正版の予定を記載します。配布停止が必要な場合は理由を案内し、既存の版を無言で差し替えません。案件の復元は利用者が退避した記録一式と移行案内に沿って行います。利用者の端末を自動更新したり、記録を自動削除したりしません。
