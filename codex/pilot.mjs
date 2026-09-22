import fs from 'node:fs';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { inspect, shareSummary, shareMarkdown } from './checkpoint.mjs';
import { json, readLocal, writeLocal } from './local-files.mjs';

const LEGACY_METRICS = {
  setupMinutes: ['導入時間', '分'], workerReviewMinutes: ['本人の確認・調整', '分'],
  requesterReviewMinutes: ['依頼側の確認・調整', '分'], operatorSupportMinutes: ['運営の支援', '分'],
  reworkMinutes: ['誤解による手戻り', '分'], falseAlertMinutes: ['誤指摘への対応', '分'],
  missedNotifications: ['入力・通知の見落とし', '回'], falseAlerts: ['誤った指摘', '回'],
  manualActions: ['本人の操作', '回'], evaluationElapsedSeconds: ['照合の経過時間', '秒'],
  stopRechecks: ['終了前の再確認', '回']
};
export const SHARING_METRICS = {
  shareGenerationSeconds: ['共有文の生成経過時間', '秒'],
  shareEditMinutes: ['開発者の共有文の手直し', '分'],
  shareDeliveryMinutes: ['開発者の共有操作', '分'],
  requesterShareReviewMinutes: ['PMの共有文の確認', '分'],
  decisionWaitMinutes: ['PMの判断待ち経過時間', '分']
};
export const METRICS = { ...LEGACY_METRICS, ...SHARING_METRICS };
const metricsFor = format => format === 'iap-pilot/0.1' ? LEGACY_METRICS : METRICS;
export const SHARING_NOTES = [
  '共有文の生成は再観測開始から要約の生成完了までの経過時間。プロセス起動・記録保存・画面描画・人の作業時間を含まない。',
  '共有文の手直しと共有操作は開発者が実際に作業した時間。手直しは本人の確認・調整時間に含まれ得る。共有操作は送信先での貼り付け・送信・結果確認など。',
  'PMの共有文の確認は依頼側の確認・調整時間の内数。二重に足さない。',
  'PMの判断待ちは判断を依頼してから回答までの経過時間。通常の進捗共有への返答待ちや、PMの実作業時間とは区別する。未回答ならnullのまま記録する。'
];
const recordPath = id => {
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(id)) throw new Error('invalid_pilot_id');
  return `.iap/pilots/${id}.json`;
};
const text = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 2000;
const exactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const emptyMetrics = (metrics = METRICS) => Object.fromEntries(Object.keys(metrics).map(key => [key, { value: null, source: null }]));
export function validatePilot(p) {
  recordPath(p?.id ?? '');
  if (!['iap-pilot/0.1', 'iap-pilot/0.2'].includes(p?.format) || !['self', 'paired', 'synthetic'].includes(p.kind) || !text(p.title) ||
      !Number.isFinite(Date.parse(p.createdAt)) || !Array.isArray(p.captures) || p.captures.length > 100)
    throw new Error('invalid_pilot');
  for (const group of ['metrics', 'baseline']) {
    if (!exactKeys(p[group], Object.keys(metricsFor(p.format)))) throw new Error('invalid_metric_keys');
    for (const [key, entry] of Object.entries(p[group])) {
      if (!exactKeys(entry, ['value', 'source']) ||
          (entry.source !== null && !text(entry.source)) ||
          (entry.value !== null && (!Number.isFinite(entry.value) || entry.value < 0 || !text(entry.source) ||
            (METRICS[key][1] === '回' && !Number.isSafeInteger(entry.value))))) throw new Error('invalid_measurement');
    }
  }
  if (!exactKeys(p.comparison, ['comparable', 'reason']) || typeof p.comparison.comparable !== 'boolean' ||
      (p.comparison.reason !== null && !text(p.comparison.reason)) ||
      (p.comparison.comparable && !text(p.comparison.reason))) throw new Error('invalid_comparison');
  if (!exactKeys(p.feedback, ['worker', 'requester'])) throw new Error('invalid_feedback');
  for (const f of Object.values(p.feedback)) if (!exactKeys(f, ['reuse', 'reason']) ||
      !['unknown', 'yes', 'no'].includes(f.reuse) || (f.reason !== null && !text(f.reason)) ||
      (f.reuse !== 'unknown' && !text(f.reason))) throw new Error('invalid_feedback');
  // A self trial has no separate requester's measured response.
  if (p.kind === 'self' && (['requesterReviewMinutes', 'requesterShareReviewMinutes', 'decisionWaitMinutes']
      .some(key => p.metrics[key]?.value != null) ||
      p.feedback.requester.reuse !== 'unknown')) throw new Error('self_trial_has_no_requester_response');
  for (const c of p.captures) {
    if (!exactKeys(c, ['at', 'observationId', 'contractHash', 'revision', 'observedFiles', 'unobservedFiles', 'valid', 'ready', 'disposition']) ||
        !Number.isFinite(Date.parse(c.at)) || !/^[a-f0-9]{64}$/.test(c.observationId) || !/^[a-f0-9]{64}$/.test(c.contractHash) ||
        !Number.isSafeInteger(c.revision) || c.revision < 1 ||
        ![c.observedFiles, c.unobservedFiles].every(n => Number.isSafeInteger(n) && n >= 0) ||
        typeof c.valid !== 'boolean' || typeof c.ready !== 'boolean' ||
        ![null, 'ready', 'revise', 'needs_human'].includes(c.disposition) ||
        (!c.valid && (c.ready || c.disposition !== null)) || (c.ready !== (c.disposition === 'ready')))
      throw new Error('invalid_pilot_capture');
  }
  return p;
}
export function readPilot(root, id) {
  const record = readLocal(root, recordPath(id));
  if (!record) throw new Error('pilot_not_found');
  const p = validatePilot(JSON.parse(record));
  if (p.id !== id) throw new Error('pilot_id_mismatch');
  return p;
}
export function initPilot(root, id, kind) {
  const p = validatePilot({ format: 'iap-pilot/0.2', id, kind, title: '案件未設定', createdAt: new Date().toISOString(),
    metrics: emptyMetrics(), baseline: emptyMetrics(), comparison: { comparable: false, reason: null },
    feedback: { worker: { reuse: 'unknown', reason: null }, requester: { reuse: 'unknown', reason: null } }, captures: [] });
  writeLocal(root, recordPath(id), json(p), { exclusive: true });
  return p;
}
function commit(root, old, next) {
  validatePilot(next);
  // Reject edits based on a stale record. The commands are intended for one local operator.
  if (json(readPilot(root, old.id)) !== json(old)) throw new Error('pilot_changed_during_update');
  writeLocal(root, recordPath(old.id), json(next));
  return next;
}
export function updatePilot(root, id, patch) {
  const old = readPilot(root, id);
  if (!patch || typeof patch !== 'object' || Array.isArray(patch) ||
      Object.keys(patch).some(key => !['title', 'metrics', 'baseline', 'comparison', 'feedback'].includes(key)))
    throw new Error('invalid_pilot_update');
  const next = structuredClone(old);
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'title') next.title = value;
    else {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid_pilot_update');
      next[key] = { ...next[key], ...value };
    }
  }
  return commit(root, old, next);
}
export function migratePilot(root, id) {
  const old = readPilot(root, id);
  if (old.format === 'iap-pilot/0.2') return { migrated: false, backup: null, pilot: old };
  const original = readLocal(root, recordPath(id));
  if (json(JSON.parse(original)) !== json(old)) throw new Error('pilot_changed_during_update');
  const next = { ...old, format: 'iap-pilot/0.2',
    metrics: { ...old.metrics, ...emptyMetrics(SHARING_METRICS) },
    baseline: { ...old.baseline, ...emptyMetrics(SHARING_METRICS) } };
  validatePilot(next);
  const backup = `.iap/pilots/backups/${id}-${crypto.randomUUID()}.json`;
  writeLocal(root, backup, original, { exclusive: true });
  return { migrated: true, backup, pilot: commit(root, old, next) };
}
export function sharePilot(root, id) {
  const old = readPilot(root, id);
  if (old.format !== 'iap-pilot/0.2') throw new Error('migrate_pilot_before_sharing_measurement');
  const began = performance.now();
  const summary = shareSummary(root);
  const markdown = shareMarkdown(summary);
  const seconds = (performance.now() - began) / 1000;
  commit(root, old, { ...old, metrics: { ...old.metrics, shareGenerationSeconds: { value: seconds,
    source: `shareの再観測・要約生成。${summary.generatedAt} / 版 ${summary.revision} / 観測 ${summary.observationId}` } } });
  return markdown;
}
export function capturePilot(root, id) {
  const old = readPilot(root, id);
  const { observation: o, verdict: v, assessment: a } = inspect(root);
  const capture = { at: o.observedAt, observationId: o.observationId, contractHash: o.contractHash, revision: o.revision,
    observedFiles: o.files.filter(f => f.status === 'observed').length,
    unobservedFiles: o.files.filter(f => f.status !== 'observed').length,
    valid: v.valid, ready: v.ready, disposition: v.valid ? a.disposition : null };
  return commit(root, old, { ...old, captures: [...old.captures, capture] });
}
export function summarizePilot(p) {
  validatePilot(p);
  const contractChanged = new Set(p.captures.map(c => c.contractHash)).size > 1;
  const rows = Object.entries(metricsFor(p.format)).map(([key, [label, unit]]) => {
    const value = p.metrics[key].value, baseline = p.baseline[key].value;
    const comparable = p.kind !== 'synthetic' && !contractChanged && p.comparison.comparable && value !== null && baseline !== null;
    return { key, label, unit, value, baseline, source: p.metrics[key].source, baselineSource: p.baseline[key].source,
      difference: comparable ? value - baseline : null,
      reductionPercent: comparable && baseline > 0 ? (baseline - value) / baseline * 100 : null };
  });
  return { format: p.format, id: p.id, kind: p.kind, title: p.title, rows,
    measuredCount: rows.filter(row => row.value !== null).length,
    unknownCount: rows.filter(row => row.value === null).length,
    captures: p.captures.length, lastCapture: p.captures.at(-1) ?? null,
    contractChanged,
    comparison: p.comparison, feedback: p.feedback,
    limitations: [...(p.format === 'iap-pilot/0.1' ? ['旧形式の11指標。共有の5指標を追加するにはmigrateを実行する。読むだけでは記録を書き換えない。'] : SHARING_NOTES),
      '未測定は0として集計しない。時間の項目は重複し得るため合算しない。',
      '経過時間は人の作業時間ではない。差分は因果効果や節約の証明ではない。',
      '評価のreadyは依頼側の検収ではない。captureは実行したフックの証明ではない。',
      p.kind === 'synthetic' ? '模擬試験。実利用の効果として扱わない。' :
        p.kind === 'self' ? '本人のみの試用。依頼側の負担と意向は未測定。' : '自己申告の記録。回答と実施内容の真正性は認証しない。'] };
}
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('|', '&#124;').replace(/[\r\n]+/g, ' ').replace(/([\\`*_[\]])/g, '\\$1');
const show = value => value === null ? '不明' : Number.isInteger(value) ? String(value) : value.toFixed(2);
export function reportPilot(p) {
  const s = summarizePilot(p);
  const lines = [`# 試用記録：${escape(s.title)}`, '',
    `ID: ${s.id} / 区分: ${{ self: '本人のみ', paired: '依頼側あり', synthetic: '模擬試験' }[s.kind]}`,
    `測定済み ${s.measuredCount}項目 / 未測定 ${s.unknownCount}項目 / 観測 ${s.captures}回`, '',
    '| 指標 | 今回 | 比較案件 | 差（今回−比較） | 根拠・未測定の理由 |', '|---|---:|---:|---:|---|',
    ...s.rows.map(r => `| ${r.label}（${r.unit}） | ${show(r.value)} | ${show(r.baseline)} | ${show(r.difference)} | 今回: ${escape(r.source ?? '未記入')} / 比較: ${escape(r.baselineSource ?? '未記入')} |`), '',
    `比較可能との申告: ${s.comparison.comparable ? 'あり' : 'なし'} / ${escape(s.comparison.reason ?? '未記入')}`,
    '比較差は、同程度の案件と確認できている項目だけ表示する。基準値が0の場合、削減率は算出しない。', '',
    `本人の再利用意向: ${s.feedback.worker.reuse} / ${escape(s.feedback.worker.reason ?? '未回答')}`,
    `依頼側の再利用意向: ${s.feedback.requester.reuse} / ${escape(s.feedback.requester.reason ?? '未回答')}`, '',
    s.lastCapture ? `最後に観測した時点の評価: ${s.lastCapture.valid ? s.lastCapture.disposition : '無効または未評価'} / ${s.lastCapture.at}（現在の状態は再観測が必要）` : '成果の観測: 未実施',
    s.contractChanged ? '試用中に目的・条件が変わっている。比較する前に変更内容を確認する。' : '観測間で記録された目的・条件の変更: なし（未観測の変更は不明）', '',
    ...s.limitations.map(line => '- ' + line), '',
    'この報告には成果本文・引用・依頼原文・絶対パスを自動で転記しない。手入力した題名・測定根拠・回答は含むため、共有前に確認する。', ''];
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  try {
    const [command, root = '.', id, option] = process.argv.slice(2);
    if (['--help', '-h', 'help'].includes(command) || !command) {
      console.log('Local pilot records (no network or model calls)\nnode pilot.mjs init PROJECT ID self|paired|synthetic\nnode pilot.mjs migrate PROJECT ID\nnode pilot.mjs capture PROJECT ID\nnode pilot.mjs share PROJECT ID\nnode pilot.mjs measure PROJECT ID < patch.json\nnode pilot.mjs report PROJECT ID [--json]\nMetrics: ' + Object.keys(METRICS).join(', ') +
        '\nEach metric is {"value": number|null, "source": "measurement evidence"|null}. Unknown stays null.');
    } else if (command === 'init') console.log(json(initPilot(root, id, option)));
    else if (command === 'migrate') console.log(json(migratePilot(root, id)));
    else if (command === 'share') process.stdout.write(sharePilot(root, id));
    else if (command === 'capture') console.log(json(capturePilot(root, id)));
    else if (command === 'measure') {
      const chunks = []; let bytes = 0;
      for await (const chunk of process.stdin) { bytes += chunk.length; if (bytes > 64_000) throw new Error('oversize_measurement'); chunks.push(chunk); }
      console.log(json(updatePilot(root, id, JSON.parse(Buffer.concat(chunks).toString('utf8')))));
    } else if (command === 'report') {
      if (option && option !== '--json') throw new Error('unknown_report_option');
      const p = readPilot(root, id);
      process.stdout.write(option === '--json' ? json(summarizePilot(p)) : reportPilot(p));
    } else throw new Error('unknown_pilot_command');
  } catch (error) {
    console.error(/^[a-z_]+$/.test(error.message) ? error.message : 'could_not_read_or_write_pilot');
    process.exitCode = 1;
  }
}
