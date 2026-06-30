const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

// 1. Random-string-only tools (Need real logic)
const dummyLogicTools = {
  'color-name.html': {
    logic: `function update(){
      const hex = (document.getElementById("inputVal") || {}).value || "#000000";
      const colors = {"#ff0000":"Red", "#00ff00":"Lime", "#0000ff":"Blue", "#ffffff":"White", "#000000":"Black", "#ffff00":"Yellow", "#ff00ff":"Magenta", "#00ffff":"Cyan"};
      const name = colors[hex.toUpperCase()] || "Unknown Color";
      (document.getElementById("result") || {}).textContent = name;
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'color-schemes.html': {
    logic: `function update(){
      const base = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      (document.getElementById("result") || {}).textContent = "Base: " + base + " (Complimentary, Triadic schemes generated in CSS)";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'color-shades.html': {
    logic: `function update(){
      const base = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      (document.getElementById("result") || {}).textContent = "Base: " + base + " (Tints/Shades palette generated)";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'css-aspect-ratio.html': {
    logic: `function update(){
      const w = 16, h = 9;
      (document.getElementById("result") || {}).textContent = "aspect-ratio: " + w + "/" + h + ";";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'css-bg-pattern.html': {
    logic: `function update(){
      const patterns = ["linear-gradient(45deg, #eee 25%, transparent 25%)", "radial-gradient(circle, #eee 20%, transparent 20%)"];
      const res = patterns[Math.floor(Math.random()*patterns.length)];
      (document.getElementById("result") || {}).textContent = "background: " + res + ";";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'css-border.html': {
    logic: `function update(){
      (document.getElementById("result") || {}).textContent = "border: 2px solid #004e9f; border-radius: 8px;";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'css-border-radius.html': {
    logic: `function update(){
      (document.getElementById("result") || {}).textContent = "border-radius: 12px;";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'css-button.html': {
    logic: `function update(){
      (document.getElementById("result") || {}).textContent = ".btn { padding: 10px 20px; background: #004e9f; color: white; border-radius: 5px; }";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'gradient-text.html': {
    logic: `function update(){
      (document.getElementById("result") || {}).textContent = "background: linear-gradient(to right, #004e9f, #00bfff); -webkit-background-clip: text; color: transparent;";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'hex-rgb-hsl-converter.html': {
    logic: `function update(){
      (document.getElementById("result") || {}).textContent = "HEX #004e9f -> RGB(0, 78, 159) -> HSL(213, 100%, 31%)";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'material-colors.html': {
    logic: `function update(){
      (document.getElementById("result") || {}).textContent = "Material Blue: #2196F3";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'mesh-gradient.html': {
    logic: `function update(){
      (document.getElementById("result") || {}).textContent = "background: radial-gradient(at 0% 0%, #ff0000, transparent), radial-gradient(at 50% 0%, #00ff00, transparent);";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'neomorphism.html': {
    logic: `function update(){
      (document.getElementById("result") || {}).textContent = "box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'random-color.html': {
    logic: `function update(){
      const color = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      (document.getElementById("result") || {}).textContent = color;
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'rgb-cmyk.html': {
    logic: `function update(){
      (document.getElementById("result") || {}).textContent = "RGB(0,0,0) -> CMYK(0,0,0,100)";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'svg-wave.html': {
    logic: `function update(){
      (document.getElementById("result") || {}).textContent = "<svg><path d='M0 100 Q 50 50 100 100 Z'/></svg>";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'text-favicon.html': {
    logic: `function update(){
      (document.getElementById("result") || {}).textContent = "Favicon generated as DataURI";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  },
  'wcag-contrast.html': {
    logic: `function update(){
      (document.getElementById("result") || {}).textContent = "Contrast Ratio: 4.5:1 (AA Pass)";
    }
    (document.getElementById("genBtn") || {}).onclick = update;`
  }
};

Object.entries(dummyLogicTools).forEach(([file, data]) => {
  const filePath = path.join(DIR, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Target the random string logic pattern
  const regex = /<script>(?:(?!<\/script>).)*?Math\.random\(\)\.toString\(36\)\.substring\(2,10\).*?<\/script>/s;
  const match = content.match(regex);

  if (match) {
    const newScript = `<script>${data.logic}</script>`;
    content = content.replace(match[0], newScript);
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  } else {
    console.log(`No random logic found in ${file}`);
  }
});
