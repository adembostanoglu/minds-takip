// V1.19.3 — İş Takibi: personel bazlı, gün gün okunaklı görünüm ve büyük puntolar.
(function bootWorksByPersonV193(){
  if(window.__mindsWorksByPersonV193)return;
  window.__mindsWorksByPersonV193=true;

  const ORDER=['umut faruk paroğlu','yusuf ebem','aslı coşkun','imran canbaz'];
  const norm=v=>String(v||'').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g,' ');
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let lastSignature='';

  function rank(name){const n=norm(name);const i=ORDER.findIndex(x=>n.includes(norm(x)));return i<0?999:i;}
  function dateKey(v){const m=String(v||'').match(/(\d{2})\.(\d{2})\.(\d{4})/);return m?`${m[3]}${m[2]}${m[1]}`:'00000000';}

  function installStyle(){
    if(document.getElementById('worksPersonV193Style'))return;
    const s=document.createElement('style');s.id='worksPersonV193Style';s.textContent=`
      #works.works-person-v193 .section-actions h2{font-size:28px!important;letter-spacing:-.5px;margin-bottom:5px}
      #works.works-person-v193 .section-actions p{font-size:13px!important;color:#9aa5aa!important}
      #works.works-person-v193>.panel{display:none!important}
      #worksPersonGridV193{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start}
      .works-person-card-v193{border:1px solid #2d373d;border-radius:15px;background:#10161a;overflow:hidden;box-shadow:0 10px 28px rgba(0,0,0,.16)}
      .works-person-head-v193{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;background:linear-gradient(180deg,#171e22,#12181c);border-bottom:1px solid #2b343a}
      .works-person-name-v193{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:850;color:#f0f3f4;letter-spacing:-.25px}
      .works-person-no-v193{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;border:1px solid #615b20;background:#292707;color:#eee52b;font-size:12px;font-weight:900}
      .works-person-count-v193{font-size:11px;color:#a6b0b4;border:1px solid #354047;border-radius:16px;padding:6px 9px;background:#141b1f;white-space:nowrap}
      .works-date-block-v193{padding:0 16px 15px}
      .works-date-head-v193{display:flex;align-items:center;gap:8px;margin:15px 0 9px;font-size:13px;font-weight:850;color:#e5df4a}
      .works-date-head-v193:after{content:'';height:1px;background:#293238;flex:1}
      .works-job-v193{display:grid;grid-template-columns:minmax(150px,.9fr) minmax(180px,1.25fr) minmax(110px,.65fr) minmax(125px,.75fr) auto;gap:12px;align-items:center;padding:13px 12px;border:1px solid #283238;border-radius:11px;background:#12191d;margin-bottom:8px}
      .works-job-v193:hover{background:#151d21;border-color:#3a454b}
      .works-firm-v193{font-size:13px;font-weight:800;color:#eef2f3;line-height:1.35}
      .works-title-v193{font-size:14px;font-weight:800;color:#f2f4f5;line-height:1.35}
      .works-title-v193 small{display:block;margin-top:4px;font-size:11px;font-weight:600;color:#8e9aa0}
      .works-type-v193{font-size:12px;color:#c9d0d3;font-weight:700}
      .works-status-v193{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
      .works-status-v193 .badge{font-size:10.5px!important;padding:6px 8px!important}
      .works-actions-v193{display:flex;gap:7px;justify-content:flex-end;flex-wrap:wrap}
      .works-actions-v193 button{font-size:10.5px!important;min-height:32px!important;padding:7px 10px!important}
      .works-empty-v193{padding:24px 18px;color:#7f8b91;font-size:13px;text-align:center}
      @media(max-width:1380px){#worksPersonGridV193{grid-template-columns:1fr}.works-job-v193{grid-template-columns:minmax(150px,.9fr) minmax(190px,1.2fr) 110px 160px auto}}
      @media(max-width:900px){.works-job-v193{grid-template-columns:1fr 1fr}.works-actions-v193{justify-content:flex-start}.works-status-v193,.works-actions-v193{grid-column:1/-1}}
    `;document.head.appendChild(s);
  }

  function ensureHost(){
    const section=document.getElementById('works');if(!section)return null;
    section.classList.add('works-person-v193');
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
    if(!data.length){host.innerHTML='<div class="works-person-card-v193"><div class="works-empty-v193">Bu ay için iş kaydı bulunmuyor.</div></div>';return;}
    const groups=new Map();
    data.forEach(x=>{if(!groups.has(x.person))groups.set(x.person,[]);groups.get(x.person).push(x);});
    const people=[...groups.keys()].sort((a,b)=>rank(a)-rank(b)||a.localeCompare(b,'tr'));
    host.innerHTML=people.map(person=>{
      const arr=groups.get(person).sort((a,b)=>dateKey(b.date).localeCompare(dateKey(a.date)));
      const dates=[...new Set(arr.map(x=>x.date))];
      const no=rank(person)<999?rank(person)+1:'';
      const blocks=dates.map(date=>{
        const jobs=arr.filter(x=>x.date===date).map(x=>`<div class="works-job-v193"><div class="works-firm-v193">${esc(x.firm)}</div><div class="works-title-v193">${esc(x.title)}${x.qty?`<small>${esc(x.qty)}</small>`:''}</div><div class="works-type-v193">${esc(x.type)}</div><div class="works-status-v193"><span>${x.prep}</span><span>${x.share}</span></div><div class="works-actions-v193">${x.actions}</div></div>`).join('');
        return `<div class="works-date-block-v193"><div class="works-date-head-v193">${esc(date)} <span style="color:#7f8c92;font-size:11px;font-weight:650">• ${arr.filter(x=>x.date===date).length} iş</span></div>${jobs}</div>`;
      }).join('');
      return `<section class="works-person-card-v193"><div class="works-person-head-v193"><div class="works-person-name-v193">${no?`<span class="works-person-no-v193">${no}</span>`:''}<span>${esc(person)}</span></div><span class="works-person-count-v193">${arr.length} kayıt</span></div>${blocks}</section>`;
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
