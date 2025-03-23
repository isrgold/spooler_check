# Check if running as admin, if not, relaunch as admin
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Start-Process powershell.exe "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# Function to create registry path if it doesn't exist
function Ensure-RegistryPath {
    param (
        [string]$Path
    )
    if (-not (Test-Path $Path)) {
        New-Item -Path $Path -Force | Out-Null
    }
}

# Set "Remove access to use all Windows Update features"
$regPath1 = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate"
$regName1 = "SetDisableUXWUAccess"
$regValue1 = 1

try {
    Ensure-RegistryPath -Path $regPath1
    Set-ItemProperty -Path $regPath1 -Name $regName1 -Value $regValue1 -Type DWord -Force
    Write-Host "Successfully disabled access to Windows Update features" -ForegroundColor Green
}
catch {
    Write-Host "Error setting Remove access to Windows Update features: $_" -ForegroundColor Red
}

# Set "Do not connect to any Windows Update Internet locations"
$regPath2 = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate"
$regName2 = "DoNotConnectToWindowsUpdateInternetLocations"
$regValue2 = 1

try {
    Ensure-RegistryPath -Path $regPath2
    Set-ItemProperty -Path $regPath2 -Name $regName2 -Value $regValue2 -Type DWord -Force
    Write-Host "Successfully disabled connections to Windows Update Internet locations" -ForegroundColor Green
}
catch {
    Write-Host "Error setting Do not connect to Windows Update Internet locations: $_" -ForegroundColor Red
}

Write-Host "`nNote: Changes may require a system restart to take full effect." -ForegroundColor Yellow