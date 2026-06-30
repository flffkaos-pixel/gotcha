const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

let changed = 0;
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));

files.forEach(f => {
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf-8');
  const before = src;
  
  // 1. function calc(). { -> function calc() {
  src = src.replace(/function\s+calc\s*\(\)\s*\.\s*\{/g, 'function calc() {');
  // 2. function calc() (. { -> function calc() {
  src = src.replace(/function\s+calc\s*\(\)\s*\(\s*\{/g, 'function calc() {');
  
  if (src !== before) {
    fs.writeFileSync(p, src, 'utf-8');
    changed++;
  }
});

console.log('Total files fixed for calc(). syntax: ' + changed);
