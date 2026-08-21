// V1.13.5 loader bridge — use the stable single-RPC bootstrap.
(function loadSingleRpcBootstrapV135(){
  if(document.querySelector('script[data-minds-v135-bootstrap]')) return;
  const s=document.createElement('script');
  s.src='appx22.js?v=1350';
  s.dataset.mindsV135Bootstrap='1';
  s.onerror=()=>console.error('V1.13.5 bootstrap module could not be loaded');
  document.body.appendChild(s);
})();