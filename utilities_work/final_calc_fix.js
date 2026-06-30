// final_calc_fix.js
const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const filesToFix = ['coin-flip.html', 'lotto-generator.html', 'dice-coin.html'];

filesToFix.forEach(f => {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) return;
  let src = fs.readFileSync(p, 'utf-8');
  
  // 1. .textContent = ... . (끝에 점 오타)
  src = src.replace(/(\.textContent\s*=\s*[^;]+)\.\s*([;}\n])/g, '$1$2');
  
  // 2. calc() 내부의 구체적 오타 수정
  // coin-flip.html: result.textContent = "앞면". -> result.textContent = "앞면"
  src = src.replace(/\.textContent\s*=\s*["'].*?["']\s*\./g, (m) => m.slice(0, -1));

  fs.writeFileSync(p, src, 'utf-8');
});
console.log('Surgically fixed syntax in calc functions.');
