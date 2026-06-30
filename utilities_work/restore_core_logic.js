const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const repairs = {
  'css-flexbox.html': () => {
    return `
<script>
function update() {
  const dir = (document.getElementById('flexDir') || {}).value || 'row';
  const justify = (document.getElementById('justifyContent') || {}).value || 'center';
  const align = (document.getElementById('alignItems') || {}).value || 'center';
  const wrap = (document.getElementById('flexWrap') || {}).value || 'nowrap';
  
  const container = document.getElementById('flexPreview');
  if (container) {
    container.style.display = 'flex';
    container.style.flexDirection = dir;
    container.style.justifyContent = justify;
    container.style.alignItems = align;
    container.style.flexWrap = wrap;
  }
  
  const code = \`display: flex;\\nflex-direction: \${dir};\\njustify-content: \${justify};\\nalign-items: \${align};\\nflex-wrap: \${wrap};\`;
  const res = document.getElementById('result');
  if (res) res.textContent = code;
}

['flexDir', 'justifyContent', 'alignItems', 'flexWrap'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', update);
});
update();
</script>`;
  },
  'css-grid.html': () => {
    return `
<script>
function update() {
  const cols = (document.getElementById('gridCols') || {}).value || '3';
  const gap = (document.getElementById('gridGap') || {}).value || '10';
  
  const container = document.getElementById('gridPreview');
  if (container) {
    container.style.display = 'grid';
    container.style.gridTemplateColumns = \`repeat(\${cols}, 1fr)\`;
    container.style.gap = \`\${gap}px\`;
  }
  
  const code = \`display: grid;\\ngrid-template-columns: repeat(\${cols}, 1fr);\\ngap: \${gap}px;\`;
  const res = document.getElementById('result');
  if (res) res.textContent = code;
}

['gridCols', 'gridGap'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', update);
});
update();
</script>`;
  },
  'glassmorphism.html': () => {
    return `
<script>
function update() {
  const blur = (document.getElementById('blurVal') || {}).value || '10';
  const opacity = (document.getElementById('opacityVal') || {}).value || '0.2';
  const color = (document.getElementById('glassColor') || {}).value || '#ffffff';
  
  const preview = document.getElementById('glassPreview');
  if (preview) {
    preview.style.backdropFilter = \`blur(\${blur}px)\`;
    preview.style.webkitBackdropFilter = \`blur(\${blur}px)\`;
    preview.style.backgroundColor = color + Math.floor(opacity * 255).toString(16).padStart(2, '0'); 
    // Simplified: using a fixed color with alpha for preview
    preview.style.backgroundColor = \`rgba(255, 255, 255, \${opacity})\`;
  }
  
  const code = \`background: rgba(255, 255, 255, \${opacity});\\nbackdrop-filter: blur(\${blur}px);\\n-webkit-backdrop-filter: blur(\${blur}px);\\nborder: 1px solid rgba(255, 255, 255, 0.3);\`;
  const res = document.getElementById('result');
  if (res) res.textContent = code;
}

['blurVal', 'opacityVal', 'glassColor'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', update);
});
update();
</script>`;
  }
};

Object.entries(repairs).forEach(([file, logicFn]) => {
  const filePath = path.join(DIR, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const newScript = logicFn();
  
  // Replace the block containing "Logic Implementation Pending"
  const regex = /<script>[\s\S]*?Logic Implementation Pending[\s\S]*?<\/script>/;
  if (regex.test(content)) {
    content = content.replace(regex, newScript);
    fs.writeFileSync(filePath, content);
    console.log(`Successfully restored logic for: ${file}`);
  } else {
    console.log(`Could not find target block in ${file}`);
  }
});
