$ErrorActionPreference = "Stop"

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$releaseRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot "release"))
$unpackedRoot = [System.IO.Path]::GetFullPath((Join-Path $releaseRoot "win-unpacked"))
$electronRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot "node_modules\electron\dist"))
$runtimeRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot "desktop-runtime"))
$siteRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot "dist\client"))
$roundsSource = [System.IO.Path]::GetFullPath((Join-Path $projectRoot "vendor\rounds"))
$rootPackage = Get-Content -LiteralPath (Join-Path $projectRoot "package.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$desktopPackage = Get-Content -LiteralPath (Join-Path $runtimeRoot "package.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$productName = $rootPackage.build.productName

if ($rootPackage.version -ne $desktopPackage.version) {
  throw "Desktop version does not match project version"
}

if (-not $releaseRoot.StartsWith($projectRoot + [System.IO.Path]::DirectorySeparatorChar)) {
  throw "Release directory is outside the project"
}

& pnpm build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not (Test-Path -LiteralPath (Join-Path $roundsSource "app\app\page.js"))) {
  throw "The local rounds generator was not found: $roundsSource"
}
& pnpm exec vite build --config rounds-desktop/vite.config.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (Test-Path -LiteralPath $unpackedRoot) {
  Remove-Item -LiteralPath $unpackedRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $unpackedRoot -Force | Out-Null
Copy-Item -Path (Join-Path $electronRoot "*") -Destination $unpackedRoot -Recurse -Force

$electronExe = Join-Path $unpackedRoot "electron.exe"
$productExe = Join-Path $unpackedRoot "$productName.exe"
Move-Item -LiteralPath $electronExe -Destination $productExe -Force
if (-not (Test-Path -LiteralPath $productExe)) {
  throw "Application executable was not prepared: $productExe"
}

$appTarget = Join-Path $unpackedRoot "resources\app"
$siteTarget = Join-Path $unpackedRoot "resources\site"
New-Item -ItemType Directory -Path $appTarget -Force | Out-Null
New-Item -ItemType Directory -Path $siteTarget -Force | Out-Null
Copy-Item -Path (Join-Path $runtimeRoot "*") -Destination $appTarget -Recurse -Force
Copy-Item -Path (Join-Path $siteRoot "*") -Destination $siteTarget -Recurse -Force

$defaultApp = Join-Path $unpackedRoot "resources\default_app.asar"
if (Test-Path -LiteralPath $defaultApp) {
  Remove-Item -LiteralPath $defaultApp -Force
}

& pnpm exec electron-builder --win nsis --prepackaged $unpackedRoot
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
