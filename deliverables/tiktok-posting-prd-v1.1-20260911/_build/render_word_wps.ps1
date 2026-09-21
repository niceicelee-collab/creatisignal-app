param([string]$Source, [string]$Output)
$ErrorActionPreference = 'Stop'
$wpsApp = $null
$wpsDocument = $null
$ownEmptyInstance = $false
try {
    $wpsApp = New-Object -ComObject 'kwps.Application'
    $ownEmptyInstance = ($wpsApp.Documents.Count -eq 0)
    if ($ownEmptyInstance) { $wpsApp.Visible = $false }
    $wpsDocument = $wpsApp.Documents.Open($Source, $false, $true, $false)
    $wpsDocument.Repaginate()
    $wpsDocument.ExportAsFixedFormat($Output, 17)
    Write-Output "Rendered DOCX with WPS to $Output"
    Write-Output "Pages: $($wpsDocument.ComputeStatistics(2))"
} finally {
    if ($null -ne $wpsDocument) {
        $wpsDocument.Close(0)
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($wpsDocument)
    }
    if ($null -ne $wpsApp) {
        if ($ownEmptyInstance) { $wpsApp.Quit() }
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($wpsApp)
    }
}
