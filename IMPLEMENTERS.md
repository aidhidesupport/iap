# 自分の道具にIAPを取り入れる

IAPは対話・協働の条件を扱う仕様草案です。現在のCodex連携は一つの実装例で、IAPそのものを特定のAI製品や画面に限定するものではありません。別の編集環境や、人が扱う手順への適用案も議論できます。

このガイドは、草案0.2-draftから実装する範囲を選び、確認結果を説明するための入口です。新しい規範要件、互換性の保証、認証制度は追加しません。

## 最初に読む範囲

1. [仕様の設計原則](IAP_SPEC.md#section-2)：本人の意思、目的、観測、権限の分離。
2. [要件48項目](IAP_SPEC.md#section-7)：各要件のIDと内容。
3. [適合と効果の検証](IAP_SPEC.md#section-18)：実装規則、意味を保つ品質、人への効果を別々に確認。
4. [適合・反証ケース](CONFORMANCE_CASES.md)：成功例に加え、未確認・変更・失敗時の期待結果。
5. [基本実装のソース](codex/)：契約・観測・評価・共有の一例。

## 最初の実装範囲を選ぶ

作業途中の確認を対象にするなら、まず一つの架空案件で、次の流れを実装・点検できます。

| 処理 | 表す情報・確かめること | 関係する仕様要件 |
|---|---|---|
| 依頼を記録 | 目的・完成条件・範囲・版。提案と確認済みの条件を区別 | A01–A04 |
| 成果を観測 | 対象、取得時点、取得失敗、観測できた範囲 | E01–E04 |
| 条件と照合 | 各条件の根拠、不明、次の一手。見えていない成功を補わない | G04、E03–E04 |
| 共有文を作成 | 許可された内容と範囲。下書きと送信を区別 | D01–D04、V01–V04 |
| 中断から戻る | 目的、進捗、次の一手。古い条件や不在の支援を明示 | R01–R04 |

この表の機能だけを作って、CoreやExecution全体への適合を主張することはできません。仕様第18章の区分に沿い、Coreと各領域の対応範囲を要件ごとに説明してください。未実装は未実装、未検査は未確認として残します。

## 最小実装でも区別すること

- 本人・依頼元が確定した条件と、AIが補った候補。
- 現在の成果に対する評価と、以前の成果への評価。
- 通常の作業途中、範囲からの逸脱、観測できない状態。
- 条件達成の評価と、PMによる成果の受け入れ。
- 下書きの生成権限と、外部への送信権限。
- 照合機構を設定したことと、その場で実際に起動したこと。

LLMに処理を任せる場合も、記録された版や権限が有効かはプログラム側で検査できます。意味の評価が必要な部分まで、形式検査だけで正しいと見なさないようにします。

## 架空例で点検する

| 入力・変化 | 確認する結果 | 参照ケース |
|---|---|---|
| 依頼の目的が不明 | 未確定の項目と、依頼元に必要な確認が残る | C02、C09 |
| 版1の確認後に版2の条件を提案 | 版2を承諾済みにしない | C10、C27 |
| 成果が更新される | 古い観測を現在の根拠として使わない。実際の取得時点と限界が分かる | C12 |
| 指定成果を取得できない | 確認できている・見守れていると表示しない | C29 |
| 途中で休止して再開 | 休止でき、目的と次の一手へ戻れる | C13、C14 |
| 下書きのみ許可 | 下書きを作れる。外部送信を勝手に行わない | C15、C16 |

上表は確認対象の例で、32ケース全件の代替ではありません。要件ごとに成功・失敗・未確認の結果と、再現用の小さな入力を公開できる形にすると、実装の違いを話し合えます。

## 現在のファイル形式と互換性

基本実装0.2.5では`iap-codex-contract/0.1`、`iap-codex-observation/0.1`、`iap-codex-assessment/0.1`などを使います。仕様の`0.2-draft`と、実装の`0.2.5`と、各ファイル形式の`0.1`は別の版です。

これらは現在の実装で使う形式です。複数の独立実装間で互換性を確認済みの交換規格ではありません。実装を参考に独自形式を作る場合は、違い、読み込めない必須項目、移行方法を明示します。実際に交換を検査するまでは、他の実装と相互運用できるとは表示しません。

互換性の提案には、対応させたい二つの実装、対象の版、入力、期待結果、実際の結果を添えてください。未対応の必須項目を読み飛ばして成功とする設計は、仕様T01と照合が必要です。

## 実装を紹介する

[実装・連携の提案用紙](https://github.com/aidhidesupport/iap/issues/new?template=implementation.md)に、対象の仕様版、用途、対応要件、未実装、検査結果を記載できます。公開可能なリポジトリや小さな架空例だけで構いません。

例えば「IAP草案0.2-draftのE01・E03を参考にした試作。その他は未実装／未検査」のように、実際の範囲を説明できます。これは表記例で、特定の実装が対応済みという宣言ではありません。公式認証・完全対応の表示や、未確認の効果の表現は避けてください。[ブランド方針](BRAND.md)

仕様変更の提案は、解決する場面、関係する要件ID、反証例、既存実装への影響を添えます。維持者が判断理由を残し、協賛額で採否を決めません。[寄稿方法](CONTRIBUTING.md)

文書・コードの再利用は[対象ごとの公開条件](LICENSE.md)に従います。

## For independent implementers

The specification is `0.2-draft`; the reference implementation is `0.2.5`. Its `iap-codex-*/0.1` file formats are implementation formats, not a demonstrated cross-implementation interchange standard. Document supported requirement IDs, unimplemented behavior, test inputs and results. Partial implementation is not full Core or Execution conformance. Assessment is separate from the PM accepting the work, and generating a draft is separate from sending it. Use the [implementation issue template](https://github.com/aidhidesupport/iap/issues/new?template=implementation.md) to discuss a small fictional example. This project does not currently provide third-party certification.
