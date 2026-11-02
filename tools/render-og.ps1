# Rebuilds og-image.jpg from tools/og-card.html.
# Requires Google Chrome + Windows PowerShell 5.1+.
# Run from the project root:
#   powershell -ExecutionPolicy Bypass -File tools/render-og.ps1

$ErrorActionPreference = 'Stop'

$root   = Split-Path -Parent $PSScriptRoot
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$src    = Join-Path $PSScriptRoot 'og-card.html'
$raw    = Join-Path $env:TEMP 'og-card-2x.png'
$out    = Join-Path $root 'og-image.jpg'

if (-not (Test-Path $chrome)) {
  $chrome = 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
}
if (-not (Test-Path $chrome)) {
  throw 'Google Chrome not found. Set the $chrome path in tools/render-og.ps1.'
}

# 1. Render at 2x so text and icons stay crisp
& $chrome `
  --headless=new `
  --disable-gpu `
  --hide-scrollbars `
  --force-device-scale-factor=2 `
  --window-size=1200,630 `
  --virtual-time-budget=4000 `
  "--screenshot=$raw" `
  ('file:///' + ($src -replace '\\', '/')) | Out-Null

if (-not (Test-Path $raw)) { throw "Chrome did not create the screenshot: $raw" }

# 2. Downscale 2400x1260 -> 1200x630 and save as JPEG
Add-Type -AssemblyName System.Drawing

$srcImg = [System.Drawing.Image]::FromFile($raw)
$bmp    = New-Object System.Drawing.Bitmap 1200, 630
$g      = [System.Drawing.Graphics]::FromImage($bmp)

$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($srcImg, 0, 0, 1200, 630)
$g.Dispose()

$codec  = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 91
$bmp.Save($out, $codec, $params)

$bmp.Dispose()
$srcImg.Dispose()

$fin = Get-Item $out
Write-Host ("Done: {0} ({1:N0} KB, 1200x630)" -f $fin.FullName, ($fin.Length / 1KB))
