// V1.14.3 — shoots can target registered firms or one-off external clients/people.
(function bootExternalShootClientsV143(){
  if(typeof sb==='undefined' || typeof state==='undefined' || typeof openModal!=='function' || !window.__mindsSharedShootsV125){
    setTimeout(bootExternalShootClientsV143,120);
    return;
  }
  if(window.__mindsExternalShootClientsV143) return;
  window.__mindsExternalShootClientsV143=true;

  let directory=[];
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const dateLabel=v=>typeof formatDate==='function'?formatDate(v):String(v||'—');
  const personLabel=id=>typeof personName==='function'?personName(id):((state.profiles||[]).find(p=>p.id===id)?.full_name||'—');
  const defaultDate=()=>typeof defaultDateForSelectedMonth==='function'?defaultDateForSelectedMonth():new Date().toISOString().slice(0,10);
  const monthShoots=()=> (state.shoots||[]).filter(x=>x.month===selectedMonth);
  const canEdit=x=>typeof canManageShoot==='function'?canManageShoot(x):(isAdmin()||x?.created_by===profile?.id||x?.responsible_id===profile?.id);
  const categoryLabel=v=>v==='takim'?'Takım / Antrenman / Deplasman':'Firma Çekimi';
  const firmById=id=>directory.find(f=>f.id===id)||(state.firms||[]).find(f=>f.id===id)||null;

  async function loadDirectory(){
    const {data,error}=await sb.rpc('list_shoot_firms_for_team');
    if(!error) directory=(data||[]).map(x=>({...x}));
    return directory;
  }

  function logoFor(f){
    if(!f) return '';
    try{return typeof firmLogo==='function'?firmLogo(f):'';}catch(_e){return '';}
  }

  function clientName(x){
    if(x.firm_id) return firmById(x.firm_id)?.name||'Kayıtlı Firma';
    return x.external_client_name||'Harici Müşteri';
  }

  function clientCell(x){
    if(x.firm_id){
      const f=firmById(x.firm_id);
      return `<div class="firm-cell">${logoFor(f)}<b>${esc(f?.name||'Kayıtlı Firma')}</b></div>`;
    }
    return `<div class="firm-cell"><span class="firm-logo logo-placeholder">H</span><div><b>${esc(x.external_client_name||'Harici Müşteri')}</b><div class="muted"><span class="badge yellow">Harici</span> Tek seferlik müşteri / kişi</div></div></div>`;
  }

  function ensureInfo(){
    const note=document.getElementById('sharedShootsInfoV124');
    if(note) note.innerHTML='<b>Ortak Çekim Listesi:</b> Tüm aktif ekip görür. Çekim, kayıtlı firmaya veya tek seferlik harici müşteri/kişiye girilebilir. Harici isim Firmalar listesine eklenmez; yalnızca bu çekim kaydında kalır.';
  }

  function renderExternalShoots(){
    ensureInfo();
    const sh=monthShoots();
    const clientCount=new Set(sh.map(x=>x.firm_id?`f:${x.firm_id}`:`x:${String(x.external_client_name||'').trim().toLocaleLowerCase('tr-TR')}`).filter(Boolean)).size;
    const videoCount=sh.reduce((sum,x)=>sum+Number(x.video_count||0),0);
    const stats=document.getElementById('shootStats');
    const rows=document.getElementById('shootRows');
    if(stats){
      stats.innerHTML=[['Çekim Kaydı',sh.length],['Çekim Yapılan Firma / Müşteri',clientCount],['Toplam Video İçeriği',videoCount]].map(([l,v])=>`<div class="stat"><div class="label">${l}</div><div class="value shoot-count">${v}</div><div class="foot"><b>${typeof prettyMonth==='function'?prettyMonth(selectedMonth):selectedMonth}</b> ekip verisi</div></div>`).join('');
    }
    if(rows){
      rows.innerHTML=sh.map(x=>{
        const actions=canEdit(x)?`<div class="row-actions"><button class="small-primary" data-edit-shoot="${x.id}">Güncelle</button><button class="small-danger" data-delete-shoot="${x.id}">Sil</button></div>`:'—';
        const cat=x.shoot_category||'firma';
        return `<tr><td>${dateLabel(x.shoot_date)}</td><td>${clientCell(x)}</td><td><b>${esc(x.title||'Video Çekimi')}</b><div style="margin-top:5px"><span class="badge ${cat==='takim'?'yellow':'blue'}">${esc(categoryLabel(cat))}</span></div></td><td><span class="badge blue">${Number(x.video_count||0)} Video</span></td><td>${esc(personLabel(x.responsible_id))}</td><td>${esc(x.notes||'—')}</td><td>${actions}</td></tr>`;
      }).join('')||'<tr><td colspan="7" class="empty">Bu ay çekim kaydı yok.</td></tr>';
    }
  }

  async function openExternalShootModal(shoot=null){
    await loadDirectory();
    let available=directory.filter(f=>f.active);
    if(shoot?.firm_id){
      const old=firmById(shoot.firm_id);
      if(old&&!available.some(f=>f.id===old.id)) available=[old,...available];
    }
    const mode=shoot?.external_client_name?'external':'registered';
    const responsibleField=isAdmin()
      ? `<div class="field full"><label>Sorumlu Personel</label><select name="person" required>${activeProfiles().map(p=>`<option value="${p.id}" ${p.id===(shoot?.responsible_id||profile.id)?'selected':''}>${esc(p.full_name)}</option>`).join('')}</select></div>`
      : `<div class="field full"><label>Sorumlu Personel</label><input value="${esc(profile.full_name)}" disabled><input type="hidden" name="person" value="${profile.id}"></div>`;

    openModal(shoot?'Çekimi Güncelle':'Yeni Çekim',`<div class="form-grid">
      <div class="field full"><label>Çekim Kimin İçin?</label><select name="target_mode" id="shootTargetModeV143"><option value="registered" ${mode==='registered'?'selected':''}>Kayıtlı Firma</option><option value="external" ${mode==='external'?'selected':''}>Harici Müşteri / Kişi</option></select><div class="field-help">Harici müşteri Firmalar listesine eklenmez.</div></div>
      <div class="field full" id="shootRegisteredFirmV143"><label>Kayıtlı Firma</label><select name="firm"><option value="">Seç</option>${available.map(f=>`<option value="${f.id}" ${shoot?.firm_id===f.id?'selected':''}>${esc(f.name)}</option>`).join('')}</select></div>
      <div class="field full" id="shootExternalClientV143"><label>Harici Firma / Kişi Adı</label><input name="external_client" maxlength="120" placeholder="Örn. ABC Marka / Ahmet Yılmaz" value="${esc(shoot?.external_client_name||'')}"></div>
      <div class="field full"><label>Çekim Başlığı</label><input name="title" placeholder="Örn. Tanıtım çekimi / Reels çekimi" value="${esc(shoot?.title||'')}"></div>
      <div class="field"><label>Çekim Türü</label><select name="category" required><option value="firma" ${(shoot?.shoot_category||'firma')==='firma'?'selected':''}>Firma Çekimi</option><option value="takim" ${shoot?.shoot_category==='takim'?'selected':''}>Takım / Antrenman / Deplasman</option></select></div>
      <div class="field"><label>Çekim Tarihi</label><input name="date" type="date" required value="${shoot?.shoot_date||defaultDate()}"></div>
      <div class="field"><label>Çekilen Video İçeriği</label><input name="video_count" type="number" min="1" step="1" required value="${shoot?.video_count??1}"></div>
      ${responsibleField}
      <div class="field full"><label>Not</label><textarea name="notes" placeholder="Çekim detayı, lokasyon, içerik notu...">${esc(shoot?.notes||'')}</textarea></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div>
    </div>`,async fd=>{
      if(typeof assertSelectedMonthDate==='function') assertSelectedMonthDate(fd.get('date'),'Çekim tarihi');
      const count=Number(fd.get('video_count'));
      if(!Number.isInteger(count)||count<1) throw new Error('Çekilen video içeriği en az 1 olmalı.');
      const category=String(fd.get('category')||'firma');
      if(!['firma','takim'].includes(category)) throw new Error('Çekim türü geçersiz.');
      const targetMode=String(fd.get('target_mode')||'registered');
      const fid=String(fd.get('firm')||'').trim()||null;
      const external=String(fd.get('external_client')||'').trim();
      if(targetMode==='registered'&&!fid) throw new Error('Kayıtlı firma seçmelisin.');
      if(targetMode==='external'&&(external.length<2||external.length>120)) throw new Error('Harici firma / kişi adı 2–120 karakter olmalı.');
      const payload={
        firm_id:targetMode==='registered'?fid:null,
        external_client_name:targetMode==='external'?external:null,
        shoot_date:fd.get('date'),
        shoot_category:category,
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

    setTimeout(()=>{
      const sel=document.getElementById('shootTargetModeV143');
      const reg=document.getElementById('shootRegisteredFirmV143');
      const ext=document.getElementById('shootExternalClientV143');
      const sync=()=>{const v=sel?.value||'registered'; if(reg)reg.style.display=v==='registered'?'':'none'; if(ext)ext.style.display=v==='external'?'':'none';};
      sel?.addEventListener('change',sync); sync();
    },0);
  }

  openShootModal=openExternalShootModal;
  renderShoots=renderExternalShoots;
  window.openShootModal=openExternalShootModal;

  loadDirectory().then(()=>renderExternalShoots()).catch(()=>{});
  const previousRenderAll=renderAll;
  renderAll=function(){previousRenderAll();loadDirectory().then(()=>renderExternalShoots()).catch(()=>renderExternalShoots());};
})();
