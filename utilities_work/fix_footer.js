// JS #4 패턴(null check 없는 footer IIFE) 자동 수정
const fs = require('fs');
const path = require('path');
const DIR = 'C:\\Users\\중진공39\\utilities_work\\utilities';

// 패턴: 한 줄 또는 여러 줄 IIFE 안의
// var dt=document.getElementById("darkToggle");
// dt.textContent=...; dt.onclick=...
// var lt=document.getElementById("langToggle");
// lt.textContent=...; lt.onclick=...
// → if(dt){...} / if(lt){...} 로 감싼다.

let patched = 0, scanned = 0, skipped = 0;

function fixOneLineIIFE(src){
  // 한 줄 형태 IIFE 안에 있는 패턴 찾기
  // var dt=document.getElementById("darkToggle");dt.textContent=d?"☀️":"🌙";dt.onclick=...var lt=document.getElementById("langToggle");lt.textContent=...lt.onclick=function(){...}
  const idx = src.indexOf('var dt=document.getElementById("darkToggle");dt.textContent=');
  if (idx < 0) return null;
  // 해당 IIFE 범위 찾기
  const iifeStart = src.lastIndexOf('(function(){', idx);
  if (iifeStart < 0) return null;
  // 닫는 })();
  const close = src.indexOf('})();', idx);
  if (close < 0) return null;
  const block = src.slice(iifeStart, close + 5);

  // 이 블록 안에 if로 감싸기
  let fixed = block;
  // dt 부분
  fixed = fixed.replace(/var dt=document\.getElementById\("darkToggle"\);dt\.textContent=([^;]+);dt\.onclick=function\(\)\{([^}]+)\}var lt=/,
    'var dt=document.getElementById("darkToggle");if(dt){dt.textContent=$1;dt.onclick=function(){$2}}var lt=');
  // lt 부분
  fixed = fixed.replace(/var lt=document\.getElementById\("langToggle"\);lt\.textContent=([^;]+);lt\.onclick=function\(\)\{([^}]+)\}\)\(\)/,
    'var lt=document.getElementById("langToggle");if(lt){lt.textContent=$1;lt.onclick=function(){$2}}})()');

  if (fixed === block) return null;
  return src.slice(0, iifeStart) + fixed + src.slice(close + 5);
}

function fixMultiLineIIFE(src){
  // 멀티라인 형태:
  //   var dt=document.getElementById("darkToggle");
  //   dt.textContent=...;
  //   dt.onclick=...;
  //   var lt=document.getElementById("langToggle");
  //   lt.textContent=...;
  //   lt.onclick=...;
  const pat = /(var dt=document\.getElementById\("darkToggle"\);\s*\n?\s*dt\.textContent=[^;]+;\s*\n?\s*dt\.onclick=[^;]+;\s*\n?\s*var lt=document\.getElementById\("langToggle"\);\s*\n?\s*lt\.textContent=[^;]+;\s*\n?\s*lt\.onclick=[^;]+;)/;
  if (!pat.test(src)) return null;
  const m = src.match(pat);
  const block = m[1];
  // dt.textContent=...; dt.onclick=...;
  // 분해
  const fixed = 'if(dt){' + block.replace(/var dt=document\.getElementById\("darkToggle"\);/, '').replace(/var lt=document\.getElementById\("langToggle"\);/, '}if(lt){') + '}';
  return src.replace(pat, fixed);
}

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.html'))){
  scanned++;
  const p = path.join(DIR, f);
  const src = fs.readFileSync(p, 'utf-8');
  // IIFE 가 둘 있지만 두 번째(IIFE with light_mode)는 이미 if (dt){...} 가 있으므로,
  // if(dt){ 가 이미 있는지 확인 후, 없으면 fix.
  if (/if\(dt\)\{[\s\S]*?dt\.textContent=/.test(src)) { skipped++; continue; }

  // 멀티라인 시도
  let out = fixMultiLineIIFE(src);
  if (!out){
    // 한 줄 IIFE 시도
    out = fixOneLineIIFE(src);
  }
  if (out && out !== src){
    fs.writeFileSync(p, out, 'utf-8');
    patched++;
    console.log('patched', f);
  }
}
console.log('SCANNED:', scanned, ' PATCHED:', patched, ' SKIPPED:', skipped);
