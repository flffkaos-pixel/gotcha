const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('C:\\Users\\중진공39\\utilities_work\\utilities\\100days.html','utf-8');

// 외부 src 스크립트 모두 제거
const clean = html.replace(/<script\b[^>]*\bsrc\s*=[^>]*><\/script>/gi, '');

const vc = new VirtualConsole();
vc.on('jsdomError', e => console.log('JSDOM-ERROR:', (e && e.stack || String(e)).slice(0, 1000)));
vc.on('error', (...a) => console.log('ERR:', a.join(' ').slice(0,500)));
vc.on('warn', (...a) => console.log('WARN:', a.join(' ').slice(0,500)));
vc.on('log', (...a) => console.log('LOG:', a.join(' ').slice(0,500)));

console.log('SIZE:', clean.length);

// 더 직접: JSDOM.fromHTML을 쓰면 더 일반적
try{
  const dom = new JSDOM(clean, { runScripts:'dangerously', virtualConsole: vc, url:'https://freeutilities.pages.dev/' });
  console.log('OK:', !!dom.window);
}catch(e){
  console.log('THROW:', e.message);
}
