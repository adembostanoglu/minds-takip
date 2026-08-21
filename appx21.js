// V1.13.6 loader bridge — stable single-RPC bootstrap + safe personnel target summary.
(function loadStableLayersV136(){
  if(!document.querySelector('script[data-minds-v135-bootstrap]')){
    const s=document.createElement('script');
    s.src='appx22.js?v=1350';
    s.dataset.mindsV135Bootstrap='1';
    s.onerror=()=>console.error('V1.13.5 bootstrap module could not be loaded');
    document.body.appendChild(s);
  }
  if(!document.querySelector('script[data-minds-v136-target-actual]')){
    const s=document.createElement('script');
    s.src='appx23.js?v=1360';
    s.dataset.mindsV136TargetActual='1';
    s.onerror=()=>console.error('V1.13.6 target/actual summary module could not be loaded');
    document.body.appendChild(s);
  }
})();