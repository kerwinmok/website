$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

New-Item -ItemType Directory -Path out -Force | Out-Null

javac -d out .\server\ResumeServer.java

Write-Host "Starting site at http://localhost:8080"
java -cp out ResumeServer
