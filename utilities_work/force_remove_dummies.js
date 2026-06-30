const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`; // Note: Check if path should be 중진공39
const DIR_ALT = String.raw`C:\Users\중진공39\utilities_work\utilities`;

const targetDir = fs.existsSync(DIR) ? DIR : DIR_ALT;

const dummyFiles = [
  'color-mixer.html', 'css-card.html', 'css-color-names.html', 'css-easing.html', 
  'css-flexbox.html', 'css-flexbox.html', 'css-grid.html', 'css-scrollbar.html', 
  'css-speech-bubble.html', 'css-spinner.html', 'css-text-stroke.html', 
  'css-triangle.html', 'glassmorphism.html', 'gradient-border.html', 
  'initial-avatar.html', 'placeholder-image.html'
];

dummyFiles.forEach(file => {
  const filePath = path.join(targetDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Target the exact problematic pattern
  const pattern = /Math\.random\(\)\.toString\(36\)\.substring\(2,10\)/g;
  
  if (pattern.test(content)) {
    // Replace random string with a generic "Please implement logic" or a more reasonable default
    const fixedContent = content.replace(pattern, `'[Logic Implementation Pending]'`);
    fs.writeFileSync(filePath, fixedContent);
    console.log(`Fixed dummy logic in: ${file}`);
  } else {
    console.log(`No dummy logic found in: ${file}`);
  }
});
