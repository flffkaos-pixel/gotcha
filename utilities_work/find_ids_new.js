const fs = require('fs');
const path = require('path');
const DIR = 'C:\Users\중진공39\utilities_work\utilities';

const ID_REF = /(?:getElementById|querySelector(?:All)?)\s*\(\s*["']([#\.]?)([\w-]+)["']\s*\)/g;
const ID_DEF = /\bid\s*=\s*["']([\w-]+)["']/g;

const filesWithMissings = [];
let totalUndefinedRefs = 0;

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.html'))){
  const src = fs.readFileSync(path.join(DIR, f), 'utf-8');
  const refs = new Set();
  let m;
  ID_REF.lastIndex = 0;
  while ((m = ID_REF.exec(src))){
    const prefix = m[1];
    const name = m[2];
    if (prefix === '#' || !prefix) refs.add(name);
  }
  const defs = new Set();
  ID_DEF.lastIndex = 0;
  while ((m = ID_DEF.exec(src))){ defs.add(m[1]); }
  const missing = [...refs].filter(r => !defs.has(r));
  if (missing.length){
    totalUndefinedRefs += missing.length;
    filesWithMissings.push({ file: f, missing });
  }
}

fs.writeFileSync('C:\Users\중진공39\utilities_work\undefined_ids.json', JSON.stringify(filesWithMissings, null, 2));
console.log('filesWithMissings:', filesWithMissings.length, ' totalRefs:', totalUndefinedRefs);
for (const x of filesWithMissings.slice(0, 30)) console.log(x.file, '->', x.missing.join(','));
