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

  function shootEditInfo(x){
    const total=Math.max(0,Number(x?.video_count||0));
    const done=Math.max(0,Math.min(total,Number(x?.edited_video_count||0)));
    let status=x?.delivered_at?'teslim_edildi':String(x?.edit_status||'bekliyor');
    if(status!=='teslim_edildi'){
      if(total>0&&done>=total) status='editlendi';
      else if(done>0) status='editleniyor';
      else status='bekliyor';
    }
    const meta={
      bekliyor:['Edit Bekliyor','red'],
      editleniyor:['Editleniyor','yellow'],
      editlendi:['Editlendi','green'],
      teslim_edildi:['Teslim Edildi','blue']
    }[status]||['Edit Bekliyor','red'];
    return {total,done,status,label:meta[0],cls:meta[1],pct:total?Math.round(done/total*100):0};
  }

  function canEditProgress(x){
    return !!x && (isAdmin() || x?.editor_id===profile?.id || x?.responsible_id===profile?.id || x?.created_by===profile?.id);
  }

  function ensureEditStyles(){
    if(document.getElementById('externalShootEditV263')) return;
    const s=document.createElement('style');
    s.id='externalShootEditV263';
    s.textContent=`
      #shootRows tr.edit-done td{background:rgba(69,181,97,.08)}
      #shootRows tr.edit-delivered td{background:rgba(61,126,211,.08)}
      #shootRows .edit-cell{min-width:150px}
      #shootRows .edit-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
      #shootRows .edit-track{height:5px;border-radius:999px;background:#20282d;overflow:hidden}
      #shootRows .edit-fill{height:100%;border-radius:999px;background:#e6df29}
      #shootRows tr.edit-done .edit-fill{background:#53c972}
      #shootRows tr.edit-delivered .edit-fill{background:#4c8edf}
      #shootRows .edit-actions{display:flex;gap:5px;flex-wrap:wrap}
      #shoots .compact-stats{grid-template-columns:repeat(6,minmax(0,1fr))}
      @media(max-width:1200px){#shoots .compact-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}
    `;
    document.head.appendChild(s);
  }

  async function openShootEditProgress(x){
    if(!canEditProgress(x)) return toast('Bu çekimin edit durumunu güncelleme yetkin yok.',true);
    const i=shootEditInfo(x);
    const editor=x.editor_id||(!isAdmin()?profile.id:'');
    openModal('Edit Takibi',`<div class="form-grid">
      <div class="field full"><label>Çekim</label><input disabled value="${esc(clientName(x)+' · '+(x.title||'Video Çekimi'))}"></div>
      <div class="field"><label>Toplam Video</label><input disabled value="${i.total}"></div>
      <div class="field"><label>Editlenen Video</label><input name="done" type="number" min="0" max="${i.total}" step="1" required value="${i.done}"></div>
      ${isAdmin()?`<div class="field full"><label>Editör</label><select name="editor"><option value="">Atanmadı</option>${activeProfiles().map(p=>`<option value="${p.id}" ${p.id===editor?'selected':''}>${esc(p.full_name)}</option>`).join('')}</select></div>`:`<input type="hidden" name="editor" value="${editor}"><div class="field full"><label>Editör</label><input disabled value="${esc(personLabel(editor))}"></div>`}
      <div class="field full"><label style="display:flex;align-items:center;gap:8px"><input style="width:auto" type="checkbox" name="delivered" value="1" ${i.status==='teslim_edildi'?'checked':''}> Müşteriye teslim edildi</label></div>
      <div class="field full"><div class="info-banner"><b>Durum otomatik:</b> 0/${i.total} Edit Bekliyor · ara değer Editleniyor · ${i.total}/${i.total} Editlendi.</div></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div>
    </div>`,async fd=>{
      let done=Number(fd.get('done'));
      if(!Number.isInteger(done)||done<0||done>i.total) throw new Error(`Editlenen video sayısı 0 ile ${i.total} arasında olmalı.`);
      const delivered=fd.get('delivered')==='1';
      if(delivered) done=i.total;
      const status=delivered?'teslim_edildi':(i.total>0&&done>=i.total?'editlendi':done>0?'editleniyor':'bekliyor');
      const now=new Date().toISOString();
      const editorId=fd.get('editor')||x.editor_id||(!isAdmin()?profile.id:null);
      const payload={
        editor_id:editorId||null,
        edited_video_count:done,
        edit_status:status,
        edit_started_at:done>0?(x.edit_started_at||now):null,
        edited_at:(status==='editlendi'||status==='teslim_edildi')?(x.edited_at||now):null,
        delivered_at:status==='teslim_edildi'?(x.delivered_at||now):null
      };
      const {error}=await sb.from('shoots').update(payload).eq('id',x.id);
      if(error) throw error;
    });
  }

  function ensureInfo(){
    const note=document.getElementById('sharedShootsInfoV124');
    if(note) note.innerHTML='<b>Ortak Çekim Listesi:</b> Tüm aktif ekip görür. Çekim, kayıtlı firmaya veya tek seferlik harici müşteri/kişiye girilebilir. Harici isim Firmalar listesine eklenmez; yalnızca bu çekim kaydında kalır.';
  }

  function renderExternalShoots(){
    ensureInfo();
    ensureEditStyles();
    const sh=monthShoots();
    const infos=sh.map(shootEditInfo);
    const stats=document.getElementById('shootStats');
    const rows=document.getElementById('shootRows');
    if(stats){
      const cards=[
        ['Çekim Kaydı',sh.length],
        ['Toplam Video',infos.reduce((sum,i)=>sum+i.total,0)],
        ['Edit Bekleyen',infos.filter(i=>i.status==='bekliyor').length],
        ['Editleniyor',infos.filter(i=>i.status==='editleniyor').length],
        ['Editlendi',infos.filter(i=>i.status==='editlendi').length],
        ['Teslim Edildi',infos.filter(i=>i.status==='teslim_edildi').length]
      ];
      stats.innerHTML=cards.map(([l,v])=>`<div class="stat"><div class="label">${l}</div><div class="value shoot-count">${v}</div><div class="foot"><b>${typeof prettyMonth==='function'?prettyMonth(selectedMonth):selectedMonth}</b> ekip verisi</div></div>`).join('');
    }
    if(rows){
      rows.innerHTML=sh.map(x=>{
        const i=shootEditInfo(x);
        const cat=x.shoot_category||'firma';
        const rowClass=i.status==='editlendi'?'edit-done':i.status==='teslim_edildi'?'edit-delivered':'';
        const buttons=[];
        if(canEditProgress(x)) buttons.push(`<button class="small-primary" data-shoot-edit-progress-v263="${x.id}">Edit Takibi</button>`);
        if(canEdit(x)) buttons.push(`<button class="small-primary" data-edit-shoot="${x.id}">Güncelle</button><button class="small-danger" data-delete-shoot="${x.id}">Sil</button>`);
        return `<tr class="${rowClass}">
          <td>${dateLabel(x.shoot_date)}</td>
          <td>${clientCell(x)}</td>
          <td><b>${esc(x.title||'Video Çekimi')}</b><div style="margin-top:5px"><span class="badge ${cat==='takim'?'yellow':'blue'}">${esc(categoryLabel(cat))}</span></div></td>
          <td><span class="badge blue">${i.total} Video</span></td>
          <td><div class="edit-cell"><div class="edit-top"><span class="badge ${i.cls}">${i.label}</span><b>${i.done}/${i.total}</b></div><div class="edit-track"><div class="edit-fill" style="width:${i.pct}%"></div></div></div></td>
          <td>${esc(x.editor_id?personLabel(x.editor_id):'Atanmadı')}</td>
          <td>${esc(personLabel(x.responsible_id))}</td>
          <td>${esc(x.notes||'—')}</td>
          <td><div class="edit-actions">${buttons.join('')||'—'}</div></td>
        </tr>`;
      }).join('')||'<tr><td colspan="9" class="empty">Bu ay çekim kaydı yok.</td></tr>';
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

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-shoot-edit-progress-v263]');
    if(!b) return;
    e.preventDefault();
    e.stopPropagation();
    const x=(state.shoots||[]).find(v=>String(v.id)===String(b.dataset.shootEditProgressV263));
    if(x) openShootEditProgress(x);
  },true);

  openShootModal=openExternalShootModal;
  renderShoots=renderExternalShoots;
  window.openShootModal=openExternalShootModal;

  loadDirectory().then(()=>renderExternalShoots()).catch(()=>{});
  const previousRenderAll=renderAll;
  renderAll=function(){previousRenderAll();loadDirectory().then(()=>renderExternalShoots()).catch(()=>renderExternalShoots());};
})();
