#!/usr/bin/env pwsh
# Starts RabbitMQ + Gateway + Listings.Api + Users.Api + Frontend.
# All services run hidden in the background. Logs go to scripts/logs/.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$logDir = Join-Path $PSScriptRoot 'logs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

$psExe = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
if (-not $psExe) {
    $psExe = (Get-Command powershell -ErrorAction SilentlyContinue).Source
}

function Start-Hidden {
    param([string]$Name, [string]$WorkDir, [string]$Command)
    $log = Join-Path $logDir "$Name.log"
    if (Test-Path $log) { Remove-Item $log -Force }

    $escaped = $Command.Replace("'", "''")
    $escapedLog = $log.Replace('\', '\\')

    $script = "Set-Location '$WorkDir'; & { $escaped } 2>&1 | Tee-Object -FilePath '$log'"

    Start-Process -FilePath $psExe `
        -ArgumentList @('-NoProfile', '-Command', $script) `
        -WindowStyle Hidden
}

function Test-Port {
    param([int]$Port)
    try {
        $c = New-Object System.Net.Sockets.TcpClient
        $c.Connect('127.0.0.1', $Port)
        $c.Close()
        return $true
    } catch { return $false }
}

function Free-Port {
    param([int]$Port)
    $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if (-not $conns) { return }
    $conns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Milliseconds 400
}

function Wait-Port {
    param([int]$Port, [string]$Name, [int]$TimeoutSec = 90)
    Write-Host "  $Name (:$Port) " -NoNewline
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while (-not (Test-Port $Port)) {
        if ((Get-Date) -gt $deadline) {
            Write-Host "TIMEOUT" -ForegroundColor Red
            Write-Host "  Log: $(Join-Path $logDir "$Name.log")"
            return $false
        }
        Start-Sleep -Milliseconds 500
        Write-Host '.' -NoNewline
    }
    Write-Host ' OK' -ForegroundColor Green
    return $true
}

Write-Host ''
Write-Host '  Market ' -ForegroundColor White -NoNewline
Write-Host 'starting...' -ForegroundColor DarkGray
Write-Host ''

# Free ports from any previous run
foreach ($p in @(5000, 5101, 5102, 5173)) { Free-Port $p }

# RabbitMQ
if (Test-Port 5672) {
    Write-Host '  rabbitmq      already running' -ForegroundColor DarkGray
} else {
    Write-Host '  rabbitmq    ' -NoNewline
    try { docker compose up -d 2>&1 | Out-Null }
    catch {
        Write-Host 'FAILED (is Docker Desktop running?)' -ForegroundColor Red
        Read-Host 'Press Enter to exit'
        exit 1
    }
    if (-not (Wait-Port 5672 'rabbitmq' 45)) {
        Read-Host 'Press Enter to exit'
        exit 1
    }
}

# Services (hidden)
Write-Host ''
Write-Host '  Starting services in background...' -ForegroundColor DarkGray
Start-Hidden 'listings' "$root\services\Listings.Api" 'dotnet run'
Start-Hidden 'users'    "$root\services\Users.Api"    'dotnet run'
Start-Hidden 'gateway'  "$root\Api"                   'dotnet run'
Start-Hidden 'frontend' "$root\frontend"              'npm install --silent; npm run dev'

# Wait
Write-Host ''
$ok = $true
$ok = (Wait-Port 5101 'listings') -and $ok
$ok = (Wait-Port 5102 'users   ') -and $ok
$ok = (Wait-Port 5000 'gateway ') -and $ok
$ok = (Wait-Port 5173 'frontend') -and $ok

Write-Host ''
if ($ok) {
    Write-Host '  All services ready.' -ForegroundColor Green
    Write-Host ''
    Write-Host '    http://localhost:5173' -ForegroundColor Cyan
    Write-Host ''
    Write-Host '  Logs: scripts\logs\' -ForegroundColor DarkGray
    Write-Host '  Stop: run stop.cmd'   -ForegroundColor DarkGray
} else {
    Write-Host '  Some services failed. Check logs in scripts\logs\' -ForegroundColor Red
}

Write-Host ''
Read-Host 'Press Enter to close'
