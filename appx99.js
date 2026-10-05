// V1.29.1 — Dilek / Öneri / Şikayet kutusu.
(function bootFeedbackBoxV291(){
  if(window.__mindsFeedbackBoxV291)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile||typeof setView!=='function'){
    setTimeout(bootFeedbackBoxV291,160);return;
  }
  window.__mindsFeedbackBoxV291=true;

  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const admin=()=>typeof isAdmin==='function'&&isAdmin();
  const typeMeta={
    dilek:{label:'Dilek',cls:'wish',icon:'✦'},
    oneri:{label:'Öneri',cls:'idea',icon:'◇'},
    sikayet:{label:'Şikayet',cls:'complaint',icon:'!'}
  };
  const categoryMeta={
    calisma_duzeni:'Çalışma Düzeni',
    ekipman:'Ekipman',
    is_akisi:'İş Akışı',
    musteri_firma:'Müşteri / Firma',
    ofis:'Ofis',
    diger:'Diğer'
  };
  const statusMeta={
    new:{label:'Yeni',cls:'new'},
    reviewing:{label:'İnceleniyor',cls:'reviewing'},
    resolved:{label:'Sonuçlandı',cls:'resolved'}
  };

  let rows=[];
  let busy=false;
  let filter='all';

  function installStyle(){
    if(document.getElementById('feedbackBoxV291Style'))return;
    const s=document.createElement('style');
    s.id='feedbackBoxV291Style';
    s.textContent=`
      #feedback{padding-bottom:30px}
      .feedback-head-v291{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:14px}
      .feedback-head-v291 h2{margin:0;font-size:22px;color:#f1f4f5}.feedback-head-v291 p{margin:5px 0 0;color:#839097;font-size:10.5px;line-height:1.5}
      .feedback-kpis-v291{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-bottom:12px}
      .feedback-kpi-v291{border:1px solid #2d373d;border-radius:12px;background:#10171b;padding:12px 13px}
      .feedback-kpi-v291 small{display:block;color:#86939a;font-size:9px;font-weight:850}.feedback-kpi-v291 b{display:block;margin-top:5px;font-size:21px;color:#eef2f3}
      .feedback-kpi-v291.new{border-color:#675523;background:#211e12}.feedback-kpi-v291.new b{color:#dfca60}
      .feedback-kpi-v291.reviewing{border-color:#31556b;background:#121f28}.feedback-kpi-v291.reviewing b{color:#7ab9dd}
      .feedback-kpi-v291.resolved{border-color:#315a3c;background:#142019}.feedback-kpi-v291.resolved b{color:#8dd09a}
      .feedback-toolbar-v291{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;flex-wrap:wrap}
      .feedback-filters-v291{display:flex;gap:7px;flex-wrap:wrap}.feedback-filter-v291{border:1px solid #303a40;border-radius:9px;background:#11181c;color:#9da8ad;padding:7px 10px;font-size:9px;font-weight:850;cursor:pointer}.feedback-filter-v291.active{border-color:#6a6423;background:#1d1e14;color:#e9e43c}
      .feedback-list-v291{display:grid;gap:9px}.feedback-card-v291{border:1px solid #303a40;border-radius:12px;background:#10171b;padding:13px 14px;position:relative}
      .feedback-card-v291.focus{box-shadow:0 0 0 2px rgba(234,226,46,.35);border-color:#8a8127}
      .feedback-card-top-v291{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.feedback-card-meta-v291{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:7px}
      .feedback-type-v291,.feedback-status-v291,.feedback-category-v291,.feedback-anon-v291{display:inline-flex;align-items:center;border-radius:999px;padding:4px 7px;font-size:8px;font-weight:900;border:1px solid #3b454b;background:#141c20;color:#cbd3d6}
      .feedback-type-v291.wish{border-color:#665523;background:#211e12;color:#dfc65f}.feedback-type-v291.idea{border-color:#31556b;background:#121f28;color:#7ab9dd}.feedback-type-v291.complaint{border-color:#6b3734;background:#241617;color:#ec847c}
      .feedback-status-v291.new{border-color:#665523;color:#dfc65f}.feedback-status-v291.reviewing{border-color:#31556b;color:#7ab9dd}.feedback-status-v291.resolved{border-color:#315a3c;color:#8dd09a}
      .feedback-anon-v291{border-color:#5c4270;background:#211728;color:#c8a1de}
      .feedback-card-v291 h3{margin:0;color:#f0f3f4;font-size:14px}.feedback-card-v291 .author{margin-top:4px;color:#79878e;font-size:9px}
      .feedback-message-v291{margin-top:9px;color:#b9c2c6;font-size:10.5px;line-height:1.6;white-space:pre-wrap}
      .feedback-reply-v291{margin-top:11px;border:1px solid #315a3c;border-radius:9px;background:#142019;padding:10px 11px}.feedback-reply-v291 small{display:block;color:#78b887;font-size:8.5px;font-weight:900;margin-bottom:4px}.feedback-reply-v291 div{color:#cfe3d3;font-size:10px;line-height:1.5;white-space:pre-wrap}
      .feedback-card-actions-v291{margin-top:11px;display:flex;justify-content:flex-end}
      .feedback-empty-v291{border:1px dashed #344047;border-radius:12px;padding:30px 16px;text-align:center;color:#829096;font-size:11px;background:#0d1317}
      .feedback-nav-count-v291{margin-left:auto;min-width:18px;height:18px;padding:0 5px;border-radius:999px;display:inline-grid;place-items:center;background:#d7524c;color:#fff;font-size:8px;font-weight:950}
      .feedback-private-note-v291{border:1px solid #4f4626;background:#1f1c12;color:#c9bd75;border-radius:9px;padding:9px 10px;font-size:9px;line-height:1.5}
      #modal .feedback-anon-check-v291{display:flex;align-items:flex-start;gap:9px;border:1px solid #3a3443;border-radius:9px;background:#17131c;padding:10px 11px}
      #modal .feedback-anon-check-v291 input{width:18px!important;height:18px!important;min-width:18px!important;min-height:18px!important;margin:1px 0 0!important;padding:0!important;flex:0 0 18px}
      #modal .feedback-anon-check-v291 b{display:block;font-size:10px;color:#e0d4e8}#modal .feedback-anon-check-v291 span{display:block;margin-top:3px;font-size:8.7px;color:#9d90a6;line-height:1.45}
      @media(max-width:760px){.feedback-head-v291{align-items:stretch;flex-direction:column}.feedback-head-v291>button{width:100%;min-height:44px}.feedback-kpis-v291{grid-template-columns:repeat(3,1fr)}.feedback-kpi-v291{padding:10px}.feedback-kpi-v291 b{font-size:18px}.feedback-card-top-v291{flex-direction:column}.feedback-card-actions-v291 button{width:100%}}
    `;
    document.head.appendChild(s);
  }

  function ensureUI(){
    installStyle();
    const navHost=document.querySelector('.sidebar nav');
    let nav=document.querySelector('.nav-item[data-view="feedback"]');
    if(!nav&&navHost){
      nav=document.createElement('button');
      nav.className='nav-item';
      nav.dataset.view='feedback';
      nav.innerHTML='💬 <span>Dilek / Öneri / Şikayet</span>';
      const activity=navHost.querySelector('.nav-item[data-view="activity"]');
      navHost.insertBefore(nav,activity||null);
    }

    let section=document.getElementById('feedback');
    if(!section){
      section=document.createElement('section');
      section.id='feedback';section.className='view';
      const anchor=document.getElementById('settings');
      (anchor?.parentElement||document.querySelector('.main'))?.appendChild(section);
    }
    return section;
  }

  function openView(){
    ensureUI();
    setView('feedback');
    const t=document.getElementById('pageTitle'),s=document.getElementById('pageSub');
    if(t)t.textContent='Dilek / Öneri / Şikayet';
    if(s)s.textContent=admin()?'Ekip geri bildirimlerini düzenli ve takip edilebilir şekilde yönet.':'Dilek, öneri ve şikayetlerini ilet; durumunu ve cevabını takip et.';
    loadFeedback(true);
  }

  function fmtDate(v){
    if(!v)return '—';
    try{return new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(v));}
    catch(_e){return String(v);}
  }

  function updateNavBadge(){
    const nav=document.querySelector('.nav-item[data-view="feedback"]');if(!nav)return;
    nav.querySelector('.feedback-nav-count-v291')?.remove();
    if(!admin())return;
    const n=rows.filter(x=>x.status==='new').length;
    if(!n)return;
    const b=document.createElement('span');b.className='feedback-nav-count-v291';b.textContent=n>99?'99+':String(n);nav.appendChild(b);
  }

  function filteredRows(){
    return filter==='all'?rows:rows.filter(x=>x.status===filter);
  }

  function render(){
    const host=ensureUI();if(!host)return;
    const counts={
      new:rows.filter(x=>x.status==='new').length,
      reviewing:rows.filter(x=>x.status==='reviewing').length,
      resolved:rows.filter(x=>x.status==='resolved').length
    };
    const list=filteredRows();
    const focus=window.__mindsFeedbackFocusId||'';

    host.innerHTML=`
      <div class="feedback-head-v291">
        <div><h2>💬 Dilek / Öneri / Şikayet Kutusu</h2><p>${admin()?'Gönderilen geri bildirimleri incele, durumunu güncelle ve cevapla. Gizli gönderimlerde personel adı gösterilmez.':'Geri bildirimlerini rahatça iletebilirsin. Gizli gönderimi seçersen yönetici ekranında adın görünmez.'}</p></div>
        ${admin()?'':'<button type="button" class="primary" data-feedback-new-v291="1">+ Yeni Geri Bildirim</button>'}
      </div>
      <div class="feedback-kpis-v291">
        <div class="feedback-kpi-v291 new"><small>Yeni</small><b>${counts.new}</b></div>
        <div class="feedback-kpi-v291 reviewing"><small>İnceleniyor</small><b>${counts.reviewing}</b></div>
        <div class="feedback-kpi-v291 resolved"><small>Sonuçlandı</small><b>${counts.resolved}</b></div>
      </div>
      <div class="feedback-toolbar-v291">
        <div class="feedback-filters-v291">
          ${[['all','Tümü'],['new','Yeni'],['reviewing','İnceleniyor'],['resolved','Sonuçlandı']].map(([k,l])=>`<button type="button" class="feedback-filter-v291 ${filter===k?'active':''}" data-feedback-filter-v291="${k}">${l}</button>`).join('')}
        </div>
        <button type="button" class="ghost" data-feedback-refresh-v291="1">Yenile</button>
      </div>
      <div class="feedback-list-v291">
        ${list.length?list.map(r=>{
          const tm=typeMeta[r.feedback_type]||typeMeta.oneri,sm=statusMeta[r.status]||statusMeta.new;
          return `<article class="feedback-card-v291 ${String(r.id)===String(focus)?'focus':''}" data-feedback-id-v291="${esc(r.id)}">
            <div class="feedback-card-top-v291">
              <div>
                <div class="feedback-card-meta-v291">
                  <span class="feedback-type-v291 ${tm.cls}">${tm.icon} ${tm.label}</span>
                  <span class="feedback-category-v291">${esc(categoryMeta[r.category]||r.category)}</span>
                  <span class="feedback-status-v291 ${sm.cls}">${sm.label}</span>
                  ${r.is_anonymous?'<span class="feedback-anon-v291">Gizli</span>':''}
                </div>
                <h3>${esc(r.subject)}</h3>
                <div class="author">${admin()?esc(r.author_name||'—'):(r.is_anonymous?'Gizli gönderim':'İsimli gönderim')} · ${esc(fmtDate(r.created_at))}</div>
              </div>
            </div>
            <div class="feedback-message-v291">${esc(r.message)}</div>
            ${r.admin_reply?`<div class="feedback-reply-v291"><small>YÖNETİCİ CEVABI</small><div>${esc(r.admin_reply)}</div></div>`:''}
            ${admin()?`<div class="feedback-card-actions-v291"><button type="button" class="small-primary" data-feedback-manage-v291="${esc(r.id)}">İncele / Cevapla</button></div>`:''}
          </article>`;
        }).join(''):'<div class="feedback-empty-v291">Bu filtrede geri bildirim bulunmuyor.</div>'}
      </div>`;

    updateNavBadge();

    if(focus){
      setTimeout(()=>{
        const el=document.querySelector(`[data-feedback-id-v291="${CSS.escape(String(focus))}"]`);
        el?.scrollIntoView({behavior:'smooth',block:'center'});
        window.__mindsFeedbackFocusId=null;
      },80);
    }
  }

  async function loadFeedback(force=false){
    if(busy&&!force)return;
    busy=true;
    try{
      const rpc=admin()?'feedback_admin_list':'feedback_my_list';
      const {data,error}=await sb.rpc(rpc);
      if(error)throw error;
      rows=data||[];
      render();
    }catch(e){
      console.warn('Geri bildirimler yüklenemedi',e);
      if(document.getElementById('feedback')?.classList.contains('active-view')&&typeof toast==='function')toast('Geri bildirimler yüklenemedi.',true);
    }finally{busy=false;}
  }

  function openNew(){
    openModal('Yeni Geri Bildirim',`<div class="form-grid">
      <div class="field"><label>Tür</label><select name="feedback_type" required><option value="dilek">Dilek</option><option value="oneri" selected>Öneri</option><option value="sikayet">Şikayet</option></select></div>
      <div class="field"><label>Kategori</label><select name="category" required><option value="calisma_duzeni">Çalışma Düzeni</option><option value="ekipman">Ekipman</option><option value="is_akisi" selected>İş Akışı</option><option value="musteri_firma">Müşteri / Firma</option><option value="ofis">Ofis</option><option value="diger">Diğer</option></select></div>
      <div class="field full"><label>Konu</label><input name="subject" maxlength="160" required placeholder="Kısaca ne hakkında?"></div>
      <div class="field full"><label>Açıklama</label><textarea name="message" rows="6" maxlength="3000" required placeholder="Dilek, öneri veya şikayetini detaylı yazabilirsin."></textarea></div>
      <div class="field full"><label class="feedback-anon-check-v291"><input type="checkbox" name="anonymous" value="1"><span><b>Gizli gönder</b><span>Yönetici ekranında adın gösterilmez. Sistem yalnızca sana durum ve cevap iletebilmek için hesabınla teknik bağlantıyı korur.</span></span></label></div>
      <div class="field full"><div class="feedback-private-note-v291">Gönderdiğin kayıtları yalnız sen ve yönetici akışı görebilir; diğer personel göremez.</div></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button type="submit" class="primary">Gönder</button></div>
    </div>`,async fd=>{
      const {error}=await sb.rpc('feedback_submit',{
        p_feedback_type:String(fd.get('feedback_type')||''),
        p_category:String(fd.get('category')||''),
        p_subject:String(fd.get('subject')||'').trim(),
        p_message:String(fd.get('message')||'').trim(),
        p_anonymous:fd.get('anonymous')==='1'
      });
      if(error)throw error;
      setTimeout(()=>loadFeedback(true),100);
    });
  }

  async function openManage(id){
    const r=rows.find(x=>String(x.id)===String(id));if(!r)return;

    // "Yeni" yalnızca yönetici tarafından henüz açılmamış kayıt demektir.
    if(r.status==='new'){
      try{
        const {error}=await sb.rpc('feedback_admin_mark_reviewing',{p_feedback_id:r.id});
        if(error)throw error;
        r.status='reviewing';
        render();
      }catch(e){
        console.warn('Geri bildirim inceleniyor durumuna alınamadı',e);
      }
    }

    const tm=typeMeta[r.feedback_type]||typeMeta.oneri;
    openModal('Geri Bildirimi İncele',`<div class="form-grid">
      <div class="field full"><div class="info-banner"><b>${esc(tm.label)} · ${esc(r.subject)}</b><br>${esc(r.author_name||'—')} · ${esc(categoryMeta[r.category]||r.category)} · ${esc(fmtDate(r.created_at))}</div></div>
      <div class="field full"><label>Mesaj</label><textarea rows="6" disabled>${esc(r.message)}</textarea></div>
      <div class="field"><label>Durum</label><select name="status"><option value="new" ${r.status==='new'?'selected':''}>Yeni</option><option value="reviewing" ${r.status==='reviewing'?'selected':''}>İnceleniyor</option><option value="resolved" ${r.status==='resolved'?'selected':''}>Sonuçlandı</option></select></div>
      <div class="field full"><label>Yönetici Cevabı</label><textarea name="reply" rows="5" placeholder="Personele iletilecek cevap">${esc(r.admin_reply||'')}</textarea></div>
      <div class="form-actions field full"><button type="button" class="ghost" onclick="closeModal()">Vazgeç</button><button type="submit" class="primary">Kaydet / Cevapla</button></div>
    </div>`,async fd=>{
      const {error}=await sb.rpc('feedback_admin_update',{
        p_feedback_id:r.id,
        p_status:String(fd.get('status')||'new'),
        p_reply:String(fd.get('reply')||'').trim()||null
      });
      if(error)throw error;
      setTimeout(()=>loadFeedback(true),100);
    });
  }

  document.addEventListener('click',e=>{
    const newBtn=e.target.closest('[data-feedback-new-v291]');if(newBtn){openNew();return;}
    const manage=e.target.closest('[data-feedback-manage-v291]');if(manage){openManage(manage.dataset.feedbackManageV291);return;}
    const flt=e.target.closest('[data-feedback-filter-v291]');if(flt){filter=flt.dataset.feedbackFilterV291;render();return;}
    if(e.target.closest('[data-feedback-refresh-v291]')){loadFeedback(true);return;}
    const nav=e.target.closest('.nav-item[data-view="feedback"]');if(nav){setTimeout(openView,0);}
  },true);

  document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadFeedback(true);});
  window.addEventListener('pageshow',()=>setTimeout(()=>loadFeedback(true),180));

  ensureUI();
  setTimeout(()=>loadFeedback(true),500);
})();