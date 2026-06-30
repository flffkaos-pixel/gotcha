const fs = require('fs');
const R = JSON.parse(fs.readFileSync(String.raw`C:\Users\중진공39\utilities_work\runtime_results.json`,'utf-8'));
const broken = R.filter(s => (s.errors && s.errors.length));
const out = broken.map(b => {
  const errs = b.errors.map(e => e.split('\n')[0].replace(/\s+/g,' ').slice(0, 200)).join(' || ');
  return b.file + '\t' + errs;
});
fs.writeFileSync(String.raw`C:\Users\중진공39\utilities_work\errors_only.txt`, out.join('\n'));
console.log('total with errors:', broken.length);
console.log(out.slice(0, 30).join('\n'));
