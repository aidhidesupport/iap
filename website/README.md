# IAPのホームページとガイド

partial-standardsの活動としてIAPを提案するWebサイト。GitHub Pagesのプロジェクトサイト `/iap/` へ静的ファイルとして配信する。

## ローカルで編集する

Node.js 22.13以降。

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

開発サーバーの `/iap/` を開く。公開先も `/iap/`。サイト内リンクは `components/site-link.tsx`、画像・動画等は `lib/site-path.ts` の `publicAsset` を使う。配信時にサーバー処理を必要としない通常のページ遷移を使う。

```sh
npx tsc --noEmit
npm run build
node scripts/check-export.mjs
```

出力先は `dist/client`。サーバー・認証・データベースを必要としない。アプリの動的処理はコマンドをコピーするボタンのみで、データを外部へ送らない。

## 更新と公開

`main` 向けのPRでは、GitHub Actionsが型検査・ビルド・リンク検査を行う。PRからは公開せず、Pagesの公開権限・環境も使わない。`main` に変更を反映した後に検査と公開を行う。手動実行もmain以外では検査だけとなる。PRの再実行は同じPRの古い検査を取り消せるが、mainの公開処理を取り消さない。リポジトリの Settings → Pages → Source は GitHub Actions を選ぶ。

公開資料はリポジトリ直下のMarkdown、Web案内はこのフォルダーで管理する。役割や実装の範囲を変更する場合は両方を更新する。

今後の編集元はこのフォルダー。ルートのwebsite-source.tar.gzは2026-09-22の保存用スナップショットで、通常の改訂では再作成しない。通常ファイルがない旧構成でのみ、Actionsはチェックサムを確認してアーカイブを展開する。

動画は架空ケースに基づく説明用の再構成。実案件の共同作業や専用アプリ画面の録画ではない。

## 公開条件と配布物

仕様・ガイドはCC BY 4.0、基本実装はApache-2.0。詳細はリポジトリ直下のRIGHTS.mdとLICENSE.mdを参照。`/participate/`に利用条件と参加案内を掲載する。`public/downloads/`に0.2.6と保持する0.2.5の最小配布物・チェックサム、`public/licenses/`に利用条件と第三者のライセンスを収録する。公開動画は2分3秒。冒頭24秒でIAPの説明と理念を伝え、続いてCodex連携の実装例を紹介する。PM・Codex表記の日本語字幕と控えめなBGM付き。読み上げ音声は含めない。BGM「Inspired」／Kevin MacLeodの出典・CC BY 4.0・編集内容を掲載ページとTHIRD_PARTY_NOTICES.mdに記載している。
