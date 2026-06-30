// broken 330개를 카테고리화: 에러 있는 것 vs changed 없는 것 vs 등
const fs = require('fs');
const R = JSON.parse(fs.readFileSync('C:\\Users\\중진공39\\utilities_work\\runtime_results.json','utf-8'));
const broken = R.filter(s => (s.errors && s.errors.length) || (!s.hasMainContent) || (s.changedKeys.length === 0));
console.log('broken:', broken.length);

// 에러 종류 카운트
const errCat = {};
for (const b of broken) {
  const k = (b.errors.map(e=>e.split('\n')[0]).join(' | ')) || 'NO_ERROR';
  errCat[k.slice(0, 200)] = (errCat[k.slice(0, 200)] || 0) + 1;
}
const entries = Object.entries(errCat).sort((a,b)=>b[1]-a[1]);
for (const [k, v] of entries) console.log(v, k);

// CSV 형태로 broken list 출력
fs.writeFileSync('C:\\Users\\중진공39\\utilities_work\\broken_list.txt',
  broken.map(b => `${b.file}\t${(b.errors[0]||'').slice(0,250).replace(/\n/g,' ')}\tchanged=${b.changedKeys.join(',')}`).join('\n')
);
console.log('saved broken_list.txt');
