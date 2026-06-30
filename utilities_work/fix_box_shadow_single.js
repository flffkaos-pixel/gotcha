const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const file = 'box-shadow.html';
const filePath = path.join(DIR, file);
if (!fs.existsSync(filePath)) process.exit(1);

let content = fs.readFileSync(filePath, 'utf-8');

// box-shadow.html has a very different structure (old version)
// It doesn't have "genBtn" but has a large Tailwind config block
// We need to replace the script part.
// The actual logic is usually at the bottom.

const newScript = `
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

// Look for any script tag that contains "boxShadow" or "update()"
const regex = /<script>(?:(?!<\/script>).)*?(?:boxShadow|update|document\.getElementById)\s*\(.*<\/script>/s;
const match = content.match(regex);

if (match) {
  content = content.replace(match[0], newScript);
  fs.writeFileSync(filePath, content);
  console.log('Fixed box-shadow.html');
} else {
  console.log('Could not find target script in box-shadow.html');
}
