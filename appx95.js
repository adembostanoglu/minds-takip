// V1.26.7 — Çekimler final renderer. En son yüklenir; eski modüllerin tekrar çizmesini engeller.
(function bootFinalShootEditV267(){
  if(window.__mindsFinalShootEditV267)return;
  if(typeof sb==='undefined'||typeof state==='undefined'||typeof profile==='undefined'||!profile){
    setTimeout(bootFinalShootEditV267,120);return;
  }
  window.__mindsFinalShootEditV267=true;

  let directory=[];
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const fmt=v=>typeof formatDate==='function'?formatDate(v):String(v||'—');
  const pname=id=>typeof personName==='function'?personName(id):((state.profiles||[]).find(p=>String(p.id)===String(id))?.full_name||'—');
  const admin=()=>typeof isAdmin==='function'&&isAdmin();
  const firmById=id=>directory.find(f=>String(f.id)===String(id))||(state.firms||[]).find(f=>String(f.id)===String(id))||null;

  async function loadDirectory(){
    try{
      const {data}=await sb.rpc('list_shoot_firms_for_team');
      directory=(data||[]).map(x=>({...x}));
    }catch(_e){}
  }

  function clientCell(x){
    if(x.firm_id){
      const f=firmById(x.firm_id);
      let logo='';
      try{logo=f&&typeof firmLogo==='function'?firmLogo(f):'';}catch(_e){}
      return '<div class="firm-cell">'+logo+'<b>'+esc(f?.name||'Kayıtlı Firma')+'</b></div>';
    }
    return '<div class="firm-cell"><span class="firm-logo logo-placeholder">H</span><div><b>'+esc(x.external_client_name||'Harici Müşteri')+'</b><div class="muted"><span class="badge yellow">Harici</span> Tek seferlik müşteri / kişi</div></div></div>';
  }

  function info(x){
    const total=Math.max(0,Number(x?.video_count||0));
    const edited=String(x?.edit_status||'bekliyor')==='editlendi'||(total>0&&Number(x?.edited_video_count||0)>=total);
    return {total,edited};
  }

  function style(){
    if(document.getElementById('shootFinalV267Style'))return;
    const s=document.createElement('style');s.id='shootFinalV267Style';
    s.textContent=`
      #shootRows tr.shoot-final-edited td{background:rgba(66,174,94,.10)!important}
      #shootRows tr.shoot-final-edited:hover td{background:rgba(66,174,94,.15)!important}
      #shootRows .shoot-final-actions{display:flex;gap:5px;flex-wrap:wrap;align-items:center}
      #shootRows .shoot-mark-done-v267{border-color:#356844!important;background:#17331e!important;color:#91d09c!important;font-weight:900!important}
      #shootRows .shoot-editor-v267{color:#9ed8a9;font-weight:800}
      #shootStats{grid-template-columns:repeat(4,minmax(0,1fr))!important}
      @media(max-width:1000px){#shootStats{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
    `;document.head.appendChild(s);
  }

  function rowsForMonth(){
    return (state.shoots||[]).filter(x=>x.month===selectedMonth);
  }

  function renderFinalShoots(){
    const rows=document.getElementById('shootRows'),stats=document.getElementById('shootStats');
    if(!rows||!stats)return;
    style();

    const thead=rows.closest('table')?.querySelector('thead tr');
    if(thead)thead.innerHTML='<th>Tarih</th><th>Firma</th><th>Çekim</th><th>Video İçeriği</th><th>Edit Durumu</th><th>Editi Yapan</th><th>Çekim Sorumlusu</th><th>Not</th><th>İşlem</th>';

    const sh=rowsForMonth();
    const edited=sh.filter(x=>info(x).edited).length;
    const cards=[
      ['Çekim Kaydı',sh.length],
      ['Toplam Video',sh.reduce((n,x)=>n+Number(x.video_count||0),0)],
      ['Edit Bekleyen',sh.length-edited],
      ['Editlendi',edited]
    ];
    stats.innerHTML=cards.map(([l,v])=>'<div class="stat"><div class="label">'+l+'</div><div class="value shoot-count">'+v+'</div><div class="foot"><b>'+prettyMonth(selectedMonth)+'</b> ekip verisi</div></div>').join('');

    rows.innerHTML=sh.map(x=>{
      const i=info(x);
      const cat=x.shoot_category||'firma';
      const actions=[];
      if(!i.edited) actions.push('<button class="small-primary shoot-mark-done-v267" data-shoot-done-v267="'+x.id+'">✓ Editlendi</button>');
      else{
        actions.push('<span class="badge green">✓ Editlendi</span>');
        if(admin())actions.push('<button class="ghost" data-shoot-undo-v267="'+x.id+'">Geri Al</button>');
      }
      const canManage=typeof canManageShoot==='function'?canManageShoot(x):(admin()||x.created_by===profile.id||x.responsible_id===profile.id);
      if(canManage)actions.push('<button class="small-primary" data-edit-shoot="'+x.id+'">Güncelle</button><button class="small-danger" data-delete-shoot="'+x.id+'">Sil</button>');
      return '<tr class="'+(i.edited?'shoot-final-edited':'')+'">'+
        '<td>'+fmt(x.shoot_date)+'</td>'+
        '<td>'+clientCell(x)+'</td>'+
        '<td><b>'+esc(x.title||'Video Çekimi')+'</b><div style="margin-top:5px"><span class="badge '+(cat==='takim'?'yellow':'blue')+'">'+esc(cat==='takim'?'Takım / Antrenman / Deplasman':'Firma Çekimi')+'</span></div></td>'+
        '<td><span class="badge blue">'+i.total+' Video</span></td>'+
        '<td><span class="badge '+(i.edited?'green':'red')+'">'+(i.edited?'✓ Editlendi':'Edit Bekliyor')+'</span></td>'+
        '<td>'+(i.edited?'<span class="shoot-editor-v267">'+esc(x.editor_id?pname(x.editor_id):'—')+'</span>':'—')+'</td>'+
        '<td>'+esc(pname(x.responsible_id))+'</td>'+
        '<td>'+esc(x.notes||'—')+'</td>'+
        '<td><div class="shoot-final-actions">'+actions.join('')+'</div></td>'+
      '</tr>';
    }).join('')||'<tr><td colspan="9" class="empty">Bu ay çekim kaydı yok.</td></tr>';
  }

  async function markDone(id){
    const x=(state.shoots||[]).find(v=>String(v.id)===String(id));if(!x)return;
    const {data,error}=await sb.rpc('mark_shoot_edited',{p_shoot_id:x.id});
    if(error){toast('Edit durumu kaydedilemedi: '+(error.message||error),true);return;}
    const updated=Array.isArray(data)?data[0]:data;
    if(updated)Object.assign(x,updated);
    else{ x.editor_id=profile.id;x.edited_video_count=x.video_count;x.edit_status='editlendi';x.edited_at=new Date().toISOString(); }
    renderFinalShoots();
    toast('Editlendi olarak işaretlendi.');
  }

  async function undo(id){
    if(!admin())return;
    const x=(state.shoots||[]).find(v=>String(v.id)===String(id));if(!x)return;
    const {data,error}=await sb.rpc('reset_shoot_edit',{p_shoot_id:x.id});
    if(error){toast('Edit durumu geri alınamadı: '+(error.message||error),true);return;}
    const updated=Array.isArray(data)?data[0]:data;
    if(updated)Object.assign(x,updated);
    else{x.editor_id=null;x.edited_video_count=0;x.edit_status='bekliyor';x.edited_at=null;}
    renderFinalShoots();
  }

  document.addEventListener('click',e=>{
    const d=e.target.closest('[data-shoot-done-v267]');
    if(d){e.preventDefault();e.stopPropagation();markDone(d.dataset.shootDoneV267);return;}
    const u=e.target.closest('[data-shoot-undo-v267]');
    if(u){e.preventDefault();e.stopPropagation();undo(u.dataset.shootUndoV267);return;}
    if(e.target.closest('[data-view="shoots"]'))setTimeout(renderFinalShoots,180);
  },true);
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker')setTimeout(renderFinalShoots,180);},true);

  // Eski modüller sonradan render çağırsa bile global renderer artık final sürümdür.
  window.renderShoots=renderFinalShoots;
  try{renderShoots=renderFinalShoots;}catch(_e){}

  loadDirectory().then(()=>renderFinalShoots());
  setTimeout(renderFinalShoots,600);
  setTimeout(renderFinalShoots,1400);
})();