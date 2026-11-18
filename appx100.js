// V1.30.0 — Is Takibi: filters + outside-firm marker + step-by-step history.
(function bootWorkJourneyV300(){
  if(window.__mindsWorkJourneyV300)return;
  if(typeof sb==='undefined'||typeof profile==='undefined'||!profile||typeof state==='undefined'){
    setTimeout(bootWorkJourneyV300,180);return;
  }
  window.__mindsWorkJourneyV300=true;

  var personFilter='all',typeFilter='all',statusFilter='all',scopeFilter='all',search='';
  var patching=false;
  var esc=function(v){return typeof escapeHtml==='function'?escapeHtml(String(v==null?'':v)):String(v==null?'':v);};
  var isAdminNow=function(){return typeof isAdmin==='function'&&isAdmin();};
  var statusLabel=function(v){return typeof workStatusLabel==='function'?workStatusLabel(v):({bekliyor:'Bekliyor',devam_ediyor:'Devam Ediyor',hazir:'Hazir',revizede:'Revizede',onaylandi:'Onaylandi'}[v]||v||'—');};
  var shareText=function(v){return typeof shareLabel==='function'?shareLabel(v):({paylasilmadi:'Paylasilmadi',planlandi:'Planlandi',paylasildi:'Paylasildi'}[v]||v||'—');};
  var typeText=function(v){return v==='video'?'Video':'Post';};
  var qty=function(w){return typeof workQty==='function'?workQty(w):Math.max(1,Number((w&&w.quantity)||1));};
  var monthWorksAll=function(){return typeof monthWorks==='function'?monthWorks():[];};
  var personText=function(id){return typeof personName==='function'?personName(id):(((state.profiles||[]).find(function(p){return p.id===id;})||{}).full_name||'—');};

  function workFirm(w){
    var fm=(state.months||[]).find(function(m){return m.id===w.firm_month_id;});
    return fm?(state.firms||[]).find(function(f){return f.id===fm.firm_id;}):null;
  }
  function isOwnAssignedFirm(w){
    var f=workFirm(w);if(!f||!w.assigned_to)return false;
    return (state.assignments||[]).some(function(a){
      return String(a.firm_id)===String(f.id)&&String(a.person_id)===String(w.assigned_to);
    });
  }
  function baseWorks(){
    return monthWorksAll().filter(function(w){
      return isAdminNow() || (typeof staffOwnWork==='function'&&staffOwnWork(w));
    });
  }
  function filteredWorks(){
    return baseWorks().filter(function(w){
      var f=workFirm(w);
      if(personFilter!=='all'&&String(w.assigned_to)!==personFilter)return false;
      if(typeFilter!=='all'&&w.type!==typeFilter)return false;
      if(statusFilter!=='all'&&w.status!==statusFilter)return false;
      var own=isOwnAssignedFirm(w);
      if(scopeFilter==='own'&&!own)return false;
      if(scopeFilter==='support'&&own)return false;
      if(search){
        var hay=((f&&f.name)||'')+' '+(w.title||'')+' '+personText(w.assigned_to)+' '+(w.notes||'');
        if(hay.toLocaleLowerCase('tr-TR').indexOf(search.toLocaleLowerCase('tr-TR'))<0)return false;
      }
      return true;
    });
  }

  function installStyle(){
    if(document.getElementById('workJourneyV300Style'))return;
    var s=document.createElement('style');s.id='workJourneyV300Style';
    s.textContent='#works .wj-panel-v300{margin:0 0 14px;border:1px solid #2b353b;border-radius:13px;background:#0f1519;overflow:hidden}'+
      '#works .wj-toolbar-v300{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:12px 13px;border-bottom:1px solid #283137}'+
      '#works .wj-toolbar-v300 select,#works .wj-toolbar-v300 input{background:#11181c;border:1px solid #344047;color:#eef1f2;border-radius:8px;padding:8px 9px;font-size:9px}'+
      '#works .wj-toolbar-v300 input{min-width:210px;flex:1}'+
      '#works .wj-stats-v300{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;padding:11px 13px}'+
      '#works .wj-stat-v300{background:#11181c;border:1px solid #283238;border-radius:9px;padding:8px 10px}'+
      '#works .wj-stat-v300 small{display:block;color:#7f8c92;font-size:7.5px;text-transform:uppercase}'+
      '#works .wj-stat-v300 b{display:block;margin-top:3px;font-size:15px;color:#eef1f2}'+
      '#works .wj-stat-v300.support b{color:#E4E251}'+
      '#works .wj-scope-v300{display:inline-flex;margin-top:4px;padding:3px 6px;border-radius:999px;font-size:7px;font-weight:850;white-space:nowrap}'+
      '#works .wj-scope-v300.own{background:#15241a;border:1px solid #315a3a;color:#8fd99c}'+
      '#works .wj-scope-v300.support{background:#28280f;border:1px solid #65651c;color:#E4E251}'+
      '#works .wj-history-btn-v300{margin-left:5px!important;border-color:#5d5c1e!important;background:#29290e!important;color:#E4E251!important}'+
      '.wj-modal-v300{max-width:760px!important}.wj-summary-v300{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:8px;margin-bottom:12px}'+
      '.wj-summary-v300>div{border:1px solid #29333a;border-radius:9px;background:#11181c;padding:9px 10px}.wj-summary-v300 small{display:block;color:#7e8b91;font-size:7.5px;text-transform:uppercase}.wj-summary-v300 b{display:block;margin-top:3px;font-size:10px}'+
      '.wj-timeline-v300{position:relative;padding-left:22px;display:grid;gap:10px}.wj-timeline-v300:before{content:"";position:absolute;left:7px;top:5px;bottom:5px;width:1px;background:#313b40}'+
      '.wj-event-v300{position:relative;border:1px solid #2b353a;border-radius:10px;background:#10171b;padding:10px 11px}.wj-event-v300:before{content:"";position:absolute;left:-20px;top:13px;width:9px;height:9px;border-radius:50%;background:#E4E251;box-shadow:0 0 0 3px #171b0d}'+
      '.wj-event-head-v300{display:flex;justify-content:space-between;gap:10px}.wj-event-head-v300 b{font-size:9.5px}.wj-event-head-v300 time{font-size:8px;color:#78858b;white-space:nowrap}.wj-event-v300 p{margin:5px 0 0;color:#aab4b9;font-size:8.5px;line-height:1.45}.wj-change-v300{display:block;margin-top:4px;color:#dce2e4}.wj-note-v300{display:block;margin-top:5px;padding:6px 7px;border-left:2px solid #67671f;background:#17190e;color:#d9dcaa;border-radius:0 6px 6px 0}'+
      '@media(max-width:800px){#works .wj-stats-v300{grid-template-columns:repeat(2,1fr)}.wj-summary-v300{grid-template-columns:1fr 1fr}}';
    document.head.appendChild(s);
  }

  function ensurePanel(){
    installStyle();
    var works=document.getElementById('works');if(!works)return;
    var box=document.getElementById('workJourneyPanelV300');
    if(!box){
      box=document.createElement('div');box.id='workJourneyPanelV300';box.className='wj-panel-v300';
      var panel=works.querySelector('.panel');if(panel)panel.insertAdjacentElement('beforebegin',box);
      box.addEventListener('change',function(e){
        if(e.target.id==='wjPersonV300')personFilter=e.target.value;
        if(e.target.id==='wjTypeV300')typeFilter=e.target.value;
        if(e.target.id==='wjStatusV300')statusFilter=e.target.value;
        if(e.target.id==='wjScopeV300')scopeFilter=e.target.value;
        applyFilters();
      });
      box.addEventListener('input',function(e){
        if(e.target.id==='wjSearchV300'){search=e.target.value.trim();applyFilters();}
      });
    }
    renderPanel();
  }

  function renderPanel(){
    var box=document.getElementById('workJourneyPanelV300');if(!box)return;
    var all=baseWorks(),people=(state.profiles||[]).filter(function(p){return p.active&&p.role!=='admin';});
    var sum=function(a){return a.reduce(function(n,w){return n+qty(w);},0);};
    var done=all.filter(function(w){return ['hazir','onaylandi'].indexOf(w.status)>=0;});
    var ongoing=all.filter(function(w){return w.status==='devam_ediyor';});
    var revision=all.filter(function(w){return w.status==='revizede';});
    var support=all.filter(function(w){return !isOwnAssignedFirm(w);});
    var personSelect='';
    if(isAdminNow()){
      personSelect='<select id="wjPersonV300"><option value="all">Tüm Personel</option>'+
        people.map(function(p){return '<option value="'+p.id+'" '+(personFilter===String(p.id)?'selected':'')+'>'+esc(p.full_name)+'</option>';}).join('')+
        '</select>';
    }
    box.innerHTML='<div class="wj-toolbar-v300">'+personSelect+
      '<select id="wjTypeV300"><option value="all">Post + Video</option><option value="post" '+(typeFilter==='post'?'selected':'')+'>Post</option><option value="video" '+(typeFilter==='video'?'selected':'')+'>Video</option></select>'+
      '<select id="wjStatusV300"><option value="all">Tüm Aşamalar</option>'+
      ['bekliyor','devam_ediyor','hazir','revizede','onaylandi'].map(function(x){return '<option value="'+x+'" '+(statusFilter===x?'selected':'')+'>'+statusLabel(x)+'</option>';}).join('')+
      '</select>'+
      '<select id="wjScopeV300"><option value="all">Tüm Firmalar</option><option value="own" '+(scopeFilter==='own'?'selected':'')+'>Kendi Firmaları</option><option value="support" '+(scopeFilter==='support'?'selected':'')+'>Diğer Firma İşleri</option></select>'+
      '<input id="wjSearchV300" placeholder="Firma, iş, personel veya not ara…" value="'+esc(search)+'"></div>'+
      '<div class="wj-stats-v300">'+
      '<div class="wj-stat-v300"><small>Toplam İçerik</small><b>'+sum(all)+'</b></div>'+
      '<div class="wj-stat-v300"><small>Devam Ediyor</small><b>'+sum(ongoing)+'</b></div>'+
      '<div class="wj-stat-v300"><small>Hazır / Tamam</small><b>'+sum(done)+'</b></div>'+
      '<div class="wj-stat-v300"><small>Revizede</small><b>'+sum(revision)+'</b></div>'+
      '<div class="wj-stat-v300 support"><small>Diğer Firma İşleri</small><b>'+sum(support)+'</b></div>'+
      '</div>';
  }

  function attachRows(){
    var tbody=document.getElementById('workRows');if(!tbody)return;
    var rows=Array.prototype.slice.call(tbody.querySelectorAll('tr'));
    var works=baseWorks();
    rows.forEach(function(tr,i){
      var w=works[i];if(!w||tr.querySelector('.empty'))return;
      tr.dataset.workId=w.id;
      var own=isOwnAssignedFirm(w),firmCell=tr.children[0];
      if(firmCell&&!firmCell.querySelector('.wj-scope-v300')){
        var tag=document.createElement('span');tag.className='wj-scope-v300 '+(own?'own':'support');
        tag.textContent=own?'Kendi Firması':'Diğer Firma İşi';firmCell.appendChild(tag);
      }
      var action=tr.lastElementChild;
      if(action&&!action.querySelector('[data-work-history-v300]')){
        var b=document.createElement('button');b.type='button';b.className='small-primary wj-history-btn-v300';
        b.dataset.workHistoryV300=w.id;b.textContent='Geçmiş';action.appendChild(b);
      }
    });
    applyFilters();
  }

  function applyFilters(){
    if(patching)return;patching=true;
    try{
      renderPanel();
      var allowed=new Set(filteredWorks().map(function(w){return String(w.id);}));
      document.querySelectorAll('#workRows tr[data-work-id]').forEach(function(tr){
        tr.style.display=allowed.has(String(tr.dataset.workId))?'':'none';
      });
    }finally{patching=false;}
  }

  function fmtTime(v){
    if(!v)return '—';
    return new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(v));
  }
  function changes(h){
    var out=[];
    if(h.action==='insert'){
      out.push('İş oluşturuldu');
      if(h.new_status)out.push('Başlangıç aşaması: '+statusLabel(h.new_status));
      if(h.new_quantity)out.push('Adet: '+h.new_quantity);
      return out;
    }
    if(h.action==='delete')return ['İş silindi'];
    if(h.old_status!==h.new_status)out.push('Hazırlık: '+statusLabel(h.old_status)+' → '+statusLabel(h.new_status));
    if(h.old_share_status!==h.new_share_status)out.push('Paylaşım: '+shareText(h.old_share_status)+' → '+shareText(h.new_share_status));
    if(h.old_quantity!==h.new_quantity)out.push('Adet: '+(h.old_quantity==null?'—':h.old_quantity)+' → '+(h.new_quantity==null?'—':h.new_quantity));
    if(String(h.old_assigned_to||'')!==String(h.new_assigned_to||''))out.push('Sorumlu: '+personText(h.old_assigned_to)+' → '+personText(h.new_assigned_to));
    if(h.old_title!==h.new_title)out.push('İş adı: '+(h.old_title||'—')+' → '+(h.new_title||'—'));
    if(h.old_notes!==h.new_notes)out.push('Not güncellendi');
    return out.length?out:['İş bilgileri güncellendi'];
  }

  async function openHistory(id){
    var w=(state.works||[]).find(function(x){return String(x.id)===String(id);});if(!w)return;
    var f=workFirm(w);
    var res=await sb.from('work_history').select('*').eq('work_id',id).order('created_at',{ascending:true});
    if(res.error){toast('İş geçmişi yüklenemedi: '+(res.error.message||res.error),true);return;}
    var arr=res.data||[],own=isOwnAssignedFirm(w);
    var timeline=arr.length?arr.map(function(h){
      var cs=changes(h);
      var note=(h.new_notes!==h.old_notes&&h.new_notes)?'<span class="wj-note-v300">Not: '+esc(h.new_notes)+'</span>':'';
      return '<div class="wj-event-v300"><div class="wj-event-head-v300"><b>'+esc(personText(h.actor_id))+'</b><time>'+fmtTime(h.created_at)+'</time></div><p>'+
        cs.map(function(x){return '<span class="wj-change-v300">'+esc(x)+'</span>';}).join('')+note+'</p></div>';
    }).join(''):'<div class="empty">Bu iş için geçmiş kaydı yok.</div>';
    var body='<div class="wj-summary-v300">'+
      '<div><small>Firma / İş</small><b>'+esc((f&&f.name)||'—')+' · '+esc(w.title)+'</b></div>'+
      '<div><small>Tür / Adet</small><b>'+typeText(w.type)+' · '+qty(w)+'</b></div>'+
      '<div><small>Sorumlu</small><b>'+esc(personText(w.assigned_to))+'</b></div>'+
      '<div><small>Firma İlişkisi</small><b>'+(own?'Kendi Firması':'Diğer Firma İşi')+'</b></div>'+
      '</div><div class="wj-timeline-v300">'+timeline+'</div>';
    if(typeof openModal==='function'){
      openModal('İş Geçmişi',body,async function(){});
      var card=document.querySelector('#modal .modal-card');if(card)card.classList.add('wj-modal-v300');
      var form=document.getElementById('modalForm');if(form){form.onsubmit=function(e){e.preventDefault();};}
    }
  }

  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-work-history-v300]');
    if(b){e.preventDefault();e.stopPropagation();openHistory(b.dataset.workHistoryV300);return;}
    if(e.target.closest('.nav-item[data-view="works"],#addWorkBtn,[data-edit-work],[data-delete-work]')){
      [80,220,500].forEach(function(ms){setTimeout(function(){ensurePanel();attachRows();},ms);});
    }
  },true);

  var tbody=document.getElementById('workRows');
  if(tbody){
    var obs=new MutationObserver(function(){
      if(document.getElementById('works')&&document.getElementById('works').classList.contains('active-view')){
        queueMicrotask(function(){ensurePanel();attachRows();});
      }
    });
    obs.observe(tbody,{childList:true,subtree:true});
  }

  [100,400,900].forEach(function(ms){setTimeout(function(){ensurePanel();attachRows();},ms);});
})();