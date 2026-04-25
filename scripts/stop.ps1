#!/usr/bin/env pwsh
# Stops all Market services and RabbitMQ.

$ErrorActionPreference = 'SilentlyContinue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Kill-Port {
    param([int]$Port, [string]$Name)
    $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($conns) {
        $conns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
        Write-Host "  $Name stopped" -ForegroundColor DarkGray
    }
}

Write-Host ''
Write-Host '  Market stopping...' -ForegroundColor White
Write-Host ''

Kill-Port 5101 'listings'
Kill-Port 5102 'users   '
Kill-Port 5000 'gateway '
Kill-Port 5173 'frontend'

Write-Host '  rabbitmq' -NoNewline
docker compose down 2>&1 | Out-Null
Write-Host ' stopped' -ForegroundColor DarkGray

Write-Host ''
Write-Host '  Done.' -ForegroundColor Green
Write-Host ''
Start-Sleep -Seconds 1
