# Read public table images with the Windows Chinese OCR model. No web requests.
param([string]$Folder = 'D:\baozhong-forum\data\admissions-sources\research-cache\ocr-2026')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType=WindowsRuntime] | Out-Null
$asyncMethod = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.IsGenericMethod } | Select-Object -First 1
function AwaitResult($Operation, [Type]$Type) {
  $task = $asyncMethod.MakeGenericMethod($Type).Invoke($null, @($Operation))
  $task.Wait()
  return $task.Result
}
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
foreach ($path in Get-ChildItem -LiteralPath $Folder -Filter '*.png') {
  $destination = [System.IO.Path]::ChangeExtension($path.FullName, '.json')
  if ((Test-Path -LiteralPath $destination) -and (Get-Item -LiteralPath $destination).Length -gt 20) { continue }
  $file = AwaitResult ([Windows.Storage.StorageFile]::GetFileFromPathAsync($path.FullName)) ([Windows.Storage.StorageFile])
  $stream = AwaitResult ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
  $decoder = AwaitResult ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $bitmap = AwaitResult ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $result = AwaitResult ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
  $words = @(foreach ($line in $result.Lines) { foreach ($word in $line.Words) {
    @{ text=$word.Text; x=$word.BoundingRect.X; y=$word.BoundingRect.Y; width=$word.BoundingRect.Width; height=$word.BoundingRect.Height }
  } })
  ConvertTo-Json -InputObject $words -Depth 5 | Set-Content -LiteralPath $destination -Encoding UTF8
  $bitmap.Dispose(); $stream.Dispose()
  Write-Output $path.Name
}
