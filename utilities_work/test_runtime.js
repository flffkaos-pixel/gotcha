// JSDOM + 외부 라이브러리 mock 기반 런타임 테스트
// 1) HTML을 불러와 JSDOM에 띄움 (외부 src CDN은 로드 안 함)
// 2) inline <script> 본문 실행, 단 외부 라이브러리 함수(JsBarcode, jsPDF, html2canvas, Chart, QRCode, JSZip, pdfjsLib, html5QrCode 등)는
//    window에 stub을 미리 주입. 그러면 페이지 스크립트가 그걸 참조해도 죽지 않음.
// 3) 페이지가 살아있는 동안 console.error / throw 잡고
//    input에 값을 채워 "버튼 onclick" / change / submit 등을 호출해 봤을 때
//    결과 DOM 영역이 채워지는지 확인.
// 페이지에서 페이지의 "본래 의도 동작"을 정의해서 그 결과를 검증.

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const DIR = 'C:\\Users\\중진공39\\utilities_work\\utilities';

const LIB_STUBS = `
window.JsBarcode = function(canvasEl, text, opts){ try{ canvasEl && (canvasEl.textContent = String(text||'')); }catch(e){} };
window.QRCode = { toCanvas: (el, text, cb)=>{ try{ el && (el.textContent = String(text||'')); cb && cb(); }catch(e){ cb && cb(e);} }, toDataURL: (t)=> 'data:image/png;base64,'};
window.qrcode = { generateCanvas: (el, text)=>{ try{ el && (el.textContent = String(text||'')); }catch(e){} }, generate: ()=>{} };
window.Chart = function(){}; window.HTML5QrCode = function(){}; window.Html5Qrcode = function(){};
window.html2canvas = async ()=>({});
window.jspdf = { jsPDF: function(){ this.addImage=()=>{}; this.save=()=>{}; this.text=()=>{}; this.rect=()=>{}; this.output=()=>''; this.internal={}; }, };
window.jsPDF = window.jspdf.jsPDF;
window.JSZip = function(){ this.file=()=>this; this.generateAsync=async ()=>new ArrayBuffer(0); };
window.pdfjsLib = { getDocument: ()=>({ promise: Promise.resolve({ numPages: 1, getPage: async()=>({ getTextContent:()=>({items:[{str:'stub'}]}), getViewport:()=>({})}) }) }), GlobalWorkerOptions:{workerSrc:''} };
window.Tesseract={recognize:async()=>({data:{text:'stub'}})};
window.morph={}; window.Tone={}; window.Papa={parse:()=>({data:[]})};
window.CryptoJS={SHA256:(s)=>'h('+s+')',AES:{encrypt:(s)=>'enc('+s+')',decrypt:(s)=>'dec('+s+')'}};
window.marked={parse:(s)=>s}; window.DOMPurify={sanitize:(s)=>s};
window.Sortable=function(){}; window.Swiper=function(){}; window.AOS={init:()=>{}};
window.hljs={highlightAll:()=>{},highlightElement:()=>{}};
window.Prism={highlightAll:()=>{}};
window.ClipboardItem=function(){}; window.Clipboard={writeText:async()=>{}};
window.navigator.clipboard={writeText:async()=>{},read:async()=>({getData:async()=>''}),readText:async()=>''};
window.createImageBitmap=async ()=>({});
window.Image=function(){this.set onload(fn){setTimeout(fn,0)};this.set src(v){this._s=v}};
window.Audio=function(){this.play=()=>{};this.pause=()=>{}};
window.Hammer=function(){}; window.Tooltip=function(){}; window.tippy=()=>{};
window.choices=function(){}; window.tagify=function(){}; window.flatpickr=function(){this.setDate=()=>{}};
window.Swal=window.sweetAlert={fire:()=>Promise.resolve({}),mixin:()=>({})};
window.Toastify=function(){this.showToast=()=>{}}; window.toast={success:()=>{},error:()=>{}};
window.kakao={init:()=>{},isInitialized:()=>true,Share:{sendDefault:()=>Promise.resolve({})}};
window.Kakao=window.kakao;
window.naver={}; window.Naver={};
window.gtag=()=>{}; window.fbq=()=>{};
window.Sentry={init:()=>{},captureException:()=>{}};
window.amplitude={init:()=>{},track:()=>{}}; window.mixpanel={track:()=>{}};
window.Superhuman={init:()=>{}}; window.Lottie={loadAnimation:()=>({play:()=>{},stop:()=>{},destroy:()=>{}})};
window.mediumZoom=()=>({}); window.lightense=()=>({});
window.Vue={createApp:()=>({})}; window.React={createElement:()=>{}}; window.jQuery=window.$={};
window.axios={get:async()=>({data:{}}),post:async()=>({data:{}}),put:async()=>({data:{}})};
window.GTranslateRun=()=>{};
`;

function stripExternalScripts(html){
  // src 가 외부CDN인 <script>는 제거 (JSDOM은 fetch 안 함). crosslinks도 같이 제거.
  return html.replace(/<script\b[^>]*\bsrc\s*=[^>]*><\/script>/gi, '');
}

async function testFile(file){
  const html = fs.readFileSync(path.join(DIR, file), 'utf-8');
  const clean = stripExternalScripts(html);

  const errors = [];
  const warns  = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push({ kind:'jsdomError', detail: (e && e.stack || String(e)).slice(0, 400) }));
  vc.on('error', (...a)=>errors.push({kind:'error', detail: a.map(String).join(' ').slice(0,400)}));
  vc.on('warn',  (...a)=>warns.push(a.map(String).join(' ').slice(0,200)));

  let dom;
  try{
    dom = new JSDOM(`<!DOCTYPE html><html><head><script>${LIB_STUBS}</script></head><body></body></html>`, { runScripts:'dangerously', virtualConsole: vc, url:'https://freeutilities.pages.dev/' });
  }catch(e){ return { file, errors:[{kind:'init', detail:String(e)}] }; }

  // mock 추가 라이브러리/메서드
  dom.window.HTMLCanvasElement.prototype.getContext = function(){
    const ctx = new Proxy({}, { get: () => () => 0, set: () => true });
    return ctx;
  };
  dom.window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
  dom.window.URL.createObjectURL = () => 'blob:stub';
  dom.window.URL.revokeObjectURL = () => {};

  // HTML 본문 주입: lib stubs 뒤에
  try{
    const body = clean.replace(/^[\s\S]*?<html[^>]*>/i, '').replace(/<\/html>[\s\S]*$/i, '');
    // 헤더에 stub script를 추가해서 먼저 실행되게 함 — 이미 dom 안에 stub 있으니 그대로 innerHTML로 body를 넣자.
    dom.window.document.documentElement.innerHTML = body;
  }catch(e){
    errors.push({kind:'inject', detail:String(e)});
  }

  // 살짝 동기 대기 (setImmediate 등)
  await new Promise(r => setTimeout(r, 50));

  // 발견된 input/button 들
  const doc = dom.window.document;
  const inputs = Array.from(doc.querySelectorAll('input, textarea, select')).slice(0, 10);
  const buttons = Array.from(doc.querySelectorAll('button, input[type=button], input[type=submit]')).slice(0, 10);
  const resultEls = Array.from(doc.querySelectorAll('[id*=result],[id*=Result],[id*=output],[id*=Output],[id*=answer],[id*=Answer]')).slice(0, 5);

  // 첫 번째 input에 값 넣고, 첫 번째 버튼 클릭해보기
  const beforeResults = resultEls.map(e => e.textContent.trim());
  try{
    for(const i of inputs){
      if(i.type === 'checkbox' || i.type === 'radio') continue;
      const tag = (i.tagName||'').toLowerCase();
      if(tag === 'input' && ['file','color','range'].includes(i.type)) continue;
      try{ i.value = tag === 'number' ? '10' : 'test123'; i.dispatchEvent(new dom.window.Event('input',{bubbles:true})); }catch{}
      try{ i.dispatchEvent(new dom.window.Event('change',{bubbles:true})); }catch{}
    }
    for(const b of buttons){
      try{ b.click(); }catch{}
    }
  }catch(e){
    errors.push({kind:'sim', detail:String(e).slice(0,300)});
  }

  await new Promise(r => setTimeout(r, 50));

  const afterResults = resultEls.map(e => e.textContent.trim());
  const resultChanged = afterResults.some((v, idx) => v !== beforeResults[idx] && v.length > 0);

  return {
    file,
    errors,
    warnCount: warns.length,
    inputsFound: inputs.length,
    buttonsFound: buttons.length,
    resultElements: resultEls.length,
    resultChanged,
    beforeResults,
    afterResults,
  };
}

(async () => {
  const all = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));
  // 우선 한 번에 적당량만 돌려보자
  const summary = [];
  let i = 0;
  for (const f of all){
    i++;
    let r;
    try { r = await testFile(f); } catch(e){ summary.push({file:f, fatal:String(e)}); continue; }
    summary.push(r);
    if (i % 50 === 0) console.error(`progress ${i}/${all.length}`);
  }

  // 요약
  const withErrors = summary.filter(s => s.errors && s.errors.length);
  const noResultChange = summary.filter(s => !s.resultChanged);

  fs.writeFileSync('C:\\Users\\중진공39\\utilities_work\\runtime_test.json', JSON.stringify(summary, null, 2));
  console.log('TOTAL', summary.length);
  console.log('WITH_RUNTIME_ERRORS', withErrors.length);
  console.log('NO_RESULT_CHANGE', noResultChange.length);

  console.log('\n--- runtime errors (top 30) ---');
  for (const s of withErrors.slice(0, 30)){
    console.log(`${s.file}: ${s.errors.map(e => e.kind+':'+ (e.detail||'').split('\n')[0]).slice(0,2).join(' | ')}`);
  }

  console.log('\n--- no result change (sample 30) ---');
  for (const s of noResultChange.slice(0, 30)) console.log(s.file);
})();
