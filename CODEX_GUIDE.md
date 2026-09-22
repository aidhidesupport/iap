# 開発者ガイド — 導入から共有まで

2026-09-22 / Codex連携のローカル試作0.2.4

試作コードの `iap-codex` フォルダーを受け取った方向けです。現在、コードの一般配布は未実施です。この文書を開いただけでは、案件への導入やフックの有効化は行われません。

## 準備

ログイン済みのCodex環境、Node.js 22.13以降、別の人が担当するPM、小さな案件を用意します。導入スクリプトに追加のAPIキーは不要です。最初は30〜60分で途中成果を確認できる案件に絞ります。

PMから目的・完成条件・対象外を受け取り、開発者とCodexが `contract.json` を作ります。PMにJSONの編集は求めません。読む成果は案件内の相対パスで明示します。観測対象は1〜16個のUTF-8テキストファイル、各64,000バイト以下です。

## 配置と有効化

配布元の `iap-codex` フォルダーで、例のパスを実際のパスへ置き換えて実行します。

```sh
node manage.mjs install /path/to/project /path/to/contract.json
node manage.mjs doctor /path/to/project
```

案件内の `.iap`、`.codex/hooks.json`、`AGENTS.md` に設定・記録・作業指示を配置します。既存設定は保持し、変更前の内容をバックアップします。

次にその案件を対象にCodex CLIを開き、`/hooks` で内容をレビューして信頼します。新規・変更されたフックは信頼されるまで実行されません。[OpenAI公式の手順](https://learn.chatgpt.com/docs/hooks#review-and-trust-hooks)を参照してください。

`doctor` の `configured: true` はファイル配置の確認です。小さな架空案件で、成果変更後の照合と共有文生成が実際に動くところまで確認します。別の案件や端末へも自動的に導入されたとは扱いません。

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

[PM側の受け取り方](PM_GUIDE.md) / [現在地と限界](STATUS.md)
