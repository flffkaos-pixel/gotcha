const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const targetFiles = ['pii-masking.html'];
let changed = 0;

targetFiles.forEach(f => {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) return;
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;
  
  // TypeError: Cannot read properties of undefined (reading 'replace')
  // .replace() 호출 전 null check 추가
  // 패턴: (\w+)\.replace\(
  src = src.replace(/(\w+)\.replace\(/g, (m, varName) => {
    // 이미 if(varName) 으로 감싸져 있는지 확인은 어렵지만
    // (varName || "").replace(
    return `(${varName} || "").replace(`;
  });

  if (src !== before) {
    fs.writeFileSync(p, src, 'utf-8');
    changed++;
  }
});

console.log('Fixed pii-masking.html: ' + changed);
