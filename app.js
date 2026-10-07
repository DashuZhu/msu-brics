'use strict';
const $ = (s) => document.querySelector(s);
const sourceUrls = ['https://www.fnm.msu.ru/international/mgu-ppi/','https://brics.br/en/about-the-brics/areas-of-cooperation','https://www.gptunnel.ru/ru/about','https://waiwai.is/training/','https://docs.z.ai/guides/overview/quick-start','https://en.smbu.edu.cn/info/1033/1267.htm'];
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
  const title = $('#heroTitle'); title.replaceChildren(document.createTextNode(t.heroCountries[0]),el('br'),el('span',t.heroCountries[1]));
  $('#bridge').replaceChildren(...t.bridge.map(([a,b]) => {const n=el('div');n.append(el('b',a),el('span',b));return n;}));
  $('#topics').replaceChildren(...t.topics.map(([a,b],i) => {const n=el('article',undefined,'topic');n.append(el('span',`0${i+1}`, 'num'),el('h3',a),el('p',b));return n;}));
  $('#companyList').replaceChildren(...t.companies.map(([a,b,c,d])=>{const n=el('article',undefined,'company');n.append(el('h3',a),el('p',b),el('div',c,'status'+(d?' interest':'')));return n;}));
  $('#agenda').replaceChildren(...t.agenda.map(([time,title,place,items,featured],i)=>{
    const n=el('details',undefined,'slot'+(featured?' feature':''));n.dataset.index=String(i);if(i===0)n.id='morning';if(i===5)n.id='afternoon';if(i===10)n.id='evening';n.open=openSlots.has(String(i));
    const summary=el('summary'),head=el('span',title,'slottitle');head.append(el('small',place));const plus=el('span','+','plus');plus.setAttribute('aria-hidden','true');summary.append(el('span',time,'time'),head,plus);
    const body=el('div',undefined,'slotbody'),list=el('ul');list.append(...items.map(s=>el('li',s)));if(featured){
      n.id='ai';body.classList.add('interview');
      body.append(el('p',t.aiLead,'session-lead'),el('h3',t.aiParticipantsLabel));
      const people=el('div',undefined,'speakers');
      t.aiParticipants.forEach(([name,role,bio],j)=>{
        const person=el('article',undefined,'speaker');
        if(j){const frame=el('div',undefined,'portrait '+(j===1?'portrait-left':'portrait-right'));const photo=el('img');photo.src='speakers.png';photo.alt=name;photo.loading='lazy';photo.width=1774;photo.height=887;frame.append(photo);person.append(frame);}
        else {const brand=el('div',undefined,'speaker-brand');brand.append(el('strong','Z.ai'),el('span','GLM'));person.append(brand);}
        person.append(el('h4',name),el('p',role,'speaker-role'),el('p',bio));people.append(person);
      });body.append(people,el('h3',t.aiQuestionsLabel));
      const themes=el('div',undefined,'session-themes');t.focus.forEach(([title,description])=>{const theme=el('article');theme.append(el('h4',title),el('p',description));themes.append(theme);});
      body.append(themes,el('h3',t.aiFormatLabel),el('p',t.aiFormat));
    }else body.append(list);n.append(summary,body);n.addEventListener('toggle',syncExpand);return n;
  }));
  $('#formatBlocks').replaceChildren(...t.formatBlocks.map(([a,b])=>{const n=el('div');n.append(el('h3',a),el('p',b,'muted'));return n;}));
  $('#sources').replaceChildren(...t.sources.map((s,i)=>{const li=el('li'),a=el('a',s);a.href=sourceUrls[i];a.target='_blank';a.rel='noopener noreferrer';li.append(a);return li;}));
  [0,5,10].forEach((index,j)=>{const h=el('h3',t.dayParts[j],'day-heading');$('#agenda').insertBefore(h,$('#agenda').querySelector('[data-index="'+index+'"]'));});
  $('#dayNav').replaceChildren(...t.dayNav.map((label,j)=>{const a=el('a',label);a.href='#'+['morning','afternoon','evening'][j];return a;}));
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
function openAnchor(){if(location.hash==='#ai'){const n=$('#ai');if(n){n.open=true;n.scrollIntoView({block:'start'});}}}
window.addEventListener('hashchange',openAnchor);
document.querySelectorAll('a[href="#ai"]').forEach(a=>a.addEventListener('click',()=>{if($('#ai'))$('#ai').open=true;}));
openAnchor();

const menuButton=$('#menuButton');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));$('#mainNav').classList.toggle('is-open',open);});
document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',()=>{menuButton.setAttribute('aria-expanded','false');$('#mainNav').classList.remove('is-open');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){menuButton.setAttribute('aria-expanded','false');$('#mainNav').classList.remove('is-open');}});
