# IAP — Interaction Accommodation Protocol

[English](README.en.md) / 日本語

**対話・協働の条件調整プロトコル / partial-standardsの活動としての提案**

維持・編集：[@aidhidesupport](https://github.com/aidhidesupport)  
仕様：0.2-draft / 案内更新：2026-09-24

IAPは、目的・完成条件・連絡方法・確認・中断と再開の条件を明確にし、本人の意思を保ちながら人・AI・サービスと協働するための仕様草案です。partial-standardsの活動の一環として、草案と具体的な実装例を出し、試行と反証から改善することを提案します。

出発点は、発達特性のある人が協働で直面する困りごとです。診断の開示やIQを利用条件にせず、必要な条件を本人が選べることを重視します。完成した標準や、実利用での効果が確立した仕組みではありません。

## 最初の実装例：開発者・PM・Codex

PMと開発者は別々の人です。PMが目的と完成条件を伝え、開発者はCodexと途中成果を照合し、合意した範囲で修正・テスト・再確認を進めます。進捗は短い要約で共有し、目的・完成条件・範囲の変更に必要な判断をPMへ切り出します。通常の修正を毎回PMの承認待ちにしません。

Codex連携は、中核機能を実装した試験版です。完成条件との照合、修正・再確認、共有文の生成、古い評価の失効、休止・復帰を扱います。基本実装0.2.6をApache-2.0で配布しており、ライセンス上は企業・顧客案件でも利用できます。

今の試験版は、macOS/Linuxでターミナルのコマンドを実行できる方を対象に、架空例から試せる形で案内しています。他の人の端末での導入や、実利用での負担軽減は未検証です。配布物0.2.5は4環境で各80テストが成功し、同じMacの実Codexで作業・再評価・共有・中断復帰を確認済みです。0.2.6は同梱文書の修正で、実行コード・記録形式は0.2.5と同一です。[検証範囲と残る確認](STATUS.md)

[ホームページとガイド](https://aidhidesupport.github.io/iap/)から、提案・役割別ガイド・デモ・検証の現在地を読めます。

[よくある質問](https://aidhidesupport.github.io/iap/faq/) / [配布・更新と活動報告](https://aidhidesupport.github.io/iap/updates/)

## 読む順序

- [完成条件・途中確認・再開の三つの場面](USE_CASES.md)：コピーできる文章と、配布物で状態の変化を試す手順。
- [ひとりで架空例を試す](https://aidhidesupport.github.io/iap/guide/developer/#before)：macOS/LinuxとNode.js 22.13以降で、共有文と古い評価の失効を確認。PMの参加やCodexへのログインは不要。
- [どこで、どう使うか](CODEX_GUIDE.md#どこでどう使うか)：説明サイト、端末で試す配布物、Codex連携の違いを確認。
- [まず一つの依頼で理解する](QUICKSTART.md)：役割と流れをつかみ、任意で一時フォルダーへの導入・休止・取り外しを試す。
- [開発者ガイド](CODEX_GUIDE.md)：ダウンロード、導入・確認・共有、停止・取り外し。
- [PMガイド](PM_GUIDE.md)：依頼に書くこと、共有文の読み方、判断の返し方。
- [実装と検証の現在地](STATUS.md)：技術的に確かめたことと、まだ分からないこと。
- [配布物の自動検証](DISTRIBUTION_TESTS.md)：Linux・macOS、Node.jsの最低版と22系での結果。
- [一案件の試用手順](PILOT_RUNBOOK.md)：両者の負担と失敗を記録する。
- [統合仕様 0.2](IAP_SPEC.md) / [適合・反証ケース](CONFORMANCE_CASES.md)：設計原則と検証案。
- [活動の順序](ROADMAP.md)：説明、試行、記録、改善の次の一歩。

## 入手・参加

[基本実装0.2.6](https://aidhidesupport.github.io/iap/downloads/iap-codex-0.2.6.tar.gz) / [開発者ガイド](CODEX_GUIDE.md) / [参加と支援](SUPPORT.md)。まず小さな架空案件から試せます。

ひとりで同梱例を試す段階では、PMの参加やCodexのログインは不要です。[紹介用の短文・出典表記](SHARE.md)と[導入相談の記入用紙](https://github.com/aidhidesupport/iap/issues/new?template=installation.md)も用意しています。

最初のお試しは端末のターミナルで行います。その後、案件にCodex連携を導入する手順はCLI向けです。専用GUIだけで完結する実装ではなく、手入力のWeb先行試作との同期もありません。

## 提案を育てる

[短い感想の窓口と改善の進め方](FEEDBACK.md)を用意しています。読んだだけ、途中で止まったという反応も、一言から残せます。自分の道具への取り入れ方は[独立実装者向けガイド](IMPLEMENTERS.md)へ進めます。

曖昧な要件、使えない手順、反証例を[Issue](https://github.com/aidhidesupport/iap/issues)に寄せてください。個人名・職場の原文・顧客資料・診断情報・資格情報を含まない、小さな架空例で十分です。試した結果が改善しなかった場合も、仕様を見直す材料になります。

現行MCPの公式拡張・採用済みの標準ではありません。独立した実装とのデータ交換は今後の検討対象です。

## ソースと改善への参加

[基本実装のソース・テスト](codex/)と[Web案内のソース](website/)を、ファイル単位で読んで変更を提案できます。[開発・寄稿手順](CONTRIBUTING.md)に確認コマンドをまとめました。サイトの変更はPRの段階で検査し、mainへの反映後にGitHub Pagesへ配信します。

今後の編集元はこの通常ファイルです。[website-source.tar.gz](website-source.tar.gz)は2026-09-22時点の保存用スナップショットとして残します。基本実装0.2.6の配布物は変更せず、ソースから同じ内容を再生成できることを検査します。

## 利用条件

文書はCC BY 4.0、基本実装はApache-2.0です。適用範囲・第三者素材・公式表示は[RIGHTS.md](RIGHTS.md)を、改善案の提供条件は[CONTRIBUTING.md](CONTRIBUTING.md)を確認してください。Issueで議論しただけで、その人の権利がプロジェクトへ移る扱いにはしません。
