// V1.22.9 — Yeni Paket İşi: personel firma listesi Tasarım + Video (+ Ana Sorumlu) görevlerinin birleşiminden gelir.
// Eski sosyal-medya/tasarım scope katmanının video firmalarını yanlışlıkla gizlemesini yalnızca paket işi modalında düzeltir.
(function bootWorkModalProductionScopeV229(){
  if(window.__mindsWorkModalProductionScopeV229)return;
  if(typeof openWorkModal!=='function'||typeof activeFirms!=='function'||typeof state==='undefined'){
    setTimeout(bootWorkModalProductionScopeV229,120);return;
  }
  window.__mindsWorkModalProductionScopeV229=true;

  const previousOpenWorkModal=openWorkModal;
  const PRODUCTION_ROLES=new Set(['tasarim','video','ana_sorumlu']);

  function isAdminLocal(){try{return typeof isAdmin==='function'&&isAdmin();}catch(_e){return false;}}
  function myId(){try{return profile?.id||'';}catch(_e){return '';}}
  function sortFirms(arr){return [...arr].sort((a,b)=>new Date(a.list_order_at||0)-new Date(b.list_order_at||0));}

  function productionFirmsForStaff(){
    const me=myId();
    if(!me)return [];
    const ids=new Set((state.assignments||[])
      .filter(a=>a.person_id===me&&PRODUCTION_ROLES.has(a.responsibility))
      .map(a=>a.firm_id));
    return sortFirms((state.firms||[]).filter(f=>f.active&&ids.has(f.id)));
  }

  const wrapped=function(w=null){
    if(isAdminLocal())return previousOpenWorkModal.apply(this,arguments);
    const scoped=productionFirmsForStaff();
    if(!scoped.length)return previousOpenWorkModal.apply(this,arguments);

    const previousActiveFirms=activeFirms;
    try{
      activeFirms=function(){return scoped;};
      return previousOpenWorkModal.apply(this,arguments);
    }finally{
      activeFirms=previousActiveFirms;
    }
  };

  // Önceki kota koruması zaten previousOpenWorkModal içinde; tekrar sarılmasını engelle.
  if(previousOpenWorkModal.__mindsQuotaGuardV208)wrapped.__mindsQuotaGuardV208=true;
  wrapped.__mindsWorkModalProductionScopeV229=true;
  wrapped.__mindsWorkModalProductionScopeBase=previousOpenWorkModal;

  try{openWorkModal=wrapped;}catch(_e){}
  try{window.openWorkModal=wrapped;}catch(_e){}
})();
