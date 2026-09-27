import fs from 'node:fs';
const rows = fs.readFileSync(process.argv[2], 'utf8').trimEnd().split(/\r?\n/).slice(1);
const total = rows.reduce((sum, row) => sum + (Number(row) || 0), 0);
console.log('合計: ' + total + '円');
