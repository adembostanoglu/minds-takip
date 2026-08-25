// V1.13.9 — monthly "shoot not planned" exemptions that reduce performance shoot targets.
(function bootShootExemptionsV139(){
  if(typeof sb==='undefined' || typeof state==='undefined' || typeof renderAll!=='function'){
    setTimeout(bootShootExemptionsV139,120); return;
  }
  if(window.__mindsShootExemptionsV139) return;
  window.__mindsShootExemptionsV139=true;
  let exemptions=[];
  let firms=[];
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const nameOf=id=>(state.profiles||[]).find(p=>p.id===id)?.full_name||'Personel';
  function currentMonth(){ return typeof monthISO==='function'?monthISO():new Date().toISOString().slice(0,7)+'-01'; }
  async function loadFirms(){
    const {data,error}=await sb.rpc('list_shoot_firms_for_team');
    if(!error) firms=data||[];
  }
  function firmName(id){ return firms.find(f=>f.id===id)?.name||(state.firms||[]).find(f=>f.id===id)?.name||'Firma'; }
  function ensureUI(){
    const section=document.getElementById('shoots'); if(!section)return null;
    const actions=section.querySelector('.section-actions');
    let btn=document.getElementById('addShootExemptionBtnV139');
    if(!btn&&actions){
      btn=document.createElement('button'); btn.id='addShootExemptionBtnV139'; btn.className='ghost'; btn.textContent='+ Çekim Yapılmadı'; btn.style.marginLeft='8px';
      const existing=document.getElementById('addShootBtn'); existing?.insertAdjacentElement('afterend',btn);
      btn.addEventListener('click',openExemptionModal);
    }
    if(btn) btn.style.display=selectedMonth===currentMonth()?'':'none';
    let panel=document.getElementById('shootExemptionPanelV139');
    if(!panel){ panel=document.createElement('div'); panel.id='shootExemptionPanelV139'; panel.className='panel'; panel.style.marginBottom='12px'; const info=document.getElementById('sharedShootsInfoV124'); (info||actions)?.insertAdjacentElement('afterend',panel); }
    return panel;
  }
  async function refresh(){
    await loadFirms();
    const panel=ensureUI(); if(!panel)return;
    const {data,error}=await sb.from('shoot_exemptions').select('*').eq('month',selectedMonth).order('created_at',{ascending:true});
    if(error){ console.warn('shoot_exemptions',error); return; }
    exemptions=data||[];
    panel.innerHTML=`<div class="panel-head"><div><h3>Çekim Planı İstisnaları</h3><p>O ay çekim yapılması planlanmayan firmalar. Her kayıt ilgili personelin çekim hedefinden 1 birim düşer.</p></div><span class="badge ${exemptions.length?'yellow':'green'}">${exemptions.length?`${exemptions.length} çekim yapılmadı`:'İstisna yok'}</span></div>${exemptions.length?`<div class="table-wrap"><table><thead><tr><th>Firma</th><th>Sorumlu</th><th>Durum</th><th>Not</th><th>İşlem</th></tr></thead><tbody>${exemptions.map(x=>`<tr><td><b>${esc(firmName(x.firm_id))}</b></td><td>${esc(nameOf(x.responsible_id))}</td><td><span class="badge yellow">Bu Ay Çekim Yapılmadı</span></td><td>${esc(x.reason||'—')}</td><td>${isAdmin()||x.responsible_id===profile.id||x.created_by===profile.id?`<button class="small-danger" data-delete-shoot-exemption="${x.id}">Kaldır</button>`:'—'}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty compact-empty">Bu ay için “çekim yapılmadı” işareti yok.</div>'}`;
  }
  async function openExemptionModal(){
    if(selectedMonth!==currentMonth()) return toast('Çekim yapılmadı kaydı yalnızca güncel ay için girilebilir.',true);
    await loadFirms();
    const active=firms.filter(f=>f.active!==false);
    const personField=isAdmin()?`<div class="field full"><label>Çekimden Sorumlu Personel</label><select name="person" required>${(state.profiles||[]).filter(p=>p.active&&p.role==='staff').map(p=>`<option value="${p.id}">${esc(p.full_name)}</option>`).join('')}</select></div>`:`<input type="hidden" name="person" value="${profile.id}"><div class="field full"><label>Çekimden Sorumlu</label><input value="${esc(profile.full_name)}" disabled></div>`;
    openModal('Bu Ay Çekim Yapılmadı',`<div class="form-grid"><div class="field full"><label>Firma</label><select name="firm" required>${active.map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join('')}</select></div>${personField}<div class="field full"><label>Neden / Not</label><textarea name="reason" placeholder="Örn. Bu ay firma çekim istemedi / mevcut stok içerik kullanılacak"></textarea><div class="field-help">Bu kayıt performansta çekim eksikliği olarak değerlendirilmez.</div></div><div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Çekim Yapılmadı Olarak İşaretle</button></div></div>`,async fd=>{
      const payload={month:selectedMonth,firm_id:fd.get('firm'),responsible_id:isAdmin()?fd.get('person'):profile.id,reason:String(fd.get('reason')||'').trim()||null,created_by:profile.id};
      const {error}=await sb.from('shoot_exemptions').upsert(payload,{onConflict:'month,firm_id,responsible_id'}); if(error) throw error;
      setTimeout(refresh,80);
    });
  }
  document.addEventListener('click',async e=>{
    const b=e.target.closest('[data-delete-shoot-exemption]'); if(!b)return;
    const x=exemptions.find(v=>v.id===b.dataset.deleteShootExemption); if(!x)return;
    if(!confirm('“Bu ay çekim yapılmadı” işareti kaldırılsın mı?')) return;
    const {error}=await sb.from('shoot_exemptions').delete().eq('id',x.id); if(error) return toast(error.message,true);
    await refresh();
  });
  document.addEventListener('change',e=>{ if(e.target?.id==='monthPicker') setTimeout(refresh,120); });
  const prev=renderAll; renderAll=function(){ prev(); setTimeout(refresh,60); };
  setTimeout(refresh,350);
})();