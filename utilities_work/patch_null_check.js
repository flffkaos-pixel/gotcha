// 2-pass 패처: getElementById('X').textContent=value 식 호출을 안전한 if(e) e.textContent=value 로 변환
const fs = require('fs');
const path = require('path');

const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;
const LOG = String.raw`C:\Users\중진공39\utilities_work\null_check_log.txt`;
fs.writeFileSync(LOG,'', 'utf-8');
function log(s){ fs.appendFileSync(LOG, s + '\n','utf-8'); }

let nChanged = 0;
for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.html'))){
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;

  // 패턴: document.getElementById("X").PROP  또는  getElementById("X").PROP  또는  document.querySelector("#X").PROP
  // 다 문장 단위로 안전하게 바꾼다.
  // 단 chained call (e.g. .value.toUpperCase()) 나 expression 이어붙이기는 건드리지 않는다.
  // 다음과 같은 단순 할당/표현을 정확히 잡는다:
  //   X = document.getElementById("Y").value
  //   document.getElementById("Y").textContent = ...
  //   document.getElementById("Y").onclick = ...
  // 1) document.getElementById("X").value  →  (v = document.getElementById("X") ? v.value : undefined)
  //    — 너무 복잡. 대신 다음 형태만 잡는다: 한 줄에 "ID.getElementById("X").PROP = VALUE;" 형태
  //    "=" 가 chain 위치에 있을 때만 변환.

  // 메인 처리:
  //   document.getElementById("X").textContent = Y;
  //   가 있으면
  //     var _e = document.getElementById("X"); if (_e) _e.textContent = Y;
  //   로 변환 (한 줄)
  // 단, 이 변환을 매번 하면 같은 줄에서 _e 충돌 가능. 매 ID에 새 변수명 _e_X 사용.

  let out = src;

  // 1) "document.getElementById("X").value = Y;" 또는 ".textContent" ".innerHTML" ".onclick" ".onchange" 등 할당
  out = out.replace(
    /document\.getElementById\(\s*["']([\w-]+)["']\s*\)\.(value|textContent|innerHTML|onclick|onchange|oninput|innerText|outerHTML|classList|className)\s*=/g,
    (m, id, prop) => {
      const vName = '_el_' + id;
      // we want: (" + vName + ").prop = value;   with safe set.
      // 그러나 다중 동시 할당 가능. 단순히 var _el_X; (X).prop = value 식으로 그대로 두고, 별도 helper에서 wrap 할 수는 없음.
      // 대안: let statements 한 줄에 하나씩 wrapping.
      // 안전하게: if (vName) ($&); 형태. 즉, "if(' + vName + ') " + m.replace('=', )
      // 한 번만 감싼다.
      return 'document.getElementById("' + id + '") && document.getElementById("' + id + '").' + prop + ' =';
    }
  );

  // 핸들링: document.querySelector("#X").textContent 도 마찬가지
  out = out.replace(
    /document\.querySelector\(\s*["']#([\w-]+)["']\s*\)\.(value|textContent|innerHTML|onclick|onchange|oninput)\s*=/g,
    (m, id, prop) => {
      return 'document.querySelector("#' + id + '") && document.querySelector("#' + id + '").' + prop + ' =';
    }
  );

  // 2) getElementById("X").value (expression, 할당 아닐 때 — var v = getElementById("X").value 정도)
  //    → 너무 광범위하므로 skip, 단 "getElementById('X').value === ..." 등 비교는 그대로 둔다.

  if (out !== before){
    fs.writeFileSync(p, out, 'utf-8');
    nChanged++;
    log(f);
  }
}
log(`=== ${nChanged} files changed ===`);
console.log('done', nChanged);
