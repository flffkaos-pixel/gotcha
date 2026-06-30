// final_last_chance.js
const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));
let total = 0;

for (const f of files) {
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;

  // 1. .textContent = ... . (마지막 점 오타 완전히 잡기)
  src = src.replace(/(\.textContent\s*=\s*[^;}\n]*?)\.([;}\n])/g, '$1$2');

  // 2. calc() 함수 try-catch
  const calcRegex = /function\s+calc\s*\(\s*\)\s*\{([\s\S]*?)\n\s*\}/g;
  src = src.replace(calcRegex, (match, body) => {
    if (body.trim().startsWith('try {')) return match;
    return `function calc() {\n  try {\n${body}\n  } catch (e) {\n    console.error("Calc Error in ${f}:", e);\n  }\n}`;
  });

  if (src !== before) {
    fs.writeFileSync(p, src, 'utf-8');
    total++;
  }
}
console.log(`Final last chance fixed ${total} files.`);
