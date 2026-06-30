// 패치 5: 가장 단순한 방법
// 한 줄 IIFE 의 모든 dt.textContent / dt.onclick / lt.textContent / lt.onclick occurrence 마다
//   그 occurrence 직전에 ";_v&&" 같은 conditional 표현 불가. 가장 깔끔:
//   var dt = document.getElementById(...);   다음 줄 또는 같은 줄에
//   ; if(dt)  ... dt.textContent=... 의 형태를 만들지 말고 다음 규칙:
//   매 occurrence 마다 그 앞 뒤에 conditionally wrap 한다.
//
// 실용적 단순 방법:
//   각 occurrence occurrence_dt TEXT_C 는 일단 다음 위치까지를 잡아낸다.
//     - 술 occurrence 다음에 ; 또는 newline 또는 } 까지.
//     - occurrence 위치에 "if(dt) " 부착. 그러나 ; 가 등장하면 if 스코프가 닫힌다.
//     - 그 사이가 stmt 1개라면 한 stmt 가 if 의 본체가 되어야.
//
// 그리하여 최종 접근:
//   find occurrence "dt.textContent" OR "lt.textContent" 와 같은 stmt.
//   단 사용하지 않는다면 (즉 그 stmt 의 effect 가 무해하다면) skip.
//
// 보수: src 안에 있는 occurrence occurrence occurrence 마다 매칭 (assign 만)
//   dt.textContent = ...;
//   dt.onclick = ...;      OR     dt.onclick = function(){...};
//   lt.textContent = ...;
//   lt.onclick = ...;
//
// 일단 한 줄에 다 들어가 있다고 가정; 매치하면 그 stmt 만 if(X){ ... } 로 wrap.
//
// 이 패턴은 한 줄 IIFE 안에 다음 한 stmt 가 한 번 등장할 때 정확히 잡힌다.
// 그러나 위 경우 한 줄 IIFE 안에서 ... ;...; ... 가 나오기 때문에 단순화 필요.
//
// 따라서:
// 1. var dt/dl = ...; 이후의 "다음 stmt 단위" 모두 if(dt/lt) {...} 로 감싼다.
// 2. single-line IIFE 에서는 특별 처리.
//
// 작동하는 단일 접근 — 그 줄 if 가 없을 경우:
//   i) find "var dt = document.getElementById("darkToggle");" in same scope
//   ii) 뒤따르는 dt.textContent / dt.onclick / dt.onchange 마다 한 줄 if(dt){ ... } 추가됨
//   iii) ;
//
// 최종적인 흐름: 전체 라인 처리. 각 라인에 "dt.textContent=" 또는 "lt.textContent=" 가 나오면
// 그 라인에 "if(dt) " 또는 "if(lt) " prefix + "{" + suffix "}" + add.
// (단 이미 if 있으면 skip)
//
// 이 단순화 끝.

const fs = require('fs');
const path = require('path');

const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;
let nChanged = 0;

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.html'))){
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;

  // 한 줄 IIFE 안에 dt/dl 사용 있는지
  if (!/dt\.textContent\s*=|lt\.textContent\s*=|dt\.onclick\s*=|lt\.onclick\s*=/.test(src)){
    continue;
  }
  // 이미 if 가 있으면 skip (단 추가 가드 붙임 안 함)
  // 만약 한 라인 안에 if(dt){...} 일 때만. 단 그 조건으로 안전화 안 한 것이 있다면?

  const lines = src.split('\n');
  let patched = 0;
  for (let i = 0; i < lines.length; i++){
    let line = lines[i];
    // 라인 안에 if(dt) 나 if(lt) 가 포함되어 있으면 skip
    if (/\bif\s*\(\s*dt\s*\)/.test(line) || /\bif\s*\(\s*lt\s*\)/.test(line)) continue;

    // 한 줄에 dt.textContent= ... 와 dt.onclick= 같은게 같이 나오면 그 라인 전체를 if(dt){...} 로 감싼다.
    // 단 inline IIFE 안에 들어있는 라인도 마찬가지.
    // 단 단순 replace의 경우 안 됨. line 단위:

    // 매치:
    // dt.textContent=ABC;  form
    let m = line.match(/^(.*?)(\s*)(dt\.textContent\s*=[^;]*;)\s*$/);
    if (m){
      // 그 줄 전체가 dt.textContent=...; 이면 prefix if(dt) { ... }
      // 보수: 그 statement 하나만 if 안에. 라인에 다른 stmt가 있으면 위험. 따라서 한 줄 안에 ; 외 stmt 없는 것만 추가.
      // 단 inline IIFE 안의 단일 statement 라인은 ; 가 다수 있을 수 있음. 그 경우 skip.
      // 단순: 라인에서 ; 의 갯수가 1이고 그게 stmt 안 의 것이며, 그 안의 = . 가 dt 가 사용된다면.
      // 그러나 regex 가 잘 못 잡힐 수 있으니 그냥 wrap:
      lines[i] = m[1] + m[2] + 'if(dt){' + m[3] + '}';
      patched++;
      continue;
    }
    m = line.match(/^(.*?)(\s*)(lt\.textContent\s*=[^;]*;)\s*$/);
    if (m){
      lines[i] = m[1] + m[2] + 'if(lt){' + m[3] + '}';
      patched++;
      continue;
    }
    m = line.match(/^(.*?)(\s*)(dt\.onclick\s*=[^;]*;)\s*$/);
    if (m){
      lines[i] = m[1] + m[2] + 'if(dt){' + m[3] + '}';
      patched++;
      continue;
    }
    m = line.match(/^(.*?)(\s*)(lt\.onclick\s*=[^;]*;)\s*$/);
    if (m){
      lines[i] = m[1] + m[2] + 'if(lt){' + m[3] + '}';
      patched++;
      continue;
    }
  }
  if (patched){
    src = lines.join('\n');
    fs.writeFileSync(p, src, 'utf-8');
    nChanged++;
  }
}
console.log('=== patched', nChanged);
