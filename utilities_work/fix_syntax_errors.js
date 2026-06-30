const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const filesToFix = [
  'coin-flip.html',
  'dice-coin.html',
  'lotto-generator.html'
];

let changed = 0;

filesToFix.forEach(f => {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) return;
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;

  // 1.--- Unexpected token '.' 또는 '(' 등을 잡기 위해
  // script 내부에서 .textContent = ...; 같은 부분의 오타나 
  // 불필요한 마침표/괄호 제거 (휴리스틱)
  // 특히 coin-flip.html 같은 곳에서 calc() 함수 끝이나 시작 부분의 오타 확인
  
  // common issue: calc() function wrapper
  // 예: function calc(). { ... } -> function calc() { ... }
  src = src.replace(/function\s+calc\s*\(\)\s*\.\s*\{/g, 'function calc() {');
  src = src.replace(/function\s+calc\s*\(\)\s*\(\s*\{/g, 'function calc() {');

  // 2.--- a.html 등에서 발견된 .textContent = (null || {}).textContent
  // 이미 patch_null_safe 가 적용되었으나 한번 더 검증
  
  if (src !== before) {
    fs.writeFileSync(p, src, 'utf-8');
    changed++;
  }
});

console.log('Fixed syntax errors in: ' + changed + ' files');
