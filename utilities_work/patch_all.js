// 단순/정확한 패치 — 매 단계 실제로 src 변하는지 검사, 모든 변경을 로그
const fs = require('fs');
const path = require('path');

const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;
const LOG = String.raw`C:\Users\중진공39\utilities_work\patch_log.txt`;
fs.writeFileSync(LOG, '', 'utf-8');

function log(s){ fs.appendFileSync(LOG, s+'\n','utf-8'); console.log(s); }
function readFile(f){ return fs.readFileSync(path.join(DIR, f), 'utf-8'); }
function writeFile(f, s){ fs.writeFileSync(path.join(DIR, f), s, 'utf-8'); }

let nTotal = 0, nChanged = 0;

// 1) footer IIFE 안전하게 감싸기
function fixFooter(src){
  // 이미 if(dt){ 가 있으면 skip
  if (/if\(dt\)\{[\s\S]*?dt\.textContent=/.test(src)) return { src, changed:false, reason:'already-safe' };

  // ----- A: 한 줄 IIFE -----
  // 패턴: (function(){ ... var dt=document.getElementById("darkToggle");dt.textContent=d?...":.."!;dt.onclick=function(){...}var lt=document.getElementById("langToggle");lt.textContent=l==="en"?...":"English";lt.onclick=function(){...}})();
  const oneLineIdx = src.indexOf('var dt=document.getElementById("darkToggle");dt.textContent=');
  if (oneLineIdx >= 0){
    const ltIdx = src.indexOf('var lt=document.getElementById("langToggle");lt.textContent=', oneLineIdx);
    if (ltIdx > 0){
      const iifeStart = src.lastIndexOf('(function(){', oneLineIdx);
      const close = src.indexOf('})();', oneLineIdx);
      if (iifeStart >= 0 && close > oneLineIdx){
        const block = src.slice(iifeStart, close+5);
        const FIXED = block
          .replace('var dt=document.getElementById("darkToggle");dt.textContent=',
                   'var dt=document.getElementById("darkToggle");if(dt){dt.textContent=')
          .replace('var lt=document.getElementById("langToggle");lt.textContent=',
                   'var lt=document.getElementById("langToggle");if(lt){lt.textContent=');
        // 닫는 }} 삽입
        // FIXED는 ...;lt.onclick=function(){...}})();
        // 이걸 ...;lt.onclick=function(){...}}});}())();  -- 마지막 }} }); })(); 이게 어렵다.
        // 더 단순: if(dt){...} 닫기 직전에 }} 삽입, if(lt){...} 닫기 직전에도 }} 삽입.
        // lt.onclick=function(){...}})();
        let f2 = FIXED;
        // lt.onclick=function(){ ... } 닫고난 후 )() ; 가 따라옴. 우리는 }} })(); 로 바꿔야 함.
        f2 = f2.replace(/lt\.onclick=function\(\)\{([^}]*)\}\)\(\);/, 'lt.onclick=function(){$1}}})()');
        // dt 쪽은 일단 그대로 두자 (만약 패턴 안 맞으면 no-op)
        // dt.onclick=function(){...}})();  ==> });var lt=...
        // 위에서 var lt 앞에 있는 }} 가 없으므로 두 번째 }} 가 다음 패턴에서 들어가야 함
        // dt.onclick=function(){...}}var lt 같은 형태가 되도록 dt.onclick 직전에 }} 삽입
        // 단순히 "}var lt=..." 를 "}}var lt=..." 로 replace (var lt는 위에서 if(lt){... 로 이미 변환됨) 안 됨.
        // 위에서 var lt=...;lt.textContent=... 는 if(lt){lt.textContent=... 로 이미 변환됨
        // 그래서 우리는 }}var lt= 를 }}var lt= 로 해야 함. 보정:
        if (f2.includes('var lt=document.getElementById("langToggle");if(lt){')){
          // 그 var lt 앞의 ")" 다음에 "}" 추가
          f2 = f2.replace(/(dt\.onclick=function\(\)\{[^}]*\}\};?)var lt=document\.getElementById\("langToggle"\);/,
                          '$1}var lt=document.getElementById("langToggle");');
        }
        // 마지막 )();))
        // lt.onclick 다음의 })(); 닫기 직전에 } 추가
        // 만약 lt.onclick 부분이 위에서 한 번 안 잡혔으면 직접 처리
        if (!/lt\.onclick=function\(\)\{[^}]*\}\}\}\)\(\)/.test(f2)) {
          // 단순 보정
          f2 = f2.replace(/lt\.onclick=function\(\)\{([^}]+)\}\)\(\);/,
                          'lt.onclick=function(){$1}}})()');
        }
        // sanity: braces
        const ob = (f2.match(/{/g) || []).length;
        const cb = (f2.match(/}/g) || []).length;
        if (ob === cb && f2 !== block) {
          return { src: src.slice(0, iifeStart) + f2 + src.slice(close+5), changed:true, reason:'one-line' };
        }
      }
    }
  }

  // ----- B: 멀티라인 IIFE -----
  const pat = /(var dt=document\.getElementById\("darkToggle"\);\s*\n\s*dt\.textContent=[^;]+;\s*\n\s*dt\.onclick=[^;]+;\s*\n\s*var lt=document\.getElementById\("langToggle"\);\s*\n\s*lt\.textContent=[^;]+;\s*\n\s*lt\.onclick=[^;]+;)/;
  const mm = src.match(pat);
  if (mm){
    const block = mm[1];
    const fixed = 'if(dt){' + block
      .replace(/var dt=document\.getElementById\("darkToggle"\);/, '')
      .replace(/var lt=document\.getElementById\("langToggle"\);/, '}if(lt){')
      + '}';
    const newSrc = src.replace(block, fixed);
    const ob = (newSrc.match(/{/g) || []).length;
    const cb = (newSrc.match(/}/g) || []).length;
    if (ob === cb && newSrc !== src) return { src: newSrc, changed:true, reason:'multi-line' };
  }

  return { src, changed:false, reason:'no-pattern' };
}

// 2) 메인 calc ID 일치화 — getElementById('X') 의 X 가 main 안에 정의 안 됐으면 main 의 첫 input/button 등으로 보정
function fixMainIds(src){
  const mainMatch = src.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) return { src, changed:false, reason:'no-main' };
  const main = mainMatch[1];

  // main 안의 id 정의들
  const definedIds = new Set();
  for (const m of main.matchAll(/\bid\s*=\s*["']([\w-]+)["']/g)) definedIds.add(m[1]);

  // main 안의 input / button / select 의 첫 번째 id 후보
  const firstInputId = (main.match(/<input\b[^>]*\bid\s*=\s*["']([\w-]+)["']/) || [])[1];
  const firstButtonId = (main.match(/<button\b[^>]*\bid\s*=\s*["']([\w-]+)["']/) || [])[1];
  const firstSelectId = (main.match(/<select\b[^>]*\bid\s*=\s*["']([\w-]+)["']/) || [])[1];
  // main 안의 div id 후보 (결과 표시)
  const divIdList = [...main.matchAll(/<div\b[^>]*\bid\s*=\s*["']([\w-]+)["']/g)].map(m=>m[1]);

  // 모든 non-tailwind/ld script 본문 모음
  let scriptBody = '';
  const scriptSpans = [];
  for (const m of src.matchAll(/<script(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/g)){
    const body = m[1];
    if (body.includes('@context') || body.includes('tailwind.config') || body.includes('WebApplication')) continue;
    scriptSpans.push({ start: m.index, body });
    scriptBody += body + '\n';
  }

  // script 안의 ID 참조
  const refIds = new Set();
  for (const m of scriptBody.matchAll(/getElementById\s*\(\s*["']([\w-]+)["']\s*\)/g)) refIds.add(m[1]);
  for (const m of scriptBody.matchAll(/querySelector(?:All)?\s*\(\s*["']#([\w-]+)["']\s*\)/g)) refIds.add(m[1]);
  const LIB = new Set(['darkToggle','langToggle','langBtnText','tailwind-config']);

  const missing = [...refIds].filter(id => !definedIds.has(id) && !LIB.has(id));
  if (!missing.length) return { src, changed:false, reason:'no-missing-id' };

  // 매핑: 단순 휴리스틱 — ref 의 성격에 따라 적절한 실제 ID 매칭
  const mapping = {};
  const inputs = [...main.matchAll(/<input\b[^>]*\bid\s*=\s*["']([\w-]+)["']/g)].map(m=>m[1]);
  let inputPtr = 0;
  const useNextInput = () => inputs[inputPtr++];

  for (const ref of missing){
    let real = null;
    if (/^(v[1-9]|val|val1|val2|num|n)$/i.test(ref) && firstInputId){
      real = useNextInput() || firstInputId;
    } else if (/^(v1|v2)$/i.test(ref) && inputs.length >= 2){
      real = (ref === 'v1') ? inputs[0] : inputs[1];
    } else if (/^(input|input1|input2)$/i.test(ref) && firstInputId){
      real = firstInputId;
    } else if (/^(result|output|outputText|resultText|answer|preview|count|total|totalDays|totalValue)$/i.test(ref)){
      real = divIdList.shift() || (ref + '_local');
    } else if (/^(actionBtn|btn|button|generate|run|compute|doIt|calcBtn|genBtn|generateBtn)$/i.test(ref)){
      real = firstButtonId || divIdList.shift() || (ref + '_local');
    } else if (/^(fileInput)$/i.test(ref)){
      real = useNextInput() || (ref + '_local');
    } else if (/^qaResult|name|val$/.test(ref)){
      real = useNextInput() || divIdList.shift() || (ref + '_local');
    } else {
      // default: 첫 input 매핑
      real = useNextInput() || firstInputId || (ref + '_local');
    }
    if (real) mapping[ref] = real;
  }

  if (!Object.keys(mapping).length) return { src, changed:false, reason:'empty-mapping' };

  // script Body 의 ID 참소 재작성
  let newScriptBody = scriptBody;
  for (const [refId, realId] of Object.entries(mapping)){
    if (refId === realId) continue;
    newScriptBody = newScriptBody.replace(
      new RegExp(`getElementById\\s*\\(\\s*["']${refId}["']\\s*\\)`, 'g'),
      `getElementById("${realId}")`
    );
    newScriptBody = newScriptBody.replace(
      new RegExp(`querySelector\\(\\s*["']#${refId}["']\\s*\\)`, 'g'),
      `querySelector("#${realId}")`
    );
  }

  // main 안에서 realId 가 정의되어 있지 않은 경우 placeholder 추가
  let newMain = main;
  for (const [refId, realId] of Object.entries(mapping)){
    if (definedIds.has(realId)) continue;
    if (realId.endsWith('_local')){
      const placeholder = `\n<div id="${realId}" class="hidden"></div>\n`;
      newMain = newMain.replace(/(<\/main>)/i, placeholder + '$1');
      log(`  add placeholder: ${realId} (for missing ${refId})`);
    }
  }

  if (newMain !== main){
    src = src.replace(main, newMain);
  }

  if (newScriptBody !== scriptBody){
    // script 본문 중 하나를 교체 (가장 긴 것을 그 골격으로 사용)
    let target = null;
    for (const s of scriptSpans){
      if (s.body.length > (target?.body?.length || 0)) target = s;
    }
    if (target){
      src = src.replace(target.body, newScriptBody.includes(target.body.split('\n')[0]) ? newScriptBody : newScriptBody);
    } else {
      // 진짜 최후
      src = src.replace(scriptBody, newScriptBody);
    }
  }

  log('  id mapping: ' + Object.entries(mapping).map(([k,v])=>k+'->'+v).join(','));
  return { src, changed:true, reason:'id-mapping' };
}

const allFiles = fs.readdirSync(DIR).filter(x => x.endsWith('.html'));
nTotal = allFiles.length;
const interestingChanges = [];
for (const f of allFiles){
  let src = readFile(f);
  const before = src;

  // 1
  let r1 = fixFooter(src);
  if (r1.changed){ src = r1.src; log(f+' :: footer ('+r1.reason+')'); }
  else if (r1.reason === 'no-pattern') { /* skipFiles.add(f) - 미사용 */ }
  // 2
  let r2 = fixMainIds(src);
  if (r2.changed){ src = r2.src; }

  // 실제로 파일이 달라졌는지 비교
  if (before !== src){
    writeFile(f, src);
    nChanged++;
    interestingChanges.push(f);
  }
}
log(`=== ${nChanged}/${nTotal} files changed ===`);
log('=== changed files (first 80):' );
log(interestingChanges.slice(0, 80).join('\n'));
