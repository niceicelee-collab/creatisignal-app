$wordInput='D:\Cursor\creatisignal-app-new\deliverables\ugc-hits-prd-immersive-20260908\UGC爆款_产品需求文档_V1.1_沉浸式浏览.docx'
$wordReviewPdf='D:\Cursor\creatisignal-app-new\deliverables\ugc-hits-prd-immersive-20260908\_build\word-render.pdf'
$wordApp=$null
$wordDoc=$null
$priorDocCount=-1
try {
  $wordApp=New-Object -ComObject KWPS.Application
  $priorDocCount=$wordApp.Documents.Count
  if($priorDocCount -eq 0){$wordApp.Visible=$false}
  $wordDoc=$wordApp.Documents.Open($wordInput,$false,$true,$false)
  $wordDoc.ExportAsFixedFormat($wordReviewPdf,17)
  Write-Output ('EXPORTED='+$wordReviewPdf)
} catch {
  Write-Output ('EXPORT_ERROR='+$_.Exception.Message)
  throw
} finally {
  if($wordDoc){try{$wordDoc.Close($false)}catch{};[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($wordDoc)}
  if($wordApp){if($priorDocCount -eq 0){try{$wordApp.Quit()}catch{}};[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($wordApp)}
}
