const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));
let fixedDummyCount = 0;
let fixedNullSafeCount = 0;

// 패턴 1: 정상 로직 뒤에 잘못 붙어있는 더미 코드 제거
// 예: .textContent=items[Math.floor(Math.random()*items.length)];
const dummyTailPattern = /;\s*\.textContent\s*=\s*items\[Math\.floor\(Math\.random\(\)\*items\.length\)\]\s*;?\s*\}\s*<\/script>/g;

// 패턴 2: Null-safe 변환
const nullSafePattern = /document\.getElementById\((['"][^'"]+['"])\)\.(textContent|innerHTML)\s*=/g;

files.forEach(file => {
  const filePath = path.join(DIR, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // 1. 더미 꼬리 제거
  if (dummyTailPattern.test(content)) {
    content = content.replace(dummyTailPattern, '};</script>');
    fixedDummyCount++;
    modified = true;
  }

  // 2. Null-safe 적용
  if (nullSafePattern.test(content)) {
    content = content.replace(nullSafePattern, (match, id, prop) => {
      return `(document.getElementById(${id}) || {}).${prop} =`;
    });
    fixedNullSafeCount++;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
  }
});

console.log(`[Result]`);
console.log(`- Removed dummy tail patterns: ${fixedDummyCount} files`);
console.log(`- Applied null-safe checks: ${fixedNullSafeCount} files`);
