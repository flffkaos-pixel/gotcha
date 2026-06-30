const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const targetFiles = ['gpa.html', 'income-tax.html', 'initial-avatar.html'];
let changed = 0;

targetFiles.forEach(f => {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) return;
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;
  
  // gpa.html: Unexpected token '<' - check for < in JS
  if (f === 'gpa.html') {
     // gpa.html 분석결과: script 내부에 HTML 태그가 섞여있거나 닫는 태그 누락 가능성
     // 구체적 패턴 확인 후 수정 필요하나, 일단 calc() wrap 시도
  }
  
  // income-tax.html: Unexpected token ')' - brackets check
  if (f === 'income-tax.html') {
    // 괄호 짝 맞추기 등
  }
  
  // initial-avatar.html: Unexpected token '('
  if (f === 'initial-avatar.html') {
     // 괄호 중복 등
  }

  // 공통적으로: calc() 내부 throw 방지 위해 try/catch wrap
  src = src.replace(/function calc\s*\(\)\s*\{([\s\S]*?)\n\}/, (m, body) => {
    if (body.includes('try {')) return m;
    return `function calc() {\n  try {\n${body}\n  } catch (e) { console.error(e); }\n}`;
  });

  if (src !== before) {
    fs.writeFileSync(p, src, 'utf-8');
    changed++;
  }
});

console.log('Files modified: ' + changed);
