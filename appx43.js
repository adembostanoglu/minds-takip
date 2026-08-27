// V1.17.9 — Ekstra İşler ekranını personel bazlı yan yana kolonlara ayırır.
(function bootExtrasByPersonV179(){
  if(window.__mindsExtrasByPersonV179)return;

  // V1.14 ekstra iş katmanı renderExtras'i en son tanımlıyor; onu bekleyip güvenli şekilde üzerine yaz.
  if(!window.__mindsExtraWorkTypesV140 || typeof renderExtras!=='function' || typeof state==='undefined'){
    setTimeout(bootExtrasByPersonV179,120);
    return;
  }
  window.__mindsExtrasByPersonV179=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const typeMeta={
    adaptasyon:['Ekstra Post / Adaptasyon','×1'],
    video_edit:['Video Edit','×1,5'],
    cekim:['Çekim / Prodüksiyon','×1,5'],
    logo_kurumsal:['Logo / Kurumsal Kimlik','×2'],
    katalog_brosur:['Katalog / Broşür','×2'],
    acik_hava_matbaa:['Açık Hava / Matbaa','×1,5'],
    diger:['Diğer','×1']
  };
  const typeLabel=v=>(typeMeta[v]||typeMeta.diger)[0];
  const typeWeight=v=>(typeMeta[v]||typeMeta.diger)[1];
  const personById=id=>(state.profiles||[]).find(p=>String(p.id)===String(id));
  const personNameSafe=id=>personById(id)?.full_name||(typeof personName==='function'?personName(id):'Personel');
  const canManage=x=>typeof canManageExtra==='function'?canManageExtra(x):(typeof isAdmin==='function'&&isAdmin())||(x?.person_id===profile?.id&&x?.created_by===profile?.id);

  function installStyles(){
    if(document.getElementById('extrasByPersonV179Style'))return;
    const s=document.createElement('style');
    s.id='extrasByPersonV179Style';
    s.textContent=`
      #extras .extra-person-grid-v179{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(330px,1fr));
        gap:14px;
        padding:14px;
        align-items:start;
      }
      #extras .extra-person-card-v179{
        min-width:0;
        border:1px solid #29343a;
        border-radius:13px;
        overflow:hidden;
        background:#0f161a;
      }
      #extras .extra-person-head-v179{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding:14px 15px;
        border-bottom:1px solid #29343a;
        background:linear-gradient(180deg,#151d21,#11181c);
      }
      #extras .extra-person-head-v179 h3{
        margin:0;
        font-size:14px;
        color:#f0f3f4;
        letter-spacing:-.15px;
      }
      #extras .extra-person-count-v179{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-width:28px;
        height:24px;
        padding:0 8px;
        border-radius:999px;
        border:1px solid #5f5a20;
        background:#1d1d0d;
        color:#ece52c;
        font-size:10px;
        font-weight:850;
      }
      #extras .extra-person-body-v179{
        max-height:610px;
        overflow:auto;
      }
      #extras .extra-item-v179{
        padding:13px 14px;
        border-bottom:1px solid #222c31;
      }
      #extras .extra-item-v179:last-child{border-bottom:0}
      #extras .extra-item-top-v179{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
        margin-bottom:8px;
      }
      #extras .extra-client-v179{
        min-width:0;
        font-weight:800;
        font-size:12px;
        color:#eef2f3;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      #extras .extra-date-v179{
        flex:0 0 auto;
        color:#829097;
        font-size:9px;
        white-space:nowrap;
      }
      #extras .extra-title-v179{
        color:#eef2f3;
        font-size:12px;
        font-weight:750;
        line-height:1.4;
        margin-bottom:7px;
      }
      #extras .extra-meta-v179{
        display:flex;
        align-items:center;
        gap:6px;
        flex-wrap:wrap;
        color:#8d999f;
        font-size:9px;
      }
      #extras .extra-meta-v179 .badge{font-size:8px;padding:4px 6px}
      #extras .extra-item-actions-v179{
        display:flex;
        gap:6px;
        flex-wrap:wrap;
        margin-top:10px;
      }
      #extras .extra-item-actions-v179 button{
        font-size:8px;
        min-height:auto;
        padding:6px 8px;
      }
      #extras .extra-person-empty-v179{
        padding:28px 14px;
        text-align:center;
        color:#748188;
        font-size:10px;
      }
      #extras .extra-grid-empty-v179{
        grid-column:1/-1;
        padding:42px 16px;
        text-align:center;
        color:#748188;
      }
      #extras .extra-original-table-v179{display:none!important}
      @media(max-width:1100px){
        #extras .extra-person-grid-v179{grid-template-columns:repeat(2,minmax(0,1fr))}
      }
      @media(max-width:760px){
        #extras .extra-person-grid-v179{grid-template-columns:1fr;padding:10px}
        #extras .extra-person-body-v179{max-height:none}
      }
    `;
    document.head.appendChild(s);
  }

  function clientName(x){
    if(x.kind==='ajans')return 'Ajans İçi';
    if(x.firm_id){
      const f=typeof firm==='function'?firm(x.firm_id):(state.firms||[]).find(v=>v.id===x.firm_id);
      return f?.name||'Kayıtlı Firma';
    }
    return x.external_client_name||'Harici Müşteri';
  }

  function sourceLabel(x){return x.source==='staff'?'Personel':'Yönetici';}
  function targetBadge(x){
    if(x.kind==='ajans')return '<span class="badge blue">Ajans İçi</span>';
    if(x.firm_id)return '<span class="badge green">Kayıtlı Firma</span>';
    return '<span class="badge yellow">Harici</span>';
  }

  function ensureGrid(){
    const tbody=document.getElementById('extraRows');
    if(!tbody)return null;
    const wrap=tbody.closest('.table-wrap');
    const panel=tbody.closest('.panel');
    if(wrap)wrap.classList.add('extra-original-table-v179');
    if(!panel)return null;
    let grid=document.getElementById('extraPersonGridV179');
    if(!grid){
      grid=document.createElement('div');
      grid.id='extraPersonGridV179';
      grid.className='extra-person-grid-v179';
      panel.insertBefore(grid,wrap||panel.firstChild);
    }
    return grid;
  }

  function sortedPeopleFor(rows){
    const ids=[...new Set(rows.map(x=>String(x.person_id||'')).filter(Boolean))];
    const profileOrder=new Map((state.profiles||[]).map((p,i)=>[String(p.id),i]));
    return ids.sort((a,b)=>{
      const ai=profileOrder.has(a)?profileOrder.get(a):9999;
      const bi=profileOrder.has(b)?profileOrder.get(b):9999;
      if(ai!==bi)return ai-bi;
      return personNameSafe(a).localeCompare(personNameSafe(b),'tr');
    });
  }

  function rowHtml(x){
    const d=typeof formatDate==='function'?formatDate(x.work_date):esc(x.work_date||'—');
    const actions=canManage(x)
      ? `<div class="extra-item-actions-v179"><button class="small-primary" data-edit-extra="${x.id}">Güncelle</button><button class="small-danger" data-delete-extra="${x.id}">Sil</button></div>`
      : '';
    return `<div class="extra-item-v179">
      <div class="extra-item-top-v179"><div class="extra-client-v179" title="${esc(clientName(x))}">${esc(clientName(x))}</div><div class="extra-date-v179">${d}</div></div>
      <div class="extra-title-v179">${esc(x.title||'Ekstra İş')}</div>
      <div class="extra-meta-v179">
        ${targetBadge(x)}
        <span class="badge blue">${esc(typeLabel(x.extra_work_type))}</span>
        <span>${esc(typeWeight(x.extra_work_type))} katkı</span>
        <span>•</span><span>${Number(x.quantity||0)} adet</span>
        <span>•</span><span>${esc(sourceLabel(x))}</span>
      </div>
      ${actions}
    </div>`;
  }

  function renderExtrasV179(){
    installStyles();
    const grid=ensureGrid();
    if(!grid)return;
    const rows=(typeof monthExtras==='function'?monthExtras():(state.extras||[]).filter(x=>x.month===selectedMonth))
      .slice()
      .sort((a,b)=>String(b.work_date||'').localeCompare(String(a.work_date||'')) || String(b.created_at||'').localeCompare(String(a.created_at||'')));

    if(!rows.length){
      grid.innerHTML='<div class="extra-grid-empty-v179">Bu ay ekstra iş yok.</div>';
      const tbody=document.getElementById('extraRows');if(tbody)tbody.innerHTML='';
      return;
    }

    const people=sortedPeopleFor(rows);
    grid.innerHTML=people.map(pid=>{
      const list=rows.filter(x=>String(x.person_id)===String(pid));
      return `<section class="extra-person-card-v179">
        <div class="extra-person-head-v179"><h3>${esc(personNameSafe(pid))}</h3><span class="extra-person-count-v179">${list.length}</span></div>
        <div class="extra-person-body-v179">${list.map(rowHtml).join('')||'<div class="extra-person-empty-v179">Bu ay ekstra iş yok.</div>'}</div>
      </section>`;
    }).join('');

    // Eski tablo görünmüyor; yine de stale DOM bırakma.
    const tbody=document.getElementById('extraRows');if(tbody)tbody.innerHTML='';
  }

  renderExtras=renderExtrasV179;
  window.renderExtras=renderExtrasV179;
  try{renderExtrasV179();}catch(e){console.warn('V1.17.9 extras-by-person initial render',e);}
})();
