// V1.13.7 — extra works can target registered firms, external clients/people, or agency-internal work.
(function bootExternalExtraClientsV137(){
  if(typeof openModal!=='function' || typeof sb==='undefined' || typeof state==='undefined' || typeof renderAll!=='function'){
    setTimeout(bootExternalExtraClientsV137,120);
    return;
  }
  if(window.__mindsExternalExtraClientsV137) return;
  window.__mindsExternalExtraClientsV137=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const canManage=x=>typeof canManageExtra==='function'?canManageExtra(x):(isAdmin()||(x?.person_id===profile?.id&&x?.created_by===profile?.id));

  function clientLabel(x){
    if(x.kind==='ajans') return '<span class="badge blue">Ajans İçi</span>';
    if(x.firm_id){
      const f=typeof firm==='function'?firm(x.firm_id):(state.firms||[]).find(v=>v.id===x.firm_id);
      return `<b>${esc(f?.name||'Kayıtlı Firma')}</b><div class="muted">Kayıtlı firma</div>`;
    }
    if(x.external_client_name) return `<b>${esc(x.external_client_name)}</b><div class="muted"><span class="badge yellow">Harici</span> Tek seferlik müşteri / kişi</div>`;
    return '—';
  }

  function renderExtrasV137(){
    const rows=typeof monthExtras==='function'?monthExtras():(state.extras||[]).filter(x=>x.month===selectedMonth);
    const tbody=document.getElementById('extraRows'); if(!tbody) return;
    tbody.innerHTML=rows.map(x=>`<tr>
      <td>${x.kind==='firma'?'Müşteri':'Ajans'}</td>
      <td>${x.source==='staff'?'Personel':'Yönetici'}</td>
      <td>${clientLabel(x)}</td>
      <td><b>${esc(x.title)}</b></td>
      <td>${Number(x.quantity||0)}</td>
      <td>${esc(typeof personName==='function'?personName(x.person_id):'—')}</td>
      <td>${typeof formatDate==='function'?formatDate(x.work_date):esc(x.work_date)}</td>
      <td>${typeof actionButtons==='function'?actionButtons('extra',x.id,canManage(x)):(canManage(x)?`<button class="small-primary" data-edit-extra="${x.id}">Güncelle</button>`:'—')}</td>
    </tr>`).join('')||'<tr><td colspan="8" class="empty">Bu ay ekstra iş yok.</td></tr>';
  }

  function openExtraModalV137(x=null){
    if(x && !canManage(x)) return toast('Bu ekstra işi düzenleme yetkin yok.',true);
    const available=typeof activeFirms==='function'?activeFirms():(state.firms||[]).filter(f=>f.active);
    const mode=x?.kind==='ajans'?'agency':x?.external_client_name?'external':'registered';
    const selectedPerson=x?.person_id||profile.id;

    openModal(x?'Ekstra İşi Güncelle':'Ekstra İş Ekle',`<div class="form-grid">
      <div class="field full"><label>İş Kimin İçin?</label><select name="target_mode" id="extraTargetModeV137">
        <option value="registered" ${mode==='registered'?'selected':''}>Kayıtlı Firma</option>
        <option value="external" ${mode==='external'?'selected':''}>Harici Müşteri / Kişi</option>
        <option value="agency" ${mode==='agency'?'selected':''}>Ajans İçi</option>
      </select><div class="field-help">Harici müşteri burada yazılır; Firmalar listesine eklenmez.</div></div>
      <div class="field full" id="extraRegisteredFirmV137"><label>Kayıtlı Firma</label><select name="firm"><option value="">Seç</option>${available.map(f=>`<option value="${f.id}" ${x?.firm_id===f.id?'selected':''}>${esc(f.name)}</option>`).join('')}</select></div>
      <div class="field full" id="extraExternalClientV137"><label>Harici Müşteri / Kişi Adı</label><input name="external_client" maxlength="120" placeholder="Örn. Ahmet Yılmaz / ABC Marka" value="${esc(x?.external_client_name||'')}"><div class="field-help">Tek seferlik edit, logo, katalog, çekim sonrası kurgu vb. işler için.</div></div>
      ${isAdmin()?`<div class="field full"><label>İşi Yapan Personel</label><select name="person">${activeProfiles().map(p=>`<option value="${p.id}" ${p.id===selectedPerson?'selected':''}>${esc(p.full_name)}</option>`).join('')}</select></div>`:`<input type="hidden" name="person" value="${profile.id}">`}
      <div class="field full"><label>Yapılan İş</label><input name="title" required placeholder="Örn. Reels edit / logo tasarımı" value="${esc(x?.title||'')}"></div>
      <div class="field"><label>Adet</label><input name="qty" type="number" min="1" step="1" required value="${x?.quantity??1}"></div>
      <div class="field"><label>Tarih</label><input name="date" type="date" required value="${x?.work_date||(typeof defaultDateForSelectedMonth==='function'?defaultDateForSelectedMonth():new Date().toISOString().slice(0,10))}"></div>
      <div class="field full"><label>Not</label><textarea name="notes">${esc(x?.notes||'')}</textarea></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div>
    </div>`,async fd=>{
      const targetMode=String(fd.get('target_mode')||'registered');
      const fid=String(fd.get('firm')||'').trim()||null;
      const external=String(fd.get('external_client')||'').trim();
      if(targetMode==='registered'&&!fid) throw new Error('Kayıtlı firma seçmelisin.');
      if(targetMode==='external'&&external.length<2) throw new Error('Harici müşteri / kişi adını yazmalısın.');
      if(external.length>120) throw new Error('Harici müşteri adı en fazla 120 karakter olabilir.');
      if(typeof assertSelectedMonthDate==='function') assertSelectedMonthDate(fd.get('date'),'Ekstra iş tarihi');
      const q=Number(fd.get('qty')); if(!Number.isInteger(q)||q<1) throw new Error('Ekstra iş adedi en az 1 olmalı.');
      const targetPerson=isAdmin()?(fd.get('person')||profile.id):profile.id;
      const payload={
        month:selectedMonth,
        kind:targetMode==='agency'?'ajans':'firma',
        firm_id:targetMode==='registered'?fid:null,
        external_client_name:targetMode==='external'?external:null,
        title:String(fd.get('title')||'').trim(),
        quantity:q,
        person_id:targetPerson,
        work_date:fd.get('date'),
        notes:String(fd.get('notes')||'').trim()||null
      };
      if(x){
        const {error}=await sb.from('extra_works').update(payload).eq('id',x.id); if(error) throw error;
      }else{
        payload.source=isAdmin()?'admin':'staff'; payload.created_by=profile.id;
        const {error}=await sb.from('extra_works').insert(payload); if(error) throw error;
      }
    });

    setTimeout(()=>{
      const modeSel=document.getElementById('extraTargetModeV137');
      const reg=document.getElementById('extraRegisteredFirmV137');
      const ext=document.getElementById('extraExternalClientV137');
      const sync=()=>{
        const v=modeSel?.value||'registered';
        if(reg) reg.style.display=v==='registered'?'':'none';
        if(ext) ext.style.display=v==='external'?'':'none';
      };
      modeSel?.addEventListener('change',sync); sync();
    },0);
  }

  openExtraModal=openExtraModalV137;
  renderExtras=renderExtrasV137;
  window.openExtraModal=openExtraModalV137;

  // Existing edit/delete click handlers continue to work because they call the global openExtraModal.
  try{ renderExtrasV137(); }catch(e){ console.warn('External extra initial render',e); }
})();
