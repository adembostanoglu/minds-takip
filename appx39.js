// V1.17.0 — Yalnızca yönetici için Sosyal Medya Takip modülü.
(function bootSocialMediaTrackingV170(){
  if(window.__mindsSocialMediaTrackingV170)return;
  window.__mindsSocialMediaTrackingV170=true;

  const VIEW_ID='socialMediaTrack';
  const NAV_ID='socialMediaTrackNav';
  let trackingRows=[];
  let searchTerm='';

  const money=v=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v||0));
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
  const monthKey=()=>String(typeof selectedMonth!=='undefined'?selectedMonth:'').slice(0,10);
  const formatDateSafe=v=>v?(typeof formatDate==='function'?formatDate(v):String(v).slice(0,10)):'—';
  const monthFirms=()=>typeof selectedMonthFirms==='function'?selectedMonthFirms():((state?.firms||[]).filter(f=>f.active));
  const currentPackage=f=>{
    const fm=(state?.months||[]).find(m=>m.firm_id===f.id&&m.month===monthKey());
    return {post:Number(fm?.post_quota??f.default_post_quota??0),video:Number(fm?.video_quota??f.default_video_quota??0)};
  };
  const rowFor=fid=>trackingRows.find(r=>r.firm_id===fid)||null;
  const paymentLabel=v=>v==='elden'?'Elden':v==='fatura'?'Fatura':'Tanımsız';

  function installStyles(){
    if(document.getElementById('socialMediaTrackingV170Style'))return;
    const s=document.createElement('style');
    s.id='socialMediaTrackingV170Style';
    s.textContent=`
      .smt-head-v170{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}.smt-head-v170 h2{margin:0 0 6px;font-size:24px;letter-spacing:-.4px}.smt-head-v170 p{margin:0;color:#8e9aa3;font-size:13px}.smt-admin-v170{display:inline-flex;align-items:center;gap:6px;border:1px solid #625d22;background:#1b1b0d;color:#ece52c;border-radius:9px;padding:7px 10px;font-size:11px;font-weight:800;white-space:nowrap}
      .smt-kpis-v170{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin-bottom:16px}.smt-kpi-v170{border:1px solid #29343a;border-radius:14px;background:#10171b;padding:16px;min-height:106px;box-sizing:border-box}.smt-kpi-v170 small{display:block;color:#8c989f;font-size:10px;text-transform:uppercase;letter-spacing:.35px;margin-bottom:9px}.smt-kpi-v170 b{display:block;color:#f0f3f4;font-size:22px;line-height:1.15;letter-spacing:-.4px}.smt-kpi-v170 span{display:block;color:#7f8b92;font-size:10px;margin-top:8px}.smt-kpi-v170.cash{border-color:#28533c}.smt-kpi-v170.cash b{color:#91d47a}.smt-kpi-v170.invoice{border-color:#294a61}.smt-kpi-v170.invoice b{color:#8bcdf3}.smt-kpi-v170.total{border-color:#625d22;background:#191a0e}.smt-kpi-v170.total b{color:#ece52c}.smt-kpi-v170.package b{color:#e8edef}
      .smt-panel-v170{border:1px solid #29343a;border-radius:14px;background:#0f161a;overflow:hidden}.smt-panel-head-v170{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid #263036}.smt-panel-head-v170 h3{margin:0;font-size:17px}.smt-search-v170{width:min(340px,46vw);height:38px;border-radius:9px;border:1px solid #344047;background:#121a1f;color:#edf1f2;padding:0 12px;outline:none}.smt-search-v170:focus{border-color:#6b6723;box-shadow:0 0 0 2px rgba(236,229,44,.07)}
      .smt-table-wrap-v170{overflow:auto}.smt-table-v170{width:100%;border-collapse:collapse;min-width:1020px}.smt-table-v170 th,.smt-table-v170 td{padding:13px 14px;border-bottom:1px solid #222c31;text-align:left;white-space:nowrap;font-size:12px}.smt-table-v170 th{color:#8d999f;font-size:10px;text-transform:uppercase;letter-spacing:.25px;background:#12191d}.smt-table-v170 tr:last-child td{border-bottom:0}.smt-firm-v170{display:flex;align-items:center;gap:10px}.smt-firm-v170 .firm-logo{width:34px;height:34px;min-width:34px}.smt-price-v170{font-weight:800;color:#eef2f3}.smt-package-v170{font-weight:800;color:#ece52c}.smt-note-v170{max-width:210px;overflow:hidden;text-overflow:ellipsis;color:#b7c0c4}.smt-pay-v170{display:inline-flex;border-radius:7px;padding:5px 8px;font-size:10px;font-weight:800}.smt-pay-v170.elden{background:#113522;color:#91d47a}.smt-pay-v170.fatura{background:#122b3b;color:#8bcdf3}.smt-pay-v170.none{background:#262d31;color:#9ba5aa}.smt-footer-v170{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 18px;border-top:1px solid #263036;color:#829097;font-size:11px}.smt-footer-v170 b{color:#e8edef}
      .smt-detail-back-v170{position:fixed;inset:0;background:rgba(0,0,0,.46);backdrop-filter:blur(2px);z-index:10010;opacity:0;pointer-events:none;transition:opacity .18s ease}.smt-detail-back-v170.open{opacity:1;pointer-events:auto}.smt-detail-v170{position:fixed;top:0;right:0;height:100vh;width:min(500px,94vw);background:#0e1418;border-left:1px solid #30393f;z-index:10011;box-shadow:-24px 0 60px rgba(0,0,0,.45);transform:translateX(102%);transition:transform .22s ease;display:flex;flex-direction:column;color:#e8edef}.smt-detail-v170.open{transform:translateX(0)}.smt-detail-head-v170{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px;border-bottom:1px solid #273137;background:linear-gradient(180deg,#151c20,#10161a)}.smt-detail-head-v170 h3{margin:0;font-size:20px}.smt-detail-head-v170 p{margin:5px 0 0;color:#839098;font-size:11px}.smt-detail-close-v170{width:36px;height:36px;border:1px solid #354047;border-radius:10px;background:#151c20;color:#d9e0e3;font-size:20px;cursor:pointer}.smt-detail-body-v170{padding:18px 20px 24px;overflow:auto;flex:1}.smt-detail-summary-v170{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:16px}.smt-detail-box-v170{border:1px solid #2a343a;border-radius:11px;background:#12191d;padding:12px}.smt-detail-box-v170 small{display:block;color:#839097;font-size:10px;margin-bottom:5px}.smt-detail-box-v170 b{font-size:16px}.smt-detail-form-v170{display:grid;grid-template-columns:1fr 1fr;gap:12px}.smt-field-v170{display:flex;flex-direction:column;gap:7px}.smt-field-v170.full{grid-column:1/-1}.smt-field-v170 label{font-size:11px;color:#9ba5aa;font-weight:700}.smt-field-v170 input,.smt-field-v170 select,.smt-field-v170 textarea{width:100%;box-sizing:border-box;border-radius:9px;border:1px solid #344047;background:#121a1f;color:#edf1f2;padding:11px 12px;font:inherit;outline:none}.smt-field-v170 textarea{min-height:140px;resize:vertical}.smt-field-v170 input:focus,.smt-field-v170 select:focus,.smt-field-v170 textarea:focus{border-color:#6b6723;box-shadow:0 0 0 2px rgba(236,229,44,.07)}.smt-help-v170{font-size:10px;color:#78858c}.smt-save-v170{margin-top:16px;width:100%;height:44px;border:0;border-radius:10px;background:#e5de29;color:#101207;font-weight:900;cursor:pointer}.smt-empty-v170{padding:42px;text-align:center;color:#7d8990}
      @media(max-width:1280px){.smt-kpis-v170{grid-template-columns:repeat(3,1fr)}}@media(max-width:760px){.smt-kpis-v170{grid-template-columns:1fr 1fr}.smt-panel-head-v170{align-items:stretch;flex-direction:column}.smt-search-v170{width:100%}.smt-detail-form-v170{grid-template-columns:1fr}.smt-field-v170.full{grid-column:auto}}
    `;
    document.head.appendChild(s);
  }

  function ensureUI(){
    installStyles();
    const nav=document.querySelector('.sidebar nav');
    if(nav&&!document.getElementById(NAV_ID)){
      const btn=document.createElement('button');
      btn.id=NAV_ID;
      btn.className='nav-item admin-nav';
      btn.dataset.view=VIEW_ID;
      btn.innerHTML='◉ <span>Sosyal Medya Takip</span>';
      const firmsBtn=nav.querySelector('[data-view="firms"]');
      firmsBtn?.insertAdjacentElement('afterend',btn);
      btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!isAdmin())return;showView();},true);
    }
    const main=document.querySelector('.main');
    if(main&&!document.getElementById(VIEW_ID)){
      const section=document.createElement('section');
      section.id=VIEW_ID;section.className='view admin-only';
      main.appendChild(section);
    }
    try{if(typeof ADMIN_VIEWS!=='undefined'&&ADMIN_VIEWS.add)ADMIN_VIEWS.add(VIEW_ID);}catch(_e){}
    ensureDrawer();
  }

  function ensureDrawer(){
    if(!document.getElementById('smtDetailBackV170')){
      const back=document.createElement('div');back.id='smtDetailBackV170';back.className='smt-detail-back-v170';document.body.appendChild(back);back.addEventListener('click',closeDetail);
    }
    if(!document.getElementById('smtDetailV170')){
      const drawer=document.createElement('aside');drawer.id='smtDetailV170';drawer.className='smt-detail-v170';document.body.appendChild(drawer);
    }
  }

  async function loadTracking(){
    if(!isAdmin())return;
    const {data,error}=await sb.from('social_media_tracking').select('*').lte('month',monthKey()).order('month',{ascending:false});
    if(error){console.error('[Sosyal Medya Takip]',error);toast('Sosyal medya takip verileri alınamadı.',true);return;}
    const seen=new Set();
    trackingRows=[];
    for(const r of (data||[])){
      if(seen.has(r.firm_id))continue;
      seen.add(r.firm_id);trackingRows.push(r);
    }
    render();
  }

  function showView(){
    ensureUI();
    document.querySelectorAll('.view').forEach(x=>x.classList.remove('active-view'));
    document.getElementById(VIEW_ID)?.classList.add('active-view');
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
    document.getElementById(NAV_ID)?.classList.add('active');
    if(el('pageTitle'))el('pageTitle').textContent='Sosyal Medya Takip';
    loadTracking();
  }

  function render(){
    const host=document.getElementById(VIEW_ID);if(!host||!isAdmin())return;
    const firms=monthFirms().filter(f=>!searchTerm||String(f.name||'').toLocaleLowerCase('tr-TR').includes(searchTerm));
    const allFirms=monthFirms();
    const totals=allFirms.reduce((a,f)=>{const r=rowFor(f.id),pkg=currentPackage(f),price=Number(r?.monthly_price||0);a.total+=price;a.post+=pkg.post;a.video+=pkg.video;if(r?.payment_type==='elden')a.cash+=price;if(r?.payment_type==='fatura')a.invoice+=price;return a;},{total:0,cash:0,invoice:0,post:0,video:0});
    host.innerHTML=`
      <div class="smt-head-v170"><div><h2>Sosyal Medya Takip</h2><p>Firmalar modülündeki sosyal medya müşterileri burada otomatik listelenir. Paket bilgileri mevcut firma kayıtlarından alınır.</p></div><span class="smt-admin-v170">🔒 Yalnızca Yönetici</span></div>
      <div class="smt-kpis-v170">
        <div class="smt-kpi-v170"><small>Aktif Firma Sayısı</small><b>${allFirms.length}</b><span>${typeof prettyMonth==='function'?prettyMonth(monthKey()):monthKey()}</span></div>
        <div class="smt-kpi-v170 cash"><small>Elden Alınan</small><b>${money(totals.cash)}</b><span>Bu ay elden tahsil edilen</span></div>
        <div class="smt-kpi-v170 invoice"><small>Fatura Kesilen</small><b>${money(totals.invoice)}</b><span>Bu ay fatura kesilen</span></div>
        <div class="smt-kpi-v170 total"><small>Genel Toplam</small><b>${money(totals.total)}</b><span>Bu ay toplam sosyal medya geliri</span></div>
        <div class="smt-kpi-v170 package"><small>Toplam Post</small><b>${totals.post}</b><span>Taahhüt edilen post</span></div>
        <div class="smt-kpi-v170 package"><small>Toplam Video</small><b>${totals.video}</b><span>Taahhüt edilen video</span></div>
      </div>
      <div class="smt-panel-v170">
        <div class="smt-panel-head-v170"><h3>Sosyal Medya Firmaları</h3><input id="smtSearchV170" class="smt-search-v170" placeholder="Firma ara…" value="${esc(searchTerm)}"></div>
        <div class="smt-table-wrap-v170"><table class="smt-table-v170"><thead><tr><th>Firma Adı</th><th>Aylık Fiyat</th><th>Paket</th><th>Paket İçeriği</th><th>Başlangıç Tarihi</th><th>Ödeme Şekli</th><th>Durum</th><th>Not</th><th>İşlem</th></tr></thead><tbody>${firms.map(f=>{
          const r=rowFor(f.id),pkg=currentPackage(f),pay=r?.payment_type||'',start=r?.start_date||String(f.created_at||'').slice(0,10),has=!!r;
          return `<tr><td><div class="smt-firm-v170">${typeof firmLogo==='function'?firmLogo(f):''}<b>${esc(f.name)}</b></div></td><td class="smt-price-v170">${has?money(r.monthly_price):'—'}</td><td class="smt-package-v170">${pkg.post}+${pkg.video}</td><td>${pkg.post} Post + ${pkg.video} Video</td><td>${formatDateSafe(start)}</td><td><span class="smt-pay-v170 ${pay||'none'}">${paymentLabel(pay)}</span></td><td><span class="badge ${f.active?'green':'orange'}">${f.active?'Aktif':'Pasif'}</span></td><td><div class="smt-note-v170" title="${esc(r?.note||'')}">${esc(r?.note||'—')}</div></td><td><button class="small-primary" data-smt-detail="${f.id}">Detay</button></td></tr>`;
        }).join('')||'<tr><td colspan="9"><div class="smt-empty-v170">Bu ay için firma bulunamadı.</div></td></tr>'}</tbody></table></div>
        <div class="smt-footer-v170"><span><b>${firms.length}</b> firma gösteriliyor</span><span>Toplam aylık ücret: <b>${money(totals.total)}</b></span></div>
      </div>`;
    const inp=document.getElementById('smtSearchV170');
    inp?.addEventListener('input',e=>{searchTerm=String(e.target.value||'').toLocaleLowerCase('tr-TR').trim();render();requestAnimationFrame(()=>{const n=document.getElementById('smtSearchV170');if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length);}});});
    host.querySelectorAll('[data-smt-detail]').forEach(b=>b.addEventListener('click',()=>openDetail(b.dataset.smtDetail)));
  }

  function closeDetail(){document.getElementById('smtDetailBackV170')?.classList.remove('open');document.getElementById('smtDetailV170')?.classList.remove('open');}

  function openDetail(fid){
    if(!isAdmin())return;
    const f=(state?.firms||[]).find(x=>x.id===fid);if(!f)return;
    const r=rowFor(fid),pkg=currentPackage(f),start=r?.start_date||String(f.created_at||'').slice(0,10),drawer=document.getElementById('smtDetailV170');
    drawer.innerHTML=`<div class="smt-detail-head-v170"><div><h3>${esc(f.name)} • Detay</h3><p>${typeof prettyMonth==='function'?prettyMonth(monthKey()):monthKey()} sosyal medya anlaşması</p></div><button class="smt-detail-close-v170" id="smtCloseV170">×</button></div><div class="smt-detail-body-v170"><div class="smt-detail-summary-v170"><div class="smt-detail-box-v170"><small>Paket</small><b>${pkg.post}+${pkg.video}</b></div><div class="smt-detail-box-v170"><small>Paket İçeriği</small><b>${pkg.post} Post + ${pkg.video} Video</b></div></div><form id="smtFormV170" class="smt-detail-form-v170"><div class="smt-field-v170"><label>Aylık Fiyat</label><input name="monthly_price" type="number" min="0" step="0.01" value="${Number(r?.monthly_price||0)}"></div><div class="smt-field-v170"><label>Ödeme Şekli</label><select name="payment_type"><option value="" ${!r?.payment_type?'selected':''}>Seçilmedi</option><option value="elden" ${r?.payment_type==='elden'?'selected':''}>Elden</option><option value="fatura" ${r?.payment_type==='fatura'?'selected':''}>Fatura</option></select></div><div class="smt-field-v170 full"><label>Başlangıç Tarihi</label><input name="start_date" type="date" value="${esc(start||'')}"><div class="smt-help-v170">Firma bilgisi Firmalar bölümünden gelir; burada yalnızca sosyal medya anlaşma detaylarını yönetirsin.</div></div><div class="smt-field-v170 full"><label>Not</label><textarea name="note" maxlength="500" placeholder="Özel not ekleyebilirsin…">${esc(r?.note||'')}</textarea></div><div class="smt-field-v170 full"><button class="smt-save-v170" type="submit">Kaydet</button></div></form></div>`;
    document.getElementById('smtDetailBackV170')?.classList.add('open');drawer.classList.add('open');
    document.getElementById('smtCloseV170')?.addEventListener('click',closeDetail);
    document.getElementById('smtFormV170')?.addEventListener('submit',async e=>{
      e.preventDefault();
      const fd=new FormData(e.currentTarget),price=Number(fd.get('monthly_price')||0),payment=String(fd.get('payment_type')||'')||null,startDate=String(fd.get('start_date')||'')||null,note=String(fd.get('note')||'').trim()||null;
      if(!Number.isFinite(price)||price<0)return toast('Aylık fiyat geçerli bir tutar olmalı.',true);
      const btn=e.currentTarget.querySelector('[type="submit"]');btn.disabled=true;btn.textContent='Kaydediliyor…';
      const payload={firm_id:fid,month:monthKey(),monthly_price:price,payment_type:payment,start_date:startDate,note,created_by:profile?.id||null};
      const {error}=await sb.from('social_media_tracking').upsert(payload,{onConflict:'firm_id,month'});
      if(error){console.error('[Sosyal Medya Takip Kaydet]',error);btn.disabled=false;btn.textContent='Kaydet';return toast(typeof friendlyError==='function'?friendlyError(error):error.message,true);}
      closeDetail();await loadTracking();toast('Sosyal medya bilgileri kaydedildi.');
    });
  }

  ensureUI();
  document.getElementById('monthPicker')?.addEventListener('change',()=>{setTimeout(()=>{if(document.getElementById(VIEW_ID)?.classList.contains('active-view'))loadTracking();},0);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('smtDetailV170')?.classList.contains('open'))closeDetail();});
})();
