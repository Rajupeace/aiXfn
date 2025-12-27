# PowerShell script to start full-stack application
# Frontend, Backend, and Database servers

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Full-Stack Application..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Yellow

# Kill any existing Node.js processes
Write-Host "🛑 Stopping existing Node.js processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2  # Give processes time to shut down
} catch {
    Write-Host "⚠️  Warning: Could not stop all Node.js processes" -ForegroundColor Yellow
}

# Function to check if a port is available
function Test-PortInUse {
    param([int]$Port)
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $Port)
    try {
        $listener.Start()
        $listener.Stop()
        return $false
    } catch {
        return $true
    } finally {
        if ($listener -ne $null) {
            $listener.Stop()
        }
    }
}

# Function to start a process in background
function Start-BackgroundProcess {
    param(
        [string]$Name,
        [string]$Command,
        [string]$Directory = ".",
        [int]$Port = 0,
        [int]$MaxWaitSeconds = 30
    )

    Write-Host "📡 Starting $Name..." -ForegroundColor Cyan
    
    # Check if port is already in use
    if ($Port -gt 0 -and (Test-PortInUse -Port $Port)) {
        Write-Host "⚠️  Port $Port is already in use. Trying to continue..." -ForegroundColor Yellow
    }

    try {
        # Start the process in the background with proper working directory
        $process = Start-Process -FilePath "node" -ArgumentList "--trace-warnings" -WorkingDirectory $Directory -PassThru -NoNewWindow
        
        # Wait for the process to start
        $waitTime = 0
        $checkInterval = 2
        $started = $false
        
        while ($waitTime -lt $MaxWaitSeconds) {
            if ($process.HasExited) {
                Write-Host "❌ $Name failed to start (process exited)" -ForegroundColor Red
                return $false
            }
            
            if ($Port -gt 0) {
                if (Test-PortInUse -Port $Port) {
                    $started = $true
                    break
                }
            } else {
                # If no port check, just wait a bit and assume success
                $started = $true
                break
            }
            
            Start-Sleep -Seconds $checkInterval
            $waitTime += $checkInterval
        }
        
        if ($started) {
            Write-Host "✅ $Name started successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $Name failed to start (timeout)" -ForegroundColor Red
            $process | Stop-Process -Force -ErrorAction SilentlyContinue
            return $false
        }
    } catch {
        Write-Host "❌ Failed to start $Name : $_" -ForegroundColor Red
        return $false
    }
}

$backendProcess = $null
Write-Host "`n🔄 Starting Backend Server..." -ForegroundColor Cyan
# Use the correct backend entrypoint and ensure WorkingDirectory is a string path
$backendDir = Join-Path $PSScriptRoot 'backend'
$backendProcess = Start-Process -FilePath "node" -ArgumentList "index.js" -WorkingDirectory $backendDir -PassThru -NoNewWindow
$backendStarted = $false

# Wait for backend to be ready
$maxWait = 30  # seconds
$waitTime = 0
$checkInterval = 2

while ($waitTime -lt $maxWait) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        # Accept case-insensitive "ok" or "OK" responses
        if ($response.status -and ($response.status.ToString().ToLower() -eq "ok")) {
            $backendStarted = $true
            break
        }
    } catch {
        # Ignore errors, just retry
    }
    
    if ($backendProcess.HasExited) {
        Write-Host "❌ Backend failed to start (process exited)" -ForegroundColor Red
        break
    }
    
    Write-Host "." -NoNewline -ForegroundColor DarkGray
    Start-Sleep -Seconds $checkInterval
    $waitTime += $checkInterval
}

if (-not $backendStarted) {
    Write-Host "❌ Backend failed to start after $maxWait seconds" -ForegroundColor Red
    $backendProcess | Stop-Process -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "`n✅ Backend is running at http://localhost:5000" -ForegroundColor Green

# Start Frontend Server (Port 3000)
Write-Host "`n🔄 Starting Frontend Server..." -ForegroundColor Cyan
# Run frontend from the repository root where this script lives
$frontendDir = $PSScriptRoot
# Use platform-appropriate npm executable on Windows
if ($IsWindows) { $npmExe = 'npm.cmd' } else { $npmExe = 'npm' }
$frontendProcess = Start-Process -FilePath $npmExe -ArgumentList "start" -WorkingDirectory $frontendDir -PassThru -NoNewWindow
$frontendStarted = $false

# Wait for frontend to be ready
$waitTime = 0

while ($waitTime -lt $maxWait) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $frontendStarted = $true
            break
        }
    } catch {
        # Ignore errors, just retry
    }
    
    if ($frontendProcess.HasExited) {
        Write-Host "❌ Frontend failed to start (process exited)" -ForegroundColor Red
        break
    }
    
    Write-Host "." -NoNewline -ForegroundColor DarkGray
    Start-Sleep -Seconds $checkInterval
    $waitTime += $checkInterval
}

if (-not $frontendStarted) {
    Write-Host "❌ Frontend failed to start after $maxWait seconds" -ForegroundColor Red
    $backendProcess | Stop-Process -Force -ErrorAction SilentlyContinue
    $frontendProcess | Stop-Process -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "`n✅ Frontend is running at http://localhost:3000" -ForegroundColor Green

# Database info
Write-Host "💾 Database: Using file-based JSON storage" -ForegroundColor Cyan

# Display success message
Write-Host ""
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "🎉 Full-Stack Application Started Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access Points:" -ForegroundColor Cyan
Write-Host "   🌐 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   🔗 Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "   📊 Admin Dashboard: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Admin Login:" -ForegroundColor Cyan
Write-Host "   Username: ReddyFBN@1228" -ForegroundColor White
Write-Host "   Password: ReddyFBN" -ForegroundColor White
Write-Host ""
Write-Host "📋 Services Running:" -ForegroundColor Cyan
Write-Host "   ✅ React Frontend (Port 3000)" -ForegroundColor Green
Write-Host "   ✅ Node.js Backend (Port 5000)" -ForegroundColor Green
Write-Host "   ✅ JSON Database (File-based)" -ForegroundColor Green
Write-Host ""
Write-Host "🛑 To stop all servers: Press Ctrl+C or close this window" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

# Function to handle cleanup on script exit
function Stop-Servers {
    Write-Host "`n🛑 Shutting down servers..." -ForegroundColor Yellow
    
    # Stop frontend
    if ($frontendProcess -and -not $frontendProcess.HasExited) {
        Write-Host "Stopping frontend..." -ForegroundColor Yellow
        $frontendProcess | Stop-Process -Force -ErrorAction SilentlyContinue
    }
    
    # Stop backend
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Write-Host "Stopping backend..." -ForegroundColor Yellow
        $backendProcess | Stop-Process -Force -ErrorAction SilentlyContinue
    }
    
    # Clean up any remaining node processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | 
        Where-Object { $_.Id -ne $PID } | 
        Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ All servers stopped!" -ForegroundColor Green
    exit 0
}

# Set up Ctrl+C handler
[Console]::TreatControlCAsInput = $false
try {
    $handler = [System.ConsoleCancelEventHandler]{
        Stop-Servers
        [System.Environment]::Exit(0)
    }
    [Console]::add_CancelKeyPress($handler)
} catch {
    Write-Host "Warning: Could not set up clean exit handler" -ForegroundColor Yellow
}

# Keep the script running
Write-Host "`n[Press Ctrl+C to stop all servers]" -ForegroundColor DarkGray
try {
    while ($true) {
        # Check if processes are still running
        if ($backendProcess.HasExited) {
            Write-Host "Backend process has stopped unexpectedly!" -ForegroundColor Red
            break
        }
        if ($frontendProcess.HasExited) {
            Write-Host "Frontend process has stopped unexpectedly!" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Seconds 5
    }
} finally {
    Stop-Servers
}

exit 0
