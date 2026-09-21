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


// Embedded live fix so the already-loaded appx92 chain always installs shoot edit tracking.
// V1.26.1 — Çekim edit takibi, canlı ekran düzeltmesi
(function(){
  function ready(){
    return typeof state!=='undefined' &&
      typeof profile!=='undefined' && profile &&
      typeof el==='function' &&
      typeof openModal==='function' &&
      typeof sb!=='undefined' &&
      typeof selectedMonth!=='undefined';
  }

  function esc(v){ return typeof escapeHtml==='function' ? escapeHtml(String(v??'')) : String(v??''); }
  function shootInfo(x){
    const total=Math.max(0,Number(x?.video_count||0));
    const done=Math.max(0,Math.min(total,Number(x?.edited_video_count||0)));
    let status=x?.delivered_at?'teslim_edildi':String(x?.edit_status||'bekliyor');
    if(status!=='teslim_edildi'){
      if(total>0 && done>=total) status='editlendi';
      else if(done>0) status='editleniyor';
      else status='bekliyor';
    }
    const labels={
      bekliyor:['Edit Bekliyor','red'],
      editleniyor:['Editleniyor','yellow'],
      editlendi:['Editlendi','green'],
      teslim_edildi:['Teslim Edildi','blue']
    };
    const [label,cls]=labels[status]||labels.bekliyor;
    return {total,done,status,label,cls,pct:total?Math.round(done/total*100):0};
  }

  function allowed(x){
    return !!x && (
      (typeof isAdmin==='function' && isAdmin()) ||
      x.editor_id===profile.id ||
      x.responsible_id===profile.id ||
      x.created_by===profile.id
    );
  }

  function shootsForMonth(){
    const all=(state.shoots||[]).filter(x=>x.month===selectedMonth);
    if(typeof isAdmin==='function' && isAdmin()) return all;
    return all.filter(allowed);
  }

  function installStyle(){
    if(document.getElementById('shootEditFix261')) return;
    const s=document.createElement('style');
    s.id='shootEditFix261';
    s.textContent=
      '#shootRows tr.edit-done td{background:rgba(69,181,97,.08)}'+
      '#shootRows tr.edit-delivered td{background:rgba(61,126,211,.08)}'+
      '#shootRows .edit-cell{min-width:150px}'+
      '#shootRows .edit-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}'+
      '#shootRows .edit-track{height:5px;border-radius:999px;background:#20282d;overflow:hidden}'+
      '#shootRows .edit-fill{height:100%;border-radius:999px;background:#e6df29}'+
      '#shootRows tr.edit-done .edit-fill{background:#53c972}'+
      '#shootRows tr.edit-delivered .edit-fill{background:#4c8edf}'+
      '#shootRows .edit-actions{display:flex;gap:5px;flex-wrap:wrap}'+
      '#shoots .compact-stats{grid-template-columns:repeat(6,minmax(0,1fr))}'+
      '@media(max-width:1200px){#shoots .compact-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}';
    document.head.appendChild(s);
  }

  function render(){
    const body=el('shootRows');
    const stats=el('shootStats');
    if(!body||!stats) return;

    installStyle();
    const rows=shootsForMonth();
    const infos=rows.map(shootInfo);
    const statRows=[
      ['Çekim Kaydı',rows.length],
      ['Toplam Video',infos.reduce((s,x)=>s+x.total,0)],
      ['Edit Bekleyen',infos.filter(x=>x.status==='bekliyor').length],
      ['Editleniyor',infos.filter(x=>x.status==='editleniyor').length],
      ['Editlendi',infos.filter(x=>x.status==='editlendi').length],
      ['Teslim Edildi',infos.filter(x=>x.status==='teslim_edildi').length]
    ];
    stats.innerHTML=statRows.map(([l,v])=>'<div class="stat"><div class="label">'+l+'</div><div class="value shoot-count">'+v+'</div><div class="foot"><b>'+prettyMonth(selectedMonth)+'</b> ekip verisi</div></div>').join('');

    body.innerHTML=rows.map(x=>{
      const i=shootInfo(x);
      const rowClass=i.status==='editlendi'?'edit-done':i.status==='teslim_edildi'?'edit-delivered':'';
      const f=typeof firm==='function'?firm(x.firm_id):null;
      const logo=f && typeof firmLogo==='function'?firmLogo(f):'';
      const editor=x.editor_id && typeof personName==='function'?personName(x.editor_id):'Atanmadı';
      const responsible=x.responsible_id && typeof personName==='function'?personName(x.responsible_id):'—';
      let actions='';
      if(allowed(x)) actions+='<button class="small-primary" data-edit-progress-261="'+x.id+'">Edit Takibi</button>';
      if(typeof canManageShoot==='function' && canManageShoot(x)){
        actions+='<button class="small-primary" data-edit-shoot="'+x.id+'">Güncelle</button><button class="small-danger" data-delete-shoot="'+x.id+'">Sil</button>';
      }
      if(!actions) actions='—';
      return '<tr class="'+rowClass+'">'+
        '<td>'+formatDate(x.shoot_date)+'</td>'+
        '<td><div class="firm-cell">'+logo+'<b>'+esc(f?.name||x.external_client_name||'—')+'</b></div></td>'+
        '<td><b>'+esc(x.title||'Video Çekimi')+'</b></td>'+
        '<td><span class="badge blue">'+i.total+' Video</span></td>'+
        '<td><div class="edit-cell"><div class="edit-top"><span class="badge '+i.cls+'">'+i.label+'</span><b>'+i.done+'/'+i.total+'</b></div><div class="edit-track"><div class="edit-fill" style="width:'+i.pct+'%"></div></div></div></td>'+
        '<td>'+esc(editor)+'</td>'+
        '<td>'+esc(responsible)+'</td>'+
        '<td>'+esc(x.notes||'—')+'</td>'+
        '<td><div class="edit-actions">'+actions+'</div></td>'+
      '</tr>';
    }).join('') || '<tr><td colspan="9" class="empty">Bu ay çekim kaydı yok.</td></tr>';
  }

  function modal(x){
    if(!allowed(x)) return toast('Bu çekimin edit durumunu güncelleme yetkin yok.',true);
    const i=shootInfo(x);
    const admin=typeof isAdmin==='function'&&isAdmin();
    const editor=x.editor_id||(!admin?profile.id:'');
    const editorField=admin
      ? '<div class="field full"><label>Editör</label><select name="editor"><option value="">Atanmadı</option>'+
        activeProfiles().map(p=>'<option value="'+p.id+'" '+(p.id===editor?'selected':'')+'>'+esc(p.full_name)+'</option>').join('')+
        '</select></div>'
      : '<input type="hidden" name="editor" value="'+editor+'"><div class="field full"><label>Editör</label><input disabled value="'+esc(personName(editor))+'"></div>';

    openModal('Edit Takibi',
      '<div class="form-grid">'+
      '<div class="field full"><label>Çekim</label><input disabled value="'+esc((firm(x.firm_id)?.name||x.external_client_name||'—')+' · '+(x.title||'Video Çekimi'))+'"></div>'+
      '<div class="field"><label>Toplam Video</label><input disabled value="'+i.total+'"></div>'+
      '<div class="field"><label>Editlenen Video</label><input name="done" type="number" min="0" max="'+i.total+'" step="1" required value="'+i.done+'"></div>'+
      editorField+
      '<div class="field full"><label style="display:flex;align-items:center;gap:8px"><input style="width:auto" type="checkbox" name="delivered" value="1" '+(i.status==='teslim_edildi'?'checked':'')+'> Müşteriye teslim edildi</label></div>'+
      '<div class="field full"><div class="info-banner"><b>Durum otomatik:</b> 0/'+i.total+' Edit Bekliyor · ara değer Editleniyor · '+i.total+'/'+i.total+' Editlendi.</div></div>'+
      '<div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button class="primary" type="submit">Kaydet</button></div>'+
      '</div>',
      async fd=>{
        let done=Number(fd.get('done'));
        if(!Number.isInteger(done)||done<0||done>i.total) throw new Error('Editlenen video sayısı 0 ile '+i.total+' arasında olmalı.');
        const delivered=fd.get('delivered')==='1';
        if(delivered) done=i.total;
        const status=delivered?'teslim_edildi':(i.total>0&&done>=i.total?'editlendi':(done>0?'editleniyor':'bekliyor'));
        const now=new Date().toISOString();
        const editorId=fd.get('editor')||x.editor_id||(!admin?profile.id:null);
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
      }
    );
  }

  function boot(){
    if(!ready()){setTimeout(boot,150);return;}
    window.__mindsShootEditFix261=true;
    window.renderShoots=render;
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-edit-progress-261]');
      if(!b) return;
      e.preventDefault();e.stopPropagation();
      const x=(state.shoots||[]).find(v=>String(v.id)===String(b.dataset.editProgress261));
      if(x) modal(x);
    },true);
    render();
  }

  boot();
})();