// patch_pdf_final.js -- PDF 도구들의 onclick/onchange null 에러 해결
const fs = require('fs');
const path = require('path');

const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;
const pdfFiles = [
  'pdf-compress.html','pdf-merge.html','pdf-page-delete.html','pdf-page-extract.html',
  'pdf-page-numbers.html','pdf-rotate.html','pdf-split.html','pdf-to-images.html',
  'pdf-watermark.html','images-to-pdf.html'
];

let changed = 0;

for (const f of pdfFiles){
  const p = path.join(DIR, f);
  if(!fs.existsSync(p)) continue;
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;

  // 1. fileInput_local -> fileInput (이미 했지만 재확인)
  src = src.replace(/fileInput_local/g, 'fileInput');

  // 2. X.onclick = ... -> if(X){ X.onclick = ... } 형태로 강제 wrap
  // 패턴: ([a-zA-Z_]\w*)\.(onclick|onchange)\s*=\s*
  src = src.replace(/([a-zA-Z_]\w*)\.(onclick|onchange)\s*=\s*(function\s*\(.*?\)\s*\{[\s\S]*?\}\s*;?)/g, (m, varName, prop, body) => {
    // 이미 if(varName) 이 앞에 있는지 확인 (단순 체크)
    return `if(${varName}){${varName}.${prop}=${body}}`;
  });

  if (src !== before){
    fs.writeFileSync(p, src, 'utf-8');
    changed++;
  }
}
console.log(`Fixed ${changed} PDF files.`);
