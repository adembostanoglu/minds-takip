// V1.17.8 — Günlük Hareketler ekranını kişi bazlı yan yana kolonlara ayırır.
(function bootActivityByPersonV178(){
  if(window.__mindsActivityByPersonV178)return;
  window.__mindsActivityByPersonV178=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const actorName=id=>typeof personName==='function'?personName(id):((state?.profiles||[]).find(p=>p.id===id)?.full_name||'Bilinmeyen');

  function installStyles(){
    if(document.getElementById('activityByPersonV178Style'))return;
    const s=document.createElement('style');
    s.id='activityByPersonV178Style';
    s.textContent=`
      #activityFull.activity-person-grid-v178{
        display:grid!important;
        grid-template-columns:repeat(auto-fit,minmax(280px,1fr))!important;
        gap:14px!important;
        align-items:start!important;
        padding:14px!important;
      }
      .activity-person-card-v178{
        min-width:0;
        border:1px solid #273137;
        border-radius:13px;
        background:#0f161a;
        overflow:hidden;
      }
      .activity-person-head-v178{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding:14px 15px;
        border-bottom:1px solid #273137;
        background:linear-gradient(180deg,#151c20,#11181c);
      }
      .activity-person-head-v178 h3{
        margin:0;
        color:#eef2f3;
        font-size:14px;
        font-weight:800;
        letter-spacing:-.15px;
      }
      .activity-person-count-v178{
        flex:0 0 auto;
        border:1px solid #4f4c20;
        border-radius:999px;
        background:#1b1b0d;
        color:#ece52c;
        padding:4px 8px;
        font-size:9px;
        font-weight:800;
      }
      .activity-person-list-v178{
        max-height:68vh;
        overflow-y:auto;
        scrollbar-width:thin;
      }
      .activity-person-item-v178{
        display:grid;
        grid-template-columns:8px minmax(0,1fr);
        gap:9px;
        padding:12px 14px;
        border-bottom:1px solid #20292e;
      }
      .activity-person-item-v178:last-child{border-bottom:0}
      .activity-person-dot-v178{
        width:6px;
        height:6px;
        margin-top:5px;
        border-radius:50%;
        background:#ece52c;
        box-shadow:0 0 0 3px rgba(236,229,44,.07);
      }
      .activity-person-text-v178{min-width:0}
      .activity-person-text-v178 b{
        display:block;
        color:#e8edef;
        font-size:10px;
        line-height:1.45;
        overflow-wrap:anywhere;
      }
      .activity-person-text-v178 time{
        display:block;
        margin-top:5px;
        color:#718087;
        font-size:8px;
      }
      .activity-person-empty-v178{
        padding:30px 14px;
        color:#6f7c83;
        text-align:center;
        font-size:10px;
      }
      @media(max-width:1050px){
        #activityFull.activity-person-grid-v178{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      }
      @media(max-width:680px){
        #activityFull.activity-person-grid-v178{grid-template-columns:1fr!important;padding:10px!important}
        .activity-person-list-v178{max-height:none}
      }
    `;
    document.head.appendChild(s);
  }

  function renderMini(source){
    const mini=document.getElementById('activityMini');
    if(!mini)return;
    const a=source.slice(0,6);
    mini.innerHTML=a.map(x=>`<div class="activity-item"><span class="dot"></span><div><b>${esc(x.description)}</b><p>${esc(actorName(x.actor_id))}</p></div><time>${typeof formatDateTime==='function'?formatDateTime(x.created_at):esc(x.created_at||'')}</time></div>`).join('')||'<div class="empty">Hareket yok.</div>';
  }

  function renderActivityByPerson(){
    installStyles();
    const full=document.getElementById('activityFull');
    if(!full)return;

    const raw=Array.isArray(state?.activity)?state.activity:[];
    const source=(typeof isAdmin==='function'&&isAdmin())?raw:raw.filter(x=>x.actor_id===profile?.id);
    renderMini(source);

    const grouped=new Map();
    source.forEach(x=>{
      const key=String(x.actor_id||'unknown');
      if(!grouped.has(key))grouped.set(key,[]);
      grouped.get(key).push(x);
    });

    let people=[];
    if(typeof isAdmin==='function'&&isAdmin()){
      people=(state?.profiles||[]).filter(p=>p.active);
      const known=new Set(people.map(p=>String(p.id)));
      for(const key of grouped.keys()){
        if(key==='unknown'||known.has(key))continue;
        people.push({id:key,full_name:actorName(key),active:false});
      }
    }else if(profile){
      people=[profile];
    }

    if(!people.length&&grouped.size){
      people=[...grouped.keys()].map(id=>({id,full_name:actorName(id)}));
    }

    // Son hareketi olan kişiyi önce getir; hareketi olmayan aktif kişiler sonda kalır.
    people.sort((a,b)=>{
      const at=grouped.get(String(a.id))?.[0]?.created_at||'';
      const bt=grouped.get(String(b.id))?.[0]?.created_at||'';
      if(at!==bt)return String(bt).localeCompare(String(at));
      return String(a.full_name||'').localeCompare(String(b.full_name||''),'tr');
    });

    full.classList.add('activity-person-grid-v178');
    full.innerHTML=people.map(p=>{
      const items=(grouped.get(String(p.id))||[]).slice(0,50);
      return `<section class="activity-person-card-v178">
        <div class="activity-person-head-v178"><h3>${esc(p.full_name||actorName(p.id))}</h3><span class="activity-person-count-v178">${items.length} hareket</span></div>
        <div class="activity-person-list-v178">${items.length?items.map(x=>`<div class="activity-person-item-v178"><span class="activity-person-dot-v178"></span><div class="activity-person-text-v178"><b>${esc(x.description)}</b><time>${typeof formatDateTime==='function'?formatDateTime(x.created_at):esc(x.created_at||'')}</time></div></div>`).join(''):'<div class="activity-person-empty-v178">Henüz hareket kaydı yok.</div>'}</div>
      </section>`;
    }).join('')||'<div class="empty">Hareket kaydı yok.</div>';
  }

  window.renderActivity=renderActivityByPerson;
  setTimeout(()=>{try{renderActivityByPerson();}catch(e){console.warn('[Günlük Hareketler V1.17.8]',e);}},0);
})();
