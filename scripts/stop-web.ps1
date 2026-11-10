# Script dung tien trinh Web Server tren cong 3333

$port = 3333
$tcp = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1

if ($tcp) {
    $pidToKill = $tcp.OwningProcess
    Write-Host "[INFO] Dang dung tien trinh Web Server (PID: $pidToKill)..." -ForegroundColor Yellow
    Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
    taskkill /F /PID $pidToKill /T 2>$null
    Write-Host "[SUCCESS] Da tat Web Server tren cong $port." -ForegroundColor Green
} else {
    Write-Host "[INFO] Web Server tren cong $port khong hoat dong." -ForegroundColor Cyan
}
