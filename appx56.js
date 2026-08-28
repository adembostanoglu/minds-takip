// V1.20.0 — Sol menü düzeltmesi: etiketler data-view üzerinden sabitlenir; çift/üst üste metin oluşmaz.
(function bootSidebarColorSystemV200(){
  if(window.__mindsSidebarColorSystemV200)return;
  window.__mindsSidebarColorSystemV200=true;

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
    if(n==='ekip'||n.includes('ekip'))return'team';
    if(n.includes('günlük hareket'))return'activity';
    if(n.includes('rapor'))return'reports';
    if(n.includes('performans'))return'performance';
    if(n.includes('arşiv'))return'archive';
    if(n.includes('hesab'))return'account';
    if(n.includes('ayar'))return'settings';
    return null;
  }

  function rgba(hex,a){
    const h=hex.replace('#',''),n=parseInt(h,16);
    return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
  }

  function installStyle(){
    document.getElementById('sidebarColorSystemV197Style')?.remove();
    document.getElementById('sidebarColorSystemV198Style')?.remove();
    if(document.getElementById('sidebarColorSystemV200Style'))return;
    const s=document.createElement('style');
    s.id='sidebarColorSystemV200Style';
    s.textContent=`
      .sidebar nav{display:flex!important;flex-direction:column!important;gap:3px!important;padding:10px 7px 12px!important;overflow:hidden!important}
      .sidebar nav .nav-item{box-sizing:border-box!important;position:relative!important;display:flex!important;align-items:center!important;flex-wrap:nowrap!important;gap:7px!important;width:100%!important;max-width:100%!important;min-width:0!important;min-height:38px!important;height:38px!important;padding:4px 7px!important;margin:0!important;border:1px solid transparent!important;border-left:2px solid var(--navc,#657078)!important;border-radius:8px!important;background:transparent!important;color:#e7ecee!important;text-align:left!important;overflow:hidden!important;line-height:1!important;transition:background .16s ease,border-color .16s ease,box-shadow .16s ease!important}
      .sidebar nav .nav-color-icon-v200{box-sizing:border-box!important;display:grid!important;place-items:center!important;flex:0 0 25px!important;width:25px!important;height:25px!important;min-width:25px!important;border-radius:7px!important;border:1px solid var(--navborder)!important;background:var(--naviconbg)!important;color:var(--navc)!important;font-size:12px!important;font-weight:850!important;line-height:1!important;overflow:hidden!important;box-shadow:0 0 9px var(--navglow)!important}
      .sidebar nav .nav-color-label-v200{display:block!important;flex:1 1 auto!important;min-width:0!important;width:auto!important;max-width:calc(100% - 32px)!important;margin:0!important;padding:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;word-break:normal!important;font-size:11.5px!important;font-weight:700!important;line-height:1!important;letter-spacing:-.05px!important;color:inherit!important}
      .sidebar nav .nav-item:hover{background:var(--navhover)!important;border-color:var(--navborder)!important}
      .sidebar nav .nav-item.active{background:linear-gradient(90deg,var(--navactive),rgba(19,25,29,.72))!important;border-color:var(--navc)!important;box-shadow:0 0 0 1px var(--navsoft),0 0 13px var(--navglow)!important;color:#fff!important}
      .sidebar nav .nav-item.active .nav-color-icon-v200{background:var(--naviconactive)!important;border-color:var(--navc)!important}
      .sidebar nav:after{content:'';height:1px;margin:6px 7px 0;background:linear-gradient(90deg,transparent,#263137,transparent)}
      .sidebar .profile-box{border-top-color:#222d32!important}
    `;
    document.head.appendChild(s);
  }

  function resolveKey(btn){
    const view=String(btn.dataset.view||'').toLocaleLowerCase('tr-TR').replace(/[^a-z0-9_]/g,'');
    return viewMap[view]||keyFromText(btn.getAttribute('aria-label')||btn.title||btn.textContent);
  }

  function patchButton(btn){
    const key=resolveKey(btn),cfg=CFG[key];
    if(!cfg)return;
    btn.dataset.navColorKey=key;
    btn.style.setProperty('--navc',cfg.color);
    btn.style.setProperty('--navborder',rgba(cfg.color,.36));
    btn.style.setProperty('--naviconbg',rgba(cfg.color,.12));
    btn.style.setProperty('--navhover',rgba(cfg.color,.075));
    btn.style.setProperty('--navactive',rgba(cfg.color,.15));
    btn.style.setProperty('--naviconactive',rgba(cfg.color,.19));
    btn.style.setProperty('--navglow',rgba(cfg.color,.16));
    btn.style.setProperty('--navsoft',rgba(cfg.color,.10));
    btn.title=cfg.label;
    btn.setAttribute('aria-label',cfg.label);

    // Her seferinde içerik baştan kurulur; eski ikon/yazı kalıntıları kesin olarak silinir.
    const icon=document.createElement('span');
    icon.className='nav-color-icon-v200';
    icon.setAttribute('aria-hidden','true');
    icon.textContent=cfg.icon;
    const text=document.createElement('span');
    text.className='nav-color-label-v200';
    text.textContent=cfg.label;
    btn.replaceChildren(icon,text);
  }

  function apply(){
    installStyle();
    document.querySelectorAll('.sidebar nav .nav-item').forEach(patchButton);
  }

  apply();
  [100,450,1200,2500,5000].forEach(ms=>setTimeout(apply,ms));
  document.addEventListener('click',e=>{if(e.target.closest('.sidebar .nav-item'))setTimeout(apply,25);},true);
})();
