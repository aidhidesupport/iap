import fs from 'node:fs';
const rows = fs.readFileSync(process.argv[2], 'utf8').trimEnd().split(/\r?\n/).slice(1);
let total = 0;
for (const [index, raw] of rows.entries()) {
  const value = raw.trim();
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
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
