// 각 HTML 안의 getElementById/쿼리에서 참조되는 ID가 실제로 DOM에 정의되어 있는지 검사
const fs = require('fs');
const path = require('path');
const DIR = 'C:\\Users\uc9c4\uc9c4\uacf5\\utilities_work\\utilities';

// ID 참조 추출 (script 안 + 외부 attr 안)
const ID_REF = /(?:getElementById|querySelector(?:All)?)\s*\(\s*["']([#\.]?)([\w-]+)["']\s*\)/g;
// 추가로 .innerHTML, setAttribute('id'
// 실제로 ID 정의 추출: id="..." 또는 id='...' (단 #이나 . 없이)
const ID_DEF = /\bid\s*=\s*["']([\w-]+)["']/g;

const summary = [];
let totalUndefinedRefs = 0;
const filesWithMissings = [];

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.html'))){
  const src = fs.readFileSync(path.join(DIR, f), 'utf-8');

  const refs = new Set();
  let m;
  ID_REF.lastIndex = 0;
  while ((m = ID_REF.exec(src))){
    const prefix = m[1];
    const name = m[2];
    if (prefix === '#' || !prefix){
      refs.add(name); // ID 참조
    }
    // '.' 는 클래스 참조라 무시
  }
  const defs = new Set();
  ID_DEF.lastIndex = 0;
  while ((m = ID_DEF.exec(src))){
    defs.add(m[1]);
  }
  const missing = [...refs].filter(r => !defs.has(r));
  if (missing.length){
    totalUndefinedRefs += missing.length;
    filesWithMissings.push({ file: f, missing });
  }
}

fs.writeFileSync('C:\\Users\uc9c4\uc9c4\uacf5\\utilities_work\\undefined_ids.json', JSON.stringify(filesWithMissings, null, 2));
console.log('filesWithMissings:', filesWithMissings.length, ' totalRefs:', totalUndefinedRefs);
for (const x of filesWithMissings.slice(0, 30)) console.log(x.file, '->', x.missing.join(','));
