import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// A reproducible fictional case. Assessments are authored examples, not an
// automated semantic classifier. IAP validates and records their evidence.
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const cli = path.join(repo, 'codex/checkpoint.mjs');
const output = path.resolve(process.argv[2] || path.join(os.tmpdir(), `iap-recovery-evidence-${Date.now()}`));
fs.mkdirSync(output, { recursive: true });
const project = fs.mkdtempSync(path.join(os.tmpdir(), 'iap-recovery-'));
fs.mkdirSync(path.join(project, '.iap'));
const write = (file, value) => fs.writeFileSync(path.join(project, file), value);
const save = (name, value) => fs.writeFileSync(path.join(output, name), typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
const runs = [];
function iap(command, review) {
  const r = spawnSync(process.execPath, [cli, command, project], { encoding: 'utf8', input: review ? JSON.stringify(review) : undefined });
  if (r.error) throw r.error;
  runs.push({ command: `node codex/checkpoint.mjs ${command} <case>`, exitCode: r.status, stdout: r.stdout, stderr: r.stderr });
  return { ...r, data: command === 'share' ? r.stdout : JSON.parse(r.stdout) };
}
const contract = {
  format: 'iap-codex-contract/0.1', revision: 1,
  purpose: 'CSVの金額エラーを見逃さず、正しい合計だけを依頼者へ返す。',
  request: '正常入力100・200・300は600円。不正な金額はデータ行番号を示して停止し、合計を出さない。ログイン・DBの追加は対象外。',
  criteria: [
    { id: 'C1', text: '100・200・300の合計が600円になる。' },
    { id: 'C2', text: 'abcを含むデータ2行目をエラーにし、合計を出さない。' }
  ],
  excluded: ['ログイン画面の設計', 'DB保存'],
  files: ['sum.mjs', 'work-note.txt', 'test-results.txt'],
  nextAction: 'CSV集計の不正な金額の扱いを直し、2つの入力を再確認する。'
};
write('.iap/contract.json', JSON.stringify(contract, null, 2));
write('valid.csv', 'amount\n100\n200\n300\n');
write('invalid.csv', 'amount\n100\nabc\n300\n');
const beforeCode = `import fs from 'node:fs';
const rows = fs.readFileSync(process.argv[2], 'utf8').trimEnd().split(/\\r?\\n/).slice(1);
const total = rows.reduce((sum, row) => sum + (Number(row) || 0), 0);
console.log('合計: ' + total + '円');
`;
const afterCode = `import fs from 'node:fs';
const rows = fs.readFileSync(process.argv[2], 'utf8').trimEnd().split(/\\r?\\n/).slice(1);
let total = 0;
for (const [index, raw] of rows.entries()) {
  const value = raw.trim();
  if (!/^\\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
    console.error('エラー: データ' + (index + 1) + '行目の金額が不正です');
    process.exit(1);
  }
  total += Number(value);
  if (!Number.isSafeInteger(total)) {
    console.error('エラー: 合計が安全に扱える整数の範囲を超えています');
    process.exit(1);
  }
}
console.log('合計: ' + total + '円');
`;
function runInputs() {
  const values = ['valid.csv', 'invalid.csv'].map(input => {
    const r = spawnSync(process.execPath, [path.join(project, 'sum.mjs'), path.join(project, input)], { encoding: 'utf8' });
    if (r.error) throw r.error;
    return { input, exitCode: r.status, stdout: r.stdout.trim(), stderr: r.stderr.trim() };
  });
  write('test-results.txt', values.map(r => `${r.input}\nexit: ${r.exitCode}\nstdout: ${r.stdout || '(empty)'}\nstderr: ${r.stderr || '(empty)'}`).join('\n\n') + '\n');
  return values;
}
write('sum.mjs', beforeCode);
write('work-note.txt', '説明用の架空記録。本人はログイン画面の設計を先に進めている。CSVの不正値処理はまだ直していない。\n');
const before = runInputs();
assert.equal(before[0].stdout, '合計: 600円');
assert.equal(before[1].stdout, '合計: 400円');
assert.equal(before[1].exitCode, 0);
const observedBefore = iap('observe').data;
const beforeReview = {
  format: 'iap-codex-assessment/0.1', observationId: observedBefore.observationId, revision: 1,
  disposition: 'revise',
  nextAction: 'ログイン画面の設計をいったん止め、CSVの不正値処理へ戻る。abcを0円扱いせず、行番号付きエラーで止めて再テストする。',
  checks: [
    { id: 'C1', result: 'met', reason: '正常入力の実行で600円を表示した。', evidence: [{ file: 'test-results.txt', quote: 'valid.csv\nexit: 0\nstdout: 合計: 600円' }] },
    { id: 'C2', result: 'not_met', reason: '不正入力が終了コード0・合計400円で成功しており、期待する停止と一致しない。', evidence: [{ file: 'test-results.txt', quote: 'invalid.csv\nexit: 0\nstdout: 合計: 400円\nstderr: (empty)' }] }
  ],
  scope: { result: 'outside', reason: '本人の作業記録は対象外のログイン設計を優先している。', evidence: [{ file: 'work-note.txt', quote: '本人はログイン画面の設計を先に進めている。CSVの不正値処理はまだ直していない。' }] }
};
assert.equal(iap('record', beforeReview).status, 0);
const beforeVerdict = iap('verify').data;
assert.equal(beforeVerdict.valid, true); assert.equal(beforeVerdict.ready, false);
const beforeShare = iap('share').data;
const beforeSummary = iap('share-json').data;
assert.equal(beforeSummary.scope, 'outside');
assert.deepEqual(beforeSummary.counts, { met: 1, notMet: 1, unknown: 0, total: 2 });
save('before-observation.json', observedBefore); save('before-assessment.json', beforeReview);
write('sum.mjs', afterCode);
write('work-note.txt', '説明用の架空記録。ログイン画面の設計を保留し、依頼されたCSVの金額検証に作業を戻した。ログイン・DBは実装していない。\n');
const after = runInputs();
assert.equal(after[0].stdout, '合計: 600円'); assert.equal(after[0].exitCode, 0);
assert.equal(after[1].stderr, 'エラー: データ2行目の金額が不正です'); assert.equal(after[1].stdout, ''); assert.equal(after[1].exitCode, 1);
const stale = iap('verify').data;
assert.equal(stale.valid, false); assert(stale.problems.includes('stale_observation_or_contract'));
const staleShare = iap('share').data;
assert(staleShare.includes('最新成果は未評価'));
const observedAfter = iap('observe').data;
const afterReview = {
  ...beforeReview, observationId: observedAfter.observationId, disposition: 'ready',
  nextAction: '2つの入力の結果と共有文を依頼者へ渡し、成果の受け入れを確認する。',
  checks: [beforeReview.checks[0],
    { id: 'C2', result: 'met', reason: 'データ2行目で終了コード1。標準出力は空で合計を出していない。', evidence: [{ file: 'test-results.txt', quote: 'invalid.csv\nexit: 1\nstdout: (empty)\nstderr: エラー: データ2行目の金額が不正です' }] }
  ],
  scope: { result: 'within', reason: '作業をCSVの金額検証に戻し、ログイン・DBを追加していない。', evidence: [{ file: 'work-note.txt', quote: 'ログイン画面の設計を保留し、依頼されたCSVの金額検証に作業を戻した。ログイン・DBは実装していない。' }, { file: 'sum.mjs', quote: "console.error('エラー: データ' + (index + 1) + '行目の金額が不正です');" }] }
};
assert.equal(iap('record', afterReview).status, 0);
const afterVerdict = iap('verify').data;
assert.equal(afterVerdict.valid, true); assert.equal(afterVerdict.ready, true);
const afterShare = iap('share').data;
const afterSummary = iap('share-json').data;
assert.deepEqual(afterSummary.counts, { met: 2, notMet: 0, unknown: 0, total: 2 });
const evidence = {
  generatedAt: new Date().toISOString(), caseType: 'fictional-reproducible-cli-case', iapVersion: '0.2.6', nodeVersion: process.version,
  checkpointSha256: createHash('sha256').update(fs.readFileSync(cli)).digest('hex'),
  limitations: ['Slackの会話と本人の作業記録は説明用の再現。Slackへの送信は行っていない。', '評価は例に対して作成したもので、IAPは引用・条件・版の対応を検証する。意味判断の自動精度を測る試験ではない。', 'CLIを直接呼び出した検証。フックによる自動起動や本人の行動変化・負担軽減は今回測定していない。', 'サンプルは非負整数の金額1列のみ。一般的なCSVパーサーではない。'],
  contract, beforeCode, afterCode, before, after, beforeVerdict, staleVerdict: stale, afterVerdict,
  beforeSummary, afterSummary, beforeShare, staleShare, afterShare
};
save('evidence.json', evidence); save('before-share.md', beforeShare); save('stale-share.md', staleShare); save('after-share.md', afterShare);
save('after-observation.json', observedAfter); save('after-assessment.json', afterReview); save('commands.json', runs);
save('sum-before.mjs', beforeCode); save('sum-after.mjs', afterCode);
console.log(JSON.stringify({ result: 'passed', output, before: beforeSummary.counts, stale: stale.problems, after: afterSummary.counts, slackMessagesSent: 0 }, null, 2));
