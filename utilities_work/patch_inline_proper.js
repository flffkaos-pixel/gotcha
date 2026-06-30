// 패치 8: inline IIFE 안 textContent/onclick/onchange 단순 if() 변환 (rolling-back pattern)
// 정확히 한 줄의 (function(){ ... })() 안에서:
//   var dt=document.getElementById("darkToggle");dt.textContent=...;dt.onclick=function(){...};var lt=document.getElementById("langToggle");lt.textContent=...;lt.onclick=function(){...};
//   같은 한 줄이 많다.
//
// 가장 깨끗한 변환:
//   var dt=...;if(dt){dt.textContent=...;dt.onclick=...}   var lt=...;if(lt){lt.textContent=...;lt.onclick=...}
//
// 즉 (function(){ ... })() 내부 contents 를 다시 파싱:
//   splitBySemicolons (단 ; 가 함수 안의 ; 와 inline 의 ; 가 동시에 있을 수 있어 분리가 어렵).
//
// 더 안전한 방법:일단 한 줄의 IIFE body's 모든 var dt= 및 var lt= 의 위치에서 시작해서
// 그 위치에서 다음 ; 까지가 한 변수의 declaration, 다음 scope 는 if() block.
//
// 결국 inline IIFE 처리를 split by '}' OR ';' 가 function(){} 안에서 안쪽일 때.
// 가장 쉬운 휴리스틱:
//   var dt=document.getElementById("darkToggle");   // 한 변수의 끝 = 다음 ; 까지
//   if(dt){...} 안에 dt.textContent=, dt.onclick= 가 있어야 함.
// 따라서 다음 패턴을 정확히 매치하면 된다:
//
//   (function(){var ...var dt=document\.getElementById\(\s*["']darkToggle["']\s*\);(stmt)*?var lt=document\.getElementById\(\s*["']langToggle["']\s*\);(stmt)*?}\)\(\);?
//
//   그 안의 모든 stmt에 <stmt>_CHANGED 를 적용:
//     dt.textContent=...;  -> if(dt)dt.textContent=...;
//     dt.onclick=function(){...}; → if(dt)dt.onclick=function(){...};
//     lt.textContent=...;  -> if(lt)lt.textContent=...;
//     lt.onclick=function(){...} → if(lt)lt.onclick=function(){...};
//
// 단 이렇게 할 때 stmt 가 다른 var 나 if 등 여러 가지가 올 수 있어 var 만 분리는 어려움.
// 즉 inline IIFE 안의 분해는 매우 까다로움.
//
// 다른 접근: We can wrap each occurrence of the form "VAR.textContent=" or "VAR.onclick="
// (where VAR is "dt" or "lt") ... but not inside string. 가장 안전:
//   Regex: (?:^|;|\{)(\s*)([a-zA-Z_]\w*)\.(textContent|onclick|onchange|innerHTML)\s*=\s*([\s\S]*?);(?=\};|\}\)\(\);|;?\})
//   Matches: " dt.textContent = abc;}"
//   But this is too complex given inline IIFE inside.
//
// 결국 단순 전략: line-level patch:
//   한 줄 안에서 "function(){" 가 등장하고 그 줄에 dt/dl_textContent / .onclick / .onchange 가 있으면 그 줄을 if(dt){...} 형이 들어 있도록 line 전체를 if(...) 로 감싸지 않고 그 라인 안 occurrence 각각만 guard.
//
// 가장 쉬운 라인 기반 단일 정공법: 각 occurrence 마다 "(VAR&&(VAR.PROP=... Expr));" 같은 expression 으로 변환하지 않고, if-문으로 감싸기 위해 stmt-with-`;` 그대로 두고 그 stmt 만 if(...) 사용.
//
//     1회 라인 내부 stmt 별로 if(X){...} 변환은 stmt 경계가 무엇인지 모름. inline 안에 function(){...;} 같은게 있으면 ;
//
// 결론: inline IIFE 의 안전한 변환을 완벽히 자동으로 달성하는 건 사실상 인간 수준 분석이 필요. 따라서 패치를 skip 하고,
// 대신 변수가 local null 일 경우 textContent= 호출이 throw 되게 두자. 단 그 throw 가 다른 콘솔 에러로 잡혀도 사용자의 "결과가 안 나옴" 현상은 변하지 않는다.
//
// 따라서 8단계는 abort.

console.log('=== skip ===');
