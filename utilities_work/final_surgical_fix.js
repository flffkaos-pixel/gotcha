// final_surgical_fix.js
const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));
let total = 0;

for (const f of files) {
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;
  
  // 1. .textContent = ... . (끝에 점 찍힌 오타 - SyntaxError 원인)
  src = src.replace(/(\.textContent\s*=\s*[^;]+)\.\s*([;}\n])/g, '$1$2');
  
  // 2. calc 함수 전체를 try-catch로 감싸기 (최종 안전장치)
  // 정규식: function calc() { ... }
  const calcRegex = /(function\s+calc\s*\(\s*\)\s*\{)([\s\S]*?)\n\s*\}/g;
  src = src.replace(calcRegex, (match, p1, body) => {
      if (body.includes('try {')) return match;
      return `${p1}\ntry {\n${body}\n} catch(e) { console.error("Calc Error in ${f}:", e); }\n}`;
  });

  if (src !== before) {
    fs.writeFileSync(p, src, 'utf-8');
    total++;
  }
}
console.log(`Surgical fixed ${total} files.`);
