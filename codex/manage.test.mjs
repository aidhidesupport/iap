import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { install, doctor, uninstall } from './manage.mjs';

function fixture(t, name = 'project') {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'iap-install-'));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const root = path.join(base, name); fs.mkdirSync(root);
  const contract = { format: 'iap-codex-contract/0.1', revision: 1, purpose: 'Synthetic installation test',
    criteria: [{ id: 'C1', text: 'Value is 600' }], excluded: ['Login'], files: ['artifact.txt'], nextAction: 'Display value' };
  const contractFile = path.join(base, 'contract.json'); fs.writeFileSync(contractFile, JSON.stringify(contract));
  fs.writeFileSync(path.join(root, 'artifact.txt'), 'SYNTHETIC: 600');
  const read = file => fs.readFileSync(path.join(root, file), 'utf8');
  const write = (file, value) => { fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.writeFileSync(path.join(root, file), value); };
  const hooks = () => JSON.parse(read('.codex/hooks.json'));
  const run = (event, data = {}) => {
    const command = hooks().hooks[event][0].hooks[0].command;
    const result = spawnSync('/bin/sh', ['-c', command], { cwd: base, input: JSON.stringify({ hook_event_name: event, session_id: 'synthetic', ...data }), encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr); return JSON.parse(result.stdout);
  };
  return { base, root, contractFile, contract, read, write, hooks, run };
}
test('installs all five events, instructions and ignored local state without requiring Git', t => {
  const f = fixture(t); const result = install(f.root, f.contractFile);
  assert.equal(result.installed, true); assert.equal(result.hookEvents.length, 5);
  assert.equal(doctor(f.root).configured, true);
  assert.equal(doctor(f.root).hookTrust, 'not_inspected');
  assert.ok(f.read('.gitignore').includes('/.iap/'));
  assert.ok(!f.read('AGENTS.md').includes(f.root));
  assert.match(f.read('.iap/LICENSE'), /Apache License/);
  assert.match(f.read('.iap/NOTICE'), /aidhidesupport/);
  for (const event of ['Stop', 'Interrupt'])
    assert.equal(f.hooks().hooks[event][0].hooks[0].additionalContextLimit, undefined);
  for (const event of ['SessionStart', 'UserPromptSubmit', 'PostToolUse'])
    assert.equal(f.hooks().hooks[event][0].hooks[0].additionalContextLimit, 4000);
});
test('uninstall previews without mutation and removes only its hooks and instructions, preserving records', t => {
  const f = fixture(t);
  const other = { hooks: [{ type: 'command', command: 'echo {}' }] };
  f.write('.codex/hooks.json', JSON.stringify({ description: 'Keep', hooks: { Stop: [other] } }));
  f.write('AGENTS.md', '# Existing instructions\n');
  install(f.root, f.contractFile);
  f.write('AGENTS.md', f.read('AGENTS.md') + '\nAfter install: keep this too.\n');
  f.write('.iap/pilots/mine.json', '{"private":true}');
  const before = f.read('.codex/hooks.json');
  const dry = uninstall(f.root);
  assert.equal(dry.dryRun, true); assert.equal(dry.uninstalled, false);
  assert.equal(f.read('.codex/hooks.json'), before);
  assert.equal(doctor(f.root).configured, true);
  const applied = uninstall(f.root, true);
  assert.equal(applied.uninstalled, true);
  assert.deepEqual(f.hooks(), { description: 'Keep', hooks: { Stop: [other] } });
  assert.match(f.read('AGENTS.md'), /Existing instructions/);
  assert.match(f.read('AGENTS.md'), /After install: keep/);
  assert.ok(!f.read('AGENTS.md').includes('IAP CODEX BEGIN'));
  assert.equal(f.read('.iap/pilots/mine.json'), '{"private":true}');
  assert.match(f.read('.iap/LICENSE'), /Apache License/);
  assert.ok(f.read('.gitignore').includes('/.iap/'));
  assert.equal(fs.existsSync(path.join(f.root, '.iap/checkpoint.mjs')), false);
  assert.equal(JSON.parse(f.read(applied.backup))['.codex/hooks.json'], before);
  assert.equal(install(f.root).installed, true);
  assert.equal(doctor(f.root).configured, true);
});
for (const [file, replace, error] of [
  ['.iap/checkpoint.mjs', text => text + '\n// local edit\n', /locally_modified_helper/],
  ['AGENTS.md', text => text.replace('目的と成果', 'Custom instructions'), /locally_modified_agent_instructions/],
  ['.codex/hooks.json', text => { const c = JSON.parse(text); c.hooks.Stop[0].hooks[0].timeout = 99; return JSON.stringify(c); }, /modified_or_missing_installed_hook/]
]) test(`uninstall refuses modified ${file} before changing any owned file`, t => {
  const f = fixture(t); install(f.root, f.contractFile);
  f.write(file, replace(f.read(file)));
  const names = ['.iap/checkpoint.mjs', '.codex/hooks.json', 'AGENTS.md', '.iap/installation.json'];
  const before = names.map(f.read);
  assert.throws(() => uninstall(f.root, true), error);
  assert.deepEqual(names.map(f.read), before);
});
test('uninstall rejects symlink destinations and leaves outside files unchanged', t => {
  const f = fixture(t); install(f.root, f.contractFile);
  const outside = path.join(f.base, 'outside'); fs.writeFileSync(outside, f.read('AGENTS.md'));
  fs.unlinkSync(path.join(f.root, 'AGENTS.md')); fs.symlinkSync(outside, path.join(f.root, 'AGENTS.md'));
  const before = f.read('.codex/hooks.json');
  assert.throws(() => uninstall(f.root, true), /symlink_target/);
  assert.equal(f.read('.codex/hooks.json'), before);
  assert.match(fs.readFileSync(outside, 'utf8'), /IAP CODEX BEGIN/);
});
test('conflicting license notice stops installation before configuration changes', t => {
  const f = fixture(t); f.write('.iap/LICENSE', 'Other project license');
  assert.throws(() => install(f.root, f.contractFile), /conflicting_license_notice/);
  assert.equal(fs.existsSync(path.join(f.root, '.codex')), false);
});
test('installer preserves existing hooks, instructions and gitignore and is idempotent', t => {
  const f = fixture(t);
  const other = { matcher: 'Bash', hooks: [{ type: 'command', command: 'echo {}' }] };
  f.write('.codex/hooks.json', JSON.stringify({ description: 'Existing settings', hooks: { PostToolUse: [other] } }));
  f.write('AGENTS.md', '# Existing instructions\nKeep this text.\n'); f.write('.gitignore', 'node_modules/\n');
  install(f.root, f.contractFile);
  assert.deepEqual(f.hooks().hooks.PostToolUse[0], other);
  assert.ok(f.read('AGENTS.md').startsWith('# Existing instructions\nKeep this text.\n'));
  assert.ok(f.read('.gitignore').startsWith('node_modules/\n'));
  assert.equal(f.hooks().description, 'Existing settings');
  assert.deepEqual(install(f.root, f.contractFile).changedFiles, []);
  assert.equal(f.hooks().hooks.PostToolUse.length, 2);
});
test('invalid existing hook configuration causes no partial installation', t => {
  const f = fixture(t); f.write('.codex/hooks.json', '{"hooks":{"Stop":false}}');
  assert.throws(() => install(f.root, f.contractFile), /invalid_existing_hook_groups/);
  assert.equal(fs.existsSync(path.join(f.root, '.iap')), false);
  assert.equal(fs.existsSync(path.join(f.root, 'AGENTS.md')), false);
});
test('installer rejects symlink destinations before writing', t => {
  const f = fixture(t); fs.mkdirSync(path.join(f.base, 'elsewhere'));
  fs.symlinkSync(path.join(f.base, 'elsewhere'), path.join(f.root, '.codex'));
  assert.throws(() => install(f.root, f.contractFile), /symlink_target/);
  assert.equal(fs.existsSync(path.join(f.root, '.iap')), false);
  assert.deepEqual(fs.readdirSync(path.join(f.base, 'elsewhere')), []);
});
test('locally modified helper is not overwritten', t => {
  const f = fixture(t); install(f.root, f.contractFile);
  f.write('.iap/checkpoint.mjs', 'Local customization');
  const hooks = f.read('.codex/hooks.json');
  assert.throws(() => install(f.root), /locally_modified_helper/);
  assert.equal(f.read('.iap/checkpoint.mjs'), 'Local customization');
  assert.equal(f.read('.codex/hooks.json'), hooks); assert.equal(doctor(f.root).configured, false);
});
test('locally modified IAP instructions are not overwritten', t => {
  const f = fixture(t); install(f.root, f.contractFile);
  f.write('AGENTS.md', f.read('AGENTS.md').replace('目的と成果', '別のルール'));
  assert.throws(() => install(f.root), /locally_modified_agent_instructions/);
});
test('changed installed hooks cause a clear conflict, not duplicate hooks', t => {
  const f = fixture(t); install(f.root, f.contractFile); const config = f.hooks();
  config.hooks.Stop[0].hooks[0].timeout = 2; f.write('.codex/hooks.json', JSON.stringify(config));
  assert.throws(() => install(f.root), /modified_or_missing_installed_hook/);
  assert.equal(f.hooks().hooks.Stop.length, 1);
});
test('existing contract is preserved and a replacement requires an explicit separate update', t => {
  const f = fixture(t); install(f.root, f.contractFile);
  fs.writeFileSync(f.contractFile, JSON.stringify({ ...f.contract, purpose: 'Another job' }));
  assert.throws(() => install(f.root, f.contractFile), /existing_contract_preserved/);
  assert.equal(JSON.parse(f.read('.iap/contract.json')).purpose, f.contract.purpose);
});
test('hook command survives spaces, apostrophes and shell metacharacters in the project path', t => {
  const f = fixture(t, "project ' $(touch SHOULD_NOT_EXIST)"); install(f.root, f.contractFile);
  assert.ok(f.run('SessionStart').hookSpecificOutput.additionalContext.includes(f.contract.purpose));
  assert.equal(fs.existsSync(path.join(f.base, 'SHOULD_NOT_EXIST')), false);
});
test('installed command chain supports start, change, assessment, stop and interruption', t => {
  const f = fixture(t); install(f.root, f.contractFile);
  assert.ok(f.run('SessionStart', { source: 'startup' }).hookSpecificOutput);
  assert.ok(f.run('UserPromptSubmit', { prompt: 'Continue synthetic work' }).hookSpecificOutput);
  assert.ok(f.run('PostToolUse', { tool_name: 'apply_patch' }).hookSpecificOutput);
  assert.equal(f.run('Stop').decision, 'block');
  const script = path.join(f.root, '.iap/checkpoint.mjs');
  const invoke = (command, input) => spawnSync(process.execPath, [script, command, f.root], { input, encoding: 'utf8' });
  const review = JSON.parse(invoke('template').stdout);
  review.disposition = 'ready'; review.checks[0] = { id: 'C1', result: 'met', reason: 'Synthetic fixture value', evidence: [{ file: 'artifact.txt', quote: '600' }] };
  review.scope = { result: 'within', reason: 'Only fixture output', evidence: [{ file: 'artifact.txt', quote: 'SYNTHETIC: 600' }] };
  assert.equal(invoke('record', JSON.stringify(review)).status, 0);
  assert.equal(f.run('Stop').decision, undefined);
  f.write('artifact.txt', 'Changed, incomplete');
  assert.ok(f.run('PostToolUse').hookSpecificOutput);
  assert.equal(f.run('Stop').decision, 'block');
  assert.equal(f.run('Stop', { stop_hook_active: true }).decision, undefined);
  assert.deepEqual(f.run('Interrupt'), {});
  assert.equal(JSON.parse(f.read('.iap/handoff.json')).assessmentCurrent, false);
  assert.equal(doctor(f.root).runtimeActivation, 'not_verified');
});
