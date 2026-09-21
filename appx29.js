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
    const edited=String(x?.edit_status||'bekliyor')==='editlendi' || (total>0 && Number(x?.edited_video_count||0)>=total);
    return {
      total,
      edited,
      status:edited?'editlendi':'bekliyor',
      label:edited?'Editlendi':'Edit Bekliyor',
      cls:edited?'green':'red'
    };
  }

  function ensureEditStyles(){
    if(document.getElementById('externalShootEditV266')) return;
    const s=document.createElement('style');
    s.id='externalShootEditV266';
    s.textContent=`
      #shootRows tr.edit-done td{background:rgba(69,181,97,.10)}
      #shootRows tr.edit-done:hover td{background:rgba(69,181,97,.14)}
      #shootRows .edit-state-v266{display:inline-flex;align-items:center;gap:6px;font-weight:850}
      #shootRows .edit-actions{display:flex;gap:5px;flex-wrap:wrap}
      #shootRows .mark-edited-v266{border-color:#356844!important;background:#17331e!important;color:#91d09c!important;font-weight:900!important}
      #shootRows .edited-by-v266{color:#9ed8a9;font-weight:800}
      #shoots .compact-stats{grid-template-columns:repeat(4,minmax(0,1fr))}
      @media(max-width:1000px){#shoots .compact-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;
    document.head.appendChild(s);
  }

  async function markShootEdited(x){
    if(!x) return;
    const who=profile?.full_name||'Sen';
    if(!confirm(`${x.title||'Bu çekim'} editlendi olarak işaretlensin mi?\n\nEditi yapan: ${who}`)) return;
    const {error}=await sb.rpc('mark_shoot_edited',{p_shoot_id:x.id});
    if(error){toast('Edit durumu kaydedilemedi: '+(error.message||error),true);return;}
    if(typeof loadData==='function') await loadData({silent:true});
    toast('Çekim editlendi olarak işaretlendi.');
    renderExternalShoots();
  }

  async function resetShootEdited(x){
    if(!x||!isAdmin()) return;
    if(!confirm('Bu çekimin edit durumunu sıfırlamak istiyor musun?')) return;
    const {error}=await sb.rpc('reset_shoot_edit',{p_shoot_id:x.id});
    if(error){toast('Edit durumu sıfırlanamadı: '+(error.message||error),true);return;}
    if(typeof loadData==='function') await loadData({silent:true});
    renderExternalShoots();
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
      const editedCount=infos.filter(i=>i.edited).length;
      const cards=[
        ['Çekim Kaydı',sh.length],
        ['Toplam Video',infos.reduce((sum,i)=>sum+i.total,0)],
        ['Edit Bekleyen',sh.length-editedCount],
        ['Editlendi',editedCount]
      ];
      stats.innerHTML=cards.map(([l,v])=>`<div class="stat"><div class="label">${l}</div><div class="value shoot-count">${v}</div><div class="foot"><b>${typeof prettyMonth==='function'?prettyMonth(selectedMonth):selectedMonth}</b> ekip verisi</div></div>`).join('');
    }

    if(rows){
      rows.innerHTML=sh.map(x=>{
        const i=shootEditInfo(x);
        const cat=x.shoot_category||'firma';
        const rowClass=i.edited?'edit-done':'';
        const buttons=[];

        if(!i.edited){
          buttons.push(`<button class="small-primary mark-edited-v266" data-shoot-mark-edited-v266="${x.id}">✓ Editlendi</button>`);
        }else{
          buttons.push('<span class="badge green">✓ Tamamlandı</span>');
          if(isAdmin()) buttons.push(`<button class="ghost" data-shoot-reset-edit-v266="${x.id}">Geri Al</button>`);
        }

        if(canEdit(x)){
          buttons.push(`<button class="small-primary" data-edit-shoot="${x.id}">Güncelle</button><button class="small-danger" data-delete-shoot="${x.id}">Sil</button>`);
        }

        return `<tr class="${rowClass}">
          <td>${dateLabel(x.shoot_date)}</td>
          <td>${clientCell(x)}</td>
          <td><b>${esc(x.title||'Video Çekimi')}</b><div style="margin-top:5px"><span class="badge ${cat==='takim'?'yellow':'blue'}">${esc(categoryLabel(cat))}</span></div></td>
          <td><span class="badge blue">${i.total} Video</span></td>
          <td><span class="badge ${i.cls} edit-state-v266">${i.edited?'✓ ':''}${i.label}</span></td>
          <td>${i.edited?`<span class="edited-by-v266">${esc(x.editor_id?personLabel(x.editor_id):'—')}</span>`:'—'}</td>
          <td>${esc(personLabel(x.responsible_id))}</td>
          <td>${esc(x.notes||'—')}</td>
          <td><div class="edit-actions">${buttons.join('')}</div></td>
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
    const done=e.target.closest('[data-shoot-mark-edited-v266]');
    if(done){
      e.preventDefault();e.stopPropagation();
      const x=(state.shoots||[]).find(v=>String(v.id)===String(done.dataset.shootMarkEditedV266));
      if(x) markShootEdited(x);
      return;
    }
    const reset=e.target.closest('[data-shoot-reset-edit-v266]');
    if(reset){
      e.preventDefault();e.stopPropagation();
      const x=(state.shoots||[]).find(v=>String(v.id)===String(reset.dataset.shootResetEditV266));
      if(x) resetShootEdited(x);
    }
  },true);

  openShootModal=openExternalShootModal;
  renderShoots=renderExternalShoots;
  window.openShootModal=openExternalShootModal;

  loadDirectory().then(()=>renderExternalShoots()).catch(()=>{});
  const previousRenderAll=renderAll;
  renderAll=function(){previousRenderAll();loadDirectory().then(()=>renderExternalShoots()).catch(()=>renderExternalShoots());};
})();
