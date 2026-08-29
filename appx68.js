// V1.22.0 — Dedicated mobile shell. Desktop remains unchanged; <=760px gets app-like navigation and layout.
(function bootMobileShellV220(){
  if(window.__mindsMobileShellV220)return;
  window.__mindsMobileShellV220=true;

  const MOBILE_MAX=760;
  const mq=window.matchMedia(`(max-width:${MOBILE_MAX}px)`);
  let installed=false;

  function installStyles(){
    if(document.getElementById('mindsMobileShellV220Style'))return;
    const s=document.createElement('style');
    s.id='mindsMobileShellV220Style';
    s.textContent=`
      #mobileNavV220,#mobileMenuOverlayV220,#mobileMenuCloseV220,#mobileMenuBtnV220,#mobileLogoutV220{display:none}
      @media(max-width:760px){
        html{background:#080b0e;overscroll-behavior-y:none}
        body{background:#080b0e;-webkit-tap-highlight-color:transparent}
        body.mobile-menu-lock-v220{overflow:hidden}
        .app-shell{display:block;min-height:100dvh}

        .sidebar{position:fixed!important;inset:0 auto 0 0!important;width:min(86vw,320px)!important;height:100dvh!important;z-index:10060!important;transform:translateX(-105%);transition:transform .24s ease;background:#0b1013!important;border-right:1px solid #303940!important;box-shadow:22px 0 70px rgba(0,0,0,.55);overflow:hidden}
        .app-shell.mobile-menu-open-v220 .sidebar{transform:translateX(0)}
        .brand-block{height:104px!important;min-height:104px;background:var(--accent)!important}
        .brand-block img{object-fit:cover}
        .sidebar nav{display:flex!important;grid-template-columns:none!important;flex:1;gap:4px;padding:14px 12px 12px!important;overflow:auto;overscroll-behavior:contain}
        .nav-item{min-height:46px;padding:11px 14px!important;border-radius:11px!important;font-size:13px!important;gap:12px!important}
        .nav-item.active{background:#181f23!important;box-shadow:inset 3px 0 0 var(--accent)!important}
        .profile-box{display:flex!important;padding:12px 16px calc(12px + env(safe-area-inset-bottom))!important;background:#0d1316}
        #mobileLogoutV220{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 12px 8px;min-height:42px;border:1px solid #3a444a;border-radius:11px;background:#12191d;color:#dfe4e6;font-size:11px;font-weight:800;cursor:pointer}
        #mobileMenuCloseV220{display:grid;place-items:center;position:absolute;right:11px;top:11px;z-index:2;width:38px;height:38px;border-radius:11px;border:1px solid rgba(0,0,0,.18);background:rgba(8,11,14,.82);color:#fff;font-size:20px;cursor:pointer}
        #mobileMenuOverlayV220{display:block;position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.66);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:opacity .22s ease}
        .app-shell.mobile-menu-open-v220 + #mobileMenuOverlayV220,.app-shell.mobile-menu-open-v220 ~ #mobileMenuOverlayV220{opacity:1;pointer-events:auto}

        .main{padding:0 12px calc(92px + env(safe-area-inset-bottom))!important;min-width:0}
        .topbar{position:sticky!important;top:0;z-index:9020;height:64px!important;min-height:64px;margin:0 -12px 12px!important;padding:9px 12px!important;display:grid!important;grid-template-columns:40px minmax(0,1fr) auto;align-items:center!important;gap:9px!important;background:rgba(9,13,16,.94);backdrop-filter:blur(16px);border-bottom:1px solid #273036!important}
        #mobileMenuBtnV220{display:grid;place-items:center;width:40px;height:40px;border:1px solid #303a40;border-radius:11px;background:#12191d;color:#f0f2f3;font-size:19px;cursor:pointer}
        .topbar>div:first-of-type{min-width:0}
        .topbar h1{font-size:17px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.2px}
        .topbar p{display:none!important}
        .top-actions{gap:7px!important;min-width:0}
        .top-actions #quickAddFirmBtn,.top-actions #logoutBtn{display:none!important}
        .top-actions #monthPicker{width:112px;max-width:112px;height:40px;padding:7px 8px!important;font-size:11px!important;border-radius:10px}
        .top-actions .ops-notify-btn-v216{width:40px;height:40px;flex:0 0 40px}

        .hero{min-height:0!important;border-radius:14px!important;padding:18px 14px!important;gap:16px!important;flex-direction:column!important}
        .slogan{width:154px!important;max-height:92px;object-fit:contain}
        .hero-actions{display:grid!important;grid-template-columns:1fr 1fr;gap:8px!important;width:100%;justify-content:stretch!important}
        .hero-actions button{width:100%;min-height:43px;padding:9px 8px!important;font-size:11px!important}
        .stats-grid{grid-template-columns:1fr 1fr!important;gap:8px!important;margin:10px 0!important}
        .stat{padding:12px!important;border-radius:12px!important;min-width:0}
        .stat .label{font-size:10px!important;line-height:1.3}.stat .value{font-size:22px!important;margin:6px 0 3px!important}.stat .foot{font-size:9px!important;line-height:1.35}
        .content-grid{grid-template-columns:1fr!important;gap:10px!important}
        .panel{padding:12px!important;border-radius:13px!important;min-width:0}
        .panel-head{align-items:flex-start!important;gap:9px}.panel-head h3{font-size:14px}.panel-head p{font-size:10px!important;line-height:1.4}
        .section-actions{align-items:stretch!important;flex-direction:column!important;gap:11px!important;margin-bottom:12px!important}
        .section-actions h2{font-size:19px}.section-actions p{font-size:10.5px!important;line-height:1.45}
        .section-actions>button{width:100%;min-height:44px}
        .card-grid{grid-template-columns:1fr!important;gap:10px!important}
        .firm-card,.person-card,.share-card,.archive-card{padding:14px!important;border-radius:13px!important}
        .metric-four{grid-template-columns:1fr 1fr!important;gap:7px!important}
        .mini-grid{gap:7px!important}.mini{padding:10px!important}.mini small{font-size:9px}.mini b{font-size:13px}
        .info-banner{font-size:10.5px!important;line-height:1.5;padding:11px 12px!important;border-radius:10px!important}
        .subsection-head{margin:20px 0 10px!important;padding-top:16px!important}.subsection-head h3{font-size:15px}.subsection-head p{font-size:9.5px!important}
        .empty{padding:24px 12px!important;font-size:11px}

        .table-wrap{overflow-x:auto!important;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;margin:0 -12px;padding:0 12px 3px;scrollbar-width:thin}
        table{min-width:680px!important}
        th,td{padding:11px 8px!important;font-size:10.5px!important;white-space:nowrap}
        th{font-size:8.5px!important}

        .modal{align-items:end!important;place-items:end center!important;padding:0!important;background:rgba(0,0,0,.72)!important}
        .modal-card{width:100%!important;max-width:none!important;max-height:92dvh!important;border-radius:20px 20px 0 0!important;border-left:0!important;border-right:0!important;border-bottom:0!important;padding:16px 14px calc(16px + env(safe-area-inset-bottom))!important;box-shadow:0 -24px 70px rgba(0,0,0,.6)!important}
        .modal-head{position:sticky;top:-16px;z-index:2;background:#12171b;padding:4px 0 10px;margin-bottom:2px}
        .modal-head h3{font-size:16px!important}.modal-head button{width:40px;height:40px;font-size:25px!important}
        .form-grid{grid-template-columns:1fr!important;gap:10px!important}.field.full{grid-column:auto!important}
        .field input,.field select,.field textarea{min-height:44px;font-size:13px!important}.field textarea{min-height:88px}
        .form-actions{position:sticky;bottom:calc(-16px - env(safe-area-inset-bottom));background:#12171b;padding:10px 0 calc(10px + env(safe-area-inset-bottom));margin-top:12px!important;display:grid!important;grid-template-columns:1fr 1fr;gap:8px!important}
        .form-actions button{min-height:44px;width:100%}
        .toast{left:12px!important;right:12px!important;bottom:calc(78px + env(safe-area-inset-bottom))!important;text-align:center;font-size:11px;z-index:11000}

        .ops-notify-panel-v216{left:8px!important;right:8px!important;top:68px!important;width:auto!important;max-height:calc(100dvh - 150px)!important;border-radius:14px!important;z-index:10030!important}
        .ops-notify-list-v216{max-height:calc(100dvh - 210px)!important}

        .ops-att-grid-v216,.rhythm-grid-v217,.v219-grid{grid-template-columns:1fr!important}
        .ops-att-head-v216,.rhythm-head-v217,.v219-head{padding:12px!important;align-items:flex-start!important}
        .ops-att-body-v216,.rhythm-body-v217,.v219-body{padding:10px!important}
        #opsAttentionV216,#contentRhythmV217,#monthReadinessV219,#packagePaceV219{border-radius:12px!important;margin-bottom:10px!important}

        #mobileNavV220{display:grid;position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:10020;grid-template-columns:repeat(5,1fr);gap:3px;padding:5px;border:1px solid #303a40;border-radius:16px;background:rgba(14,20,23,.96);backdrop-filter:blur(18px);box-shadow:0 16px 50px rgba(0,0,0,.48)}
        #mobileNavV220 button{position:relative;border:0;background:transparent;color:#8d999f;border-radius:11px;min-height:53px;padding:5px 2px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;font-size:8.5px;font-weight:750;line-height:1.1;min-width:0}
        #mobileNavV220 button .ico{font-size:17px;line-height:1}#mobileNavV220 button.active{background:#202314;color:#ece83b}#mobileNavV220 button.active:after{content:'';position:absolute;top:3px;width:18px;height:2px;border-radius:10px;background:#e8e33b}
        #mobileNavV220 button span:last-child{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

        .auth-screen{padding:16px!important}.auth-card{padding:20px 16px!important;border-radius:18px!important}.auth-logo{width:135px!important;height:92px!important}.auth-slogan{width:185px!important;margin-bottom:18px!important}.auth-card input{min-height:46px;font-size:14px}
      }
      @media(max-width:390px){
        .top-actions #monthPicker{width:98px;max-width:98px;font-size:10px!important}
        .topbar{grid-template-columns:40px minmax(78px,1fr) auto}
        .topbar h1{font-size:15px!important}
        #mobileNavV220 button{font-size:8px}.stats-grid{gap:7px!important}.stat{padding:10px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function closeMenu(){
    const shell=document.getElementById('appShell');
    shell?.classList.remove('mobile-menu-open-v220');
    document.body.classList.remove('mobile-menu-lock-v220');
  }
  function openMenu(){
    if(!mq.matches)return;
    const shell=document.getElementById('appShell');
    shell?.classList.add('mobile-menu-open-v220');
    document.body.classList.add('mobile-menu-lock-v220');
  }

  function activeView(){return document.querySelector('.view.active-view')?.id||'dashboard';}
  function syncBottomNav(view=activeView()){
    const primary=new Set(['dashboard','works','extras','shoots']);
    document.querySelectorAll('#mobileNavV220 button[data-mobile-view]').forEach(b=>b.classList.toggle('active',b.dataset.mobileView===view));
    document.querySelector('#mobileNavV220 [data-mobile-more]')?.classList.toggle('active',!primary.has(view));
  }

  function ensureUi(){
    const shell=document.getElementById('appShell'),sidebar=shell?.querySelector('.sidebar'),topbar=shell?.querySelector('.topbar');
    if(!shell||!sidebar||!topbar)return false;
    if(installed)return true;

    let menuBtn=document.getElementById('mobileMenuBtnV220');
    if(!menuBtn){menuBtn=document.createElement('button');menuBtn.type='button';menuBtn.id='mobileMenuBtnV220';menuBtn.setAttribute('aria-label','Menüyü aç');menuBtn.textContent='☰';topbar.insertBefore(menuBtn,topbar.firstChild);}

    let closeBtn=document.getElementById('mobileMenuCloseV220');
    if(!closeBtn){closeBtn=document.createElement('button');closeBtn.type='button';closeBtn.id='mobileMenuCloseV220';closeBtn.setAttribute('aria-label','Menüyü kapat');closeBtn.textContent='×';sidebar.appendChild(closeBtn);}

    let logout=document.getElementById('mobileLogoutV220');
    if(!logout){
      logout=document.createElement('button');logout.type='button';logout.id='mobileLogoutV220';logout.innerHTML='<span>↪</span><span>Oturumu Kapat</span>';
      const profileBox=sidebar.querySelector('.profile-box');sidebar.insertBefore(logout,profileBox||null);
      logout.addEventListener('click',()=>{closeMenu();document.getElementById('logoutBtn')?.click();});
    }

    let overlay=document.getElementById('mobileMenuOverlayV220');
    if(!overlay){overlay=document.createElement('div');overlay.id='mobileMenuOverlayV220';document.body.appendChild(overlay);}

    let nav=document.getElementById('mobileNavV220');
    if(!nav){
      nav=document.createElement('nav');nav.id='mobileNavV220';nav.setAttribute('aria-label','Mobil ana menü');
      nav.innerHTML=`
        <button type="button" data-mobile-view="dashboard"><span class="ico">⌂</span><span>Ana Panel</span></button>
        <button type="button" data-mobile-view="works"><span class="ico">☷</span><span>İşler</span></button>
        <button type="button" data-mobile-view="extras"><span class="ico">✦</span><span>Ekstra</span></button>
        <button type="button" data-mobile-view="shoots"><span class="ico">◉</span><span>Çekimler</span></button>
        <button type="button" data-mobile-more="1"><span class="ico">☰</span><span>Daha</span></button>`;
      document.body.appendChild(nav);
    }

    menuBtn.addEventListener('click',openMenu);
    closeBtn.addEventListener('click',closeMenu);
    overlay.addEventListener('click',closeMenu);
    nav.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.mobileMore){openMenu();return;}
      const view=b.dataset.mobileView;if(!view)return;
      const desktopNav=document.querySelector(`.nav-item[data-view="${CSS.escape(view)}"]`);
      if(desktopNav)desktopNav.click();else if(typeof setView==='function'&&document.getElementById(view))setView(view);
      closeMenu();setTimeout(()=>syncBottomNav(view),30);
    });

    document.addEventListener('click',e=>{
      const item=e.target.closest('.nav-item[data-view]');
      if(item){const view=item.dataset.view;setTimeout(()=>syncBottomNav(view),30);if(mq.matches)closeMenu();}
    },true);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
    mq.addEventListener?.('change',e=>{if(!e.matches)closeMenu();syncBottomNav();});
    window.addEventListener('orientationchange',()=>setTimeout(()=>{closeMenu();syncBottomNav();},120));
    window.addEventListener('pageshow',()=>setTimeout(()=>syncBottomNav(),80));

    installed=true;syncBottomNav();return true;
  }

  installStyles();
  if(!ensureUi()){
    let tries=0;
    const retry=()=>{tries++;if(ensureUi()||tries>50)return;setTimeout(retry,100);};
    setTimeout(retry,60);
  }
})();
