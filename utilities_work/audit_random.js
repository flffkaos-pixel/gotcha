const fs = require('fs');
const path = require('path');
const DIR = String.raw`C:\Users\중진공39\utilities_work\utilities`;

// Files that use Math.random() - these need to be categorized
const filesWithMathRandom = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.html'))
  .filter(f => {
    const content = fs.readFileSync(path.join(DIR, f), 'utf-8');
    return content.includes('Math.random()');
  });

console.log('=== Files with Math.random() (need review) ===');
console.log(`Total: ${filesWithMathRandom.length} files`);
console.log('');

// Categorize
const dummyPattern = filesWithMathRandom.filter(f => {
  const content = fs.readFileSync(path.join(DIR, f), 'utf-8');
  return content.includes('toString(36)') || content.includes('Logic Implementation Pending');
});

const urlShortener = filesWithMathRandom.filter(f => {
  const content = fs.readFileSync(path.join(DIR, f), 'utf-8');
  return content.includes('freeutilities.pages.dev') || content.includes('simulated');
});

const legitRandom = filesWithMathRandom.filter(f => {
  const content = fs.readFileSync(path.join(DIR, f), 'utf-8');
  // Random generators that legitimately need random values
  return (f.includes('random') || f.includes('lotto') || f.includes('dice') || 
          f.includes('roulette') || f.includes('fortune') || f.includes('fate') ||
          f.includes('slot') || f.includes('password') || f.includes('bingo') ||
          f.includes('pick') || f.includes('draw') || f.includes('shuffle') ||
          f.includes('coin') || f.includes('rps') || f.includes('scramble'));
});

const suspiciousCalc = filesWithMathRandom.filter(f => {
  return !dummyPattern.includes(f) && !urlShortener.includes(f) && !legitRandom.includes(f);
});

console.log('=== DUMMY (toString(36) / Pending) ===');
console.log(dummyPattern.length ? dummyPattern.join('\n') : 'None');

console.log('');
console.log('=== URL SHORTENER (simulated) ===');
console.log(urlShortener.length ? urlShortener.join('\n') : 'None');

console.log('');
console.log('=== LEGIT RANDOM TOOLS (lotto/dice/etc) ===');
console.log(legitRandom.length ? legitRandom.join('\n') : 'None');

console.log('');
console.log('=== SUSPICIOUS (may need real calc) ===');
console.log(suspiciousCalc.length ? suspiciousCalc.join('\n') : 'None');