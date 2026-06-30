// getElementById('X').value  // fetch (read)
// document.getElementById('X').textContent = ...
// getElementById('X').onclick = ...
// 를 안전화 한다.
//
// 1) document.getElementById('X').VALUE  (할당 아님, 값을 가져오는 시점)
//    패턴이 광범위해서 무조건 변환하면 사용처 형편에 따라 안 맞는다.
//    안전한 형태: let e = document.getElementById('X'); if (e) e.value.style ...
//    한 줄 호출 패턴 두 가지만 정확히 잡는다:
//      document.getElementById('X').value  (수식 시작/괄호 안)
//      getElementById('X').value
//    그리고 그것이 어떤 식에 들어가던지 `(document.getElementById('X')||{}).value` 로 바꿔준다.
//
//    단점은 만약 실제로 input element가 있는 경우 null 가드 효과를 주지 않는다 (실제론 input이 존재해서 의도 유지됨).
//    만약 input이 없어서 null이면 (null||{}).value === undefined 가 되어 bool 비교에서 false && asis 등 의도와 비슷.
//
// 2) getElementById('X').onclick = ...  또는 onchange 등 이벤트 핸들러 할당
//    그대로 동작 (null 이면 throw 됨). => (getElementById('X')||{}).onclick = ... 로 변환하면 null이면 실패 안 함.
//
// 3) document.getElementById('X').textContent = ...  => 이미 patch_all.js에서 일부 수정됨.
//
// 각 replace 는 정확히 한 번만 발생하도록 패턴을 잡는다.

const fs = require('fs');
const path = require('path');

const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;
let nChanged = 0;
let nReplaced = 0;

const RX_ASSIGN = /(document\.getElementById|getElementById)\s*\(\s*["']([\w-]+)["']\s*\)\s*\.(value|checked|min|max|selectedIndex|innerHTML|innerText|textContent|outerHTML|className|classList|onclick|onchange|oninput|onsubmit|style)\b\s*=/g;

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.html'))){
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;
  const cnt = { read: 0, assign: 0 };

  // 1) ASSIGN patterns:
  //    document.getElementById('X').PROP = ...
  //    getElementById('X').PROP = ...
  // => (document.getElementById('X') || {}).PROP = ...
  // 단 override 되지 않도록 if 문이 이미 있는지 확인 후.
  // 매우 광범위이라 만약 1번 같은 줄에 var e.x 패턴 후 .e.textContent=... 가 있으면
  // 우리는 한 번에 두 군데를 broken 처리할 수 있다. 보수 접근:
  // 단순히 () 로 감쌈.
  src = src.replace(RX_ASSIGN, (m, fn, id, prop) => {
    cnt.assign++;
    return `(${fn}("${id}") || {}).${prop} =`;
  });

  // 2) READ patterns (chained start):
  //   document.getElementById('X').value  (anywhere) -> (document.getElementById('X') || {}).value
  //   getElementById('X').value
  //   querySelector('#X').value
  // 단 이미 변환된 ((document.getElementById...) || ...) 안에 다시 안 들어가도록 single occurrence only.
  // RX read = `(document\.getElementById\(["'][^"']+["']\)|getElementById\(["'][^"']+["']\)|querySelector\(["']#[^"']+["']\))\.value`
  // 치환 대상만 매치:
  const RX_READ = /(?<!\|\|\s\{\})(?<!or\s)(document\.getElementById\(\s*["']([\w-]+)["']\s*\)|getElementById\(\s*["']([\w-]+)["']\s*\))\.(value|checked|min|max|selectedIndex|innerHTML|innerText|textContent|outerHTML|className)/g;
  src = src.replace(RX_READ, (m, full, id1, id2, prop) => {
    const id = id1 || id2;
    cnt.read++;
    return `(document.getElementById("${id}") || {}).${prop}`;
  });

  // READ on querySelector
  const RX_QS_READ = /(?<!\|\|\s\{\})document\.querySelector\(\s*["']#([\w-]+)["']\s*\)\.(value|checked|min|max|selectedIndex|innerHTML|innerText|textContent|outerHTML|className)/g;
  src = src.replace(RX_QS_READ, (m, id, prop) => {
    cnt.read++;
    return `(document.querySelector("#${id}") || {}).${prop}`;
  });

  if (src !== before){
    nReplaced += cnt.read + cnt.assign;
    nChanged++;
    fs.writeFileSync(p, src, 'utf-8');
    console.log(`${f}: read=${cnt.read} assign=${cnt.assign}`);
  }
}
console.log(`=== files changed: ${nChanged}, replacements: ${nReplaced} ===`);
