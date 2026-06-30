// final_manual_calc_fix.js
const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const manual = {
  'coin-flip.html': {
    'document.getElementById("result").textContent = "앞면".': 'if(document.getElementById("result")) document.getElementById("result").textContent = "앞면";',
    'document.getElementById("result").textContent = "뒷면".': 'if(document.getElementById("result")) document.getElementById("result").textContent = "뒷면";'
  },
  'lotto-generator.html': {
    'document.getElementById("result").textContent = " ".': 'if(document.getElementById("result")) document.getElementById("result").textContent = " ";'
  },
  'dice-coin.html': {
    'document.getElementById("result").textContent = result.': 'if(document.getElementById("result")) document.getElementById("result").textContent = result;'
  }
};

let changed = 0;
for (const [f, fixes] of Object.entries(manual)) {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) continue;
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;
  for (const [old, nw] of Object.entries(fixes)) {
    src = src.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), nw);
  }
  if (src !== before) {
    fs.writeFileSync(p, src, 'utf-8');
    changed++;
  }
}
console.log(`Manually fixed ${changed} calc files.`);
