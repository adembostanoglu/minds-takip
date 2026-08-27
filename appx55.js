// V1.19.4 — İş Takibi: 4 personeli aynı ekranda gösteren kompakt günlük sütunlar; okunaklı punto ve kart içi kaydırma.
(function bootWorksByPersonV194(){
  if(window.__mindsWorksByPersonV194)return;
  window.__mindsWorksByPersonV194=true;

  const ORDER=['umut faruk paroğlu','yusuf ebem','aslı coşkun','imran canbaz'];
  const norm=v=>String(v||'').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g,' ');
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let lastSignature='';

  function rank(name){const n=norm(name);const i=ORDER.findIndex(x=>n.includes(norm(x)));return i<0?999:i;}
  function dateKey(v){const m=String(v||'').match(/(\d{2})\.(\d{2})\.(\d{4})/);return m?`${m[3]}${m[2]}${m[1]}`:'00000000';}

  function installStyle(){
    if(document.getElementById('worksPersonV194Style'))return;
    document.getElementById('worksPersonV193Style')?.remove();
    const s=document.createElement('style');s.id='worksPersonV194Style';s.textContent=`
      #works.works-person-v194 .section-actions{margin-bottom:10px!important}
      #works.works-person-v194 .section-actions h2{font-size:24px!important;letter-spacing:-.4px;margin-bottom:3px}
      #works.works-person-v194 .section-actions p{font-size:12.5px!important;color:#9aa5aa!important}
      #works.works-person-v194>.panel{display:none!important}
      #worksPersonGridV193{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;align-items:stretch;height:calc(100vh - 235px);min-height:540px;max-height:760px}
      .works-person-card-v194{min-width:0;height:100%;border:1px solid #2d373d;border-radius:13px;background:#10161a;overflow:hidden;box-shadow:0 8px 22px rgba(0,0,0,.14);display:flex;flex-direction:column}
      .works-person-head-v194{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 11px;background:linear-gradient(180deg,#171e22,#12181c);border-bottom:1px solid #2b343a;flex:0 0 auto}
      .works-person-name-v194{display:flex;align-items:center;gap:7px;min-width:0;font-size:14px;font-weight:850;color:#f0f3f4;letter-spacing:-.15px}
      .works-person-name-v194>span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .works-person-no-v194{width:23px;height:23px;flex:0 0 23px;display:grid;place-items:center;border-radius:7px;border:1px solid #615b20;background:#292707;color:#eee52b;font-size:10.5px;font-weight:900}
      .works-person-count-v194{font-size:9.5px;color:#a6b0b4;border:1px solid #354047;border-radius:14px;padding:4px 6px;background:#141b1f;white-space:nowrap}
      .works-person-body-v194{min-height:0;overflow-y:auto;overflow-x:hidden;padding:0 8px 10px;scrollbar-width:thin;scrollbar-color:#39444a transparent}
      .works-person-body-v194::-webkit-scrollbar{width:6px}.works-person-body-v194::-webkit-scrollbar-thumb{background:#39444a;border-radius:8px}
      .works-date-block-v194{padding:0 1px 5px}
      .works-date-head-v194{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:6px;margin:0 -1px 6px;padding:10px 1px 6px;background:#10161a;font-size:11.5px;font-weight:850;color:#e5df4a}
      .works-date-head-v194:after{content:'';height:1px;background:#293238;flex:1}
      .works-date-count-v194{color:#879399;font-size:9.5px;font-weight:650;white-space:nowrap}
      .works-job-v194{padding:9px 9px 8px;border:1px solid #283238;border-radius:9px;background:#12191d;margin-bottom:6px}
      .works-job-v194:hover{background:#151d21;border-color:#3a454b}
      .works-job-top-v194{display:flex;align-items:flex-start;justify-content:space-between;gap:7px;margin-bottom:5px}
      .works-firm-v194{min-width:0;font-size:12.5px;font-weight:850;color:#eef2f3;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .works-type-v194{flex:0 0 auto;font-size:9.5px;color:#aeb8bc;font-weight:750;border:1px solid #303b41;border-radius:6px;padding:3px 5px;background:#10161a;white-space:nowrap}
      .works-title-v194{font-size:12px;font-weight:760;color:#e5eaec;line-height:1.3;margin-bottom:6px;overflow-wrap:anywhere}
      .works-title-v194 small{display:inline;margin-left:5px;font-size:9.5px;font-weight:650;color:#87949a}
      .works-status-v194{display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-top:2px}
      .works-status-v194 .badge{font-size:8.5px!important;padding:4px 6px!important;line-height:1.1!important}
      .works-actions-v194{display:flex;gap:5px;justify-content:flex-end;flex-wrap:wrap;margin-top:7px;padding-top:7px;border-top:1px solid #232c31}
      .works-actions-v194:empty{display:none}
      .works-actions-v194 button{font-size:8.5px!important;min-height:27px!important;padding:5px 7px!important}
      .works-empty-v194{padding:22px 12px;color:#7f8b91;font-size:12px;text-align:center}
      @media(max-width:1500px){#worksPersonGridV193{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.works-person-head-v194{padding:10px 9px}.works-person-name-v194{font-size:13px}.works-job-v194{padding:8px}.works-firm-v194{font-size:12px}.works-title-v194{font-size:11.5px}}
      @media(max-width:1180px){#worksPersonGridV193{grid-template-columns:repeat(2,minmax(0,1fr));height:auto;max-height:none}.works-person-card-v194{height:620px}}
      @media(max-width:760px){#worksPersonGridV193{grid-template-columns:1fr}.works-person-card-v194{height:560px}}
    `;document.head.appendChild(s);
  }

  function ensureHost(){
    const section=document.getElementById('works');if(!section)return null;
    section.classList.remove('works-person-v193');section.classList.add('works-person-v194');
    let host=document.getElementById('worksPersonGridV193');
    if(!host){host=document.createElement('div');host.id='worksPersonGridV193';section.querySelector('.panel')?.insertAdjacentElement('afterend',host);}
    return host;
  }

  function rowData(tr){
    const c=tr.cells;if(!c||c.length<8)return null;
    const titleBold=c[1].querySelector('b')?.textContent?.trim()||c[1].textContent.trim();
    const qty=c[1].querySelector('.muted')?.textContent?.trim()||'';
    return {firm:c[0].textContent.trim(),title:titleBold,qty,type:c[2].textContent.trim(),prep:c[3].innerHTML,share:c[4].innerHTML,person:c[5].textContent.trim(),date:c[6].textContent.trim(),actions:c[7].innerHTML};
  }

  function rebuild(){
    const tbody=document.getElementById('workRows'),host=ensureHost();if(!tbody||!host)return;
    const trs=[...tbody.querySelectorAll(':scope > tr')];
    const signature=trs.map(r=>r.textContent.trim()).join('|')+'#'+trs.length;
    if(signature===lastSignature&&host.children.length)return;
    lastSignature=signature;
    const data=trs.map(rowData).filter(Boolean).filter(x=>x.person&&x.person!=='—');
    if(!data.length){host.innerHTML='<div class="works-person-card-v194"><div class="works-empty-v194">Bu ay için iş kaydı bulunmuyor.</div></div>';return;}
    const groups=new Map();
    data.forEach(x=>{if(!groups.has(x.person))groups.set(x.person,[]);groups.get(x.person).push(x);});
    const people=[...groups.keys()].sort((a,b)=>rank(a)-rank(b)||a.localeCompare(b,'tr'));
    host.innerHTML=people.map(person=>{
      const arr=groups.get(person).sort((a,b)=>dateKey(b.date).localeCompare(dateKey(a.date)));
      const dates=[...new Set(arr.map(x=>x.date))];
      const no=rank(person)<999?rank(person)+1:'';
      const blocks=dates.map(date=>{
        const dayJobs=arr.filter(x=>x.date===date);
        const jobs=dayJobs.map(x=>`<div class="works-job-v194"><div class="works-job-top-v194"><div class="works-firm-v194" title="${esc(x.firm)}">${esc(x.firm)}</div><div class="works-type-v194">${esc(x.type)}</div></div><div class="works-title-v194">${esc(x.title)}${x.qty?`<small>${esc(x.qty)}</small>`:''}</div><div class="works-status-v194"><span>${x.prep}</span><span>${x.share}</span></div><div class="works-actions-v194">${x.actions}</div></div>`).join('');
        return `<div class="works-date-block-v194"><div class="works-date-head-v194">${esc(date)} <span class="works-date-count-v194">• ${dayJobs.length} iş</span></div>${jobs}</div>`;
      }).join('');
      return `<section class="works-person-card-v194"><div class="works-person-head-v194"><div class="works-person-name-v194">${no?`<span class="works-person-no-v194">${no}</span>`:''}<span>${esc(person)}</span></div><span class="works-person-count-v194">${arr.length} kayıt</span></div><div class="works-person-body-v194">${blocks}</div></section>`;
    }).join('');
  }

  function apply(){
    if(!document.getElementById('works')?.classList.contains('active-view'))return;
    installStyle();ensureHost();rebuild();
  }

  installStyle();
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="works"]'))setTimeout(apply,80);},true);
  document.getElementById('monthPicker')?.addEventListener('change',()=>{lastSignature='';setTimeout(apply,180);});
  setInterval(apply,900);
})();
