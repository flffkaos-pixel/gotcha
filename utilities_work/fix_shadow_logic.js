const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const shadowFiles = [
  'box-shadow-generator.html',
  'box-shadow.html',
  'css-text-shadow.html'
];

shadowFiles.forEach(file => {
  const filePath = path.join(DIR, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 1.-- 2.-- 3.--- 로직을 완전히 교체. 
  // 기존의 (document.getElementById("genBtn") || {}).onclick = ... 
  // -> 실제 작동하는 shadow generation logic으로 교체
  
  let newScript = '';
  if (file === 'box-shadow-generator.html' || file === 'box-shadow.html') {
    newScript = `
<script>
function update() {
  const x = (document.getElementById("xOffset") || {}).value || 0;
  const y = (document.getElementById("yOffset") || {}).value || 0;
  const b = (document.getElementById("blur") || {}).value || 0;
  const s = (document.getElementById("spread") || {}).value || 0;
  const c = (document.getElementById("shadowColor") || {}).value || '#000000';
  const o = (document.getElementById("opacity") || {}).value || 0.15;

  if (document.getElementById("xVal")) document.getElementById("xVal").textContent = x;
  if (document.getElementById("yVal")) document.getElementById("yVal").textContent = y;
  if (document.getElementById("blurVal")) document.getElementById("blurVal").textContent = b;
  if (document.getElementById("spreadVal")) document.getElementById("spreadVal").textContent = s;
  if (document.getElementById("opacityVal")) document.getElementById("opacityVal").textContent = o;

  const r = parseInt(c.substr(1,2),16);
  const g = parseInt(c.substr(3,2),16);
  const bl = parseInt(c.substr(5,2),16);
  const shadow = \`\${x}px \${y}px \${b}px \${s}px rgba(\${r},\${g},\${bl},\${o})\`;
  
  const preview = document.getElementById('previewBox');
  if (preview) preview.style.boxShadow = shadow;
  
  const res = document.getElementById('cssCode');
  if (res) res.textContent = 'box-shadow: ' + shadow + ';';
}

function copyCode() {
  const code = (document.getElementById("cssCode") || {}).textContent;
  if (code) navigator.clipboard.writeText(code);
}

const inputs = ['xOffset','yOffset','blur','spread','shadowColor','opacity'];
inputs.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', update);
});
update();
</script>`;
  } else if (file === 'css-text-shadow.html') {
    newScript = `
<script>
function updateTextShadow() {
  const x = (document.getElementById("xOffset") || {}).value || 0;
  const y = (document.getElementById("yOffset") || {}).value || 0;
  const b = (document.getElementById("blur") || {}).value || 0;
  const c = (document.getElementById("shadowColor") || {}).value || '#000000';
  
  const shadow = \`\${x}px \${y}px \${b}px \${c}\`;
  const preview = document.getElementById('previewText');
  if (preview) preview.style.textShadow = shadow;
  
  const res = document.getElementById('result');
  if (res) res.textContent = 'text-shadow: ' + shadow + ';';
}

// a simplified version for text-shadow as IDs might differ
document.querySelectorAll('input').forEach(el => {
  el.addEventListener('input', updateTextShadow);
});
updateTextShadow();
</script>`;
  }

  // Replace the problematic script block. 
  // We look for the start of the first <script> tag that looks like it contains the logic.
  // To be safe, we replace from the first <script> (excluding tailwind/config) to the end of its block.
  
  // find index of actual logic script (usually after style tags)
  const scriptMatch = content.match(/<script>(?:(?!<\/script>).)*?document\.getElementById\("genBtn"\).*?<\/script>/s);
  if (scriptMatch) {
    content = content.replace(scriptMatch[0], newScript);
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  } else {
    console.log(`Could not find target script in ${file}`);
  }
});
