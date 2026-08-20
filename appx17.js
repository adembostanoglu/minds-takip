// V1.12.4 — shared team shoots: all active users can see/add, personal edit/delete stays scoped
(function bootSharedShootsV124(){
  if(typeof sb==='undefined' || typeof openModal!=='function' || typeof isAdmin!=='function'){
    setTimeout(bootSharedShootsV124,120);
    return;
  }
  if(window.__mindsSharedShootsV124) return;
  window.__mindsSharedShootsV124=true;

  let shootFirmDirectory=[];
  let directoryLoading=null;

  function esc(v){
    if(typeof escapeHtml==='function') return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
  }
  function dateLabel(v){ return typeof formatDate==='function'?formatDate(v):String(v||'—'); }
  function personLabel(id){ return typeof personName==='function'?personName(id):((state.profiles||[]).find(p=>p.id===id)?.full_name||'—'); }
  function selectedMonthDateDefault(){ return typeof defaultDateForSelectedMonth==='function'?defaultDateForSelectedMonth():new Date().toISOString().slice(0,10); }
  function allMonthShoots(){ return (state.shoots||[]).filter(x=>x.month===selectedMonth); }
  function shootFirm(fid){ return shootFirmDirectory.find(f=>f.id===fid) || (state.firms||[]).find(f=>f.id===fid) || null; }
  function canEditShoot(x){ return typeof canManageShoot==='function'?canManageShoot(x):(isAdmin()||x?.created_by===profile?.id||x?.responsible_id===profile?.id); }

  async function loadShootFirmDirectory(force=false){
    if(directoryLoading) return directoryLoading;
    if(shootFirmDirectory.length && !force) return shootFirmDirectory;
    directoryLoading=(async()=>{
      const {data,error}=await sb.rpc('list_shoot_firms_for_team');
      if(error){ console.warn('Shared shoot firm directory',error); return shootFirmDirectory; }
      shootFirmDirectory=(data||[]).map(f=>({...f}));
      return shootFirmDirectory;
    })();
    try{return await directoryLoading;}finally{directoryLoading=null;}
  }

  function firmLogoForShoot(f){
    if(!f) return '';
    try{ return typeof firmLogo==='function'?firmLogo(f):''; }catch(_e){ return ''; }
  }

  function ensureSharedInfo(){
    const section=document.getElementById('shoots');
    const actions=section?.querySelector('.section-actions');
    if(!section||!actions) return;
    let note=document.getElementById('sharedShootsInfoV124');
    if(!note){
      note=document.createElement('div');
      note.id='sharedShootsInfoV124';
      note.className='info-banner';
      note.style.marginBottom='12px';
      actions.insertAdjacentElement('afterend',note);
    }
    note.innerHTML='<b>Ortak Çekim Listesi:</b> Bu bölüm tüm aktif ekip tarafından görülür. Her personel çekim ekleyebilir; personel kendi oluşturduğu veya sorumlu olduğu kaydı yönetebilir, yönetici tüm kayıtları yönetebilir.';
  }

  function renderSharedShoots(){
    ensureSharedInfo();
    const sh=allMonthShoots();
    const firmCount=new Set(sh.map(x=>x.firm_id)).size;
    const videoCount=sh.reduce((sum,x)=>sum+Number(x.video_count||0),0);
    const stats=document.getElementById('shootStats');
    const rows=document.getElementById('shootRows');
    if(stats){
      stats.innerHTML=[['Çekim Kaydı',sh.length],['Çekim Yapılan Firma',firmCount],['Toplam Video İçeriği',videoCount]].map(([l,v])=>`<div class="stat"><div class="label">${l}</div><div class="value shoot-count">${v}</div><div class="foot"><b>${typeof prettyMonth==='function'?prettyMonth(selectedMonth):selectedMonth}</b> ekip verisi</div></div>`).join('');
    }
    if(rows){
      rows.innerHTML=sh.map(x=>{
        const f=shootFirm(x.firm_id);
        const can=canEditShoot(x);
        const actions=can?`<div class="row-actions"><button class="small-primary" data-edit-shoot="${x.id}">Güncelle</button><button class="small-danger" data-delete-shoot="${x.id}">Sil</button></div>`:'—';
        return `<tr><td>${dateLabel(x.shoot_date)}</td><td><div class="firm-cell">${firmLogoForShoot(f)}<b>${esc(f?.name||'Firma')}</b></div></td><td><b>${esc(x.title||'Video Çekimi')}</b></td><td><span class="badge blue">${Number(x.video_count||0)} Video</span></td><td>${esc(personLabel(x.responsible_id))}</td><td>${esc(x.notes||'—')}</td><td>${actions}</td></tr>`;
      }).join('')||'<tr><td colspan="7" class="empty">Bu ay çekim kaydı yok.</td></tr>';
    }
  }

  async function openSharedShootModal(shoot=null){
    await loadShootFirmDirectory();
    let available=shootFirmDirectory.filter(f=>f.active);
    if(shoot){
      const oldFirm=shootFirm(shoot.firm_id);
      if(oldFirm&&!available.some(f=>f.id===oldFirm.id)) available=[oldFirm,...available];
    }
    if(!available.length) return toast('Aktif firma bulunamadı.',true);

    const responsibleField=isAdmin()
      ? `<div class="field full"><label>Sorumlu Personel</label><select name="person" required>${activeProfiles().map(p=>`<option value="${p.id}" ${p.id===(shoot?.responsible_id||profile.id)?'selected':''}>${esc(p.full_name)}</option>`).join('')}</select></div>`
      : `<div class="field full"><label>Sorumlu Personel</label><input value="${esc(profile.full_name)}" disabled><input type="hidden" name="person" value="${profile.id}"></div>`;

    openModal(shoot?'Çekimi Güncelle':'Yeni Çekim',`<div class="form-grid">
      <div class="field full"><label>Firma</label><select name="firm" required>${available.map(f=>`<option value="${f.id}" ${shoot?.firm_id===f.id?'selected':''}>${esc(f.name)}</option>`).join('')}</select></div>
      <div class="field full"><label>Çekim Başlığı</label><input name="title" placeholder="Örn. Aylık sosyal medya çekimi" value="${esc(shoot?.title||'')}"></div>
      <div class="field"><label>Çekim Tarihi</label><input name="date" type="date" required value="${shoot?.shoot_date||selectedMonthDateDefault()}"></div>
      <div class="field"><label>Çekilen Video İçeriği</label><input name="video_count" type="number" min="1" step="1" required value="${shoot?.video_count??1}"></div>
      ${responsibleField}
      <div class="field full"><label>Not</label><textarea name="notes" placeholder="Çekim detayı, lokasyon, içerik notu...">${esc(shoot?.notes||'')}</textarea></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div>
    </div>`,async fd=>{
      if(typeof assertSelectedMonthDate==='function') assertSelectedMonthDate(fd.get('date'),'Çekim tarihi');
      const count=Number(fd.get('video_count'));
      if(!Number.isInteger(count)||count<1) throw new Error('Çekilen video içeriği en az 1 olmalı.');
      const payload={
        firm_id:fd.get('firm'),
        shoot_date:fd.get('date'),
        title:String(fd.get('title')||'').trim()||null,
        video_count:count,
        responsible_id:isAdmin()?(fd.get('person')||profile.id):profile.id,
        notes:String(fd.get('notes')||'').trim()||null
      };
      if(shoot){
        const {error}=await sb.from('shoots').update(payload).eq('id',shoot.id); if(error) throw error;
      }else{
        payload.created_by=profile.id;
        const {error}=await sb.from('shoots').insert(payload); if(error) throw error;
      }
    });
  }

  openShootModal=openSharedShootModal;
  renderShoots=renderSharedShoots;

  loadShootFirmDirectory().then(()=>{ try{renderSharedShoots();}catch(e){console.warn('Shared shoots initial render',e);} });

  const previousRenderAll=renderAll;
  renderAll=function(){
    previousRenderAll();
    renderSharedShoots();
    loadShootFirmDirectory(true).then(()=>renderSharedShoots()).catch(()=>{});
  };
})();