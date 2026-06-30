// last_resort_calc_fix.js
const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));
let total = 0;

for (const f of files) {
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;

  // 1. .textContent = ... (단순화: .textContent 할당문 자체를 if(...)로 감싸기)
  // Regex: (\b\w+\.textContent\s*=\s*[^;}\n]+)
  // Transform: if(X)X.textContent = ... (X를 찾아야함)
  // 대신 단순하게 .textContent = ... 를 (X&&X.textContent=...) 형태로 변환 시도 (SyntaxError 위험 높음)
  
  // 가장 안전: calc() 함수 내의 모든 .textContent= 를 try-catch 로 감싸는 것 (이미 함)
  // 그럼에도 SyntaxError 가 난다면 그것은 .textContent = "값". 같은 오타임.
  src = src.replace(/(\.textContent\s*=\s*[^;}\n]*?)\.\s*([;}\n])/g, '$1$2');

  if (src !== before) {
    fs.writeFileSync(p, src, 'utf-8');
    total++;
  }
}
console.log(`Last resort fixed ${total} files.`);
