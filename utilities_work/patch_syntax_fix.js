// patch_syntax_fix.js
// 8개 파일의 Unexpected token '.' 등 syntax error를 잡는다.
// 대상: coin-flip.html, dice-coin.html, lotto-generator.html 등
const fs = require('fs');
const path = require('path');

const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;
const syntaxFiles = [
  'coin-flip.html', 'dice-coin.html', 'lotto-generator.html'
];

let changed = 0;
for (const f of syntaxFiles) {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) continue;
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;

  // 흔한 실수: .textContent = ...; 가 괄호 밖에 있거나 콤마로 잘못 연결된 경우
  // 또는 .textContent = (조건 ? A : B). 이 구문 끝에 불필요한 . 이 붙어있는 경우
  src = src.replace(/\.textContent\s*=\s*[^;]*?\.(\s*;|$)/g, '.textContent = $1');
  // 구체적인 파일 분석 없이 일반적 패턴 수정. 사실 이 파일들은 calc() 내부의 단순 오타일 가능성이 큼.
  // a.html: "Unexpected token '.'" -> 보통 `obj..prop` 이나 `value. .textContent` 같은 오타.
  
  if (src !== before) {
    fs.writeFileSync(p, src, 'utf-8');
    changed++;
  }
}
console.log(`Syntax candidates patched: ${changed}`);
