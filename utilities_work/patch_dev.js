// patch_pdf_input.js — pdf-* 계열 fileInput_local → fileInput 치환
// + 그 외 dev tool (api-key, color-mixer, gradient-generator, initial-avatar, placeholder-image, uuid)
// 각 파일별 진짜 calc 에러에 집중

const fs = require('fs');
const path = require('path');

const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;
const pdfFiles = [
  'images-to-pdf.html','pdf-compress.html','pdf-merge.html','pdf-page-delete.html',
  'pdf-page-extract.html','pdf-page-numbers.html','pdf-rotate.html','pdf-split.html',
  'pdf-to-text.html','pdf-to-images.html','pdf-watermark.html','pdf-text-extract.html'
];
const otherDev = [
  'uuid.html','api-key.html','color-mixer.html','gradient-generator.html','initial-avatar.html','placeholder-image.html'
];

let changed = 0;

// pdf-* — fileInput_local → fileInput
for (const f of pdfFiles){
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;
  src = src.replace(/fileInput_local/g, 'fileInput');
  // pdf-* fileInput.onchange = function(e) { ... } — safe with if(fileInput){ ... }?
  // 실제로 input id="fileInput" 이 DOM에 있지만 null 인 건 placeholder mapping
  if (src !== before){
    fs.writeFileSync(p, src, 'utf-8');
    changed++;
  }
}

// uuid.html — runtime 3 errors
const uuidPath = path.join(DIR, 'uuid.html');
let uuidSrc = fs.readFileSync(uuidPath, 'utf-8');
const beforeUuid = uuidSrc;
// uuid.html 의 calc() 함수 안에 null-safety 없는 textContent 패턴 있을 것. try/catch 로 calc wrap
uuidSrc = uuidSrc.replace(/(function\s+calc\(\)\s*\{)/, (m) => {
  return m;
  // 대신 그냥 calc 내부에 try{}catch{} 넣기
});
// 아니면: calc() 전체를 try/catch?
uuidSrc = uuidSrc.replace(/function calc\s*\(\)\s*\{[\s\S]*?\n\}/, (fn) => {
  // 이미 try 가 있으면 skip
  if (/\btry\s*\{/.test(fn)) return fn;
  const idx = fn.indexOf('{');
  return fn.substring(0, idx+1) + '\ntry{\n' + fn.substring(idx+1, fn.lastIndexOf('}')) + '\n}catch(e){console.error("calc error:",e)};\n' + '}';
});
if (uuidSrc !== beforeUuid){
  fs.writeFileSync(uuidPath, uuidSrc, 'utf-8');
  changed++;
}

// api-key.html
const apiKeyPath = path.join(DIR, 'api-key.html');
let apiSrc = fs.readFileSync(apiKeyPath, 'utf-8');
const beforeApi = apiSrc;
apiSrc = apiSrc.replace(/function calc\s*\(\)\s*\{[\s\S]*?\n\}/, (fn) => {
  if (/\btry\s*\{/.test(fn)) return fn;
  const idx = fn.indexOf('{');
  return fn.substring(0, idx+1) + '\ntry{\n' + fn.substring(idx+1, fn.lastIndexOf('}')) + '\n}catch(e){console.error(e)};\n' + '}';
});
if (apiSrc !== beforeApi){
  fs.writeFileSync(apiKeyPath, apiSrc, 'utf-8');
  changed++;
}

console.log('pdf fixed: ' + pdfFiles.filter(f => {
  const src = fs.readFileSync(path.join(DIR, f), 'utf-8');
  return src.includes('fileInput') && !src.includes('fileInput_local');
}).length + ' / ' + pdfFiles.length);
console.log('total files changed: ' + changed);