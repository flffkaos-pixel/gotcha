// final_syntax_cleanup.js
const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

// SyntaxError의 가장 큰 원인인 "잘못된 닫는 괄호" 또는 "Unexpected token"
// 특히 `.textContent = ...` 구문 끝에 점(`.`)이 찍혀있는 경우를 정교하게 잡음.
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));
let total = 0;

for (const f of files) {
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;

  // 1. .textContent = "값". (끝에 점 오타) -> .textContent = "값"
  src = src.replace(/(\.textContent\s*=\s*['"][^'"]*['"])\s*\.\s*([;}\n])/g, '$1$2');
  
  // 2. .textContent = 변수. (끝에 점 오타)
  src = src.replace(/(\.textContent\s*=\s*[a-zA-Z0-9_]+)\s*\.\s*([;}\n])/g, '$1$2');

  // 3. calc() 함수 내부의 try-catch 가드 재강화 (정규식 개선)
  // function calc(){ ... } -> function calc(){ try { ... } catch(e){...} }
  const calcRegex = /function\s+calc\s*\(\s*\)\s*\{([\s\S]*?)\n\s*\}/g;
  src = src.replace(calcRegex, (match, body) => {
    if (body.trim().startsWith('try {')) return match;
    return `function calc() {\n  try {\n${body}\n  } catch (e) {\n    console.error("calc error in ${f}:", e);\n  }\n}`;
  });

  if (src !== before) {
    fs.writeFileSync(p, src, 'utf-8');
    total++;
  }
}
console.log(`Surgically cleaned ${total} files.`);
