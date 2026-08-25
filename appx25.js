// V1.14.0 — previous-month carryover backlog, pinned directly below dashboard KPIs for admin visibility.
(function bootCarryoverV140(){
  if(typeof sb==='undefined' || typeof state==='undefined' || typeof renderAll!=='function'){
    setTimeout(bootCarryoverV140,120); return;
  }
  if(window.__mindsCarryoverV140) return;
  window.__mindsCarryoverV140=true;
  let lastRows=[];
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const monthLabel=v=>typeof prettyMonth==='function'?prettyMonth(v):String(v||'');
  function previousMonth(v){ const d=new Date(`${String(v).slice(0,10)}T12:00:00`); d.setMonth(d.getMonth()-1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`; }
  function currentMonth(){ return typeof monthISO==='function'?monthISO():new Date().toISOString().slice(0,7)+'-01'; }
  function ensurePanel(){
    const dash=document.getElementById('dashboard'); if(!dash) return null;
    if(typeof isAdmin==='function' && !isAdmin()){
      document.getElementById('carryoverPanelV138')?.remove();
      return null;
    }
    let panel=document.getElementById('carryoverPanelV138');
    if(!panel){
      panel=document.createElement('section');
      panel.id='carryoverPanelV138';
      panel.className='panel admin-only';
      panel.style.margin='12px 0';
    }
    // Always keep this directly below the KPI cards and before Ekip Anlık Durumu.
    const stats=document.getElementById('stats');
    if(stats && stats.nextElementSibling!==panel) stats.insertAdjacentElement('afterend',panel);
    else if(!panel.parentNode) dash.prepend(panel);
    return panel;
  }
  async function refreshCarryover(){
    if(!profile) return;
    const panel=ensurePanel(); if(!panel) return;
    const source=previousMonth(selectedMonth);
    panel.innerHTML=`<div class="panel-head"><div><h3>Geçen Aydan Kalanlar</h3><p>${monthLabel(source)} ayından ${monthLabel(selectedMonth)} ayına devreden eksik içerikler</p></div><span class="badge yellow">Kontrol ediliyor</span></div>`;
    const {data,error}=await sb.rpc('carryover_preview',{p_source_month:source});
    if(error){
      panel.innerHTML=`<div class="panel-head"><div><h3>Geçen Aydan Kalanlar</h3><p>${monthLabel(source)} eksikleri</p></div><span class="badge orange">Kontrol edilemedi</span></div><div class="empty compact-empty">Liste alınamadı.</div>`;
      console.warn('carryover_preview',error); return;
    }
    lastRows=data||[];
    const canComplete=selectedMonth===currentMonth();
    panel.innerHTML=`<div class="panel-head"><div><h3>Geçen Aydan Kalanlar</h3><p>${monthLabel(source)} ayında eksik kalan işler ${monthLabel(selectedMonth)} paketine karışmadan burada takip edilir.</p></div><span class="badge ${lastRows.length?'orange':'green'}">${lastRows.length?`${lastRows.length} eksik kalem`:'✓ Eksik yok'}</span></div>
      ${lastRows.length?`<div class="table-wrap"><table><thead><tr><th>Firma</th><th>İçerik</th><th>Paket</th><th>Önceki Ay Hazır</th><th>Devirde Tamamlanan</th><th>Kalan</th><th>Sorumlu</th><th>İşlem</th></tr></thead><tbody>${lastRows.map((r,i)=>`<tr><td><b>${esc(r.firm_name)}</b></td><td><span class="badge ${r.type==='post'?'blue':'yellow'}">${r.type==='post'?'Post':'Video'}</span></td><td>${r.package_qty}</td><td>${r.prepared_qty}</td><td>${r.carryover_done}</td><td><b>${r.remaining_qty}</b></td><td>${(r.responsible_names||[]).map(esc).join(', ')||'—'}</td><td>${canComplete?`<button class="small-primary" data-carryover-complete="${i}">Tamamlandı</button>`:'<span class="muted">Sadece güncel ayda kapatılır</span>'}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty compact-empty">${monthLabel(source)} ayından devreden eksik içerik yok. ${selectedMonth==='2026-08-01'?'Ağustos eksikleri Eylül ayına geçtiğinde burada otomatik listelenecek.':''}</div>`}`;
  }
  async function openComplete(row){
    const names=row.responsible_names||[], ids=row.responsible_ids||[];
    const candidates=ids.map((id,i)=>({id,name:names[i]||((state.profiles||[]).find(p=>p.id===id)?.full_name)||'Personel'}));
    const options=(candidates.length?candidates:(state.profiles||[]).filter(p=>p.active&&p.role==='staff').map(p=>({id:p.id,name:p.full_name})));
    openModal('Geçen Aydan Kalanı Tamamla',`<div class="form-grid"><div class="field full"><label>Firma / İçerik</label><input value="${esc(row.firm_name)} · ${row.type==='post'?'Post':'Video'}" disabled></div><div class="field"><label>Kalan Adet</label><input value="${row.remaining_qty}" disabled></div><div class="field"><label>Tamamlanan Adet</label><input name="qty" type="number" min="1" max="${row.remaining_qty}" value="${row.remaining_qty}" required></div>${isAdmin()?`<div class="field full"><label>Tamamlayan Personel</label><select name="person">${options.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></div>`:`<input type="hidden" name="person" value="${profile.id}">`}<div class="field full"><label>Not</label><textarea name="notes" placeholder="İstersen kısa not ekle"></textarea></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Tamamlandı Olarak Kaydet</button></div></div>`,async fd=>{
      const q=Number(fd.get('qty')); if(!Number.isInteger(q)||q<1||q>Number(row.remaining_qty)) throw new Error('Adet geçersiz.');
      const {error}=await sb.rpc('complete_carryover',{p_source_month:row.source_month,p_firm_id:row.firm_id,p_type:row.type,p_quantity:q,p_person_id:fd.get('person')||null,p_notes:String(fd.get('notes')||'').trim()||null});
      if(error) throw error;
      setTimeout(()=>refreshCarryover(),80);
    });
  }
  document.addEventListener('click',e=>{ const b=e.target.closest('[data-carryover-complete]'); if(!b)return; const r=lastRows[Number(b.dataset.carryoverComplete)]; if(r) openComplete(r); });
  document.addEventListener('change',e=>{ if(e.target?.id==='monthPicker') setTimeout(refreshCarryover,120); });
  const prev=renderAll;
  renderAll=function(){ prev(); setTimeout(refreshCarryover,50); };
  setTimeout(refreshCarryover,300);
})();