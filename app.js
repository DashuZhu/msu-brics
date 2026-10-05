'use strict';
const $ = (s) => document.querySelector(s);
const sourceUrls = ['https://www.fnm.msu.ru/international/mgu-ppi/','https://brics.br/en/about-the-brics/areas-of-cooperation','https://www.gptunnel.ru/ru'];
let language = 'ru';
function el(tag, text, className) { const n = document.createElement(tag); if(text !== undefined) n.textContent = text; if(className) n.className = className; return n; }
function render(lang) {
  if (!CONTENT[lang]) lang = 'ru';
  const openSlots = new Set([...document.querySelectorAll('.slot[open]')].map(n => n.dataset.index));
  language = lang; const t = CONTENT[lang];
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  document.title = t.title;
  $('meta[name="description"]').content = t.description;
  document.querySelectorAll('[data-t]').forEach(n => { n.textContent = t[n.dataset.t] || ''; });
  document.querySelectorAll('[data-lang]').forEach(n => n.setAttribute('aria-pressed', String(n.dataset.lang === lang)));
  $('nav').setAttribute('aria-label',t.navLabel);
  $('#brand').replaceChildren(document.createTextNode(t.brand),el('small',t.brandSub));
  const title = $('#heroTitle'); title.replaceChildren(document.createTextNode(t.heroCountries[0]),el('br'),el('span','× ' + t.heroCountries[1]));
  $('#bridge').replaceChildren(...t.bridge.map(([a,b]) => {const n=el('div');n.append(el('b',a),el('span',b));return n;}));
  $('#topics').replaceChildren(...t.topics.map(([a,b],i) => {const n=el('article',undefined,'topic');n.append(el('span',`0${i+1}`, 'num'),el('h3',a),el('p',b));return n;}));
  $('#companyList').replaceChildren(...t.companies.map(([a,b,c,d])=>{const n=el('article',undefined,'company');n.append(el('h3',a),el('p',b),el('div',c,'status'+(d?' interest':'')));return n;}));
  $('#focusList').replaceChildren(...t.focus.map(([a,b],i)=>{const n=el('article',undefined,'focusrow'),body=el('div');body.append(el('h3',a),el('p',b));n.append(el('span',`0${i+1}`),body);return n;}));
  $('#steps').replaceChildren(...t.steps.map(s=>el('span',s)));
  $('#agenda').replaceChildren(...t.agenda.map(([time,title,place,items,featured],i)=>{
    const n=el('details',undefined,'slot'+(featured?' feature':''));n.dataset.index=String(i);n.open=openSlots.has(String(i));
    const summary=el('summary'),head=el('span',title,'slottitle');head.append(el('small',place));const plus=el('span','+','plus');plus.setAttribute('aria-hidden','true');summary.append(el('span',time,'time'),head,plus);
    const body=el('div',undefined,'slotbody'),list=el('ul');list.append(...items.map(s=>el('li',s)));body.append(list);n.append(summary,body);n.addEventListener('toggle',syncExpand);return n;
  }));
  $('#formatBlocks').replaceChildren(...t.formatBlocks.map(([a,b])=>{const n=el('div');n.append(el('h3',a),el('p',b,'muted'));return n;}));
  $('#sources').replaceChildren(...t.sources.map((s,i)=>{const li=el('li'),a=el('a',s);a.href=sourceUrls[i];a.target='_blank';a.rel='noopener noreferrer';li.append(a);return li;}));
  syncExpand();
  try{localStorage.setItem('msu-brics-language',lang);}catch{}
}
function syncExpand(){const all=[...document.querySelectorAll('.slot')];const expanded=all.length>0&&all.every(n=>n.open);$('#expand').textContent=CONTENT[language][expanded?'collapse':'expand'];$('#expand').setAttribute('aria-expanded',String(expanded));}
document.querySelectorAll('[data-lang]').forEach(n=>n.addEventListener('click',()=>{render(n.dataset.lang);const u=new URL(location.href);u.searchParams.set('lang',n.dataset.lang);history.replaceState(null,'',u);}));
$('#expand').addEventListener('click',()=>{const target=$('#expand').getAttribute('aria-expanded')!=='true';document.querySelectorAll('.slot').forEach(n=>n.open=target);syncExpand();});
function icsEscape(s){return s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
function foldLine(line){const encoder=new TextEncoder();let out='',part='',bytes=0;for(const c of line){const size=encoder.encode(c).length;if(bytes+size>73){out+=part+'\r\n ';part='';bytes=1;}part+=c;bytes+=size;}return out+part;}
$('#calendar').addEventListener('click',()=>{
 const t=CONTENT[language];const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MSU BRICS Business Day//2026//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:business-day-20261122@msu-brics.ru','DTSTAMP:20261005T000000Z','DTSTART;VALUE=DATE:20261122','DTEND;VALUE=DATE:20261123','SUMMARY:'+icsEscape(t.calendarTitle),'LOCATION:'+icsEscape(t.location),'DESCRIPTION:'+icsEscape(t.calendarDescription),'STATUS:TENTATIVE','END:VEVENT','END:VCALENDAR'];
 const url=URL.createObjectURL(new Blob([lines.map(foldLine).join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));const a=el('a');a.href=url;a.download='msu-brics-2026-11-22.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
let preferred=new URL(location.href).searchParams.get('lang');if(!preferred){try{preferred=localStorage.getItem('msu-brics-language');}catch{}}
render(preferred || 'ru');
