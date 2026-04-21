$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$indexFile = Join-Path $projectRoot "public\index.html"

if (-not (Test-Path $indexFile)) {
    throw "Could not find $indexFile"
}

Write-Host "Opening $indexFile"
Start-Process $indexFile