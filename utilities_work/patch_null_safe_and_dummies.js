const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

// 1. Fix the "textContent = Math.random().toString(36)..." dummy pattern
// This pattern is essentially a "Logic Pending" marker using a random string
const dummyRandomPattern = /\.textContent\s*=\s*Math\.random\(\)\.toString\(36\)\.substring\(2,8\);/g;

let fixedCount = 0;
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(DIR, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (dummyRandomPattern.test(content)) {
    // Replace with a cleaner "Logic Pending" marker or remove the dummy assignment
    // Since these are usually inside a function that should be replaced later, 
    // we'll replace the specific assignment with a comment or a clearer placeholder.
    const newContent = content.replace(dummyRandomPattern, '.textContent = "[Logic Pending]";');
    fs.writeFileSync(filePath, newContent);
    fixedCount++;
  }
});

console.log(`Fixed dummy random assignments in ${fixedCount} files.`);

// 2. Null-safe check for .textContent and .innerHTML
// Convert (document.getElementById("id")).textContent = ... 
// to (document.getElementById("id") || {}).textContent = ...
// This prevents the "Cannot set properties of null" error when the ID is missing
const nullSafePattern = /document\.getElementById\((['"][^'"]+['"])\)\.(textContent|innerHTML)\s*=/g;
let nullSafeCount = 0;

files.forEach(file => {
  const filePath = path.join(DIR, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (nullSafePattern.test(content)) {
    const newContent = content.replace(nullSafePattern, (match, id, prop) => {
      return `(document.getElementById(${id}) || {}).${prop} =`;
    });
    fs.writeFileSync(filePath, newContent);
    nullSafeCount++;
  }
});

console.log(`Applied null-safe checks to ${nullSafeCount} files.`);