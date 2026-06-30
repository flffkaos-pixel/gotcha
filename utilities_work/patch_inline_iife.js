// 6단계 패치: inline IIFE (function(){ ... })() 한 줄 안의 dt/dl textContent/onclick/onchange 단순 감싸기
// 패턴 위치별로:
//   var dt=document....; dt.textContent=... (dt.onclick=...)
//   var lt=document....; lt.textContent=... (lt.onclick=...)
// 각각을:
//   var dt=document....; if(dt){dt.textContent=...}  if(dt) { dt.onclick=... }
//   var lt=document....; if(lt){lt.textContent=...} if(lt) { lt.onclick=... }
// 로 감쌈.

const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

let nChanged = 0;
for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.html'))){
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;
  // inline IIFE 한 줄 안에 dt/dl + .textContent 같이 등장하는 경우만 잡기
  // 한 줄 단위로 검사:
  const lines = src.split('\n');
  let touched = 0;
  for (let i = 0; i < lines.length; i++){
    let line = lines[i];
    if (!/function\(\)\{/.test(line)) continue;
    if (!/var\s+dt\s*=\s*document\.getElementById|var\s+lt\s*=\s*document\.getElementById/.test(line)) continue;
    if (!/dt\.textContent\s*=|lt\.textContent\s*=|dt\.onclick\s*=|lt\.onclick\s*=|lt\.textContent\s*=/.test(line)) continue;

    // 이미 wrapping 된 형태인지 (if(dt){...) 면 skip.
    // 모두 wrap. 변환 결과 동일 var 이름.
    let ln = line;

    // var dt=document.getElementById("darkToggle");
    // 위 라인에서 시작 후 다음 ; 까지가 var 선언 라인이다.
    // 다음 occurrence: dt.textContent=...; dt.onclick=function(){...};  ⇒ 와 같이 하나의 stmt 가 ; 로 분리돼 있을 가능성.
    // 매우 단순한 방법: var dt=... ; 다음에 comma separated occurrence 를
    // splitBy(';') 하고 다시 joinBy(';if(dt){...') 패턴으로 변경한다.
    //
    // 알고리즘:
    //   ln을 (function(){ 부터 })까지 추출.
    //   var dt=document.getElementById("darkToggle"); ... var lt= ... 를 split.
    //   각 "var X = document... " 다음에 오는 stmt 들을 if(X){}로 감싼다.
    //
    // 구현 단순:
    //   var dt=..; stmt1; stmt2; stmt3; var lt=..; stmtA; stmtB;
    //   위를:
    //   var dt=..; if(dt){stmt1; stmt2; stmt3;} var lt=..; if(lt){stmtA; stmtB;}
    //   처럼 만든다.
    //
    // 사용자 코드 라인 하나다. split(';')로 나뉘었을 때 변수 부분을 분리한다.

    const iifeStart = ln.indexOf('(function(){');
    if (iifeStart < 0) continue;
    const close = ln.indexOf('})();', iifeStart);
    if (close < 0) continue;

    const prefix = ln.slice(0, iifeStart + '(function(){'.length);
    const body = ln.slice(iifeStart + '(function(){'.length, close);
    const suffix = ln.slice(close);

    // body 를 ';' 단위로 split
    const parts = body.split(';').map(s => s.trim()).filter(Boolean);
    const out = [];
    let currentVar = null;
    for (const part of parts){
      // 변수 재선언 검사
      const vm = part.match(/^var\s+(\w+)\s*=\s*document\.getElementById\s*\(\s*["'](\w+)["']\s*\)/);
      if (vm){
        if (currentVar){ out.push('}'); }
        currentVar = vm[1];
        out.push(part);
      } else {
        out.push((currentVar ? `if(${currentVar}){` : '') + part);
      }
    }
    if (currentVar){ out.push('}'); }

    let newBody = out.join(';');
    // Body 의 마지막에 } 도 추가: 일단 위 구현에서 마지막 } 추가됐음.
    // 또한 각 stmt 다음 ; 가 있어야.
    if (!newBody.endsWith(';')) newBody += ';';

    const newLine = prefix + newBody + suffix;
    if (newLine !== line){
      lines[i] = newLine;
      touched++;
    }
  }

  if (touched){
    fs.writeFileSync(p, lines.join('\n'), 'utf-8');
    nChanged++;
  }
}
console.log('=== patched', nChanged);
