// V1.31.2 — Eski mesai onay DOM yaması devre dışı.
// Ana günlük puantaj ve mesai hesaplaması yalnız appx32 tarafından yapılır.
// Bu no-op dosya eski cache/loader çağrılarını güvenli biçimde karşılar.
(function disableLegacyAttendanceApprovalControlsV312(){
  window.__mindsAttendanceApprovalControlsV235=true;
  window.__mindsAttendanceApprovalControlsDisabledV312=true;
})();
