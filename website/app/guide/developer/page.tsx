import { pageMetadata } from '@/lib/site-metadata';
import { Guide, Section, DataTable } from '@/components/guide';
import { CodeBlock } from '@/components/code-block';
import { TextLink } from '@/components/site';
import { publicAsset } from '@/lib/site-path';
export const metadata = pageMetadata('/guide/developer/');
export default function Developer(){return <Guide title="ひとりで試す。案件で使う。" label="DEVELOPER GUIDE" lead="中核機能を実装した試験版を、まず架空例から試せます。現在の手順は、macOS/Linuxでターミナルのコマンドを実行できる方が対象です。その後のCodex連携では、案件の完成条件と作業中の成果を照合します。" sections={ [['use','どこで、どう使うか'],['before','ひとりで試す'],['agree','依頼を記録する'],['install','配置・有効化する'],['work','作業と確認'],['share','PMへ共有する'],['pause','止める・戻る']] }>
<Section id="use" title="はじめに — どこで、どう使うか">
<p>このサイトは説明と配布の入口です。最初のお試しと、Codexを使った案件への導入を分けて案内します。</p>
<DataTable headings={['使うもの','できること']} rows={[
  ['このWebサイト','ガイドと2分3秒の紹介動画を見る。ページを開くだけでは案件に導入されません。'],
  ['配布物の架空例','端末のターミナルで、成果の観測・共有文・古い評価の失効をひとりで確かめる。PMの参加やCodexへのログインは不要です。'],
  ['Codex連携','案件フォルダーに設定し、Codex CLIの作業中に照合を組み込む。初期設定はターミナル、日常の作業はCodexとの会話とコマンドで進めます。']
]}/>
<p>専用GUIだけで導入から共有まで完結する実装ではありません。別途作った手入力のWeb先行試作は、Codex連携と同期しません。このガイドは配布物の架空例と、検証済みのCLIでの導入手順を扱います。</p>
<p>最初は下の「ひとりで試す」までで十分です。0.2.5を実Codexで動かし、作業・再評価・共有・中断復帰まで確認しました。0.2.6は同梱文書のリンクと案内を直した版で、実行コードと記録形式は0.2.5と同一です。0.2.6として実Codex試験を再実施した記録ではありません。他の人の導入や実利用での負担軽減は未検証です。</p><TextLink href="/status">検証した版と、残る確認</TextLink>
</Section>
<Section id="before" title="01 — ひとりで架空例を試す"><p>基本実装0.2.6をApache-2.0で配布しています。商用利用に寄付や個別の許可は不要です。<a href={publicAsset("/downloads/iap-codex-0.2.6.tar.gz")} download="iap-codex-0.2.6.tar.gz">ソースとテストをダウンロード</a>し、<a href={publicAsset("/downloads/iap-codex-0.2.6.sha256")}>SHA-256</a>を確認して展開してください。Node.js 22.13以降のmacOS/Linuxが対象です。Codex等の利用環境の費用は各提供者の条件に従います。</p><CodeBlock>{`curl -fLO https://aidhidesupport.github.io/iap/downloads/iap-codex-0.2.6.tar.gz
curl -fLO https://aidhidesupport.github.io/iap/downloads/iap-codex-0.2.6.sha256
shasum -a 256 -c iap-codex-0.2.6.sha256
tar -xzf iap-codex-0.2.6.tar.gz
cd iap-codex-0.2.6
npm test
node checkpoint.mjs observe example
node checkpoint.mjs verify example`}</CodeBlock><p>追加パッケージは不要です。同梱の架空例は<code>valid: true, ready: false</code>が正常です。チェックサムは破損の確認用です。この段階ではPMの参加やCodexのログインは不要です。</p><h3>ひとりで、共有文と評価の失効を確かめる</h3><p>展開した配布元フォルダーで、例を新しい一時フォルダーへコピーして実行します。既存の案件への導入は行いません。</p><CodeBlock>{`trial_dir="$(mktemp -d)"
cp -R example/. "$trial_dir/"
node checkpoint.mjs observe "$trial_dir"
node checkpoint.mjs verify "$trial_dir"
node checkpoint.mjs share "$trial_dir"`}</CodeBlock><p>完成条件が未確認で、対象外の設計へ広がっている例です。次に同じターミナルで成果へ追記し、もう一度共有文を作ります。</p><CodeBlock>{`printf '\nお試しの追記。実際のCSV検証結果ではありません。\n' >> "$trial_dir/artifact.txt"
node checkpoint.mjs share "$trial_dir"`}</CodeBlock><p>変更後は古い評価をそのまま使わず、未評価の状態を確認できます。新しい評価を自動的に正解として作る操作ではありません。お試しの記録は一時フォルダーに残ります。</p><p><a href="https://github.com/aidhidesupport/iap/blob/main/DISTRIBUTION_TESTS.md">Linux・macOSの4環境でのテスト結果</a>も確認できます。以下は、実際にCodex連携を導入する段階で用意するものです。</p><DataTable headings={['用意するもの','確認すること']} rows={ [['Codexを使う開発環境','ログイン済みで、対象プロジェクトを開けること。初回の有効化はCLIで確認します。'],['Node.js','22.13以降。導入スクリプトに追加のAPIキーは不要です。'],['小さな案件と読む成果','最初は30〜60分の案件と、少数のUTF-8テキストファイル。'],['別の人が担当するPM','目的・完成条件・対象外を共有できること。']]}/><div className="callout neutral"><p>このページを開いても、案件への導入は行われません。以下のコマンドは、導入する端末のターミナルで実行します。</p></div></Section>
<Section id="agree" title="02 — PMの依頼を、作業記録にする"><p>PMから目的・完成条件・対象外を受け取り、開発者とCodexが<code>contract.json</code>を作ります。PMにJSONの編集を依頼する必要はありません。既存の案件の記録をそのまま流用せず、その依頼に合わせます。</p><DataTable headings={['項目','例']} rows={ [['目的','CSVの金額を集計し、正常・不正入力の結果を検証する。'],['完成条件','正常入力で合計600円。不正入力で2行目のエラーを報告する。'],['対象外','ログイン、認証、データベースの開発。'],['読む成果','検証報告のテキストファイル。'],['次の一手','指定した2入力を実行し、結果を記録する。']]}/><p>観測できるのは、指定したファイルだけです。1〜16ファイル、各64,000バイト以下のUTF-8テキストが対象です。画像・PDF・フォルダー全体を自動で理解する設定ではありません。</p><CodeBlock label="Codexへの依頼例">{`この案件にIAPを導入するため、作業記録JSONを作ってください。
PMの依頼：［依頼の文章］
目的：［目的］
完成条件：［成果で確認できる条件］
対象外：［今回は扱わないこと］
読むファイル：［案件フォルダーからの相対パス］
不明な条件は推測で確定せず、確認事項として残してください。`}</CodeBlock></Section>
<Section id="install" title="03 — 案件フォルダーに配置して、有効化する"><p>展開した<code>iap-codex-0.2.6</code>フォルダーをターミナルで開きます。以下のパスを実際の案件フォルダーと作業記録JSONへ置き換えて実行してください。</p><CodeBlock>{`node manage.mjs install /path/to/project /path/to/contract.json
node manage.mjs doctor /path/to/project`}</CodeBlock><p>インストーラーが案件内に<code>.iap</code>の記録・照合スクリプト、<code>.codex/hooks.json</code>、<code>AGENTS.md</code>の作業指示を配置します。既存設定を保持し、変更前の内容をバックアップします。</p><p>次に、<strong>その案件フォルダーを対象に</strong>Codex CLIを開き、<code>/hooks</code>でIAPのフックをレビューして信頼します。対象プロジェクトの信頼確認が表示された場合も内容を確認します。新規・変更されたフックは信頼されるまで実行されません。<a href="https://learn.chatgpt.com/docs/hooks#review-and-trust-hooks">OpenAI公式の有効化手順</a></p><div className="callout"><p><strong>配置の確認と、動作の確認は別です。</strong><br/><code>doctor</code>の<code>configured: true</code>は、必要なファイルがそろっていることを示します。導入直後で評価がまだない場合、state.valid: false、assessment_missing_or_invalid、disposition: "unassessed" が併記されても、配置の失敗を意味しません。最後に小さな架空の依頼で、成果変更後の照合と共有文生成が動くことを確認してください。</p></div><p>導入先ごとに確認します。親フォルダーの別のタスクや、別の端末にも有効になったとは扱いません。</p></Section>
<Section id="work" title="04 — 作業を進め、ずれたら戻る"><ol><li>Codexが依頼と実際の成果を読み、完成条件と対象範囲を照合します。</li><li>範囲内で直せるものは、開発者側で実装・テスト・再確認を進めます。</li><li>目的・完成条件・範囲の変更に判断が必要なら、PMへの確認事項を切り出します。</li><li>評価を保存すると、共有文の下書きも生成されます。</li></ol><p>評価の<code>ready</code>は、条件達成の評価があるという状態です。PMが成果を受け入れたことや、Codexの意味判断が必ず正しいことを保証しません。</p></Section>
<Section id="share" title="05 — 最新の要約を、PMへ渡す"><p>共有する直前に、<strong>導入先の案件フォルダー</strong>で最新の要約を取得します。古い評価が失効していれば、未評価と表示します。</p><CodeBlock>{`node .iap/checkpoint.mjs share .`}</CodeBlock><p>目的・進捗・残り・次の一手・確認事項を読み、共有先に合わせて表現を整えてから、既存のチャット等へ貼り付けます。成果本文や実行ログは自動転載しませんが、自由記述の自動匿名化ではありません。</p><h3>試用の時間も記録する場合</h3><p>展開した配布元のフォルダーから実行します。<code>first-trial</code>は記録用のID例です。既に作成済みならinitを繰り返さず、shareから使います。</p><CodeBlock>{`node pilot.mjs init /path/to/project first-trial paired
node pilot.mjs share /path/to/project first-trial
node pilot.mjs report /path/to/project first-trial`}</CodeBlock><p>この共有コマンドは、要約の再観測・生成にかかった時間だけを記録します。手直し・送信操作・PMの確認時間は、本人たちが測った値を別に記録します。外部への送信は自動では行いません。</p></Section>
<Section id="pause" title="06 — 止める・再開する・困ったとき"><p>案件フォルダーで実行します。pauseはIAPの照合を休止し、resumeで再開します。Codex自体の中断とは別です。</p><CodeBlock>{`node .iap/checkpoint.mjs pause .
node .iap/checkpoint.mjs resume .
node .iap/checkpoint.mjs handoff .`}</CodeBlock><h3>更新・取り外し</h3><p>対象を使うCodexセッションを閉じ、新版の配布元から同じinstallを実行すると更新できます。契約は保持し、手作業の変更との競合では停止します。取り外す場合は配布元から次を実行します。最初は変更予定の表示だけです。</p><CodeBlock>{`node manage.mjs uninstall /path/to/project
node manage.mjs uninstall /path/to/project --apply`}</CodeBlock><p>IAPのフックと作業指示・照合スクリプトを取り外し、他の設定と案件記録を保持します。完全削除が必要なら保存要否を確認してから案件の<code>.iap</code>を別途削除してください。既存設定を含む<code>.codex</code>やAGENTS.md全体は削除しないでください。詳細は同梱のREADMEへ。</p><DataTable headings={['状態','確認すること']} rows={ [['フックが動かない','対象の案件でCodexを開いているか、/hooksで設定を信頼しているか。'],['評価が古い・成果が未観測','成果のパス・更新内容を確認し、Codexに再観測と再評価を依頼する。'],['導入時に既存設定の変更を検出','手作業の変更を上書きせず、差分とバックアップを確認する。'],['共有文を書けない','評価が保存済みかを確認し、shareで現在の要約を取り直す。']]}/><div className="guide-next"><TextLink href="/guide/pm">PM側の受け取り方</TextLink><TextLink href="/status">できること・未実装のこと</TextLink></div></Section>
</Guide>;}
