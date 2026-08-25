// V1.14.4 — visual highlight for only the "Hazırladığı" column in team person detail tables.
(function bootPreparedColumnHighlightV144(){
  if(window.__mindsPreparedColumnHighlightV144) return;
  window.__mindsPreparedColumnHighlightV144=true;

  const style=document.createElement('style');
  style.id='preparedColumnHighlightV144Style';
  style.textContent=`
    #teamPersonDetailV121 .person-detail-table-wrap-v121 table th:nth-child(5),
    #teamPersonDetailV121 .person-detail-table-wrap-v121 table td:nth-child(5){
      background:linear-gradient(180deg,rgba(221,225,43,.13),rgba(172,187,25,.075));
      border-left:1px solid rgba(224,227,49,.24);
      border-right:1px solid rgba(224,227,49,.24);
    }
    #teamPersonDetailV121 .person-detail-table-wrap-v121 table th:nth-child(5){
      color:#dedf3d;
      box-shadow:inset 0 -1px 0 rgba(226,229,48,.28);
    }
    #teamPersonDetailV121 .person-detail-table-wrap-v121 table td:nth-child(5) b{
      color:#f0ef63;
      text-shadow:0 0 10px rgba(221,225,43,.10);
    }
    #teamPersonDetailV121 .person-detail-table-wrap-v121 table tbody tr:hover td:nth-child(5){
      background:linear-gradient(180deg,rgba(228,231,53,.18),rgba(177,192,28,.11));
    }
  `;
  document.head.appendChild(style);
})();
