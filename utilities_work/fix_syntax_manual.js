// fix_syntax_manual.js
const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const manualFixes = {
  'coin-flip.html': [
    { old: 'document.getElementById("result").textContent = "앞면";', new: 'if(document.getElementById("result"))document.getElementById("result").textContent="앞면";' },
    { old: 'document.getElementById("result").textContent = "뒷면";', new: 'if(document.getElementById("result"))document.getElementById("result").textContent="뒷면";' }
  ],
  'lotto-generator.html': [
    { old: 'document.getElementById("result").textContent = " ";', new: 'if(document.getElementById("result"))document.getElementById("result").textContent=" ";' }
  ],
  'dice-coin.html': [
    { old: 'document.getElementById("result").textContent = result;', new: 'if(document.getElementById("result"))document.getElementById("result").textContent=result;' }
  ]
};

let totalChanged = 0;
for (const [file, fixes] of Object.entries(manualFixes)) {
  const p = path.join(DIR, file);
  if (!fs.existsSync(p)) continue;
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;
  fixes.forEach(fix => {
    src = src.replace(new RegExp(fix.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.new);
  });
  if (src !== before) {
    fs.writeFileSync(p, src, 'utf-8');
    totalChanged++;
  }
}
console.log(`Manually fixed ${totalChanged} files.`);
