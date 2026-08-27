// V1.19.8 — Sol menü: tek ikon + tek etiket yapısı; üst üste binen eski ikon/yazı parçalarını temizler.
(function bootSidebarColorSystemV198(){
  if(window.__mindsSidebarColorSystemV198)return;
  window.__mindsSidebarColorSystemV198=true;

  const CFG={
    dashboard:{color:'#e6e92b',icon:'⌂'},
    firms:{color:'#35c66b',icon:'◎'},
    social:{color:'#91d92d',icon:'▣'},
    works:{color:'#efa91e',icon:'▦'},
    shares:{color:'#4398ef',icon:'↗'},
    extras:{color:'#9a5be8',icon:'✦'},
    shoots:{color:'#ee8a24',icon:'◉'},
    agenda:{color:'#29c1d0',icon:'▤'},
    attendance:{color:'#e75269',icon:'◷'},
    team:{color:'#4f9fca',icon:'♙'},
    activity:{color:'#2ec19c',icon:'◴'},
    reports:{color:'#4a87b8',icon:'▥'},
    performance:{color:'#d6a31f',icon:'★'},
    archive:{color:'#a5b72a',icon:'▣'},
    account:{color:'#6f78d8',icon:'♙'},
    settings:{color:'#7d858a',icon:'⚙'}
  };

  const viewMap={
    dashboard:'dashboard',firms:'firms',social:'social',social_media:'social',socialmedia:'social',socialmediatrack:'social',
    works:'works',shares:'shares',extras:'extras',shoots:'shoots',agenda:'agenda',agendav150:'agenda',attendance:'attendance',
    team:'team',activity:'activity',reports:'reports',performance:'performance',archive:'archive',account:'account',settings:'settings'
  };

  const norm=v=>String(v||'').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g,' ');

  function labelKey(label){
    const n=norm(label);
    if(n.includes('ana panel'))return'dashboard';
    if(n.includes('firma'))return'firms';
    if(n.includes('sosyal medya'))return'social';
    if(n.includes('iş takibi')||n.includes('görev'))return'works';
    if(n.includes('paylaşım takibi')||n.includes('paylaşım bekleyen'))return'shares';
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
    const h=String(hex).replace('#','');
    const v=h.length===3?h.split('').map(x=>x+x).join(''):h;
    const n=parseInt(v,16);
    return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
  }

  function cleanLabel(v){
    return String(v||'').replace(/[⌂◎▣▦↗✦◉▤◷♙◴▥★⚙]/g,' ').replace(/\s+/g,' ').trim();
  }

  function extractLabel(btn){
    if(btn.dataset.navLabelV198)return btn.dataset.navLabelV198;
    const candidates=[...btn.querySelectorAll('span')]
      .filter(x=>!x.classList.contains('nav-color-icon-v197')&&!x.classList.contains('nav-color-icon-v198'))
      .map(x=>cleanLabel(x.textContent))
      .filter(Boolean)
      .sort((a,b)=>b.length-a.length);
    const label=candidates[0]||cleanLabel(btn.textContent)||'Menü';
    btn.dataset.navLabelV198=label;
    return label;
  }

  function installStyle(){
    document.getElementById('sidebarColorSystemV197Style')?.remove();
    if(document.getElementById('sidebarColorSystemV198Style'))return;
    const s=document.createElement('style');
    s.id='sidebarColorSystemV198Style';
    s.textContent=`
      .sidebar nav{display:flex!important;flex-direction:column!important;gap:4px!important;padding:11px 9px 12px!important;overflow-x:hidden!important}
      .sidebar .nav-item{position:relative!important;display:flex!important;align-items:center!important;flex-wrap:nowrap!important;gap:9px!important;min-height:42px!important;width:100%!important;max-width:100%!important;padding:5px 9px 5px 7px!important;border:1px solid transparent!important;border-left:2px solid var(--navc,#657078)!important;border-radius:9px!important;background:transparent!important;color:#e2e7e9!important;text-align:left!important;overflow:hidden!important;transition:background .16s ease,border-color .16s ease,box-shadow .16s ease,transform .16s ease!important}
      .sidebar .nav-color-icon-v198{display:grid!important;place-items:center!important;flex:0 0 30px!important;width:30px!important;height:30px!important;border-radius:8px!important;border:1px solid var(--navborder)!important;background:var(--naviconbg)!important;color:var(--navc)!important;font-size:14px!important;font-weight:850!important;line-height:1!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.018),0 0 12px var(--navglow)!important}
      .sidebar .nav-color-label-v198{display:block!important;flex:1 1 auto!important;min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;font-size:12.5px!important;font-weight:650!important;line-height:1.2!important;letter-spacing:-.08px!important;color:inherit!important}
      .sidebar .nav-item:hover{background:var(--navhover)!important;border-color:var(--navborder)!important;transform:translateX(1px)!important}
      .sidebar .nav-item.active{background:linear-gradient(90deg,var(--navactive),rgba(19,25,29,.72))!important;border-color:var(--navc)!important;box-shadow:0 0 0 1px var(--navsoft),0 0 16px var(--navglow)!important;color:#fff!important}
      .sidebar .nav-item.active .nav-color-icon-v198{background:var(--naviconactive)!important;border-color:var(--navc)!important;box-shadow:0 0 14px var(--navglow),inset 0 0 9px var(--navsoft)!important}
      .sidebar nav:after{content:'';height:1px;margin:6px 7px 0;background:linear-gradient(90deg,transparent,#263137,transparent)}
      .sidebar .profile-box{border-top-color:#222d32!important;background:linear-gradient(180deg,rgba(17,23,27,.25),rgba(12,17,20,.52))!important}
      @media(max-width:1100px){.sidebar .nav-color-label-v198{font-size:12px!important}.sidebar .nav-color-icon-v198{width:28px!important;height:28px!important;flex-basis:28px!important}}
    `;
    document.head.appendChild(s);
  }

  function patchButton(btn){
    if(!btn)return;
    const label=extractLabel(btn);
    const view=String(btn.dataset.view||'').toLocaleLowerCase('tr-TR').replace(/[^a-z0-9_]/g,'');
    const key=viewMap[view]||labelKey(label);
    const cfg=CFG[key];
    if(!cfg)return;

    btn.dataset.navColorKey=key;
    btn.style.setProperty('--navc',cfg.color);
    btn.style.setProperty('--navborder',rgba(cfg.color,.34));
    btn.style.setProperty('--naviconbg',rgba(cfg.color,.12));
    btn.style.setProperty('--navhover',rgba(cfg.color,.075));
    btn.style.setProperty('--navactive',rgba(cfg.color,.15));
    btn.style.setProperty('--naviconactive',rgba(cfg.color,.19));
    btn.style.setProperty('--navglow',rgba(cfg.color,.17));
    btn.style.setProperty('--navsoft',rgba(cfg.color,.10));
    btn.title=label;
    btn.setAttribute('aria-label',label);

    const icon=document.createElement('span');
    icon.className='nav-color-icon-v198';
    icon.setAttribute('aria-hidden','true');
    icon.textContent=cfg.icon;

    const text=document.createElement('span');
    text.className='nav-color-label-v198';
    text.textContent=label;

    btn.replaceChildren(icon,text);
  }

  function apply(){
    installStyle();
    document.querySelectorAll('.sidebar nav .nav-item').forEach(patchButton);
  }

  apply();
  [120,700,1800,3500,6000].forEach(ms=>setTimeout(apply,ms));
  document.addEventListener('click',e=>{if(e.target.closest('.sidebar .nav-item'))setTimeout(apply,40);},true);
})();
