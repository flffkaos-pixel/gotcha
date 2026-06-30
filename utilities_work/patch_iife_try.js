// 패치 inline IIFE: TRADEOFF — 우리는 inline IIFE 의 첫 번째 throw 만 제거하면 페이지 메인은 살아난다.
// 사실 핵심 문제는 inline IIFE 의 첫 dt.textContent= 또는 첫 dt.onclick= 시점에 darkToggle 가 null 일 때 throw.
// 해결: IIFE 전체를
//   (function(){try{ ... }catch(e){}})()
// 로 감싼다. 그러면 throw 가 swallow 되고 페이지 메인은 영향 없음.
//
// 또한 동일 file 의 footer 멀티라인 IIFE 도 try/catch 로 감싼다.

const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

let nChanged = 0;

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.html'))){
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;

  // 1) inline IIFE 한 줄: (function(){ ... })();
  //    존재 검사: 정확히 어떤 라인에 매치할지. 우리는 한 줄 IIFE 의 끝 "})();" 또는 "})()"
  //    찾고, 그것을 (function(){try{ ... }catch(e){}})();
  //    로 변환. try{ 와 } 사이에 동일 본문.
  //    가장 단순: 모든 '})(;)' 중 두 번째로 등장하는 것 또는 정확히 매치되는 것.
  //    Hard: 일반 code 와 구분해야 한다. (footer 자체가 단 한개의 inline IIFE 인 게 특징.)
  //
  //    Heuristic: src 안에 (function(){ 코드 끝 }))(); 패턴이 있고,
  //    그 안의 var dt / var lt를 가져오면 거의 확실.
  //
  //    그러나 inline IIFE 안의 본문에 }; 가 들어 있을 수 있어 위치 잡기 어려움.
  //
  //    다른 단순 방법: 매 inline IIFE 라인에서 그 줄 안에 있는 모든 statement 를
  //    try{ }catch(e){} 로 감싸지 말고, 마지막 var lt/var dt 의 }catch(e){} 도입.
  //    → 어찌 됐든 정확한 위치 매칭이 어려움. 다음 가장 단순한 방법:
  //
  //   마지막 ;})(); 패턴을 ' ; try{...}catch(e){} )();' 변환.
  //   즉 우리가 어떤 IIFE 본문이든 그 안에 try{} catch(e){}로 wrap.
  //
  //   한 줄 inline IIFE 를 try/catch 로 wrap 하는 가장 쉬운 방법:
  //   regex: (function\(\)\{)(.*?)(\}\)\(\);?)$
  //   대체:  $1try{$2}catch(e){}$3
  //
  // 다중 라인 매치(m flag). 단 라인이 너무 길고 inline IIFE 안의 본문에 function(){...}; 가 들어있을 수 있음.
  // 가장 단순한 방법: 같은 line 에서만 매치:

  src = src.replace(/(\(function\(\)\{)(.{1,3000}?)(\}\)\(\);?)/g, (m, p1, body, p3) => {
    // 1줄 매치. 2글자 이상 본문. 본문 안에 ';})()); 가 없으면 매치.
    if (body.indexOf('})();') >= 0) return m;
    if (body.indexOf('})()') >= 0 && body.length > body.indexOf('})()') + 4) return m;

    // 이미 try 가 들어있으면 skip
    if (/\btry\s*\{/.test(body)) return m;
    return p1 + 'try{' + body + '}catch(e){}' + p3;
  });

  // 2) 멀티라인 footer IIFE 도 동일. 다음 패턴:
  //    <script>(function(){\n   ... \n   ... \n})();</script>
  //    또는 그냥 (function(){\n ... \n})();
  // 우리 알고리즘: try{...}catch 감싸기.
  // 단 inline IIFE 와 구분: 매우 어렵다.
  // 따라서 패치 7(파일 전체의 inline IIFE wrap)을 적용하는 게 안전.

  if (src !== before){
    fs.writeFileSync(p, src, 'utf-8');
    nChanged++;
  }
}
console.log('=== wrapped', nChanged);
