const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

// 각 파일에서 'Cannot set properties of null' 가 발생하는 정확한 위치를 잡는다.
// 패턴: getElementById("X").textContent = ...
//       document.getElementById("X").value = ...
//       document.getElementById("X").onclick = ...

const ACCESS_PATTERNS = [
  // document.getElementById('X').textContent = ...
  /document\.getElementById\(\s*["']([\w-]+)["']\s*\)\.textContent/g,
  /document\.getElementById\(\s*["']([\w-]+)["']\s*\)\.value/g,
  /document\.getElementById\(\s*["']([\w-]+)["']\s*\)\.onclick/g,
  /document\.getElementById\(\s*["']([\w-]+)["']\s*\)\.onchange/g,
  // 그냥 getElementById('X').textContent
  /\bgetElementById\(\s*["']([\w-]+)["']\s*\)\.textContent/g,
];
const DOUBLE_DOT = /document\.querySelector\(\s*["']#([\w-]+)["']\s*\)\.textContent/g;

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.html')).slice(0, 30)){
  const src = fs.readFileSync(path.join(DIR, f), 'utf-8');
  const m = [...src.matchAll(/(?:getElementById|querySelector)\([^)]*\)\.(textContent|value|onclick|onchange)/g)];
  if (m.length > 0){
    const seen = new Set();
    let sample = '';
    for (const x of m){
      const key = x[0];
      if (seen.size < 2) sample += key + ' | ';
      seen.add(key);
    }
    console.log(`${f}: ${m.length} calls. Sample: ${sample}`);
  }
}
