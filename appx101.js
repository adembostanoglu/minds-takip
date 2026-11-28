// V1.30.1 — Paket + ekstra işleri tek İş Takibi ekranında birleştirir.
(function bootUnifiedWorkTrackingV301(){
  if(window.__mindsUnifiedWorkTrackingV301)return;
  if(!window.__mindsWorksByPersonV228 || !window.__mindsExtraAssignmentTrackingV215 ||
     typeof state==='undefined' || typeof sb==='undefined' || typeof profile==='undefined' || !profile){
    setTimeout(bootUnifiedWorkTrackingV301,160);
    return;
  }
  window.__mindsUnifiedWorkTrackingV301=true;

  var filterPerson='all', filterKind='all', filterState='all', search='';
  var lastSignature='';

  function admin(){
    try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return false;}
  }
  function esc(v){
    return typeof escapeHtml==='function'
      ? escapeHtml(String(v==null?'':v))
      : String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});
  }
  function qty(v){var n=Number(v||1);return Number.isFinite(n)&&n>0?Math.max(1,Math.trunc(n)):1;}
  function personNameSafe(id){
    var p=(state.profiles||[]).find(function(x){return String(x.id)===String(id);});
    return p&&p.full_name?p.full_name:'—';
  }
  function packageStatus(v){
    return typeof workStatusLabel==='function'?workStatusLabel(v):({bekliyor:'Bekliyor',devam_ediyor:'Devam Ediyor',hazir:'Hazır',revizede:'Revizede',onaylandi:'Onaylandı'}[v]||v||'—');
  }
  function extraStatus(v){
    return ({waiting:'Bekliyor',in_progress:'Devam Ediyor',review:'Tamamlandı',completed:'Tamamlandı'}[v]||v||'—');
  }
  function extraType(v){
    return ({adaptasyon:'Ekstra Post / Adaptasyon',video_edit:'Video Edit',cekim:'Çekim / Prodüksiyon',logo_kurumsal:'Logo / Kurumsal Kimlik',katalog_brosur:'Katalog / Broşür',acik_hava_matbaa:'Açık Hava / Matbaa',diger:'Diğer'}[v]||'Diğer');
  }
  function packageFirm(w){
    var fm=(state.months||[]).find(function(m){return String(m.id)===String(w.firm_month_id);});
    return fm?(state.firms||[]).find(function(f){return String(f.id)===String(fm.firm_id);}):null;
  }
  function extraClient(x){
    if(x.kind==='ajans')return 'Ajans İçi';
    if(x.firm_id){
      var f=(state.firms||[]).find(function(v){return String(v.id)===String(x.firm_id);});
      return f&&f.name?f.name:'Kayıtlı Firma';
    }
    return x.external_client_name||'Harici Müşteri';
  }
  function packageOwnFirm(w){
    var f=packageFirm(w);if(!f||!w.assigned_to)return false;
    return (state.assignments||[]).some(function(a){
      return String(a.firm_id)===String(f.id)&&String(a.person_id)===String(w.assigned_to);
    });
  }
  function monthPackage(){
    var ids=new Set((state.months||[]).filter(function(m){return m.month===selectedMonth;}).map(function(m){return String(m.id);}));
    return (state.works||[]).filter(function(w){
      if(!ids.has(String(w.firm_month_id)))return false;
      return admin() || (typeof staffOwnWork==='function'&&staffOwnWork(w));
    });
  }
  function monthExtra(){
    return (state.extras||[]).filter(function(x){
      if(x.month!==selectedMonth)return false;
      return admin() || String(x.person_id)===String(profile.id);
    });
  }
  function normalized(){
    var out=[];
    monthPackage().forEach(function(w){
      var f=packageFirm(w);
      var item={
        kind:'package',id:w.id,person_id:w.assigned_to,work_date:w.work_date,created_at:w.created_at,
        client:(f&&f.name)||'—',title:w.title||'İş',quantity:qty(w.quantity),
        type:w.type==='video'?'Video':'Post',status:w.status,status_text:packageStatus(w.status),
        notes:w.notes||'',raw:w,ownFirm:packageOwnFirm(w)
      };
      item.display_date=displayDate(item);
      item.age_text=activeAgeText(item);
      out.push(item);
    });
    monthExtra().forEach(function(x){
      var item={
        kind:'extra',id:x.id,person_id:x.person_id,work_date:x.work_date,created_at:x.created_at,
        client:extraClient(x),title:x.title||'Ekstra İş',quantity:qty(x.quantity),
        type:extraType(x.extra_work_type),status:x.task_status,status_text:extraStatus(x.task_status),
        notes:x.notes||'',raw:x,ownFirm:true
      };
      item.display_date=displayDate(item);
      item.age_text=activeAgeText(item);
      out.push(item);
    });
    return out;
  }
  function isDone(item){
    if(item.kind==='package')return item.status==='hazir'||item.status==='onaylandi';
    return item.status==='completed'||item.status==='review';
  }
  function isActive(item){
    if(item.kind==='package')return ['bekliyor','devam_ediyor','revizede'].indexOf(item.status)>=0;
    return item.status==='waiting'||item.status==='in_progress';
  }
  function dateInIstanbul(value){
    if(!value)return null;
    var d=value instanceof Date?value:new Date(value);
    if(Number.isNaN(d.getTime()))return null;
    var parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
    var map={};parts.forEach(function(p){if(p.type!=='literal')map[p.type]=p.value;});
    return map.year+'-'+map.month+'-'+map.day;
  }
  function todayIstanbul(){return dateInIstanbul(new Date());}
  function sameSelectedMonth(dateValue){
    return !!dateValue&&String(dateValue).slice(0,7)===String(selectedMonth||'').slice(0,7);
  }
  function displayDate(item){
    var today=todayIstanbul();
    if(isActive(item)&&sameSelectedMonth(today)&&String(item.work_date||'')<=today)return today;
    if(isDone(item)){
      var stamp=item.kind==='package'
        ? (item.raw.ready_at||item.raw.approved_at||null)
        : (item.raw.completed_at||item.raw.submitted_at||null);
      var doneDate=dateInIstanbul(stamp);
      if(doneDate&&sameSelectedMonth(doneDate))return doneDate;
    }
    return item.work_date;
  }
  function activeAgeText(item){
    if(!isActive(item))return '';
    var today=todayIstanbul(),start=String(item.work_date||'');
    if(!today||!start||start>today)return '';
    var a=Date.parse(start+'T00:00:00Z'),b=Date.parse(today+'T00:00:00Z');
    if(!Number.isFinite(a)||!Number.isFinite(b))return '';
    var days=Math.floor((b-a)/86400000)+1;
    return days<=1?'Bugün başladı':days+' gündür';
  }
  function filtered(items){
    return items.filter(function(item){
      if(filterPerson!=='all'&&String(item.person_id)!==filterPerson)return false;
      if(filterKind!=='all'&&item.kind!==filterKind)return false;
      if(filterState==='active'&&!isActive(item))return false;
      if(filterState==='done'&&!isDone(item))return false;
      if(search){
        var hay=(item.client+' '+item.title+' '+personNameSafe(item.person_id)+' '+item.type+' '+item.notes).toLocaleLowerCase('tr-TR');
        if(hay.indexOf(search.toLocaleLowerCase('tr-TR'))<0)return false;
      }
      return true;
    });
  }
  function dateKey(v){return String(v||'').replaceAll('-','');}
  function fmtDate(v){
    if(typeof formatDate==='function')return formatDate(v);
    var p=String(v||'').split('-');return p.length===3?p[2]+'.'+p[1]+'.'+p[0]:String(v||'—');
  }
  function fmtDateTime(v){
    if(!v)return '—';
    return new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(v));
  }

  function installStyles(){
    if(document.getElementById('unifiedWorkTrackingV301Style'))return;
    var s=document.createElement('style');
    s.id='unifiedWorkTrackingV301Style';
    s.textContent=
      '#worksPersonGridV228,#workJourneyPanelV300{display:none!important}'+
      '#works.unified-work-v301>.panel{display:none!important}'+
      '#unifiedWorkToolbarV301{border:1px solid #2d373d;border-radius:13px;background:#10161a;margin:0 0 12px;overflow:hidden}'+
      '.uw-toolbar-v301{display:flex;gap:7px;align-items:center;flex-wrap:wrap;padding:10px 12px;border-bottom:1px solid #293238}'+
      '.uw-toolbar-v301 select,.uw-toolbar-v301 input{background:#11181c;border:1px solid #344047;color:#eef1f2;border-radius:8px;padding:8px 9px;font-size:9px}'+
      '.uw-toolbar-v301 input{min-width:210px;flex:1}'+
      '.uw-kpis-v301{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:10px 12px}'+
      '.uw-kpi-v301{border:1px solid #29343a;border-radius:9px;background:#11181c;padding:8px 10px}.uw-kpi-v301 small{display:block;font-size:7.5px;color:#7f8d93;text-transform:uppercase}.uw-kpi-v301 b{display:block;margin-top:3px;font-size:15px}.uw-kpi-v301.extra b{color:#E4E251}'+
      '#unifiedWorkGridV301{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;align-items:start}'+
      '#unifiedWorkGridV301.uw-staff-single-v302{grid-template-columns:minmax(0,1fr)!important}#unifiedWorkGridV301.uw-staff-single-v302 .uw-person-v301{width:100%;max-width:none}#unifiedWorkGridV301.uw-staff-single-v302 .uw-person-body-v301{max-height:none}'+
      '.uw-person-v301{border:1px solid #2d373d;border-radius:13px;background:#10161a;overflow:hidden;min-width:0}.uw-person-head-v301{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 12px;border-bottom:1px solid #2b343a;background:linear-gradient(180deg,#171e22,#12181c)}'+
      '.uw-person-head-v301 b{font-size:13px}.uw-person-head-v301 span{font-size:9px;color:#9aa5aa;border:1px solid #354047;border-radius:999px;padding:4px 7px}'+
      '.uw-person-body-v301{max-height:670px;overflow:auto;padding:0 8px 10px}.uw-date-v301{position:sticky;top:0;z-index:2;padding:10px 1px 6px;background:#10161a;color:#e5df4a;font-size:10.5px;font-weight:850;border-bottom:1px solid #232c31;margin-bottom:6px}'+
      '.uw-job-v301{border:1px solid #283238;border-radius:9px;background:#12191d;padding:9px;margin-bottom:6px}.uw-job-top-v301{display:flex;align-items:flex-start;justify-content:space-between;gap:7px}.uw-client-v301{font-size:11.5px;font-weight:850;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
      '.uw-kind-v301{font-size:7.5px;font-weight:950;border-radius:999px;padding:4px 6px;white-space:nowrap}.uw-kind-v301.package{background:#14283a;border:1px solid #315a78;color:#83c0ea}.uw-kind-v301.extra{background:#29280e;border:1px solid #66631e;color:#E4E251}'+
      '.uw-title-v301{font-size:11px;font-weight:760;color:#e5eaec;margin-top:6px;line-height:1.35}.uw-meta-v301{display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-top:7px;font-size:8px;color:#89969c}.uw-status-v301{border:1px solid #3b464c;border-radius:999px;padding:3px 6px;color:#cfd7da}.uw-support-v301{border:1px solid #665f1f;border-radius:999px;padding:3px 6px;color:#E4E251;background:#24230d}'+
      '.uw-note-v301{margin-top:6px;font-size:8px;color:#9aa5aa;line-height:1.4}.uw-actions-v301{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;margin-top:8px;padding-top:7px;border-top:1px solid #232c31}.uw-actions-v301 button{font-size:8px!important;padding:5px 7px!important;min-height:27px!important}'+
      '.uw-empty-v301{padding:28px 12px;text-align:center;color:#78858b;font-size:10px}'+
      '.uw-history-v301{display:grid;gap:9px}.uw-history-item-v301{border:1px solid #2c363c;border-radius:9px;background:#11181c;padding:9px 10px}.uw-history-item-v301 b{font-size:9px}.uw-history-item-v301 time{float:right;font-size:8px;color:#7f8b91}.uw-history-item-v301 p{margin:5px 0 0;font-size:8.5px;color:#aab4b8;line-height:1.45}'+
      '@media(max-width:1180px){#unifiedWorkGridV301{grid-template-columns:repeat(2,minmax(0,1fr))}}'+
      '@media(max-width:760px){#unifiedWorkGridV301{grid-template-columns:1fr}.uw-person-body-v301{max-height:none}.uw-kpis-v301{grid-template-columns:repeat(2,1fr)}.uw-toolbar-v301 select,.uw-toolbar-v301 input{width:100%}}';
    document.head.appendChild(s);
  }

  function setupHeader(){
    var section=document.getElementById('works');if(!section)return;
    section.classList.add('unified-work-v301');
    var h=section.querySelector('.section-actions h2');
    var p=section.querySelector('.section-actions p');
    if(h)h.textContent='İş Takibi';
    if(p)p.textContent='Paket ve ekstra tüm ekip işlerini tek ekrandan takip et.';
    var packageBtn=document.getElementById('addWorkBtn');
    var extraBtn=document.getElementById('addExtraBtn');
    if(packageBtn)packageBtn.textContent='+ Paket İşi';
    if(extraBtn){
      extraBtn.textContent='+ Ekstra İş';
      extraBtn.classList.remove('admin-only');
      if(packageBtn&&extraBtn.parentElement!==packageBtn.parentElement)packageBtn.insertAdjacentElement('afterend',extraBtn);
    }
    document.querySelectorAll('.sidebar .nav-item[data-view="extras"]').forEach(function(extraNav){extraNav.remove();});
    var extraSection=document.getElementById('extras');
    if(extraSection)extraSection.dataset.mergedIntoWorks='1';
  }

  function ensureHosts(){
    var section=document.getElementById('works');if(!section)return null;
    var toolbar=document.getElementById('unifiedWorkToolbarV301');
    if(!toolbar){
      toolbar=document.createElement('div');toolbar.id='unifiedWorkToolbarV301';
      var panel=section.querySelector('.panel');
      if(panel)panel.insertAdjacentElement('afterend',toolbar);
      toolbar.addEventListener('change',function(e){
        if(e.target.id==='uwPersonV301')filterPerson=e.target.value;
        if(e.target.id==='uwKindV301')filterKind=e.target.value;
        if(e.target.id==='uwStateV301')filterState=e.target.value;
        render(true);
      });
      toolbar.addEventListener('input',function(e){
        if(e.target.id==='uwSearchV301'){search=e.target.value.trim();render(true);}
      });
    }
    var grid=document.getElementById('unifiedWorkGridV301');
    if(!grid){
      grid=document.createElement('div');grid.id='unifiedWorkGridV301';
      toolbar.insertAdjacentElement('afterend',grid);
    }
    return {toolbar:toolbar,grid:grid};
  }

  function actionHtml(item){
    if(item.kind==='package'){
      var can=typeof staffOwnWork==='function'&&staffOwnWork(item.raw);
      return (can?'<button class="small-primary" data-edit-work="'+item.id+'">Güncelle</button>':'')+
        '<button class="small-primary" data-work-history-v300="'+item.id+'">Geçmiş</button>';
    }
    var x=item.raw, html='';
    if(!admin()&&String(x.person_id)===String(profile.id)){
      if(x.task_status==='waiting')html+='<button class="extra-action-start-v215" data-extra-start-v215="'+x.id+'">Başladım</button>';
      if(x.task_status==='in_progress')html+='<button class="extra-action-submit-v215" data-extra-submit-v215="'+x.id+'">Tamamladım</button>';
    }
    if(admin())html+='<button class="small-primary" data-edit-extra="'+x.id+'">Düzenle</button><button class="small-danger" data-delete-extra="'+x.id+'">Sil</button>';
    html+='<button class="small-primary" data-extra-history-v301="'+x.id+'">Geçmiş</button>';
    return html;
  }

  function itemHtml(item){
    var support=item.kind==='package'&&!item.ownFirm;
    return '<div class="uw-job-v301">'+
      '<div class="uw-job-top-v301"><div class="uw-client-v301" title="'+esc(item.client)+'">'+esc(item.client)+'</div><span class="uw-kind-v301 '+item.kind+'">'+(item.kind==='package'?'PAKET':'EKSTRA')+'</span></div>'+
      '<div class="uw-title-v301">'+esc(item.title)+(item.quantity>1?' <small>· '+item.quantity+' adet</small>':'')+'</div>'+
      '<div class="uw-meta-v301"><span>'+esc(item.type)+'</span><span>•</span><span class="uw-status-v301">'+esc(item.status_text)+'</span>'+(item.age_text?'<span>•</span><span>'+esc(item.age_text)+'</span>':'')+(support?'<span class="uw-support-v301">Diğer Firma</span>':'')+'</div>'+
      (item.notes?'<div class="uw-note-v301">'+esc(item.notes)+'</div>':'')+
      '<div class="uw-actions-v301">'+actionHtml(item)+'</div></div>';
  }

  function renderToolbar(toolbar,items){
    var packageCount=items.filter(function(x){return x.kind==='package';}).reduce(function(n,x){return n+x.quantity;},0);
    var extraCount=items.filter(function(x){return x.kind==='extra';}).reduce(function(n,x){return n+x.quantity;},0);
    var activeCount=items.filter(isActive).length;
    var doneCount=items.filter(isDone).length;
    var people=(state.profiles||[]).filter(function(p){return p.active&&p.role!=='admin';});
    var personSelect='';
    if(admin()){
      personSelect='<select id="uwPersonV301"><option value="all">Tüm Personel</option>'+
        people.map(function(p){return '<option value="'+p.id+'" '+(filterPerson===String(p.id)?'selected':'')+'>'+esc(p.full_name)+'</option>';}).join('')+'</select>';
    }
    toolbar.innerHTML='<div class="uw-toolbar-v301">'+personSelect+
      '<select id="uwKindV301"><option value="all">Paket + Ekstra</option><option value="package" '+(filterKind==='package'?'selected':'')+'>Sadece Paket</option><option value="extra" '+(filterKind==='extra'?'selected':'')+'>Sadece Ekstra</option></select>'+
      '<select id="uwStateV301"><option value="all">Tüm Durumlar</option><option value="active" '+(filterState==='active'?'selected':'')+'>Devam Eden</option><option value="done" '+(filterState==='done'?'selected':'')+'>Tamamlanan</option></select>'+
      '<input id="uwSearchV301" placeholder="Firma, iş veya personel ara…" value="'+esc(search)+'"></div>'+
      '<div class="uw-kpis-v301"><div class="uw-kpi-v301"><small>Paket İçerik</small><b>'+packageCount+'</b></div><div class="uw-kpi-v301 extra"><small>Ekstra İş</small><b>'+extraCount+'</b></div><div class="uw-kpi-v301"><small>Devam Eden</small><b>'+activeCount+'</b></div><div class="uw-kpi-v301"><small>Tamamlanan</small><b>'+doneCount+'</b></div></div>';
  }

  function render(force){
    if(!document.getElementById('works')||!document.getElementById('works').classList.contains('active-view'))return;
    setupHeader();installStyles();
    var hosts=ensureHosts();if(!hosts)return;
    var all=normalized();
    var sig=selectedMonth+'|'+filterPerson+'|'+filterKind+'|'+filterState+'|'+search+'|'+all.map(function(x){
      return [x.kind,x.id,x.person_id,x.work_date,x.display_date,x.title,x.quantity,x.status,x.notes].join(':');
    }).join('|');
    if(!force&&sig===lastSignature)return;
    lastSignature=sig;
    renderToolbar(hosts.toolbar,all);
    var items=filtered(all);
    var order=['umut faruk paroğlu','yusuf ebem','aslı coşkun','imran canbaz'];
    function rank(name){var n=String(name||'').toLocaleLowerCase('tr-TR');var i=order.indexOf(n);return i<0?999:i;}
    var people=(state.profiles||[]).filter(function(p){return p.active&&p.role!=='admin';}).sort(function(a,b){return rank(a.full_name)-rank(b.full_name)||a.full_name.localeCompare(b.full_name,'tr');});
    if(!admin())people=people.filter(function(p){return String(p.id)===String(profile.id);});
    if(filterPerson!=='all')people=people.filter(function(p){return String(p.id)===filterPerson;});
    hosts.grid.classList.toggle('uw-staff-single-v302',!admin());
    hosts.grid.innerHTML=people.map(function(p){
      var arr=items.filter(function(x){return String(x.person_id)===String(p.id);}).sort(function(a,b){
        return dateKey(b.display_date).localeCompare(dateKey(a.display_date))||String(b.created_at||'').localeCompare(String(a.created_at||''));
      });
      var dates=Array.from(new Set(arr.map(function(x){return x.display_date;})));
      var blocks=dates.map(function(d){
        return '<div><div class="uw-date-v301">'+esc(fmtDate(d))+' · '+arr.filter(function(x){return x.display_date===d;}).length+' kayıt</div>'+
          arr.filter(function(x){return x.display_date===d;}).map(itemHtml).join('')+'</div>';
      }).join('');
      return '<section class="uw-person-v301"><div class="uw-person-head-v301"><b>'+esc(p.full_name)+'</b><span>'+arr.length+' kayıt</span></div><div class="uw-person-body-v301">'+(blocks||'<div class="uw-empty-v301">Bu filtrede kayıt yok.</div>')+'</div></section>';
    }).join('')||'<div class="uw-empty-v301">Bu filtrede kayıt yok.</div>';
  }

  function extraHistoryLabel(action){
    return ({assigned:'Görev atandı',created:'Ekstra iş eklendi',status_changed:'Durum değişti',reassigned:'Sorumlu değişti',updated:'Bilgiler güncellendi',deleted:'Ekstra iş silindi'}[action]||action||'Güncelleme');
  }
  async function openExtraHistory(id){
    var x=(state.extras||[]).find(function(v){return String(v.id)===String(id);});if(!x)return;
    var res=await sb.from('extra_work_history').select('*').eq('extra_work_id',id).order('created_at',{ascending:true});
    if(res.error){toast('Ekstra iş geçmişi yüklenemedi: '+(res.error.message||res.error),true);return;}
    var rows=res.data||[];
    var body='<div class="uw-history-v301">'+(rows.length?rows.map(function(h){
      var detail=[];
      if(h.from_status!==h.to_status)detail.push(extraStatus(h.from_status)+' → '+extraStatus(h.to_status));
      if(h.details&&h.details.quantity)detail.push('Adet: '+h.details.quantity);
      if(h.details&&h.details.due_date)detail.push('Teslim: '+fmtDate(h.details.due_date));
      return '<div class="uw-history-item-v301"><b>'+esc(personNameSafe(h.actor_id))+' · '+esc(extraHistoryLabel(h.action))+'</b><time>'+fmtDateTime(h.created_at)+'</time><p>'+esc(detail.join(' · ')||h.title_snapshot||x.title)+'</p></div>';
    }).join(''):'<div class="uw-empty-v301">Geçmiş kaydı yok.</div>')+'</div>';
    if(typeof openModal==='function'){
      openModal('Ekstra İş Geçmişi',body,async function(){});
      var form=document.getElementById('modalForm');if(form)form.onsubmit=function(e){e.preventDefault();};
    }
  }

  document.addEventListener('click',function(e){
    var h=e.target.closest('[data-extra-history-v301]');
    if(h){e.preventDefault();e.stopPropagation();openExtraHistory(h.dataset.extraHistoryV301);return;}
    if(e.target.closest('.nav-item[data-view="works"],#addWorkBtn,#addExtraBtn,[data-edit-work],[data-edit-extra],[data-delete-extra],[data-extra-start-v215],[data-extra-submit-v215]')){
      lastSignature='';[100,280,650].forEach(function(ms){setTimeout(function(){render(true);},ms);});
    }
  },true);
  document.getElementById('monthPicker')&&document.getElementById('monthPicker').addEventListener('change',function(){lastSignature='';setTimeout(function(){render(true);},180);});

  setInterval(function(){
    setupHeader();
    var extras=document.getElementById('extras');
    if(extras&&extras.classList.contains('active-view')){
      var worksNav=document.querySelector('.nav-item[data-view="works"]');if(worksNav)worksNav.click();
    }
    render(false);
  },800);

  setupHeader();installStyles();
  [180,500,1100].forEach(function(ms){setTimeout(function(){render(true);},ms);});
})();