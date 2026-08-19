function setView(v){ if(!isAdmin()&&ADMIN_VIEWS.has(v)) v='dashboard'; document.querySelectorAll('.view').forEach(x=>x.classList.remove('active-view')); el(v).classList.add('active-view'); document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===v)); const names=isAdmin()?{dashboard:'Ana Panel',firms:'Firmalar',works:'İş Takibi',shares:'Paylaşım Takibi',extras:'Ekstra İşler',shoots:'Çekimler',team:'Ekip',activity:'Günlük Hareketler',reports:'Raporlar',archive:'Arşiv',settings:'Ayarlar'}:{dashboard:'Ana Panel',firms:'Firmalarım',works:'Görevlerim',shares:'Paylaşım Bekleyenler',extras:'Ekstra İşler',shoots:'Çekimler',activity:'Günlük Hareketlerim'}; el('pageTitle').textContent=names[v]||'Mind\'s Takip'; }
function closeModal(){ el('modal').classList.add('hidden'); el('modalForm').innerHTML=''; }
function openModal(title,html,onSubmit){
  el('modalTitle').textContent=title; el('modalForm').innerHTML=html; el('modal').classList.remove('hidden');
  let submitting=false;
  el('modalForm').onsubmit=async e=>{
    e.preventDefault(); if(submitting) return; submitting=true;
    const submit=e.target.querySelector('[type="submit"],button:not([type="button"])');
    if(submit){ submit.disabled=true; submit.dataset.oldText=submit.textContent; submit.textContent='Kaydediliyor…'; }
    try{ await onSubmit(new FormData(e.target)); closeModal(); await loadData(); toast('Kaydedildi.'); }
    catch(err){ console.error(err); toast(friendlyError(err),true); if(submit){ submit.disabled=false; submit.textContent=submit.dataset.oldText||'Kaydet'; } }
    finally{ submitting=false; }
  };
}
function peopleOptions(selected=''){ return activeProfiles().map(p=>`<option value="${p.id}" ${p.id===selected?'selected':''}>${escapeHtml(p.full_name)}</option>`).join(''); }
function firmOptions(){ return activeFirms().map(f=>`<option value="${f.id}">${escapeHtml(f.name)}</option>`).join(''); }

function openFirmModal(f=null){ if(!isAdmin()) return toast('Bu işlem yalnızca yönetici hesabında kullanılabilir.',true);
  if(!isAdmin()) return;
  const ass=f?assignedPeople(f.id):[], respMap=Object.fromEntries(ass.map(x=>[x.a.responsibility,x.p.id]));
  openModal(f?'Firmayı Düzenle':'Yeni Firma',`<div class="form-grid"><div class="field full"><label>Firma Adı</label><input name="name" required value="${escapeHtml(f?.name||'')}"></div><div class="field"><label>Sektör</label><input name="sector" value="${escapeHtml(f?.sector||'')}"></div><div class="field"><label>Firma Logosu</label><input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></div><div class="field"><label>Aylık Post Paketi</label><input name="post" type="number" min="0" required value="${f?.default_post_quota??0}"></div><div class="field"><label>Aylık Video Paketi</label><input name="video_quota" type="number" min="0" required value="${f?.default_video_quota??0}"></div><div class="field full"><div class="field-help">Paket değişikliği mevcut ay ve sonraki aylar için geçerlidir. Geçmiş ay paketleri değiştirilmez.</div></div>${['ana_sorumlu','tasarim','video','sosyal_medya'].map(r=>`<div class="field"><label>${({ana_sorumlu:'Ana Sorumlu',tasarim:'Tasarım',video:'Video',sosyal_medya:'Sosyal Medya'})[r]}</label><select name="resp_${r}"><option value="">Seçilmedi</option>${peopleOptions(respMap[r]||'')}</select></div>`).join('')}<div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div></div>`,async fd=>{
    const name=String(fd.get('name')||'').trim(); if(!name) throw new Error('Firma adı gerekli.');
    const post=Number(fd.get('post')), video=Number(fd.get('video_quota')); if(!Number.isInteger(post)||post<0||!Number.isInteger(video)||video<0) throw new Error('Paket adetleri 0 veya daha büyük tam sayı olmalı.');
    const assignments=['ana_sorumlu','tasarim','video','sosyal_medya'].map(r=>({person_id:fd.get('resp_'+r)||'',responsibility:r})).filter(x=>x.person_id);
    let logoPath=f?.logo_path||null, uploadedLogo=null; const oldLogo=f?.logo_path||null, file=fd.get('logo');
    if(file&&file.size){ const ext=(file.name.split('.').pop()||'png').toLowerCase(); uploadedLogo=`${crypto.randomUUID()}.${ext}`; const up=await sb.storage.from('firm-logos').upload(uploadedLogo,file,{upsert:false}); if(up.error) throw up.error; logoPath=uploadedLogo; }
    try{
      const {error}=await sb.rpc('admin_save_firm',{p_firm_id:f?.id||null,p_name:name,p_sector:String(fd.get('sector')||'').trim()||null,p_logo_path:logoPath,p_post_quota:post,p_video_quota:video,p_assignments:assignments});
      if(error) throw error;
      if(uploadedLogo&&oldLogo&&oldLogo!==uploadedLogo){ const rm=await sb.storage.from('firm-logos').remove([oldLogo]); if(rm.error) console.warn('Eski logo temizlenemedi',rm.error); }
    }catch(err){ if(uploadedLogo){ const rm=await sb.storage.from('firm-logos').remove([uploadedLogo]); if(rm.error) console.warn('Yeni logo geri alınamadı',rm.error); } throw err; }
  });
}
