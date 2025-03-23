# Define the registry path
$regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\System"

# Ensure the registry path exists
if (!(Test-Path $regPath)) {
    New-Item -Path $regPath -Force
}

# Set the Custom User Interface value
Set-ItemProperty -Path $regPath -Name "Shell" -Value "C:\Path\To\YourApp.exe"

# Restart Explorer to apply changes
# Stop-Process -Name explorer -Force
# Start-Process explorer

# to run from CMD:
powershell -ExecutionPolicy Bypass -NoProfile -Command "& { 
    $regPath = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\System'; 
    if (!(Test-Path $regPath)) { 
        New-Item -Path $regPath -Force 
    }
    Set-ItemProperty -Path $regPath -Name 'Shell' -Value 'C:\Path\To\YourApp.exe' 
}"