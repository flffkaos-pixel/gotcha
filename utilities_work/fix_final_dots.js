// fix_final_dots.js
const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));
let changed = 0;

for (const f of files) {
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;

  // 1. l.textContent = "앞면". (끝에 점) -> l.textContent = "앞면"
  // 2. l.textContent = result. (끝에 점) -> l.textContent = result
  // regex: .textContent\s*=\s*[^;}\n]*?\.\s*([;}\n])
  src = src.replace(/(\.textContent\s*=\s*[^;}\n]*?)\.\s*([;}\n])/g, '$1$2');

  if (src !== before) {
    fs.writeFileSync(p, src, 'utf-8');
    changed++;
  }
}
console.log(`Removed trailing dots from ${changed} files.`);
