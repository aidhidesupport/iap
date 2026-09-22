# 開発者ガイド — 導入から共有まで

2026-09-22 / Codex連携のローカル試作0.2.5

基本実装のソース・テストをApache-2.0で配布しています。商用でも利用でき、寄付や個別の許可は不要です。この文書を開いただけでは、案件への導入やフックの有効化は行われません。

## 入手して確かめる

[0.2.5をダウンロード](https://aidhidesupport.github.io/iap/downloads/iap-codex-0.2.5.tar.gz) / [SHA-256](https://aidhidesupport.github.io/iap/downloads/iap-codex-0.2.5.sha256)。macOS/Linux、Node.js 22.13以降が対象です。端末上で次のように展開できます。

```sh
curl -fLO https://aidhidesupport.github.io/iap/downloads/iap-codex-0.2.5.tar.gz
curl -fLO https://aidhidesupport.github.io/iap/downloads/iap-codex-0.2.5.sha256
shasum -a 256 -c iap-codex-0.2.5.sha256
tar -xzf iap-codex-0.2.5.tar.gz
cd iap-codex-0.2.5
npm test
node checkpoint.mjs observe example
node checkpoint.mjs verify example
```

追加パッケージのインストールは不要です。この同梱例の確認にはPMの参加やCodexへのログインも不要です。同梱例は架空データで、`valid: true, ready: false`が正常です。未実行のCSV検証と範囲外の作業を、完了扱いにしない例です。ライセンス本文・NOTICE・ファイルごとのハッシュを同梱しています。チェックサムは破損確認用で、第三者の署名認証ではありません。

[ひとりで共有文と古い評価の失効を確かめる手順](https://aidhidesupport.github.io/iap/guide/developer/#before)も用意しました。実案件への導入前に、一時フォルダーへコピーした架空例で試せます。[Linux・macOSの4環境での検証](DISTRIBUTION_TESTS.md) / [導入相談](https://github.com/aidhidesupport/iap/issues/new?template=installation.md)

配布物に実案件の記録、端末固有の設定、Codex本体は含みません。Codexを呼ぶ実ランタイム試験用ハーネスも最小配布物の対象外です。下のフック有効化は、例を読む操作とは別です。

## 準備

ログイン済みのCodex環境、Node.js 22.13以降、別の人が担当するPM、小さな案件を用意します。導入スクリプトに追加のAPIキーは不要です。最初は30〜60分で途中成果を確認できる案件に絞ります。

PMから目的・完成条件・対象外を受け取り、開発者とCodexが `contract.json` を作ります。PMにJSONの編集は求めません。読む成果は案件内の相対パスで明示します。観測対象は1〜16個のUTF-8テキストファイル、各64,000バイト以下です。

## 配置と有効化

展開した `iap-codex-0.2.5` フォルダーで、例のパスを実際のパスへ置き換えて実行します。

```sh
node manage.mjs install /path/to/project /path/to/contract.json
node manage.mjs doctor /path/to/project
```

案件内の `.iap`、`.codex/hooks.json`、`AGENTS.md` に設定・記録・作業指示を配置します。既存設定は保持し、変更前の内容をバックアップします。LICENSEとNOTICEも案件内へ配置します。Codexのグローバル設定や信頼設定は変更しません。

次にその案件を対象にCodex CLIを開き、`/hooks` で内容をレビューして信頼します。新規・変更されたフックは信頼されるまで実行されません。[OpenAI公式の手順](https://learn.chatgpt.com/docs/hooks#review-and-trust-hooks)を参照してください。

`doctor` の `configured: true` はファイル配置の確認です。導入直後で評価がまだない場合、`state.valid: false`、`assessment_missing_or_invalid`、`disposition: "unassessed"` が併記されても、配置の失敗を意味しません。小さな架空案件で、成果変更後の照合と共有文生成が実際に動くところまで確認します。別の案件や端末へも自動的に導入されたとは扱いません。

## 作業と共有

Codexが指定成果を観測し、根拠付きで評価します。範囲内の修正・テスト・再照合は開発者側で進め、条件変更の判断だけPMへ切り出します。評価保存時に共有下書きが生成されます。

共有直前に、導入先の案件フォルダーで実行します。

```sh
node .iap/checkpoint.mjs share .
```

進捗・残り・次の一手・確認事項を読み直し、既存のチャットへ貼り付けます。外部送信は自動では行いません。成果本文の自動転載はしませんが、自由記述の自動匿名化ではありません。古くなった評価は失効し、未評価と表示します。

試用の時間も記録する場合は、配布元フォルダーで実行します。`first-trial` は記録IDの例です。既に初期化したIDではinitを繰り返しません。

```sh
node pilot.mjs init /path/to/project first-trial paired
node pilot.mjs share /path/to/project first-trial
node pilot.mjs report /path/to/project first-trial
```

自動記録するのは共有要約の再観測・生成時間です。文章の手直し、送信操作、PMの確認時間は本人たちの実測値を別に記録します。`ready` は条件達成の評価で、PMの受け入れ済みとは異なります。

## 休止と復帰

案件フォルダーで実行します。pauseはIAPの照合の休止で、Codex自体の中断とは別です。

```sh
node .iap/checkpoint.mjs pause .
node .iap/checkpoint.mjs resume .
node .iap/checkpoint.mjs handoff .
```

フックが動かなければ対象の案件と `/hooks` の信頼状態を確認します。未観測なら成果パスを確認し、Codexへ再観測・再評価を依頼します。既存設定との競合があれば、変更を上書きせず差分とバックアップを確認します。

## 更新・取り外し・記録の削除

更新は、新版を別フォルダーへ展開し、対象を使うCodexセッションを閉じてから、同じ`install`を実行します。契約は保持され、変更された設定・指示・コードとの競合では停止します。フックが変更された場合は再レビューしてください。

取り外すときは、対象プロジェクトを使うCodexセッションを閉じ、配布元フォルダーから実行します。最初は変更予定の表示だけです。

```sh
node manage.mjs uninstall /path/to/project
node manage.mjs uninstall /path/to/project --apply
```

IAPが配置したフック、AGENTS.md内のIAP指示、照合スクリプト、導入管理情報を取り外します。他のフックや指示は保持します。手作業で変更したIAP設定があれば上書きせず停止します。同時に編集する運用は対象外です。

**取り外しても案件記録は残ります。** `.iap`内の契約・評価・共有文・試用記録・バックアップ・ライセンスと、`.gitignore`の除外は保持します。完全削除が必要なら保存期間・保存要否を確認し、必要なものを別の場所へ退避してから、案件の`.iap`を削除してください。他の設定を含み得る`.codex`やAGENTS.md全体を削除しないでください。配布元フォルダーの削除と案件記録の削除も別です。

[PM側の受け取り方](PM_GUIDE.md) / [現在地と限界](STATUS.md)
