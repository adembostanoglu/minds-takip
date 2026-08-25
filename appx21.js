// V1.14.4 loader bridge — stable bootstrap + target summary + weighted extras + carryover + shoot notes + performance + external shoot clients + prepared column highlight.
(function loadStableLayersV144(){
  const load=(flag,src,err)=>{if(document.querySelector(`script[${flag}]`))return;const s=document.createElement('script');s.src=src;s.setAttribute(flag,'1');s.onerror=()=>console.error(err);document.body.appendChild(s);};
  load('data-minds-v135-bootstrap','appx22.js?v=1350','V1.13.5 bootstrap module could not be loaded');
  load('data-minds-v136-target-actual','appx23.js?v=1360','V1.13.6 target/actual summary module could not be loaded');
  load('data-minds-v140-external-extras','appx24.js?v=1400','V1.14 weighted extra work module could not be loaded');
  load('data-minds-v138-carryover','appx25.js?v=1400','V1.14.0 carryover module could not be loaded');
  load('data-minds-v140-shoot-notes','appx26.js?v=1400','V1.14 shoot note module could not be loaded');
  load('data-minds-v142-performance-direct','appx28.js?v=1420','V1.14.2 direct performance recovery module could not be loaded');
  load('data-minds-v143-external-shoots','appx29.js?v=1430','V1.14.3 external shoot clients module could not be loaded');
  load('data-minds-v144-prepared-highlight','appx30.js?v=1440','V1.14.4 prepared column highlight module could not be loaded');
})();
