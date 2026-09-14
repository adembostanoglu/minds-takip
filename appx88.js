// V1.24.7 — Personel kendi eklediği İş Takibi kayıtlarını düzenleyebilir ve silebilir.
// Yönetici tarafından personele atanmış işler silinemez; yalnızca personelin bizzat oluşturduğu kayıtlar silinebilir.
(function bootStaffOwnWorkDeleteV247(){
  if(window.__mindsStaffOwnWorkDeleteV247)return;
  if(typeof sb==='undefined'||typeof state==='undefined'||!profile){
    setTimeout(bootStaffOwnWorkDeleteV247,120);return;
  }
  window.__mindsStaffOwnWorkDeleteV247=true;

  let deleting=false;
  const admin=()=>{try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return false;}};
  const mine=w=>{try{return typeof staffOwnWork==='function'&&staffOwnWork(w);}catch(_e){return false;}};
  const workById=id=>(state.works||[]).find(w=>String(w.id)===String(id));
  const canDelete=w=>!admin()&&!!w&&mine(w)&&String(w.created_by||'')===String(profile?.id||'');
  const firmName=w=>{
    const fm=(state.months||[]).find(m=>m.id===w?.firm_month_id);
    return fm?(state.firms||[]).find(f=>f.id===fm.firm_id)?.name||'Firma':'Firma';
  };

  function installStyle(){
    if(document.getElementById('staffOwnWorkDeleteV247Style'))return;
    const s=document.createElement('style');s.id='staffOwnWorkDeleteV247Style';s.textContent=`
      #works .staff-delete-work-v247{border-color:#603238!important;background:#2a171a!important;color:#ef8585!important}
      #works .staff-delete-work-v247:hover{background:#3a1b20!important;border-color:#85414a!important;color:#ffaaaa!important}
    `;document.head.appendChild(s);
  }

  function decorate(){
    if(admin())return;
    const host=document.getElementById('worksPersonGridV228');if(!host)return;
    host.querySelectorAll('.works-job-v228[data-work-id]:not(.works-completion-clone-v244)').forEach(card=>{
      const w=workById(card.dataset.workId),actions=card.querySelector('.works-actions-v228');
      if(!actions)return;
      const old=actions.querySelector('.staff-delete-work-v247');
      if(!canDelete(w)){old?.remove();return;}
      if(old)return;
      const btn=document.createElement('button');
      btn.type='button';btn.className='small-danger staff-delete-work-v247';btn.dataset.staffDeleteWorkV247=String(w.id);btn.textContent='Sil';
      actions.appendChild(btn);
    });
  }

  async function removeWork(w){
    if(deleting||!canDelete(w))return;
    const f=firmName(w),title=String(w.title||'İş');
    if(!confirm(`${f} — ${title}\n\nBu iş kaydı silinsin mi?\nBu işlem geri alınamaz.`))return;
    deleting=true;
    try{
      // Paylaşıma dönüşmüş gerçek içerik varsa veritabanı zaten personel silmesini engeller.
      const {data,error}=await sb.from('works').delete().eq('id',w.id).select('id');
      if(error)throw error;
      if(!Array.isArray(data)||!data.length)throw new Error('Bu kaydı silme yetkin yok.');
      if(typeof toast==='function')toast('İş kaydı silindi.');
      if(typeof loadData==='function')await loadData();
      else if(Array.isArray(state.works)){state.works=state.works.filter(x=>x.id!==w.id);}
      setTimeout(decorate,60);
    }catch(e){
      const msg=String(e?.message||e||'');
      const shared=/shared_work_delete_admin_only|content_shares|foreign key/i.test(msg);
      if(typeof toast==='function')toast(shared?'Bu işte gerçek paylaşım kaydı olduğu için yalnızca yönetici silebilir.':`İş silinemedi: ${typeof friendlyError==='function'?friendlyError(e):msg}`,true);
    }finally{deleting=false;}
  }

  installStyle();
  document.addEventListener('click',e=>{
    const del=e.target.closest('[data-staff-delete-work-v247]');
    if(del){e.preventDefault();e.stopPropagation();const w=workById(del.dataset.staffDeleteWorkV247);removeWork(w);return;}
    if(e.target.closest('[data-view="works"]')){setTimeout(decorate,100);setTimeout(decorate,280);}
  },true);
  document.getElementById('monthPicker')?.addEventListener('change',()=>setTimeout(decorate,220));

  if(typeof renderAll==='function'&&!renderAll.__mindsStaffOwnWorkDeleteV247){
    const prev=renderAll;
    const wrapped=function(){const out=prev.apply(this,arguments);setTimeout(decorate,30);return out;};
    wrapped.__mindsStaffOwnWorkDeleteV247=true;
    try{renderAll=wrapped;}catch(_e){}
  }

  [180,500,1100].forEach(ms=>setTimeout(decorate,ms));
})();

// V1.24.8 loader bridge — Cumartesi nöbetçisi 18:30 sonrası fazla mesai.
(function loadDutyOvertimeV248(){
  if(document.querySelector('script[data-minds-v248-duty-overtime]'))return;
  const s=document.createElement('script');
  s.src='appx89.js?v=2480';s.async=false;s.setAttribute('data-minds-v248-duty-overtime','1');
  s.onerror=()=>console.error('V1.24.8 duty overtime module could not be loaded');
  document.body.appendChild(s);
})();
