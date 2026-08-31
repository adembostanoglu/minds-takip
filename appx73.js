// V1.23.1 — Paylaşım girişi personel tarafında yalnızca Aslı COŞKUN hesabında kullanılabilir; yönetici erişimi korunur.
(function bootShareEntryAsliOnlyV231(){
  if(window.__mindsShareEntryAsliOnlyV231)return;
  if(typeof isAdmin!=='function'||typeof isSocialMediaStaff!=='function'||typeof canShareWork!=='function'||typeof openShareModal!=='function'){
    setTimeout(bootShareEntryAsliOnlyV231,120);return;
  }
  window.__mindsShareEntryAsliOnlyV231=true;

  const norm=v=>String(v||'').trim().toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/\s+/g,' ');
  const isAsli=()=>{try{return !isAdmin()&&norm(profile?.full_name)==='asli coskun';}catch(_e){return false;}};
  const canEnterShare=()=>{try{return isAdmin()||isAsli();}catch(_e){return false;}};

  const previousCanManageShare=typeof canManageShare==='function'?canManageShare:null;
  const previousOpenShareModal=openShareModal;

  isSocialMediaStaff=function(){return isAsli();};
  window.isSocialMediaStaff=isSocialMediaStaff;

  canShareWork=function(w){
    if(!w||typeof workReady!=='function'||!workReady(w))return false;
    if(isAdmin())return true;
    if(!isAsli())return false;
    try{return typeof isSocialMediaForFirm==='function'&&isSocialMediaForFirm(workFirmId(w),profile?.id);}catch(_e){return false;}
  };
  window.canShareWork=canShareWork;

  if(previousCanManageShare){
    canManageShare=function(s){return canEnterShare()?previousCanManageShare(s):false;};
    window.canManageShare=canManageShare;
  }

  openShareModal=function(){
    if(!canEnterShare()){
      if(typeof toast==='function')toast('Paylaşım girişi yalnızca Aslı COŞKUN hesabında kullanılabilir.',true);
      return;
    }
    return previousOpenShareModal.apply(this,arguments);
  };
  window.openShareModal=openShareModal;

  function applyVisibility(){
    const allowed=canEnterShare();
    ['heroShareBtnV111','addShareBtnV11'].forEach(id=>{const b=document.getElementById(id);if(b)b.style.display=allowed?'':'none';});
    const note=document.getElementById('shareFlowNoteV111');if(note)note.style.display=allowed?'':'none';
    if(!allowed){
      document.querySelectorAll('[data-share-work-v11],[data-share-work],[data-edit-share-v11],[data-delete-share-v11]').forEach(x=>x.style.display='none');
    }
  }

  document.addEventListener('click',e=>{
    const action=e.target.closest('#heroShareBtnV111,#addShareBtnV11,[data-share-work-v11],[data-share-work],[data-edit-share-v11],[data-delete-share-v11]');
    if(!action||canEnterShare())return;
    e.preventDefault();e.stopImmediatePropagation();
    if(typeof toast==='function')toast('Paylaşım işlemleri yalnızca Aslı COŞKUN hesabında kullanılabilir.',true);
  },true);

  document.addEventListener('click',e=>{if(e.target.closest('[data-view="shares"]'))setTimeout(applyVisibility,80);},true);
  document.addEventListener('change',e=>{if(e.target?.id==='monthPicker')setTimeout(applyVisibility,120);},true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(applyVisibility,80);});

  try{if(typeof applyRoleUI==='function')applyRoleUI();}catch(e){console.warn('Paylaşım rol görünümü',e);}
  try{if(typeof renderShares==='function')renderShares();}catch(e){console.warn('Paylaşım görünümü',e);}
  [0,160,500].forEach(ms=>setTimeout(applyVisibility,ms));
})();
