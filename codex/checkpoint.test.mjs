import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { observe, verifyAssessment, runHook, assessmentTemplate, status, handoff, shareSummary, shareMarkdown } from './checkpoint.mjs';

const cli = fileURLToPath(new URL('./checkpoint.mjs', import.meta.url));
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'iap-checkpoint-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, '.iap'));
  const contract = { format: 'iap-codex-contract/0.1', revision: 1,
    purpose: 'Synthetic fixture: display the sum.', nextAction: 'Display the sum.',
    criteria: [{ id: 'C1', text: 'Display 600.' }, { id: 'C2', text: 'Reject invalid row.' }],
    excluded: ['Login'], files: ['artifact.txt'] };
  const write = (file, value) => fs.writeFileSync(path.join(root, file), value);
  write('.iap/contract.json', JSON.stringify(contract));
  write('artifact.txt', 'SYNTHETIC FIXTURE ONLY\nSum: 600\nInvalid row: 3\n');
  const snapshot = () => observe(root, contract);
  const review = () => ({ format: 'iap-codex-assessment/0.1', observationId: snapshot().observationId,
    revision: 1, disposition: 'ready', nextAction: 'Submit the synthetic result.',
    checks: [
      { id: 'C1', result: 'met', reason: 'Synthetic sum line.', evidence: [{ file: 'artifact.txt', quote: 'Sum: 600' }] },
      { id: 'C2', result: 'met', reason: 'Synthetic error line.', evidence: [{ file: 'artifact.txt', quote: 'Invalid row: 3' }] }
    ], scope: { result: 'within', reason: 'Synthetic output concerns only the sum and invalid input.',
      evidence: [{ file: 'artifact.txt', quote: 'Sum: 600\nInvalid row: 3' }] } });
  const save = r => write('.iap/assessment.json', JSON.stringify(r));
  return { root, contract, write, snapshot, review, save };
}

test('observation reads only explicitly listed files and remains stable', t => {
  const f = fixture(t);
  f.write('private.txt', 'UNRELATED PRIVATE VALUE');
  const a = f.snapshot();
  f.write('private.txt', 'CHANGED PRIVATE VALUE');
  assert.equal(a.observationId, f.snapshot().observationId);
  assert.deepEqual(a.files.map(x => x.path), ['artifact.txt']);
  assert.ok(!JSON.stringify(a).includes('PRIVATE VALUE'));
});
test('changed artifact invalidates a previous assessment', t => {
  const f = fixture(t); const r = f.review(); f.write('artifact.txt', 'Changed');
  const v = verifyAssessment(f.snapshot(), r);
  assert.equal(v.ready, false); assert.ok(v.problems.includes('stale_observation_or_contract'));
});
test('purpose changes invalidate an assessment even if revision was not increased', t => {
  const f = fixture(t); const r = f.review(); f.contract.purpose = 'Different purpose';
  assert.ok(verifyAssessment(f.snapshot(), r).problems.includes('stale_observation_or_contract'));
});
test('missing source is unobserved and cannot be ready', t => {
  const f = fixture(t); const r = f.review(); fs.unlinkSync(path.join(f.root, 'artifact.txt'));
  const o = f.snapshot(); r.observationId = o.observationId;
  assert.equal(o.files[0].error, 'missing');
  assert.ok(verifyAssessment(o, r).problems.includes('ready_with_unknown_or_unmet'));
});
test('oversize and non-UTF8 artifacts are unobserved', t => {
  const f = fixture(t); f.write('artifact.txt', 'x'.repeat(64_001));
  assert.equal(f.snapshot().files[0].status, 'unobserved');
  f.write('artifact.txt', Buffer.from([0xff, 0xfe]));
  assert.equal(f.snapshot().files[0].status, 'unobserved');
});
test('symlink files and directory components are not observed', t => {
  const f = fixture(t); f.write('other.txt', 'do not follow');
  fs.unlinkSync(path.join(f.root, 'artifact.txt'));
  fs.symlinkSync('other.txt', path.join(f.root, 'artifact.txt'));
  assert.equal(f.snapshot().files[0].status, 'unobserved');
  fs.mkdirSync(path.join(f.root, 'real'));
  f.write('real/value.txt', 'do not follow directory');
  fs.symlinkSync('real', path.join(f.root, 'alias'));
  f.contract.files = ['alias/value.txt'];
  assert.equal(f.snapshot().files[0].status, 'unobserved');
});
test('traversal, absolute, control and typical secret paths are rejected', t => {
  const f = fixture(t);
  for (const file of ['../secret', '/tmp/secret', 'a/../b', 'a\\b', '.git/config', '.iap/contract.json', '.env', 'a/.env.local', 'key.pem', 'key.key']) {
    f.contract.files = [file]; assert.throws(() => f.snapshot(), /unsafe_observation_path/, file);
  }
});
test('duplicate or absent completion criteria invalidate the contract', t => {
  const f = fixture(t); f.contract.criteria[1].id = 'C1';
  assert.throws(() => f.snapshot(), /invalid_contract/);
  f.contract.criteria = []; assert.throws(() => f.snapshot(), /invalid_contract/);
});
test('fresh assessment with exact fixture quotes passes structural validation', t => {
  const f = fixture(t);
  assert.deepEqual(verifyAssessment(f.snapshot(), f.review()), { valid: true, ready: true, problems: [] });
});
test('invented quote is rejected', t => {
  const f = fixture(t); const r = f.review(); r.checks[0].evidence[0].quote = 'All production tests passed';
  assert.ok(verifyAssessment(f.snapshot(), r).problems.includes('quote_not_in_observed_source'));
});
test('an unobserved source cannot be cited', t => {
  const f = fixture(t); const r = f.review(); f.write('other.txt', 'Sum: 600');
  r.checks[0].evidence[0].file = 'other.txt';
  assert.equal(verifyAssessment(f.snapshot(), r).valid, false);
});
test('met without evidence is rejected', t => {
  const f = fixture(t); const r = f.review(); r.checks[0].evidence = [];
  assert.ok(verifyAssessment(f.snapshot(), r).problems.includes('met_without_evidence'));
});
test('all completion criteria must appear once', t => {
  const f = fixture(t); const r = f.review(); r.checks.pop();
  assert.ok(verifyAssessment(f.snapshot(), r).problems.includes('incomplete_criteria'));
  const duplicate = f.review(); duplicate.checks[1] = duplicate.checks[0];
  assert.ok(verifyAssessment(f.snapshot(), duplicate).problems.includes('duplicate_criteria'));
});
test('unknown criterion blocks ready but permits needs_human', t => {
  const f = fixture(t); const r = f.review(); r.checks[0] = { id: 'C1', result: 'unknown', reason: 'Need execution.', evidence: [] };
  assert.equal(verifyAssessment(f.snapshot(), r).ready, false);
  r.disposition = 'needs_human';
  assert.deepEqual(verifyAssessment(f.snapshot(), r), { valid: true, ready: false, problems: [] });
});
test('scope outside or unknown prevents ready even with all criteria met', t => {
  const f = fixture(t); const r = f.review();
  for (const result of ['outside', 'unknown']) {
    r.scope.result = result;
    assert.ok(verifyAssessment(f.snapshot(), r).problems.includes('ready_with_unknown_or_unmet'));
  }
  r.disposition = 'revise'; assert.equal(verifyAssessment(f.snapshot(), r).valid, true);
});
test('missing scope and invented scope evidence are rejected', t => {
  const f = fixture(t); const r = f.review(); delete r.scope;
  assert.ok(verifyAssessment(f.snapshot(), r).problems.includes('invalid_scope_check'));
  const invented = f.review(); invented.scope.evidence[0].quote = 'No login code anywhere';
  assert.ok(verifyAssessment(f.snapshot(), invented).problems.includes('scope_quote_not_in_observed_source'));
});
test('structural verifier deliberately does not certify the meaning of real quotes', t => {
  const f = fixture(t); f.write('artifact.txt', 'Sum: 600 was NOT implemented. Invalid row: 3 was NOT implemented.');
  const r = f.review(); r.scope.evidence[0].quote = 'NOT implemented';
  // Actual quotes can be misinterpreted. A separate semantic review remains necessary.
  assert.equal(verifyAssessment(f.snapshot(), r).valid, true);
});
test('PostToolUse emits context once per observation, without full source content', t => {
  const f = fixture(t); const event = { hook_event_name: 'PostToolUse' };
  const first = runHook(f.root, event).hookSpecificOutput;
  assert.equal(first.hookEventName, 'PostToolUse');
  assert.ok(first.additionalContext.startsWith('IAP [PostToolUse]:'));
  assert.ok(first.additionalContext.includes(f.contract.purpose));
  assert.ok(!first.additionalContext.includes('SYNTHETIC FIXTURE ONLY'));
  assert.deepEqual(runHook(f.root, event), {});
  f.write('artifact.txt', 'Changed'); assert.ok(runHook(f.root, event).hookSpecificOutput);
});
test('a fresh valid review suppresses redundant PostToolUse prompts', t => {
  const f = fixture(t); f.save(f.review());
  assert.deepEqual(runHook(f.root, { hook_event_name: 'PostToolUse' }), {});
});
test('parallel tool completions emit one context per session and observation', async t => {
  const { spawn } = await import('node:child_process');
  const f = fixture(t);
  const code = `import { runHook } from ${JSON.stringify(new URL('./checkpoint.mjs', import.meta.url).href)};
    process.send('ready');
    process.once('message', () => {
      process.send(runHook(process.argv[1], { hook_event_name: 'PostToolUse', session_id: 'parallel' }));
      process.disconnect();
    });`;
  const workers = Array.from({ length: 12 }, () => spawn(process.execPath,
    ['--input-type=module', '-e', code, f.root], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] }));
  t.after(() => workers.forEach(child => { if (child.exitCode === null) child.kill(); }));
  await Promise.all(workers.map(child => new Promise((resolve, reject) => {
    child.once('message', resolve); child.once('error', reject);
  })));
  const results = workers.map(child => new Promise((resolve, reject) => {
    child.once('message', resolve); child.once('error', reject);
  }));
  const exits = workers.map(child => new Promise(resolve => child.once('close', resolve)));
  workers.forEach(child => child.send('go'));
  assert.equal((await Promise.all(results)).filter(r => r.hookSpecificOutput).length, 1);
  assert.ok((await Promise.all(exits)).every(code => code === 0));
  f.write('artifact.txt', 'New observed work');
  assert.ok(runHook(f.root, { hook_event_name: 'PostToolUse', session_id: 'parallel' }).hookSpecificOutput);
});
test('Stop requests one recheck, then permits the turn to end with a warning', t => {
  const f = fixture(t);
  assert.equal(runHook(f.root, { hook_event_name: 'Stop' }).decision, 'block');
  const second = runHook(f.root, { hook_event_name: 'Stop', stop_hook_active: true });
  assert.equal(second.decision, undefined); assert.ok(second.systemMessage);
});
test('Stop permits ready and needs_human without claiming semantic certification', t => {
  const f = fixture(t); const r = f.review(); f.save(r);
  assert.match(runHook(f.root, { hook_event_name: 'Stop' }).systemMessage, /未認証/);
  r.disposition = 'needs_human'; f.save(r);
  assert.match(runHook(f.root, { hook_event_name: 'Stop' }).systemMessage, /判断待ち/);
});
test('CLI verify distinguishes invalid from valid-but-unfinished assessments', t => {
  const f = fixture(t); const r = f.review(); r.disposition = 'revise'; f.save(r);
  const valid = spawnSync(process.execPath, [cli, 'verify', f.root], { encoding: 'utf8' });
  assert.equal(valid.status, 0); assert.equal(JSON.parse(valid.stdout).ready, false);
  f.write('artifact.txt', 'Changed');
  const stale = spawnSync(process.execPath, [cli, 'verify', f.root], { encoding: 'utf8' });
  assert.equal(stale.status, 1); assert.equal(JSON.parse(stale.stdout).valid, false);
});
test('CLI help works without a project and failed record explains the accepted scope values', t => {
  const f = fixture(t);
  const help = spawnSync(process.execPath, [cli, '--help', path.join(f.root, 'not-a-project')], { encoding: 'utf8' });
  assert.equal(help.status, 0);
  assert.deepEqual(JSON.parse(help.stdout).assessmentHelp.scope.result, ['within', 'outside', 'unknown']);
  const review = f.review(); review.scope.result = 'in_scope';
  const failed = spawnSync(process.execPath, [cli, 'record', f.root], { input: JSON.stringify(review), encoding: 'utf8' });
  assert.equal(failed.status, 1);
  assert.ok(JSON.parse(failed.stdout).problems.includes('invalid_scope_check'));
  assert.deepEqual(JSON.parse(failed.stdout).assessmentHelp.scope.result, ['within', 'outside', 'unknown']);
  assert.equal(fs.existsSync(path.join(f.root, '.iap/assessment.json')), false);
});
test('CLI hook accepts stdin event JSON and safely reports configuration failure', t => {
  const f = fixture(t);
  const call = () => spawnSync(process.execPath, [cli, 'hook', f.root], { input: JSON.stringify({ hook_event_name: 'Stop' }), encoding: 'utf8' });
  assert.equal(JSON.parse(call().stdout).decision, 'block');
  f.write('.iap/contract.json', 'not JSON');
  const failed = call(); assert.equal(failed.status, 0);
  assert.ok(JSON.parse(failed.stdout).systemMessage);
  assert.ok(!failed.stdout.includes(f.root)); assert.equal(failed.stderr, '');
});
test('symlink control directory fails visibly through the hook CLI', t => {
  const f = fixture(t);
  fs.renameSync(path.join(f.root, '.iap'), path.join(f.root, 'controls'));
  fs.symlinkSync('controls', path.join(f.root, '.iap'));
  const result = spawnSync(process.execPath, [cli, 'hook', f.root], { input: '{"hook_event_name":"Stop"}', encoding: 'utf8' });
  assert.ok(JSON.parse(result.stdout).systemMessage);
  assert.ok(!result.stdout.includes(f.root));
});

test('startup, resume and new prompts restore purpose without copying full artifact content', t => {
  const f = fixture(t); f.contract.request = 'Original synthetic request';
  f.write('.iap/contract.json', JSON.stringify(f.contract));
  for (const event of [{ hook_event_name: 'SessionStart', source: 'resume' }, { hook_event_name: 'UserPromptSubmit', prompt: 'Continue' }]) {
    const result = runHook(f.root, event).hookSpecificOutput;
    assert.equal(result.hookEventName, event.hook_event_name);
    assert.ok(result.additionalContext.includes(f.contract.request));
    assert.ok(!result.additionalContext.includes('SYNTHETIC FIXTURE ONLY'));
  }
});
test('PostToolUse deduplication does not suppress context in another session', t => {
  const f = fixture(t);
  assert.ok(runHook(f.root, { hook_event_name: 'PostToolUse', session_id: 'A' }).hookSpecificOutput);
  assert.deepEqual(runHook(f.root, { hook_event_name: 'PostToolUse', session_id: 'A' }), {});
  assert.ok(runHook(f.root, { hook_event_name: 'PostToolUse', session_id: 'B' }).hookSpecificOutput);
});
test('hook diagnostics associate an event with its runtime session and turn without copying input', t => {
  const f = fixture(t);
  runHook(f.root, { hook_event_name: 'UserPromptSubmit', session_id: 'session-A', turn_id: 'turn-B', prompt: 'PRIVATE PROMPT' });
  const receipt = status(f.root).lastHook;
  assert.equal(receipt.event, 'UserPromptSubmit');
  assert.equal(receipt.sessionId, 'session-A');
  assert.equal(receipt.turnId, 'turn-B');
  assert.ok(!JSON.stringify(receipt).includes('PRIVATE PROMPT'));
});
test('assessment template never asserts completion', t => {
  const f = fixture(t); const template = assessmentTemplate(f.snapshot());
  assert.equal(template.disposition, 'revise');
  assert.ok(template.checks.every(c => c.result === 'unknown'));
  assert.deepEqual(verifyAssessment(f.snapshot(), template), { valid: true, ready: false, problems: [] });
});
test('record saves valid assessments and refuses to overwrite one with stale or invented evidence', t => {
  const f = fixture(t); const r = f.review();
  const record = value => spawnSync(process.execPath, [cli, 'record', f.root], { input: JSON.stringify(value), encoding: 'utf8' });
  assert.equal(record(r).status, 0);
  const before = fs.readFileSync(path.join(f.root, '.iap/assessment.json'), 'utf8');
  const invented = structuredClone(r); invented.checks[0].evidence[0].quote = 'NOT REAL';
  assert.equal(record(invented).status, 1);
  f.write('artifact.txt', 'Changed'); assert.equal(record(r).status, 1);
  assert.equal(fs.readFileSync(path.join(f.root, '.iap/assessment.json'), 'utf8'), before);
});
test('record re-observes the contract after receiving input', async t => {
  const { spawn } = await import('node:child_process');
  const f = fixture(t); const r = f.review();
  const child = spawn(process.execPath, [cli, 'record', f.root], { stdio: ['pipe', 'pipe', 'pipe'] });
  let output = ''; child.stdout.on('data', data => { output += data; });
  // Even if initialization races with this edit, the final current contract must be used.
  f.contract.purpose = 'Changed while evaluation was being provided';
  f.write('.iap/contract.json', JSON.stringify(f.contract));
  child.stdin.end(JSON.stringify(r));
  const code = await new Promise(resolve => child.on('close', resolve));
  assert.equal(code, 1); assert.ok(JSON.parse(output).problems.includes('stale_observation_or_contract'));
});
test('pause suppresses hooks, resume re-enables them, and status does not invent trust', t => {
  const f = fixture(t);
  const call = command => spawnSync(process.execPath, [cli, command, f.root], { encoding: 'utf8' });
  assert.equal(call('pause').status, 0);
  for (const hook_event_name of ['SessionStart', 'UserPromptSubmit', 'PostToolUse', 'Stop', 'Interrupt'])
    assert.deepEqual(runHook(f.root, { hook_event_name }), {});
  assert.equal(status(f.root).paused, true);
  assert.equal(call('resume').status, 0);
  assert.ok(runHook(f.root, { hook_event_name: 'SessionStart' }).hookSpecificOutput);
  assert.equal(status(f.root).activation, 'not_verified_by_this_command');
});
test('Interrupt stores a handoff without blocking or restarting', t => {
  const f = fixture(t); const r = f.review(); r.disposition = 'revise'; r.nextAction = 'Fix one specific thing'; f.save(r);
  assert.deepEqual(runHook(f.root, { hook_event_name: 'Interrupt' }), {});
  const stored = JSON.parse(fs.readFileSync(path.join(f.root, '.iap/handoff.json')));
  assert.equal(stored.nextAction, r.nextAction); assert.ok(stored.interruptedAt);
  f.write('artifact.txt', 'Changed');
  const fresh = handoff(f.root);
  assert.equal(fresh.assessmentCurrent, false); assert.equal(fresh.nextAction, f.contract.nextAction);
  assert.ok(fresh.checks.every(c => c.result === 'unknown'));
});
test('malformed pause state produces a warning rather than silently enabling hooks', t => {
  const f = fixture(t); f.write('.iap/mode.json', '{"paused":"yes"}');
  const result = spawnSync(process.execPath, [cli, 'hook', f.root], { input: '{"hook_event_name":"Stop"}', encoding: 'utf8' });
  assert.ok(JSON.parse(result.stdout).systemMessage); assert.equal(result.status, 0);
});
test('record automatically generates a share draft without artifact bodies, quotes, paths or private reasons', t => {
  const f = fixture(t), r = f.review();
  r.checks[0].reason = 'PRIVATE INTERNAL NOTE';
  f.contract.request = 'PRIVATE RAW REQUEST'; f.write('.iap/contract.json', JSON.stringify(f.contract));
  r.observationId = f.snapshot().observationId;
  const saved = spawnSync(process.execPath, [cli, 'record', f.root], { input: JSON.stringify(r), encoding: 'utf8' });
  assert.equal(saved.status, 0, saved.stdout);
  assert.equal(JSON.parse(saved.stdout).shareDraft.updated, true);
  const draft = fs.readFileSync(path.join(f.root, '.iap/share-draft.md'), 'utf8');
  assert.match(draft, /達成 2\/2/); assert.match(draft, /PMの受け入れ判断/);
  for (const secret of ['PRIVATE INTERNAL NOTE', 'PRIVATE RAW REQUEST', 'SYNTHETIC FIXTURE ONLY', 'artifact.txt', f.root])
    assert.ok(!draft.includes(secret), secret);
});
test('sharing reobserves changed work and never repeats stale ready, next action or attention', t => {
  const f = fixture(t), r = f.review(); r.nextAction = 'OLD READY NEXT ACTION'; f.save(r);
  assert.equal(shareSummary(f.root).disposition, 'ready');
  f.write('artifact.txt', 'New unfinished work');
  const s = shareSummary(f.root);
  assert.equal(s.assessmentCurrent, false); assert.equal(s.disposition, 'unassessed');
  assert.deepEqual(s.counts, { met: 0, notMet: 0, unknown: 2, total: 2 });
  assert.ok(!JSON.stringify(s).includes('OLD READY NEXT ACTION'));
  assert.match(shareMarkdown(s), /最新成果は未評価/);
});
test('sharing shows missing artifacts and absent evaluations as unknown', t => {
  const f = fixture(t); fs.unlinkSync(path.join(f.root, 'artifact.txt'));
  const s = shareSummary(f.root); assert.equal(s.counts.unknown, 2); assert.equal(s.scope, 'unknown');
  assert.equal(s.disposition, 'unassessed');
});
test('revise stays on the development side while needs_human exposes an actual question', t => {
  const f = fixture(t), r = f.review(); r.disposition = 'revise'; r.scope.result = 'outside'; f.save(r);
  const draft = shareMarkdown(shareSummary(f.root));
  assert.match(draft, /開発者側で修正継続/); assert.match(draft, /依頼の範囲：対象外/);
  r.disposition = 'needs_human'; r.nextAction = 'PMに確認：認証を範囲へ追加しますか？'; f.save(r);
  assert.equal(shareSummary(f.root).attention, r.nextAction);
  assert.match(shareMarkdown(shareSummary(f.root)), /入力または判断が必要/);
});
test('a share draft failure does not undo a successfully saved assessment', t => {
  const f = fixture(t); fs.mkdirSync(path.join(f.root, '.iap/share-draft.md'));
  const saved = spawnSync(process.execPath, [cli, 'record', f.root], { input: JSON.stringify(f.review()), encoding: 'utf8' });
  assert.equal(saved.status, 0); assert.equal(JSON.parse(saved.stdout).shareDraft.updated, false);
  assert.equal(status(f.root).ready, true);
  const report = spawnSync(process.execPath, [cli, 'share', f.root], { encoding: 'utf8' });
  assert.equal(report.status, 0); assert.ok(report.stdout.startsWith('# 進捗共有\n'));
});
test('failed record preserves both the assessment and previous share draft', t => {
  const f = fixture(t), r = f.review();
  const call = value => spawnSync(process.execPath, [cli, 'record', f.root], { input: JSON.stringify(value), encoding: 'utf8' });
  assert.equal(call(r).status, 0);
  const before = fs.readFileSync(path.join(f.root, '.iap/share-draft.md'), 'utf8');
  r.checks[0].evidence[0].quote = 'INVENTED'; assert.equal(call(r).status, 1);
  assert.equal(fs.readFileSync(path.join(f.root, '.iap/share-draft.md'), 'utf8'), before);
});
test('share CLI returns copyable Markdown and JSON with bounded escaped text', t => {
  const f = fixture(t); f.contract.purpose = '<script>alert(1)</script> [link](https://example.invalid) ' + 'x'.repeat(800);
  f.write('.iap/contract.json', JSON.stringify(f.contract));
  const markdown = spawnSync(process.execPath, [cli, 'share', f.root], { encoding: 'utf8' });
  const data = spawnSync(process.execPath, [cli, 'share-json', f.root], { encoding: 'utf8' });
  assert.equal(markdown.status, 0); assert.equal(data.status, 0);
  assert.ok(!markdown.stdout.includes('<script>')); assert.ok(markdown.stdout.includes('\\[link\\]'));
  assert.ok(JSON.parse(data.stdout).purpose.length < 260);
  assert.match(markdown.stdout, /省略/);
});
test('coordination prompts keep routine corrections with the developer and separate PM changes', t => {
  const f = fixture(t);
  const context = runHook(f.root, { hook_event_name: 'UserPromptSubmit' }).hookSpecificOutput.additionalContext;
  assert.match(context, /開発者とPMは別人/); assert.match(context, /修正のたびにPM確認を求めない/);
  const stop = runHook(f.root, { hook_event_name: 'Stop' });
  assert.match(stop.reason, /方針修正・実装・テストまで進めて再照合/);
  assert.match(stop.reason, /目的・完成条件・範囲の変更/);
});
