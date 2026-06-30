// patch_onclick_safe.js
// document.getElementById('X').onclick = ... 형태의 모든 호출을 safe하게 변환
const fs = require('fs');
const path = require('path');

const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`; // corrected path in logic

const targetDir = String.raw`C:\Users\중진공39\utilities_work\utilities`;

let changed = 0;
const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.html'));

for (const f of files) {
  const p = path.join(targetDir, f);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;

  // Pattern: .onclick = function... or .onclick = () => ...
  // Target: (document.getElementById('X') && (document.getElementById('X').onclick = ...))
  // This is a bit risky for complex lines, so we use a safer if-guard wrap if possible, 
  // but for one-liners, the conditional is easiest.
  
  // We target: getElementById("...").onclick = 
  src = src.replace(/(\bdocument\.getElementById\(['"].*?['"]\)\.onclick\s*=)/g, (m) => {
    return `((${m.match(/document\.getElementById\(['"].*?['"]\)/)[0]} && ${m})`;
    // This is not quite right. Let's use a cleaner regex replace.
  });
}
