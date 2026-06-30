// playwright-core + 시스템 Edge 로 476개 페이지 헤드리스 실행
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DIR = 'C:\\Users\\중진공39\\utilities_work\\utilities';
const OUT = 'C:\\Users\\중진공39\\utilities_work\\runtime_results.json';

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const ctx = await browser.newContext();
  const all = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));
  const summary = [];

  let i = 0;
  for (const f of all){
    i++;
    const page = await ctx.newPage();
    const errs = [];
    const warns = [];
    const requFailed = [];
    page.on('pageerror', e => errs.push(String(e.stack || e.message || e)));
    page.on('console', m => {
      const t = m.type();
      const txt = m.text();
      if (t === 'error') errs.push('[console.error] ' + txt);
      else if (t === 'warning') warns.push('[console.warn] ' + txt);
    });
    page.on('requestfailed', r => {
      const u = r.url();
      // 우리 crosslinks / 외부 CDN은 실패해도 OK 라 일단 수집만
      requFailed.push(u + ' :: ' + (r.failure() && r.failure().errorText));
    });

    const fileUrl = 'file:///' + path.join(DIR, f).replace(/\\/g, '/');
    try{
      await page.goto(fileUrl, { waitUntil:'domcontentloaded', timeout: 8000 });
    }catch(e){
      errs.push('goto: ' + String(e.message || e));
    }

    // 페이지 navigation 시 콘솔 잃지 않도록 잠시 안정화
    try { await page.waitForLoadState('domcontentloaded', { timeout: 2000 }); } catch(e){}

    // 결과 영역 검출: id에 result/output/answer 가 들어가는 것들 그리고 main 표시 구역
    const before = await page.evaluate(() => {
      const out = {};
      const els = document.querySelectorAll('[id]');
      els.forEach(el => {
        const id = el.id;
        if (/result|output|answer|value|calc|total|preview|count/i.test(id)){
          out[id] = (el.textContent || el.value || el.innerHTML || '').slice(0, 120);
        }
      });
      // 첫 20개 input 의 현재 값도 저장
      out.__inputs__ = Array.from(document.querySelectorAll('input, textarea, select')).slice(0,15).map(i => ({
        id: i.id, name: i.name, type: i.type, value: i.value
      }));
      return out;
    });

    // input 채우고 change/input 이벤트 발생, button click — 각 input의 type/placeholder에 맞춰 의미 있는 값 주입
    try{
      await page.evaluate(() => {
        const set = (el, v) => {
          const proto = Object.getPrototypeOf(el);
          const desc = Object.getOwnPropertyDescriptor(proto, 'value');
          if (desc && desc.set) desc.set.call(el, v); else el.value = v;
          el.dispatchEvent(new Event('input', {bubbles:true}));
          el.dispatchEvent(new Event('change',{bubbles:true}));
        };
        document.querySelectorAll('input, textarea, select').forEach(el => {
          const t = (el.type || '').toLowerCase();
          const ph = (el.placeholder || '').toLowerCase();
          const name = (el.name || el.id || '').toLowerCase();
          const tag = el.tagName;
          if (tag === 'SELECT') { if (el.options.length > 1) { el.selectedIndex = Math.min(1, el.options.length-1); el.dispatchEvent(new Event('change',{bubbles:true})); } return; }
          if (['checkbox','radio'].includes(t)) return;
          if (['file','color','range','submit','button','reset','image','hidden'].includes(t)) return;
          if (t === 'number') {
            // 맥락별 디폴트
            if (/(height|cm|키|tall)/i.test(name+ph)) set(el, '170');
            else if (/(weight|kg|몸무게|kg)/i.test(name+ph)) set(el, '70');
            else if (/(age|나이|년)/i.test(name+ph)) set(el, '30');
            else if (/(year|연도|year)/i.test(name+ph)) set(el, '5');
            else if (/(temp|온도)/i.test(name+ph)) set(el, '25');
            else if (/(rate|percent|%|이자율|퍼센트)/i.test(name+ph)) set(el, '5');
            else if (/(price|amount|price|금액|원|price|price|won|price)/i.test(name+ph)) set(el, '100000');
            else set(el, '10');
            return;
          }
          if (t === 'date') { set(el, '2000-01-01'); return; }
          if (t === 'time') { set(el, '12:00'); return; }
          if (t === 'email') { set(el, 'a@b.com'); return; }
          if (t === 'tel') { set(el, '01012345678'); return; }
          if (t === 'url') { set(el, 'https://example.com'); return; }
          if (t === 'password') { set(el, 'Test1234!'); return; }
          if (tag === 'TEXTAREA') { set(el, 'test'); return; }
          set(el, 'test');
        });
        // 첫 5개 button 클릭
        Array.from(document.querySelectorAll('button, [type=button], [type=submit]')).slice(0,5)
          .forEach(b => { try { b.click(); } catch(e){} });
      });
      await page.waitForTimeout(150);
    }catch(e){
      errs.push('interact: ' + String(e.message || e));
    }

    const after = await page.evaluate(() => {
      const out = {};
      const els = document.querySelectorAll('[id]');
      els.forEach(el => {
        const id = el.id;
        if (/result|output|answer|value|calc|total|preview|count/i.test(id)){
          out[id] = (el.textContent || el.value || el.innerHTML || '').slice(0, 120);
        }
      });
      // 페이지에 보이는 텍스트 본문도 수집 (혹시 결과가 일반 div 에 들어가는 경우)
      const main = document.querySelector('main');
      out.__main__ = main ? (main.textContent || '').trim().slice(0, 300) : '';
      return out;
    });

    // 변화 추적: before와 after 의 result/output/answer 키 중 값이 달라진 것이 있는지
    let changed = [];
    for (const k of Object.keys(after)){
      if (k.startsWith('__')) continue;
      if ((before[k] || '') !== (after[k] || '') && (after[k]||'').length > 0) changed.push(k);
    }

    summary.push({
      file: f, errors: errs.slice(0,8), warns: warns.slice(0,3),
      changedKeys: changed,
      hasMainContent: (after.__main__||'').length > 30,
      mainSample: (after.__main__||'').slice(0, 200),
    });
    await page.close();
    if (i % 50 === 0) console.error('progress ' + i + '/' + all.length);
  }

  fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));
  console.log('TOTAL', summary.length);
  const broken = summary.filter(s => (s.errors && s.errors.length) || (!s.hasMainContent) || (s.changedKeys.length === 0));
  console.log('BROKEN:', broken.length);
  console.log('--- first 30 broken ---');
  for (const b of broken.slice(0, 30)) console.log(b.file, '| errs=' + b.errors.length, '| changed=' + b.changedKeys.length, '| main=' + b.hasMainContent);
  await browser.close();
})();
