$ErrorActionPreference = 'Stop'
$wordInput = 'D:\Cursor\creatisignal-app-new\deliverables\ugc-hits-prd-20260907\UGC爆款_产品需求文档_V1.0.docx'
$wordReviewPdf = 'D:\Cursor\creatisignal-app-new\deliverables\ugc-hits-prd-20260907\_build\word-render.pdf'
$wordApp = $null
$wordDoc = $null
$priorDocCount = -1
try {
  $wordApp = New-Object -ComObject KWPS.Application
  Write-Output 'Application created'
  $priorDocCount = $wordApp.Documents.Count
  Write-Output ('Existing document count=' + $priorDocCount)
  if ($priorDocCount -eq 0) { $wordApp.Visible = $false }
  $wordDoc = $wordApp.Documents.Open($wordInput, $false, $true, $false)
  Write-Output 'Document opened'
  $wordDoc.ExportAsFixedFormat($wordReviewPdf, 17)
  Write-Output ('PDF_READY=' + (Test-Path -LiteralPath $wordReviewPdf))
} catch {
  Write-Output ('EXPORT_ERROR=' + $_.Exception.Message)
  throw
} finally {
  if ($null -ne $wordDoc) { try { $wordDoc.Close($false) } catch {} ; [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($wordDoc) }
  if ($null -ne $wordApp) {
    if ($priorDocCount -eq 0) { try { $wordApp.Quit() } catch {} }
    [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($wordApp)
  }
}
