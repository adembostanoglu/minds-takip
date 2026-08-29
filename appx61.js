// V1.20.8 — Paket kotası aşım koruması: canlı sayaç + kaydetmeden önce net onay uyarısı.
(function bootPackageQuotaGuardV208(){
  if(window.__mindsPackageQuotaGuardV208)return;
  window.__mindsPackageQuotaGuardV208=true;

  const READY=new Set(['hazir','onaylandi']);
  const qty=w=>{try{return typeof workQty==='function'?workQty(w):Math.max(1,Number(w?.quantity||1));}catch(_e){return Math.max(1,Number(w?.quantity||1));}};
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');

  function installStyle(){
    if(document.getElementById('packageQuotaGuardV208Style'))return;
    const s=document.createElement('style');
    s.id='packageQuotaGuardV208Style';
    s.textContent=`
      .quota-guard-v208{grid-column:1/-1;border:1px solid #3a454b;border-radius:10px;background:#11181c;padding:11px 12px;display:none;align-items:center;justify-content:space-between;gap:12px;font-size:11px;line-height:1.35}
      .quota-guard-v208.show{display:flex}.quota-guard-v208 strong{font-size:12px;color:#edf2f4}.quota-guard-v208 span{color:#9ba6ac}
      .quota-guard-v208.safe{border-color:#315840;background:#0f1d16}.quota-guard-v208.safe strong{color:#9cddb0}
      .quota-guard-v208.warn{border-color:#7a6821;background:#201d0d;box-shadow:0 0 0 1px rgba(231,219,42,.05)}.quota-guard-v208.warn strong{color:#f0e53d}.quota-guard-v208.warn span{color:#d2c887}
      .quota-guard-v208 .quota-pill-v208{flex:0 0 auto;border-radius:8px;padding:6px 9px;font-weight:900;font-size:11px;white-space:nowrap;background:#0d1317;border:1px solid currentColor}
      @media(max-width:700px){.quota-guard-v208{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(s);
  }

  function snapshot(form,w){
    const fd=new FormData(form);
    const fm=w?(state?.months||[]).find(m=>m.id===w.firm_month_id):null;
    const fid=w?fm?.firm_id:fd.get('firm');
    const month=fid&&typeof currentFirmMonth==='function'?currentFirmMonth(fid):null;
    const type=String(fd.get('type')||w?.type||'post');
    const quantity=Number(fd.get('quantity'));
    const status=String(fd.get('status')||w?.status||'bekliyor');
    const f=fid&&typeof firm==='function'?firm(fid):null;
    if(!month||!Number.isInteger(quantity)||quantity<1)return null;

    const quota=Number(type==='video'?month.video_quota:month.post_quota)||0;
    const base=(state?.works||[])
      .filter(x=>x.firm_month_id===month.id&&x.id!==w?.id&&x.type===type&&READY.has(x.status))
      .reduce((sum,x)=>sum+qty(x),0);
    const countsNow=READY.has(status);
    const projected=base+(countsNow?quantity:0);
    const oldSameCounted=!!w&&w.type===type&&READY.has(w.status);
    const beforeWithOld=base+(oldSameCounted?qty(w):0);
    const exceeds=countsNow&&projected>quota;
    const increasesOver=exceeds&&(!w||projected>beforeWithOld||!oldSameCounted);
    return {fid,month,type,quantity,status,quota,base,projected,beforeWithOld,exceeds,increasesOver,countsNow,firmName:f?.name||'Firma'};
  }

  function attach(form,w){
    if(!form||form.dataset.quotaGuardV208==='1')return;
    form.dataset.quotaGuardV208='1';
    installStyle();

    const actions=form.querySelector('.form-actions');
    const box=document.createElement('div');
    box.className='quota-guard-v208';
    if(actions)actions.insertAdjacentElement('beforebegin',box);else form.appendChild(box);

    function paint(){
      const s=snapshot(form,w);
      if(!s){box.className='quota-guard-v208';box.innerHTML='';return;}
      const label=s.type==='video'?'Video':'Post';
      if(!s.countsNow){
        box.className='quota-guard-v208 show';
        box.innerHTML=`<div><strong>${label} paketi: ${s.base}/${s.quota}</strong><br><span>Bu kayıt henüz Hazır/Onaylandı olmadığı için paket sayacına eklenmeyecek.</span></div><div class="quota-pill-v208">+${s.quantity} beklemede</div>`;
        return;
      }
      if(s.exceeds){
        box.className='quota-guard-v208 show warn';
        box.innerHTML=`<div><strong>⚠ Paket kotası aşılacak</strong><br><span>Şu an ${s.base}/${s.quota} ${label.toLocaleLowerCase('tr-TR')} var. Bu kayıt ${s.quantity} adet. Kaydedilirse toplam <b>${s.projected}/${s.quota}</b> olacak.</span></div><div class="quota-pill-v208">${s.projected}/${s.quota}</div>`;
      }else{
        box.className='quota-guard-v208 show safe';
        box.innerHTML=`<div><strong>✓ Paket kontrolü</strong><br><span>${label}: ${s.base}/${s.quota} + ${s.quantity} = ${s.projected}/${s.quota}</span></div><div class="quota-pill-v208">${s.projected}/${s.quota}</div>`;
      }
    }

    ['input','change'].forEach(evt=>form.addEventListener(evt,e=>{
      if(e.target?.matches?.('[name="firm"],[name="type"],[name="quantity"],[name="status"]'))paint();
    }));

    const originalSubmit=form.onsubmit;
    if(typeof originalSubmit==='function'){
      form.onsubmit=function(e){
        const s=snapshot(form,w);
        if(s?.increasesOver){
          e.preventDefault();
          const label=s.type==='video'?'video':'post';
          const ok=confirm(`${s.firmName} için paket kotası aşılacak.\n\nŞu an: ${s.base}/${s.quota} ${label}\nBu kayıt: +${s.quantity}\nKaydedilirse: ${s.projected}/${s.quota}\n\nBu adedi gerçekten yeni yapılan içerik olarak eklemek istediğine emin misin?`);
          if(!ok)return false;
        }
        return originalSubmit.call(this,e);
      };
    }
    paint();
  }

  function wrapCurrent(){
    if(typeof openWorkModal!=='function')return false;
    if(openWorkModal.__mindsQuotaGuardV208)return true;
    const previous=openWorkModal;
    const guarded=function(w=null){
      const result=previous.apply(this,arguments);
      setTimeout(()=>attach(document.getElementById('modalForm'),w),0);
      return result;
    };
    guarded.__mindsQuotaGuardV208=true;
    guarded.__mindsQuotaGuardBase=previous;
    try{openWorkModal=guarded;}catch(_e){}
    try{window.openWorkModal=guarded;}catch(_e){}
    return true;
  }

  wrapCurrent();
  [80,250,700,1500,3000,5500].forEach(ms=>setTimeout(wrapCurrent,ms));
})();
