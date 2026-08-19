// Events
el('loginBtn').onclick=login; el('setupBtn').onclick=setupAdmin; el('showSetupBtn').onclick=()=>{el('loginBox').classList.add('hidden');el('setupBox').classList.remove('hidden')}; el('showLoginBtn').onclick=()=>{el('setupBox').classList.add('hidden');el('loginBox').classList.remove('hidden')};
el('logoutBtn').onclick=async()=>{await sb.auth.signOut();location.reload()}; el('modalClose').onclick=closeModal; el('modal').onclick=e=>{if(e.target===el('modal'))closeModal()};
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>setView(b.dataset.view));
el('monthPicker').onchange=async e=>{selectedMonth=e.target.value;await loadData()};
el('quickAddFirmBtn').onclick=()=>openFirmModal(); el('addFirmBtn').onclick=()=>openFirmModal(); el('addWorkBtn').onclick=()=>openWorkModal(); el('addExtraBtn').onclick=()=>openExtraModal(); el('addShootBtn').onclick=()=>openShootModal(); el('addPersonBtn').onclick=()=>openPersonModal();
document.addEventListener('click',async e=>{ const a=e.target.closest('[data-action]'); if(a){ if(a.dataset.action==='firm')openFirmModal(); if(a.dataset.action==='work')openWorkModal(); if(a.dataset.action==='extra')openExtraModal(); if(a.dataset.action==='shoot')openShootModal(); }
  const ef=e.target.closest('[data-edit-firm]'); if(ef) openFirmModal(firm(ef.dataset.editFirm));
  const tf=e.target.closest('[data-toggle-firm]'); if(tf&&isAdmin()){ const active=tf.dataset.active==='true'; const f=firm(tf.dataset.toggleFirm); if(!confirm(`${f.name} ${active?'pasife alınsın mı?':'yeniden aktif edilsin mi?'}`)) return; const payload={active:!active,deactivated_at:active?todayISO():null}; if(!active) payload.list_order_at=new Date().toISOString(); const {error}=await sb.from('firms').update(payload).eq('id',f.id); if(error)toast(error.message,true); else { if(!active){ const r=await sb.rpc('ensure_month',{target_month:monthISO()}); if(r.error) console.warn(r.error); } await loadData(); }}
  const df=e.target.closest('[data-delete-firm]'); if(df&&isAdmin()){
    const f=firm(df.dataset.deleteFirm); if(!f)return;
    const months=state.months.filter(m=>m.firm_id===f.id), monthIds=new Set(months.map(m=>m.id));
    const impact={works:state.works.filter(w=>monthIds.has(w.firm_month_id)).length,shoots:state.shoots.filter(x=>x.firm_id===f.id).length,extras:state.extras.filter(x=>x.firm_id===f.id).length,months:months.length};
    if(!confirm(`${f.name} kalıcı olarak silinsin mi?\n\nSilinecek bağlı kayıtlar:\n• ${impact.months} aylık paket kaydı\n• ${impact.works} paket işi\n• ${impact.shoots} çekim kaydı\n• ${impact.extras} ekstra iş\n\nNormal müşteri ayrılığında “Pasife Al” kullan.`)) return;
    const typed=prompt(`Kalıcı silmeyi onaylamak için firma adını aynen yaz:\n${f.name}`); if(typed!==f.name){ if(typed!==null) toast('Firma adı eşleşmedi; silme iptal edildi.',true); return; }
    const {error}=await sb.rpc('admin_delete_firm',{p_firm_id:f.id});
    if(error) toast('Firma silinemedi: '+friendlyError(error),true);
    else { if(f.logo_path){ const rm=await sb.storage.from('firm-logos').remove([f.logo_path]); if(rm.error) console.warn('Logo dosyası temizlenemedi',rm.error); } await loadData(); toast('Firma ve bağlı kayıtları kalıcı olarak silindi.'); }
  }
  const ew=e.target.closest('[data-edit-work]'); if(ew) openWorkModal(state.works.find(w=>w.id===ew.dataset.editWork));
  const esh=e.target.closest('[data-edit-shoot]'); if(esh) openShootModal(state.shoots.find(x=>x.id===esh.dataset.editShoot));
  const sw=e.target.closest('[data-share-work]'); if(sw){ const work=state.works.find(w=>w.id===sw.dataset.shareWork); const shareDate=selectedMonth===monthISO()?todayISO():(work?.work_date||defaultDateForSelectedMonth()); const {error}=await sb.from('works').update({share_status:'paylasildi',shared_date:shareDate}).eq('id',sw.dataset.shareWork); if(error)toast(friendlyError(error),true); else await loadData(); }
  const tp=e.target.closest('[data-toggle-person]'); if(tp&&isAdmin()){ try{await manageUser({action:'active',user_id:tp.dataset.togglePerson,active:tp.dataset.active!=='true'});await loadData();toast('Personel durumu güncellendi.')}catch(err){toast(err.message,true)} }
  const rp=e.target.closest('[data-reset-pass]'); if(rp&&isAdmin()){ const pass=prompt('Yeni şifreyi gir (en az 8 karakter):'); if(!pass)return; try{await manageUser({action:'password',user_id:rp.dataset.resetPass,password:pass});toast('Şifre güncellendi.')}catch(err){toast(err.message,true)} }
});

(async()=>{
  const {data}=await sb.auth.getSession();
  if(data.session){ session=data.session; const ok=await startApp(); if(!ok) await bootstrapCheck(); }
  else { await bootstrapCheck(); }
})();
