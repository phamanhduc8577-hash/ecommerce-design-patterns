# Script khoi dong E-Commerce Design Patterns Web Server chay an tren cong 3333

$port = 3333
$projectDir = "D:\Projects\thuc hanh 5"

# 1. Kiem tra xem cong 3333 da co tien trinh nao chay chua
$tcp = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1

if ($tcp) {
    Write-Host "[INFO] Web Server dang chay tren cong $port (PID: $($tcp.OwningProcess))." -ForegroundColor Green
    exit 0
}

# 2. Khoi dong tien trinh an qua WMI de tranh cua so cmd
$startup = ([wmiclass]"Win32_ProcessStartup").CreateInstance()
$startup.ShowWindow = 0

$cmd = "cmd.exe /c cd /d `"$projectDir`" && npm run web"
$proc = ([wmiclass]"Win32_Process").Create($cmd, $projectDir, $startup)

if ($proc.ReturnValue -ne 0) {
    Write-Error "[ERROR] Khong the khoi dong Web Server (ErrorCode: $($proc.ReturnValue))"
    exit 1
}

Write-Host "[SUCCESS] Da khoi tao Web Server an thanh cong (PID: $($proc.ProcessId))." -ForegroundColor Green
