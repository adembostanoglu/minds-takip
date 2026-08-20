// V1.11.3 — premium icon KPI cards on Ana Panel
(function bootDashboardIconsV113(){
  if(typeof counts!=='function' || typeof selectedMonthFirms!=='function' || typeof prettyMonth!=='function'){
    setTimeout(bootDashboardIconsV113,100); return;
  }
  if(window.__mindsDashboardIconsV113) return;
  window.__mindsDashboardIconsV113=true;

  const icons={
    firms:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17"/><path d="M16 8h3a1 1 0 0 1 1 1v12"/><path d="M8 7h4M8 11h4M8 15h4M8 19h4"/></svg>',
    post:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></svg>',
    video:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></svg>',
    sharePost:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m21 3-7.6 18-4.2-8.2L1 8.6z"/><path d="M9.2 12.8 21 3"/></svg>',
    shareVideo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="12" height="12" rx="2"/><path d="m15 10 5-3v10l-5-3z"/><path d="M7 3h4"/></svg>',
    waiting:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    extra:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
    shootFirm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11z"/><circle cx="12" cy="10" r="2"/></svg>',
    shootVideo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/><path d="M6 3h7"/></svg>'
  };

  function statCard(item){
    return `<div class="dash-kpi-card dash-kpi-${item.tone}"><div class="dash-kpi-icon">${icons[item.icon]}</div><div class="dash-kpi-body"><div class="dash-kpi-label">${item.label}</div><div class="dash-kpi-value">${item.value}</div><div class="dash-kpi-foot">${item.foot}</div></div></div>`;
  }

  function renderPremiumStats(){
    const c=counts(), firmCount=selectedMonthFirms().length, monthText=prettyMonth(selectedMonth);
    const admin=isAdmin(), social=typeof isSocialMediaStaff==='function' && isSocialMediaStaff();
    let items;
    if(admin){
      items=[
        {label:selectedMonth===monthISO()?'Aktif Firma':'Firma',value:firmCount,icon:'firms',tone:'purple',foot:'Aktif firmalar'},
        {label:'Hazırlanan Post',value:c.post,icon:'post',tone:'blue',foot:`${monthText} tamamlanan`},
        {label:'Hazırlanan Video',value:c.video,icon:'video',tone:'green',foot:`${monthText} tamamlanan`},
        {label:'Paylaşılan Post',value:c.sharedPost??0,icon:'sharePost',tone:'orange',foot:`${monthText} paylaşılan`},
        {label:'Paylaşılan Video',value:c.sharedVideo??0,icon:'shareVideo',tone:'red',foot:`${monthText} paylaşılan`},
        {label:'Paylaşım Bekleyen',value:c.waiting,icon:'waiting',tone:'cyan',foot:'İçerik'},
        {label:'Personel Ekstrası',value:c.staffExtras,icon:'extra',tone:'violet',foot:`${monthText} verisi`},
        {label:'Çekim Yapılan Firma',value:c.shootFirms,icon:'shootFirm',tone:'gold',foot:`${monthText} verisi`},
        {label:'Çekilen Video İçeriği',value:c.shootVideos,icon:'shootVideo',tone:'indigo',foot:`${monthText} verisi`}
      ];
    }else if(social){
      items=[
        {label:'Firmalarım',value:firmCount,icon:'firms',tone:'purple',foot:'Atanmış firmalar'},
        {label:'Hazırladığım Post',value:c.post,icon:'post',tone:'blue',foot:`${monthText} tamamlanan`},
        {label:'Hazırladığım Video',value:c.video,icon:'video',tone:'green',foot:`${monthText} tamamlanan`},
        {label:'Paylaştığım Post',value:c.sharedPost??0,icon:'sharePost',tone:'orange',foot:`${monthText} paylaşılan`},
        {label:'Paylaştığım Video',value:c.sharedVideo??0,icon:'shareVideo',tone:'red',foot:`${monthText} paylaşılan`},
        {label:'Paylaşım Bekleyen',value:c.waiting,icon:'waiting',tone:'cyan',foot:'İçerik'},
        {label:'Ekstra İşim',value:c.extras,icon:'extra',tone:'violet',foot:`${monthText} verisi`},
        {label:'Çekim Yaptığım Firma',value:c.shootFirms,icon:'shootFirm',tone:'gold',foot:`${monthText} verisi`},
        {label:'Çektiğim Video İçeriği',value:c.shootVideos,icon:'shootVideo',tone:'indigo',foot:`${monthText} verisi`}
      ];
    }else{
      items=[
        {label:'Firmalarım',value:firmCount,icon:'firms',tone:'purple',foot:'Atanmış firmalar'},
        {label:'Hazırladığım Post',value:c.post,icon:'post',tone:'blue',foot:`${monthText} tamamlanan`},
        {label:'Hazırladığım Video',value:c.video,icon:'video',tone:'green',foot:`${monthText} tamamlanan`},
        {label:'Paylaşım Bekleyen',value:c.waiting,icon:'waiting',tone:'cyan',foot:'İçerik'},
        {label:'Ekstra İşim',value:c.extras,icon:'extra',tone:'violet',foot:`${monthText} verisi`},
        {label:'Çekim Yaptığım Firma',value:c.shootFirms,icon:'shootFirm',tone:'gold',foot:`${monthText} verisi`},
        {label:'Çektiğim Video İçeriği',value:c.shootVideos,icon:'shootVideo',tone:'indigo',foot:`${monthText} verisi`}
      ];
    }
    const n=el('stats'); if(n) n.innerHTML=items.map(statCard).join('');
  }

  const st=document.createElement('style');
  st.id='dashboardPremiumIconStyleV113';
  st.textContent=`
  #stats.stats-grid{grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
  .dash-kpi-card{position:relative;display:grid;grid-template-columns:54px 1fr;gap:12px;align-items:center;min-height:86px;padding:14px 14px;background:linear-gradient(145deg,#11171c,#0e1317);border:1px solid #263038;border-radius:14px;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.02)}
  .dash-kpi-card:before{content:'';position:absolute;inset:auto -20px -34px auto;width:86px;height:86px;border-radius:50%;filter:blur(28px);opacity:.18;pointer-events:none}
  .dash-kpi-icon{position:relative;width:50px;height:50px;border-radius:13px;display:grid;place-items:center;color:#fff;border:1px solid rgba(255,255,255,.20);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 7px 20px rgba(0,0,0,.28)}
  .dash-kpi-icon:after{content:'';position:absolute;inset:3px;border-radius:10px;background:linear-gradient(135deg,rgba(255,255,255,.24),transparent 52%);pointer-events:none}
  .dash-kpi-icon svg{width:27px;height:27px;position:relative;z-index:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,.28))}
  .dash-kpi-label{font-size:10px;color:#c9d0d5;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dash-kpi-value{font-size:27px;line-height:1;font-weight:800;color:#fff;margin-top:5px;font-variant-numeric:tabular-nums}
  .dash-kpi-foot{font-size:9px;color:#89939a;margin-top:5px}
  .dash-kpi-purple .dash-kpi-icon{background:linear-gradient(135deg,#8254ff,#5130e8);box-shadow:0 0 22px rgba(117,72,255,.28),inset 0 1px 0 rgba(255,255,255,.3)}.dash-kpi-purple:before{background:#7448ff}
  .dash-kpi-blue .dash-kpi-icon{background:linear-gradient(135deg,#2498ff,#1961e8);box-shadow:0 0 22px rgba(36,143,255,.28),inset 0 1px 0 rgba(255,255,255,.3)}.dash-kpi-blue:before{background:#258dff}
  .dash-kpi-green .dash-kpi-icon{background:linear-gradient(135deg,#42d67b,#13a950);box-shadow:0 0 22px rgba(50,210,112,.28),inset 0 1px 0 rgba(255,255,255,.3)}.dash-kpi-green:before{background:#2dcc6d}
  .dash-kpi-orange .dash-kpi-icon{background:linear-gradient(135deg,#ffb32e,#ef7800);box-shadow:0 0 22px rgba(255,147,24,.28),inset 0 1px 0 rgba(255,255,255,.3)}.dash-kpi-orange:before{background:#ff9418}
  .dash-kpi-red .dash-kpi-icon{background:linear-gradient(135deg,#ff6380,#e42b50);box-shadow:0 0 22px rgba(255,72,108,.26),inset 0 1px 0 rgba(255,255,255,.3)}.dash-kpi-red:before{background:#ff486c}
  .dash-kpi-cyan .dash-kpi-icon{background:linear-gradient(135deg,#24d0cc,#079796);box-shadow:0 0 22px rgba(24,195,191,.26),inset 0 1px 0 rgba(255,255,255,.3)}.dash-kpi-cyan:before{background:#18c3bf}
  .dash-kpi-violet .dash-kpi-icon{background:linear-gradient(135deg,#b262ff,#7c32d8);box-shadow:0 0 22px rgba(166,75,245,.25),inset 0 1px 0 rgba(255,255,255,.3)}.dash-kpi-violet:before{background:#9e4deb}
  .dash-kpi-gold .dash-kpi-icon{background:linear-gradient(135deg,#f1d73c,#c49a08);box-shadow:0 0 22px rgba(224,190,35,.22),inset 0 1px 0 rgba(255,255,255,.3)}.dash-kpi-gold:before{background:#e1bf22}
  .dash-kpi-indigo .dash-kpi-icon{background:linear-gradient(135deg,#6f87ff,#4450d8);box-shadow:0 0 22px rgba(91,111,238,.24),inset 0 1px 0 rgba(255,255,255,.3)}.dash-kpi-indigo:before{background:#6477f3}
  @media(max-width:760px){.dash-kpi-card{grid-template-columns:48px 1fr}.dash-kpi-icon{width:45px;height:45px}}
  `;
  document.head.appendChild(st);

  renderStats=renderPremiumStats;
  renderPremiumStats();
})();
