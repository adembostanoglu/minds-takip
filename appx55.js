// V1.22.8 — İş Takibi: gruplu görünüm artık gizli tablo DOM'undan değil doğrudan state verisinden üretilir.
(function bootWorksByPersonV228(){
  if(window.__mindsWorksByPersonV228)return;
  window.__mindsWorksByPersonV228=true;

  const ORDER=['umut faruk paroğlu','yusuf ebem','aslı coşkun','imran canbaz'];
  const norm=v=>String(v||'').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g,' ');
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
  const qty=w=>{const n=Number(w?.quantity??1);return Number.isFinite(n)&&n>0?Math.max(1,Math.trunc(n)):1;};
  let lastSignature='';

  function rank(name){const n=norm(name);const i=ORDER.findIndex(x=>n.includes(norm(x)));return i<0?999:i;}
  function dateKey(v){const s=String(v||'').slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(s)?s.replaceAll('-',''):'00000000';}
  function visibleWorks(){
    if(typeof state==='undefined'||!Array.isArray(state.works)||!Array.isArray(state.months))return [];
    const monthIds=new Set(state.months.filter(m=>m.month===selectedMonth).map(m=>m.id));
    return state.works.filter(w=>monthIds.has(w.firm_month_id)&&(typeof isAdmin==='function'&&isAdmin()||typeof staffOwnWork==='function'&&staffOwnWork(w)));
  }
  function firmNameFor(w){
    const fm=state.months.find(m=>m.id===w.firm_month_id);
    const f=fm?state.firms.find(x=>x.id===fm.firm_id):null;
    return f?.name||'—';
  }
  function personNameFor(w){return state.profiles.find(p=>p.id===w.assigned_to)?.full_name||'—';}
  function statusHtml(w){
    const prep=typeof workStatusLabel==='function'?workStatusLabel(w.status):w.status;
    const share=typeof shareLabel==='function'?shareLabel(w.share_status):w.share_status;
    return `<span class="badge yellow">${esc(prep)}</span><span class="badge ${w.share_status==='paylasildi'?'green':'orange'}">${esc(share)}</span>`;
  }

  function installStyle(){
    if(document.getElementById('worksPersonV228Style'))return;
    ['worksPersonV193Style','worksPersonV194Style','worksPersonV196Style'].forEach(id=>document.getElementById(id)?.remove());
    const s=document.createElement('style');s.id='worksPersonV228Style';s.textContent=`
      #works.works-person-v228 .section-actions{margin-bottom:10px!important}
      #works.works-person-v228 .section-actions h2{font-size:24px!important;letter-spacing:-.4px;margin-bottom:3px}
      #works.works-person-v228 .section-actions p{font-size:12.5px!important;color:#9aa5aa!important}
      #works.works-person-v228>.panel{display:none!important}
      #worksPersonGridV228{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;align-items:stretch;height:calc(100vh - 235px);min-height:540px;max-height:760px}
      .works-person-card-v228{min-width:0;height:100%;border:1px solid #2d373d;border-radius:13px;background:#10161a;overflow:hidden;box-shadow:0 8px 22px rgba(0,0,0,.14);display:flex;flex-direction:column}
      .works-person-head-v228{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px;background:linear-gradient(180deg,#171e22,#12181c);border-bottom:1px solid #2b343a;flex:0 0 auto}
      .works-person-name-v228{display:flex;align-items:center;gap:7px;min-width:0;font-size:14px;font-weight:850;color:#f0f3f4;letter-spacing:-.15px}
      .works-person-name-v228>span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .works-person-no-v228{width:23px;height:23px;flex:0 0 23px;display:grid;place-items:center;border-radius:7px;border:1px solid #615b20;background:#292707;color:#eee52b;font-size:10.5px;font-weight:900}
      .works-person-count-v228{font-size:9.5px;color:#a6b0b4;border:1px solid #354047;border-radius:14px;padding:4px 6px;background:#141b1f;white-space:nowrap}
      .works-person-body-v228{min-height:0;overflow-y:auto;overflow-x:hidden;padding:0 8px 10px;scrollbar-width:thin;scrollbar-color:#39444a transparent}
      .works-person-body-v228::-webkit-scrollbar{width:6px}.works-person-body-v228::-webkit-scrollbar-thumb{background:#39444a;border-radius:8px}
      .works-date-block-v228{padding:0 1px 5px}
      .works-date-head-v228{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:6px;margin:0 -1px 6px;padding:10px 1px 6px;background:#10161a;font-size:11.5px;font-weight:850;color:#e5df4a}
      .works-date-head-v228:after{content:'';height:1px;background:#293238;flex:1}.works-date-count-v228{color:#879399;font-size:9.5px;font-weight:650;white-space:nowrap}
      .works-job-v228{padding:9px 9px 8px;border:1px solid #283238;border-radius:9px;background:#12191d;margin-bottom:6px}.works-job-v228:hover{background:#151d21;border-color:#3a454b}
      .works-job-top-v228{display:flex;align-items:flex-start;justify-content:space-between;gap:7px;margin-bottom:5px}.works-job-main-v228{display:flex;align-items:flex-start;gap:7px;min-width:0;flex:1}
      .works-job-index-v228{width:25px;height:25px;flex:0 0 25px;display:grid;place-items:center;border:1px solid #5c5720;border-radius:7px;background:#252407;color:#eee52b;font-size:9.5px;font-weight:900;line-height:1}
      .works-firm-v228{min-width:0;font-size:12.5px;font-weight:850;color:#eef2f3;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-top:4px}
      .works-type-v228{flex:0 0 auto;font-size:9.5px;color:#aeb8bc;font-weight:750;border:1px solid #303b41;border-radius:6px;padding:3px 5px;background:#10161a;white-space:nowrap}
      .works-title-v228{font-size:12px;font-weight:760;color:#e5eaec;line-height:1.3;margin:0 0 6px 32px;overflow-wrap:anywhere}.works-title-v228 small{display:inline;margin-left:5px;font-size:9.5px;font-weight:650;color:#87949a}
      .works-status-v228{display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin:2px 0 0 32px}.works-status-v228 .badge{font-size:8.5px!important;padding:4px 6px!important;line-height:1.1!important}
      .works-actions-v228{display:flex;gap:5px;justify-content:flex-end;flex-wrap:wrap;margin-top:7px;padding-top:7px;border-top:1px solid #232c31}.works-actions-v228:empty{display:none}.works-actions-v228 button{font-size:8.5px!important;min-height:27px!important;padding:5px 7px!important}
      .works-empty-v228{padding:22px 12px;color:#7f8b91;font-size:12px;text-align:center}
      @media(max-width:1500px){#worksPersonGridV228{gap:8px}.works-person-head-v228{padding:10px 9px}.works-person-name-v228{font-size:13px}.works-job-v228{padding:8px}.works-firm-v228{font-size:12px}.works-title-v228{font-size:11.5px}}
      @media(max-width:1180px){#worksPersonGridV228{grid-template-columns:repeat(2,minmax(0,1fr));height:auto;max-height:none}.works-person-card-v228{height:620px}}
      @media(max-width:760px){#worksPersonGridV228{grid-template-columns:1fr}.works-person-card-v228{height:560px}}
    `;document.head.appendChild(s);
  }

  function ensureHost(){
    const section=document.getElementById('works');if(!section)return null;
    section.classList.remove('works-person-v193','works-person-v194');section.classList.add('works-person-v228');
    document.getElementById('worksPersonGridV193')?.remove();
    let host=document.getElementById('worksPersonGridV228');
    if(!host){host=document.createElement('div');host.id='worksPersonGridV228';section.querySelector('.panel')?.insertAdjacentElement('afterend',host);}
    return host;
  }

  function rebuild(force=false){
    const host=ensureHost();if(!host)return;
    const rows=visibleWorks().filter(w=>w.assigned_to&&personNameFor(w)!=='—');
    const signature=[selectedMonth,...rows.map(w=>[w.id,w.updated_at,w.assigned_to,w.status,w.share_status,w.quantity,w.work_date].join(':'))].join('|');
    if(!force&&signature===lastSignature&&host.children.length)return;
    lastSignature=signature;

    let people=(state.profiles||[]).filter(p=>p.active&&p.role!=='admin').sort((a,b)=>rank(a.full_name)-rank(b.full_name)||a.full_name.localeCompare(b.full_name,'tr'));
    if(!(typeof isAdmin==='function'&&isAdmin())){
      const ids=new Set(rows.map(w=>w.assigned_to));if(profile?.id)ids.add(profile.id);people=people.filter(p=>ids.has(p.id));
    }
    if(!people.length){host.innerHTML='<div class="works-person-card-v228"><div class="works-empty-v228">Bu ay için iş kaydı bulunmuyor.</div></div>';return;}

    host.innerHTML=people.map(p=>{
      const arr=rows.filter(w=>w.assigned_to===p.id).sort((a,b)=>dateKey(b.work_date).localeCompare(dateKey(a.work_date))||String(b.created_at||'').localeCompare(String(a.created_at||'')));
      const dates=[...new Set(arr.map(w=>w.work_date))];
      let seq=0;
      const blocks=dates.map(date=>{
        const dayJobs=arr.filter(w=>w.work_date===date);
        const jobs=dayJobs.map(w=>{
          seq+=1;const jobNo=String(seq).padStart(2,'0'),q=qty(w),type=typeof typeLabel==='function'?typeLabel(w.type):w.type;
          const actions=(typeof staffOwnWork==='function'&&staffOwnWork(w))?`<button class="small-primary" data-edit-work="${w.id}">Güncelle</button>`:'';
          return `<div class="works-job-v228" data-work-id="${w.id}"><div class="works-job-top-v228"><div class="works-job-main-v228"><span class="works-job-index-v228">${jobNo}</span><div class="works-firm-v228" title="${esc(firmNameFor(w))}">${esc(firmNameFor(w))}</div></div><div class="works-type-v228">${esc(type)}</div></div><div class="works-title-v228">${esc(w.title||'İş')}${q>1?`<small>${q} adet</small>`:''}</div><div class="works-status-v228">${statusHtml(w)}</div><div class="works-actions-v228">${actions}</div></div>`;
        }).join('');
        const label=typeof formatDate==='function'?formatDate(date):date;
        return `<div class="works-date-block-v228"><div class="works-date-head-v228">${esc(label)} <span class="works-date-count-v228">• ${dayJobs.length} iş</span></div>${jobs}</div>`;
      }).join('');
      const no=rank(p.full_name)<999?rank(p.full_name)+1:'';
      return `<section class="works-person-card-v228" data-person-id="${p.id}"><div class="works-person-head-v228"><div class="works-person-name-v228">${no?`<span class="works-person-no-v228">${no}</span>`:''}<span>${esc(p.full_name)}</span></div><span class="works-person-count-v228">${arr.length} kayıt</span></div><div class="works-person-body-v228">${blocks||'<div class="works-empty-v228">Bu ay kayıt yok.</div>'}</div></section>`;
    }).join('');
  }

  function apply(force=false){
    if(!document.getElementById('works')?.classList.contains('active-view'))return;
    installStyle();rebuild(force);
  }

  installStyle();
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="works"]'))setTimeout(()=>apply(true),90);},true);
  document.getElementById('monthPicker')?.addEventListener('change',()=>{lastSignature='';setTimeout(()=>apply(true),160);});

  if(typeof renderAll==='function'&&!renderAll.__mindsWorksByPersonV228){
    const previousRenderAll=renderAll;
    const wrapped=function(){const out=previousRenderAll.apply(this,arguments);setTimeout(()=>apply(true),0);return out;};
    wrapped.__mindsWorksByPersonV228=true;
    try{renderAll=wrapped;}catch(_e){}
  }

  [100,350,900].forEach(ms=>setTimeout(()=>apply(true),ms));
})();