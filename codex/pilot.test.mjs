import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { initPilot, readPilot, updatePilot, capturePilot, summarizePilot, reportPilot, migratePilot, sharePilot, SHARING_METRICS } from './pilot.mjs';
import { observe } from './checkpoint.mjs';
const cli = fileURLToPath(new URL('./pilot.mjs', import.meta.url));
function fixture(t, kind = 'self') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'iap-pilot-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, '.iap'));
  const contract = { format: 'iap-codex-contract/0.1', revision: 1, purpose: 'PRIVATE REQUEST',
    criteria: [{ id: 'C1', text: 'PRIVATE CRITERION' }], excluded: [], files: ['artifact.txt'], nextAction: 'Check artifact' };
  fs.writeFileSync(path.join(root, '.iap/contract.json'), JSON.stringify(contract));
  fs.writeFileSync(path.join(root, 'artifact.txt'), 'PRIVATE ARTIFACT');
  initPilot(root, 'trial', kind);
  return { root, contract, read: () => readPilot(root, 'trial'), update: patch => updatePilot(root, 'trial', patch) };
}
test('new pilot has unknown measurements and no invented participant feedback', t => {
  const f = fixture(t), s = summarizePilot(f.read());
  assert.equal(s.measuredCount, 0); assert.equal(s.unknownCount, 16);
  assert.equal(s.feedback.worker.reuse, 'unknown');
  assert.ok(s.rows.every(row => row.value === null && row.reductionPercent === null));
  assert.match(reportPilot(f.read()), /未測定 16項目/);
});
test('zero is measured only with evidence and is distinct from unknown', t => {
  const f = fixture(t);
  f.update({ metrics: { falseAlerts: { value: 0, source: 'During the reviewed interval, no false alerts were observed.' } } });
  const s = summarizePilot(f.read()); assert.equal(s.measuredCount, 1); assert.equal(s.unknownCount, 15);
  assert.equal(s.rows.find(r => r.key === 'falseAlerts').value, 0);
});
test('invalid or unsupported measurements leave the existing record intact', t => {
  const f = fixture(t), before = f.read();
  for (const patch of [
    { metrics: { falseAlerts: { value: 0, source: null } } },
    { metrics: { falseAlerts: { value: 0.5, source: 'estimate' } } },
    { metrics: { setupMinutes: { value: -1, source: 'timer' } } },
    { metrics: { setupMinutes: { value: '3', source: 'timer' } } },
    { metrics: { invented: { value: 1, source: 'no' } } },
    { kind: 'paired' }, { captures: [] }, { feedback: { worker: { reuse: 'yes', reason: null } } }
  ]) { assert.throws(() => f.update(patch)); assert.deepEqual(f.read(), before); }
});
test('self trials cannot record a separate requester as having responded', t => {
  const f = fixture(t);
  assert.throws(() => f.update({ metrics: { requesterReviewMinutes: { value: 0, source: 'Not present' } } }), /self_trial/);
  assert.throws(() => f.update({ feedback: { requester: { reuse: 'yes', reason: 'imagined' } } }), /self_trial/);
});
test('missing, zero and unconfirmed baselines never produce a saving rate', t => {
  const f = fixture(t);
  f.update({ metrics: { workerReviewMinutes: { value: 5, source: 'timer' } } });
  const rate = () => summarizePilot(f.read()).rows.find(r => r.key === 'workerReviewMinutes').reductionPercent;
  assert.equal(rate(), null);
  f.update({ baseline: { workerReviewMinutes: { value: 10, source: 'previous timer' } } });
  assert.equal(rate(), null);
  f.update({ comparison: { comparable: true, reason: 'Same scope and role; test fixture only.' } }); assert.equal(rate(), 50);
  f.update({ baseline: { workerReviewMinutes: { value: 0, source: 'previous timer' } } }); assert.equal(rate(), null);
});
test('synthetic runs remain synthetic even if values and comparison claims are filled', t => {
  const f = fixture(t, 'synthetic');
  f.update({ metrics: { workerReviewMinutes: { value: 5, source: 'synthetic' } },
    baseline: { workerReviewMinutes: { value: 10, source: 'synthetic' } }, comparison: { comparable: true, reason: 'synthetic' } });
  assert.ok(summarizePilot(f.read()).rows.every(r => r.reductionPercent === null && r.difference === null));
  assert.match(reportPilot(f.read()), /模擬試験。実利用の効果として扱わない/);
});
test('capture keeps only observation metadata and ignores stale ready evaluations', t => {
  const f = fixture(t), o = observe(f.root, f.contract);
  fs.writeFileSync(path.join(f.root, '.iap/assessment.json'), JSON.stringify({ format: 'iap-codex-assessment/0.1',
    observationId: o.observationId, revision: 1, disposition: 'ready', nextAction: 'Finish',
    checks: [{ id: 'C1', result: 'met', reason: 'fixture', evidence: [{ file: 'artifact.txt', quote: 'PRIVATE ARTIFACT' }] }],
    scope: { result: 'within', reason: 'fixture', evidence: [{ file: 'artifact.txt', quote: 'PRIVATE ARTIFACT' }] } }));
  capturePilot(f.root, 'trial'); assert.equal(f.read().captures[0].ready, true);
  fs.writeFileSync(path.join(f.root, 'artifact.txt'), 'CHANGED PRIVATE ARTIFACT');
  capturePilot(f.root, 'trial');
  const p = f.read(); assert.equal(p.captures[1].valid, false); assert.equal(p.captures[1].disposition, null);
  assert.ok(!JSON.stringify(p).includes('PRIVATE')); assert.ok(!JSON.stringify(p).includes(f.root));
  assert.ok(!reportPilot(p).includes('PRIVATE'));
});
test('missing artifacts remain unobserved and changed contracts are visible in reports', t => {
  const f = fixture(t); capturePilot(f.root, 'trial');
  f.update({ metrics: { workerReviewMinutes: { value: 5, source: 'timer' } },
    baseline: { workerReviewMinutes: { value: 10, source: 'earlier timer' } },
    comparison: { comparable: true, reason: 'Initially the same scope.' } });
  f.contract.purpose = 'New actual purpose'; fs.writeFileSync(path.join(f.root, '.iap/contract.json'), JSON.stringify(f.contract));
  fs.unlinkSync(path.join(f.root, 'artifact.txt')); capturePilot(f.root, 'trial');
  const s = summarizePilot(f.read()); assert.equal(s.contractChanged, true); assert.equal(s.lastCapture.unobservedFiles, 1);
  assert.ok(s.rows.every(row => row.reductionPercent === null && row.difference === null));
  assert.match(reportPilot(f.read()), /目的・条件が変わっている/);
});
test('pilot IDs and symlink paths cannot write outside the local records directory', t => {
  const f = fixture(t);
  for (const id of ['../other', '/tmp/other', 'nested/other', 'UPPER']) assert.throws(() => initPilot(f.root, id, 'self'));
  fs.symlinkSync('trial.json', path.join(f.root, '.iap/pilots/alias.json'));
  assert.throws(() => readPilot(f.root, 'alias'), /symlink_local_path/);
});
test('init refuses to overwrite an existing pilot', t => {
  const f = fixture(t); f.update({ title: 'Keep this trial' });
  assert.throws(() => initPilot(f.root, 'trial', 'synthetic'), /EEXIST/);
  assert.equal(f.read().title, 'Keep this trial');
});
test('paired feedback is explicit and report escapes hand-entered markup', t => {
  const f = fixture(t, 'paired');
  f.update({ title: '<img src=x>|\nInjected', feedback: { requester: { reuse: 'no', reason: 'Too much checking' } } });
  const report = reportPilot(f.read()); assert.ok(!report.includes('<img')); assert.match(report, /&#124;/);
  assert.match(report, /依頼側の再利用意向: no/);
});
test('CLI init, measure, capture and report run without model or network calls', t => {
  const f = fixture(t);
  const run = (args, input) => spawnSync(process.execPath, [cli, ...args], { input, encoding: 'utf8' });
  assert.equal(run(['init', f.root, 'cli-trial', 'self']).status, 0);
  assert.equal(run(['measure', f.root, 'cli-trial'], JSON.stringify({ title: 'CLI trial' })).status, 0);
  assert.equal(run(['capture', f.root, 'cli-trial']).status, 0);
  const result = run(['report', f.root, 'cli-trial', '--json']);
  assert.equal(result.status, 0, result.stderr); assert.equal(JSON.parse(result.stdout).captures, 1);
  const bad = run(['measure', f.root, 'cli-trial'], '{'); assert.equal(bad.status, 1);
  assert.equal(readPilot(f.root, 'cli-trial').title, 'CLI trial');
});
function legacy(f) {
  const p = f.read(); p.format = 'iap-pilot/0.1';
  for (const group of ['metrics', 'baseline']) for (const key of Object.keys(SHARING_METRICS)) delete p[group][key];
  const bytes = JSON.stringify(p, null, 4) + '\n';
  fs.writeFileSync(path.join(f.root, '.iap/pilots/trial.json'), bytes);
  return { p, bytes };
}
test('legacy records are readable without mutation and migration retains original bytes and values', t => {
  const f = fixture(t, 'paired');
  f.update({ title: 'Existing case', metrics: { workerReviewMinutes: { value: 2.5, source: 'timer' } },
    feedback: { requester: { reuse: 'no', reason: 'Needs fewer steps' } } });
  capturePilot(f.root, 'trial');
  const { p, bytes } = legacy(f);
  assert.equal(summarizePilot(f.read()).rows.length, 11);
  assert.match(reportPilot(f.read()), /旧形式の11指標/);
  assert.equal(fs.readFileSync(path.join(f.root, '.iap/pilots/trial.json'), 'utf8'), bytes);
  const migrated = migratePilot(f.root, 'trial');
  assert.equal(migrated.migrated, true);
  assert.equal(fs.readFileSync(path.join(f.root, migrated.backup), 'utf8'), bytes);
  assert.deepEqual(f.read().captures, p.captures); assert.deepEqual(f.read().feedback, p.feedback);
  assert.equal(f.read().createdAt, p.createdAt); assert.equal(f.read().title, p.title);
  for (const group of ['metrics', 'baseline']) {
    for (const [key, value] of Object.entries(p[group])) assert.deepEqual(f.read()[group][key], value);
    for (const key of Object.keys(SHARING_METRICS)) assert.deepEqual(f.read()[group][key], { value: null, source: null });
  }
  assert.equal(migratePilot(f.root, 'trial').migrated, false);
  assert.equal(fs.readdirSync(path.join(f.root, '.iap/pilots/backups')).length, 1);
});
test('legacy metrics can be updated but new fields require migration', t => {
  const f = fixture(t), { bytes } = legacy(f);
  assert.throws(() => f.update({ metrics: { shareEditMinutes: { value: 1, source: 'timer' } } }), /invalid_metric_keys/);
  assert.equal(fs.readFileSync(path.join(f.root, '.iap/pilots/trial.json'), 'utf8'), bytes);
  f.update({ title: 'Updated legacy case' });
  assert.equal(f.read().format, 'iap-pilot/0.1'); assert.equal(f.read().title, 'Updated legacy case');
});
test('a failed migration backup leaves the old record untouched', t => {
  const f = fixture(t), { bytes } = legacy(f);
  fs.writeFileSync(path.join(f.root, '.iap/pilots/backups'), 'not a directory');
  assert.throws(() => migratePilot(f.root, 'trial'));
  assert.equal(fs.readFileSync(path.join(f.root, '.iap/pilots/trial.json'), 'utf8'), bytes);
});
test('sharing metrics separate active work, elapsed time and unanswered judgments', t => {
  const f = fixture(t, 'paired');
  f.update({ metrics: { shareGenerationSeconds: { value: 0.1, source: 'command timer' },
    shareEditMinutes: { value: 0, source: 'No edits in the observed sharing step' },
    shareDeliveryMinutes: { value: 0.25, source: 'Active copy/send operation, synthetic test' },
    requesterShareReviewMinutes: { value: 2, source: 'PM reported reading time, synthetic test' },
    decisionWaitMinutes: { value: null, source: 'No reply yet' } } });
  const s = summarizePilot(f.read()); assert.equal(s.measuredCount, 4);
  assert.equal(s.rows.find(r => r.key === 'decisionWaitMinutes').value, null);
  assert.equal(s.rows.find(r => r.key === 'shareGenerationSeconds').unit, '秒');
  assert.match(reportPilot(f.read()), /内数。二重に足さない/);
  assert.match(reportPilot(f.read()), /PMの判断待ちは判断を依頼してから回答までの経過時間/);
});
test('sharing values require evidence and self trials cannot invent PM participation', t => {
  const f = fixture(t);
  for (const key of Object.keys(SHARING_METRICS))
    assert.throws(() => f.update({ metrics: { [key]: { value: 0, source: null } } }));
  for (const key of ['requesterShareReviewMinutes', 'decisionWaitMinutes'])
    assert.throws(() => f.update({ metrics: { [key]: { value: 1, source: 'imagined' } } }), /self_trial/);
  const paired = fixture(t, 'paired');
  for (const value of [-1, Infinity, NaN, '2'])
    assert.throws(() => paired.update({ metrics: { shareEditMinutes: { value, source: 'test' } } }));
});
test('migration CLI preserves legacy data before new measurements', t => {
  const f = fixture(t, 'paired'); legacy(f);
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
  const migrated = run('migrate', f.root, 'trial'); assert.equal(migrated.status, 0, migrated.stderr);
  assert.equal(JSON.parse(migrated.stdout).migrated, true);
  const report = run('report', f.root, 'trial', '--json');
  assert.equal(JSON.parse(report.stdout).unknownCount, 16);
});
test('measured sharing records generation only, leaving human effort and external delivery unknown', t => {
  const f = fixture(t, 'paired');
  const markdown = sharePilot(f.root, 'trial'), p = f.read();
  assert.match(markdown, /^# 進捗共有/); assert.match(markdown, /最新成果は未評価/);
  assert.ok(Number.isFinite(p.metrics.shareGenerationSeconds.value));
  assert.ok(p.metrics.shareGenerationSeconds.value >= 0);
  assert.match(p.metrics.shareGenerationSeconds.source, /観測 [a-f0-9]{64}/);
  for (const key of ['shareEditMinutes', 'shareDeliveryMinutes', 'requesterShareReviewMinutes', 'decisionWaitMinutes'])
    assert.equal(p.metrics[key].value, null);
  assert.match(markdown, /外部送信は行っていません/);
});
test('measured sharing does not write legacy records or record failed observations as a timing', t => {
  const f = fixture(t), { bytes } = legacy(f);
  assert.throws(() => sharePilot(f.root, 'trial'), /migrate_pilot/);
  assert.equal(fs.readFileSync(path.join(f.root, '.iap/pilots/trial.json'), 'utf8'), bytes);
  migratePilot(f.root, 'trial'); const before = f.read();
  fs.unlinkSync(path.join(f.root, '.iap/contract.json'));
  assert.throws(() => sharePilot(f.root, 'trial'));
  assert.deepEqual(f.read(), before);
});
test('measured sharing CLI prints copyable summary and persists its local generation time', t => {
  const f = fixture(t);
  const result = spawnSync(process.execPath, [cli, 'share', f.root, 'trial'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, /^# 進捗共有\n/);
  assert.equal(summarizePilot(f.read()).measuredCount, 1);
});
