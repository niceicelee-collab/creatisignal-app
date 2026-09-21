$ErrorActionPreference = 'Stop'
$inputDoc = 'D:\Cursor\creatisignal-app-new\deliverables\material-replicate-ux-20260911\素材分析与高保真复刻字段优化方案_V1.0.docx'
$renderFolder = 'D:\Cursor\creatisignal-app-new\.codex-tmp\material-replicate-ux-20260911\render'
New-Item -ItemType Directory -Force -Path $renderFolder | Out-Null
$outputPdf = Join-Path $renderFolder 'review.pdf'
$officeApp = $null
$openedDoc = $null
try {
    $officeApp = New-Object -ComObject 'KWPS.Application'
    $openedDoc = $officeApp.Documents.Open($inputDoc, $false, $true, $false)
    $openedDoc.Repaginate()
    $openedDoc.ExportAsFixedFormat($outputPdf, 17)
    Write-Output ('Rendered PDF: ' + $outputPdf)
    Write-Output ('Pages: ' + $openedDoc.ComputeStatistics(2))
} finally {
    if ($null -ne $openedDoc) {
        $openedDoc.Close(0)
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($openedDoc)
    }
    if ($null -ne $officeApp) {
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($officeApp)
    }
}
