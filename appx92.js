// V1.25.3 — Paylaşım Takibi: yeni işler için Onaylandı şartı; daha önce paylaşımına başlanmış hazır işler kaybolmadan devam eder. İş tarihi kartta görünür.
(function bootApprovedShareQueueV253(){
  if(window.__mindsApprovedShareQueueV253)return;
  if(
    typeof state==='undefined'||typeof selectedMonth==='undefined'||!profile||
    typeof renderShares!=='function'||typeof ensureShareTopButton!=='function'||
    typeof monthWorks!=='function'||typeof monthShares!=='function'||
    typeof workQty!=='function'||typeof sharedQty!=='function'||
    typeof remainingToShare!=='function'||typeof canShareWork!=='function'||
    !window.__mindsShareEntryAsliOnlyV231
  ){
    setTimeout(bootApprovedShareQueueV253,120);return;
  }
  window.__mindsApprovedShareQueueV253=true;

  const approved=w=>!!w&&w.status==='onaylandi';
  // Yeni kayıtlar Onaylandı olmadan paylaşım sırasına girmez.
  // Ancak geçmişte paylaşımına başlanmış bir işin kalan adedi varsa, süreç yarıda kaybolmasın diye görünmeye devam eder.
  const eligible=w=>!!w&&(approved(w)||sharedQty(w)>0);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const dateText=v=>typeof formatDate==='function'?formatDate(v):(v||'—');

  function installStyle(){
    if(document.getElementById('approvedShareQueueV253Style'))return;
    const s=document.createElement('style');
    s.id='approvedShareQueueV253Style';
    s.textContent=`
      #shares .share-approved-card-v253{border-color:#31513a;background:linear-gradient(145deg,#101a14,#0d1216);box-shadow:inset 3px 0 0 #55a866}
      #shares .share-approved-card-v253:hover{border-color:#42704e}
      #shares .share-approved-state-v253{font-size:8.5px!important;line-height:1.15!important;white-space:normal!important}
      #shares .share-work-date-v253{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;padding:8px 10px;border:1px solid #29343a;border-radius:9px;background:#11181c}
      #shares .share-work-date-v253 small{color:#829097;font-size:8.5px;font-weight:700}
      #shares .share-work-date-v253 b{color:#e8edef;font-size:10px;font-weight:850}
      @media(max-width:760px){
        #shares .share-approved-state-v253{font-size:8px!important}
        #shares .share-work-date-v253{padding:8px 9px}
      }
    `;
    document.head.appendChild(s);
  }

  function keepOnlyEligibleInNewShareModal(){
    const modal=document.getElementById('modal');
    const form=document.getElementById('modalForm');
    const select=document.getElementById('shareWorkSelect');
    if(!modal||modal.classList.contains('hidden')||!form||!select)return;
    if(String(document.getElementById('modalTitle')?.textContent||'').includes('Güncelle'))return;

    [...select.options].forEach(option=>{
      const w=(state.works||[]).find(x=>String(x.id)===String(option.value));
      if(!eligible(w))option.remove();
    });

    if(!select.options.length){
      if(typeof closeModal==='function')closeModal();
      if(typeof toast==='function')toast('Paylaşım girişi yapılabilecek onaylanmış içerik yok.',true);
      return;
    }
    select.dispatchEvent(new Event('change',{bubbles:true}));
  }

  renderShares=function(){
    ensureShareTopButton();
    installStyle();

    const actions=document.querySelector('#shares .section-actions');
    const intro=actions?.querySelector('p');
    if(intro)intro.textContent='Onaylanan ve paylaşımı devam eden içerikleri, tarihleriyle birlikte takip et.';

    const pending=monthWorks()
      .filter(w=>eligible(w)&&remainingToShare(w)>0)
      .sort((a,b)=>{
        const ad=String(a.work_date||'9999-12-31'),bd=String(b.work_date||'9999-12-31');
        return ad.localeCompare(bd)||String(a.created_at||'').localeCompare(String(b.created_at||''));
      });
    const history=monthShares().slice().sort((a,b)=>String(b.share_date).localeCompare(String(a.share_date))||String(b.created_at).localeCompare(String(a.created_at)));
    const sharedPost=sumSharesOfType(history,'post'),sharedVideo=sumSharesOfType(history,'video');
    const waiting=pending.reduce((n,w)=>n+remainingToShare(w),0);

    el('shareCards').className='share-hub';

    const pendingHtml=pending.map(w=>{
      const f=firm(workFirmId(w)),q=workQty(w),done=sharedQty(w),left=remainingToShare(w),can=canShareWork(w);
      const status=approved(w)
        ? (done?`Onaylandı · ${done}/${q} Paylaşıldı`:'Onaylandı · Paylaşım Bekliyor')
        : `Paylaşım Devam Ediyor · ${done}/${q} Paylaşıldı`;
      return `<div class="share-pending-card share-approved-card-v253">
        <div class="share-pending-top">
          <span class="badge ${done?'blue':'green'} share-approved-state-v253">${status}</span>
          <b>${left} adet kaldı</b>
        </div>
        <h3>${esc(f?.name||'—')}</h3>
        <p>${esc(w.title)}</p>
        <div class="muted">${typeLabel(w.type)} · Hazırlayan: ${esc(personName(w.assigned_to))}</div>
        <div class="share-work-date-v253"><small>İş Tarihi</small><b>${dateText(w.work_date)}</b></div>
        ${can?`<div class="card-bottom"><button class="small-primary" data-share-work-v11="${w.id}">Paylaşım Gir</button></div>`:''}
      </div>`;
    }).join('')||'<div class="empty">Paylaşım bekleyen içerik yok.</div>';

    const historyRows=history.map(s=>{
      const w=state.works.find(x=>x.id===s.work_id),f=firm(workFirmId(w));
      return `<tr><td>${dateText(s.share_date)}</td><td>${esc(f?.name||'—')}</td><td><b>${esc(w?.title||'—')}</b></td><td>${typeLabel(w?.type)} · ${s.quantity}</td><td>${platformLabel(s.platform)}</td><td>${esc(personName(s.shared_by))}</td><td>${esc(s.notes||'—')}</td><td>${canManageShare(s)?`<div class="row-actions"><button class="small-primary" data-edit-share-v11="${s.id}">Güncelle</button><button class="small-danger" data-delete-share-v11="${s.id}">Sil</button></div>`:'—'}</td></tr>`;
    }).join('')||'<tr><td colspan="8" class="empty">Bu ay henüz paylaşım kaydı yok.</td></tr>';

    el('shareCards').innerHTML=`
      <div class="share-summary-grid">
        <div class="stat"><div class="label">Paylaşılan Post</div><div class="value">${sharedPost}</div></div>
        <div class="stat"><div class="label">Paylaşılan Video</div><div class="value">${sharedVideo}</div></div>
        <div class="stat"><div class="label">Paylaşım Bekleyen</div><div class="value">${waiting}</div></div>
      </div>
      <section class="panel">
        <div class="panel-head"><div><h3>Paylaşım Bekleyenler</h3><p>Yeni içeriklerde yalnızca Onaylandı olanlar görünür. Daha önce paylaşımına başlanmış mevcut içerikler kalan adet bitene kadar listede kalır. Karttaki tarih, ekip tarafından İş Takibi'ne girilen tarihtir.</p></div></div>
        <div class="share-pending-grid">${pendingHtml}</div>
      </section>
      <section class="panel">
        <div class="panel-head"><div><h3>Paylaşım Geçmişi</h3><p>Hangi firma, hangi içerik, kim, ne zaman ve nerede paylaştı</p></div></div>
        <div class="table-wrap"><table><thead><tr><th>Tarih</th><th>Firma</th><th>İçerik</th><th>Tür / Adet</th><th>Platform</th><th>Paylaşan</th><th>Not</th><th>İşlem</th></tr></thead><tbody>${historyRows}</tbody></table></div>
      </section>`;
  };
  window.renderShares=renderShares;

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="shares"]'))setTimeout(()=>{try{renderShares();}catch(_e){}},100);
    if(e.target.closest('#addShareBtnV11,#heroShareBtnV111,[data-share-work-v11]')){
      setTimeout(keepOnlyEligibleInNewShareModal,90);
      setTimeout(keepOnlyEligibleInNewShareModal,180);
    }
  },true);
  document.getElementById('monthPicker')?.addEventListener('change',()=>setTimeout(()=>{try{renderShares();}catch(_e){}},180));

  try{renderShares();}catch(e){console.warn('[Onaylı paylaşım kuyruğu]',e);}
})();

