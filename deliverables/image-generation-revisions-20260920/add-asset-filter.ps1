Add-Type -AssemblyName System.Drawing
$sourcePath = 'C:\Users\ice.li\AppData\Local\Temp\codex-clipboard-bca95810-212c-4001-8ea7-13207fd31d91.png'
$outputDir = $PSScriptRoot
$canvas = [System.Drawing.Bitmap]::FromFile($sourcePath)
$searchRect = [System.Drawing.Rectangle]::new(2243, 170, 254, 43)
$search = $canvas.Clone($searchRect, $canvas.PixelFormat)

# Restore only the old search-field background, using the adjacent background on each row.
for ($row = 170; $row -lt 213; $row++) {
    $leftColor = $canvas.GetPixel(2239, $row)
    $rightColor = $canvas.GetPixel(2501, $row)
    for ($col = 2243; $col -lt 2497; $col++) {
        $amount = ($col - 2239) / 262.0
        $red = [int][Math]::Round($leftColor.R + ($rightColor.R - $leftColor.R) * $amount)
        $green = [int][Math]::Round($leftColor.G + ($rightColor.G - $leftColor.G) * $amount)
        $blue = [int][Math]::Round($leftColor.B + ($rightColor.B - $leftColor.B) * $amount)
        $canvas.SetPixel($col, $row, [System.Drawing.Color]::FromArgb($red, $green, $blue))
    }
}
$baseGraphics = [System.Drawing.Graphics]::FromImage($canvas)
$baseGraphics.DrawImageUnscaled($search, 2110, 170)
$search.Dispose()

# Render the new control at 4x for smooth text and corners.
$scale = 4
$layer = [System.Drawing.Bitmap]::new(149 * $scale, 196 * $scale)
$graphics = [System.Drawing.Graphics]::FromImage($layer)
$graphics.ScaleTransform($scale, $scale)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

function RoundedPath([single]$x, [single]$y, [single]$width, [single]$height, [single]$radius) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $diameter = $radius * 2
    $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
    $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
    $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    return $path
}
function FillRound([single]$x, [single]$y, [single]$width, [single]$height, [single]$radius, [System.Drawing.Color]$color) {
    $path = RoundedPath $x $y $width $height $radius
    $brush = [System.Drawing.SolidBrush]::new($color)
    $graphics.FillPath($brush, $path)
    $brush.Dispose()
    $path.Dispose()
}
function PaintLabel([string]$label, [single]$x, [single]$y, [string]$colorHex) {
    $brush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($colorHex))
    $graphics.DrawString($label, $font, $brush, [System.Drawing.PointF]::new($x, $y), $format)
    $brush.Dispose()
}

$font = [System.Drawing.Font]::new('Microsoft YaHei UI', 14, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$format = [System.Drawing.StringFormat]::GenericTypographic.Clone()
$format.FormatFlags = [System.Drawing.StringFormatFlags]::NoWrap
$white = [System.Drawing.Color]::White
FillRound 12 9 125 36 7 $white
$borderPath = RoundedPath 12 9 125 36 7
$borderPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#DFE4E8'), 1)
$graphics.DrawPath($borderPen, $borderPath)
$borderPath.Dispose()
$borderPen.Dispose()
PaintLabel '全部' 28 17 '#344054'
$chevronPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#83909E'), 1.3)
$graphics.DrawLines($chevronPen, [System.Drawing.PointF[]]@([System.Drawing.PointF]::new(112,29), [System.Drawing.PointF]::new(116,25), [System.Drawing.PointF]::new(120,29)))
$chevronPen.Dispose()

for ($spread = 8; $spread -ge 1; $spread--) {
    FillRound (12 - $spread / 2) (56 - $spread / 2) (125 + $spread) (120 + $spread) (8 + $spread / 2) ([System.Drawing.Color]::FromArgb(4, 25, 39, 48))
}
FillRound 12 53 125 120 8 $white
FillRound 17 58 115 36 5 ([System.Drawing.ColorTranslator]::FromHtml('#EDF9F1'))
PaintLabel '全部' 28 66 '#344054'
PaintLabel '视频' 28 102 '#344054'
PaintLabel '图片' 28 138 '#344054'
$checkPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#1CB398'), 1.8)
$checkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$checkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLines($checkPen, [System.Drawing.PointF[]]@([System.Drawing.PointF]::new(112,76), [System.Drawing.PointF]::new(116,80), [System.Drawing.PointF]::new(123,72)))
$checkPen.Dispose()
$font.Dispose()
$format.Dispose()
$graphics.Dispose()

$baseGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$baseGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$baseGraphics.DrawImage($layer, [System.Drawing.Rectangle]::new(2356,164,149,196), 0,0,$layer.Width,$layer.Height,[System.Drawing.GraphicsUnit]::Pixel)
$baseGraphics.Dispose()
$layer.Dispose()
$outputPath = Join-Path $outputDir '06-资产库-搜索框右侧媒体筛选.png'
$canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$detail = $canvas.Clone([System.Drawing.Rectangle]::new(2070,145,455,235), $canvas.PixelFormat)
$detail.Save((Join-Path $outputDir '06-筛选局部预览.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$detail.Dispose()
$canvas.Dispose()
Write-Output $outputPath
