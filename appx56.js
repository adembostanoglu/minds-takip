// V1.22.4 — Sol menü ikon/etiket bütünlüğü: metinlerin ikon kutularına taşmasını engeller ve event-driven korur.
(function bootSidebarColorSystemV224(){
  if(window.__mindsSidebarColorSystemV224)return;
  window.__mindsSidebarColorSystemV224=true;

  const CFG={
    dashboard:{label:'Ana Panel',color:'#e6e92b',icon:'⌂'},
    firms:{label:'Firmalar',color:'#35c66b',icon:'◎'},
    social:{label:'Sosyal Medya Takip',color:'#91d92d',icon:'▣'},
    works:{label:'İş Takibi',color:'#efa91e',icon:'▦'},
    shares:{label:'Paylaşım Takibi',color:'#4398ef',icon:'↗'},
    extras:{label:'Ekstra İşler',color:'#9a5be8',icon:'✦'},
    shoots:{label:'Çekimler',color:'#ee8a24',icon:'◉'},
    agenda:{label:'Ajanda',color:'#29c1d0',icon:'▤'},
    attendance:{label:'Mesai',color:'#e75269',icon:'◷'},
    team:{label:'Ekip',color:'#4f9fca',icon:'♙'},
    activity:{label:'Günlük Hareketler',color:'#2ec19c',icon:'◴'},
    reports:{label:'Raporlar',color:'#4a87b8',icon:'▥'},
    performance:{label:'Performans',color:'#d6a31f',icon:'★'},
    archive:{label:'Arşiv',color:'#a5b72a',icon:'▣'},
    account:{label:'Hesabım',color:'#6f78d8',icon:'♙'},
    settings:{label:'Ayarlar',color:'#7d858a',icon:'⚙'}
  };

  const viewMap={
    dashboard:'dashboard',firms:'firms',social:'social',social_media:'social',socialmedia:'social',socialmediatrack:'social',
    works:'works',tasks:'works',shares:'shares',extras:'extras',shoots:'shoots',agenda:'agenda',agendav150:'agenda',attendance:'attendance',
    team:'team',activity:'activity',reports:'reports',performance:'performance',archive:'archive',account:'account',settings:'settings'
  };

  let observer=null,observedNav=null,pending=false;
  const norm=v=>String(v||'').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g,' ');
  function keyFromText(v){
    const n=norm(v);
    if(n.includes('ana panel'))return'dashboard';
    if(n.includes('firma'))return'firms';
    if(n.includes('sosyal medya'))return'social';
    if(n.includes('iş takibi')||n.includes('görev'))return'works';
    if(n.includes('paylaşım'))return'shares';
    if(n.includes('ekstra'))return'extras';
    if(n.includes('çekim'))return'shoots';
    if(n.includes('ajanda'))return'agenda';
    if(n.includes('mesai'))return'attendance';
    if(n.includes('ekip'))return'team';
    if(n.includes('günlük hareket'))return'activity';
    if(n.includes('rapor'))return'reports';
    if(n.includes('performans'))return'performance';
    if(n.includes('arşiv'))return'archive';
    if(n.includes('hesab'))return'account';
    if(n.includes('ayar'))return'settings';
    return null;
  }
  function isAdminLocal(){try{return typeof isAdmin==='function'&&!!isAdmin();}catch(_e){return true;}}
  function effectiveLabel(key){
    if(key==='extras'&&!isAdminLocal())return'Ekstra Görevlerim';
    return CFG[key]?.label||'';
  }
  function rgba(hex,a){
    const h=hex.replace('#',''),n=parseInt(h,16);
    return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
  }

  function installStyle(){
    ['sidebarColorSystemV197Style','sidebarColorSystemV198Style','sidebarColorSystemV200Style','sidebarColorSystemV201Style'].forEach(id=>document.getElementById(id)?.remove());
    if(document.getElementById('sidebarColorSystemV224Style'))return;
    const s=document.createElement('style');
    s.id='sidebarColorSystemV224Style';
    s.textContent=`
      .sidebar nav{display:flex!important;flex-direction:column!important;gap:4px!important;padding:11px 9px 13px!important;overflow-x:hidden!important}
      .sidebar nav .nav-item{box-sizing:border-box!important;position:relative!important;display:flex!important;align-items:center!important;flex-wrap:nowrap!important;gap:9px!important;width:100%!important;max-width:100%!important;min-width:0!important;min-height:43px!important;height:43px!important;padding:6px 9px!important;margin:0!important;border:1px solid transparent!important;border-left:2px solid var(--navc,#657078)!important;border-radius:9px!important;background:transparent!important;color:#eef2f3!important;text-align:left!important;overflow:hidden!important;line-height:1!important;transition:background .16s ease,border-color .16s ease,box-shadow .16s ease!important}
      .sidebar nav .nav-color-icon-v201{box-sizing:border-box!important;display:grid!important;place-items:center!important;flex:0 0 28px!important;width:28px!important;height:28px!important;min-width:28px!important;max-width:28px!important;border-radius:7px!important;border:1px solid var(--navborder)!important;background:var(--naviconbg)!important;color:var(--navc)!important;font-family:Inter,Arial,sans-serif!important;font-size:13.5px!important;font-weight:850!important;line-height:1!important;overflow:hidden!important;text-overflow:clip!important;white-space:nowrap!important;box-shadow:0 0 10px var(--navglow)!important}
      .sidebar nav .nav-color-label-v201{display:block!important;flex:1 1 auto!important;min-width:0!important;width:auto!important;max-width:calc(100% - 37px)!important;margin:0!important;padding:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;word-break:normal!important;font-size:14px!important;font-weight:750!important;line-height:1.12!important;letter-spacing:-.12px!important;color:inherit!important}
      .sidebar nav .nav-item:hover{background:var(--navhover)!important;border-color:var(--navborder)!important}
      .sidebar nav .nav-item.active{background:linear-gradient(90deg,var(--navactive),rgba(19,25,29,.72))!important;border-color:var(--navc)!important;box-shadow:0 0 0 1px var(--navsoft),0 0 14px var(--navglow)!important;color:#fff!important}
      .sidebar nav .nav-item.active .nav-color-icon-v201{background:var(--naviconactive)!important;border-color:var(--navc)!important}
      .sidebar nav:after{content:'';height:1px;margin:6px 7px 0;background:linear-gradient(90deg,transparent,#263137,transparent)}
      .sidebar .profile-box{border-top-color:#222d32!important}
      @media(max-width:1100px){
        .sidebar nav{padding-left:8px!important;padding-right:8px!important}
        .sidebar nav .nav-item{gap:8px!important;padding-left:8px!important;padding-right:8px!important}
        .sidebar nav .nav-color-label-v201{font-size:13.2px!important;font-weight:750!important;letter-spacing:-.18px!important}
        .sidebar nav .nav-color-icon-v201{width:27px!important;height:27px!important;min-width:27px!important;max-width:27px!important;flex-basis:27px!important;font-size:13px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function resolveKey(btn){
    const raw=String(btn.dataset.view||'').toLocaleLowerCase('tr-TR').replace(/[^a-z0-9_]/g,'');
    return viewMap[raw]||btn.dataset.navColorKey||keyFromText(btn.getAttribute('aria-label')||btn.title||btn.textContent);
  }

  function patchButton(btn){
    const key=resolveKey(btn),cfg=CFG[key];if(!cfg)return;
    const label=effectiveLabel(key);
    btn.dataset.navColorKey=key;
    btn.style.setProperty('--navc',cfg.color);
    btn.style.setProperty('--navborder',rgba(cfg.color,.36));
    btn.style.setProperty('--naviconbg',rgba(cfg.color,.12));
    btn.style.setProperty('--navhover',rgba(cfg.color,.075));
    btn.style.setProperty('--navactive',rgba(cfg.color,.15));
    btn.style.setProperty('--naviconactive',rgba(cfg.color,.19));
    btn.style.setProperty('--navglow',rgba(cfg.color,.16));
    btn.style.setProperty('--navsoft',rgba(cfg.color,.10));
    btn.title=label;btn.setAttribute('aria-label',label);

    let icon=btn.querySelector(':scope > .nav-color-icon-v201');
    let text=btn.querySelector(':scope > .nav-color-label-v201');
    const valid=icon&&text&&btn.children.length===2;
    if(!valid){
      icon=document.createElement('span');icon.className='nav-color-icon-v201';icon.setAttribute('aria-hidden','true');
      text=document.createElement('span');text.className='nav-color-label-v201';
      btn.replaceChildren(icon,text);
    }
    if(icon.textContent!==cfg.icon)icon.textContent=cfg.icon;
    if(text.textContent!==label)text.textContent=label;
  }

  function apply(){
    installStyle();
    const nav=document.querySelector('.sidebar nav');if(!nav)return;
    const wasObserving=observer&&observedNav===nav;
    if(wasObserving)observer.disconnect();
    try{nav.querySelectorAll('.nav-item').forEach(patchButton);}finally{if(observer&&nav.isConnected){observedNav=nav;observer.observe(nav,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-view','aria-label','title']});}}
  }

  function scheduleApply(){
    if(pending)return;pending=true;
    requestAnimationFrame(()=>{pending=false;apply();});
  }
  function attachObserver(){
    const nav=document.querySelector('.sidebar nav');if(!nav)return;
    if(!observer)observer=new MutationObserver(scheduleApply);
    if(observedNav===nav)return;
    observer.disconnect();observedNav=nav;observer.observe(nav,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-view','aria-label','title']});
  }

  installStyle();apply();attachObserver();
  [120,420,900,1800].forEach(ms=>setTimeout(()=>{attachObserver();apply();},ms));
  document.addEventListener('click',e=>{if(e.target.closest('.sidebar .nav-item,#loginBtn'))setTimeout(scheduleApply,25);},true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleApply();});
  window.addEventListener('pageshow',scheduleApply);
})();