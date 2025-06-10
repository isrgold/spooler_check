# Must be run as Administrator

# === VARIABLES ===
$ShareName = "development"
$FolderPath = "C:\development"
$Username = "development"
$Password  = "development"
$Access = "Full"

if (net user $Username 2>$null) {
    net user $Username $Password
    Write-Host "User '$Username' exists — password updated"
} else {
    net user $Username $Password /add
    net localgroup "Users" $Username /add
    Write-Host "Created user '$Username'"
}

# === CREATE FOLDER IF NEEDED ===
if (-Not (Test-Path $FolderPath)) {
    Write-Host "folder does not exist"
}

# === SET NTFS PERMISSIONS ===
$Acl = Get-Acl $FolderPath
$Ar = New-Object System.Security.AccessControl.FileSystemAccessRule("$Username", "$Access", "ContainerInherit,ObjectInherit", "None", "Allow")
$Acl.SetAccessRule($Ar)
Set-Acl $FolderPath $Acl
Write-Host "Set NTFS permissions for $Username"

# === ENABLE SMB FEATURES ===
# Enable-WindowsOptionalFeature -Online -FeatureName "SMB1Protocol" -NoRestart -ErrorAction SilentlyContinue
# Enable-WindowsOptionalFeature -Online -FeatureName "SMBDirect" -NoRestart -ErrorAction SilentlyContinue

# === CREATE SMB SHARE ===
New-SmbShare -Name $ShareName -Path $FolderPath -FullAccess "$Username"
Write-Host "Created SMB Share '$ShareName' with full access for $Username"

# === ENABLE FILE AND PRINTER SHARING IN FIREWALL ===
$firewallRules = @(
    "File and Printer Sharing (SMB-In)",
    "File and Printer Sharing (NB-Session-In)",
    "File and Printer Sharing (Echo Request - ICMPv4-In)",
    "File and Printer Sharing (NB-Name-In)",
    "File and Printer Sharing (NB-Datagram-In)"
)
foreach ($rule in $firewallRules) {
    Set-NetFirewallRule -DisplayName $rule -Enabled True -Profile Domain,Private -Action Allow -ErrorAction SilentlyContinue
}
Write-Host "Enabled File and Printer Sharing in firewall"

# === ENABLE NETWORK DISCOVERY AND SHARING SETTINGS ===
# These control the equivalent of "Advanced Sharing Settings" in the Control Panel

# Enable network discovery
Set-NetFirewallRule -DisplayGroup "Network Discovery" -Enabled True -Profile Domain,Private -Action Allow -ErrorAction SilentlyContinue
# Set-SmbServerConfiguration -EnableSMB1Protocol $true -Force
# Set-SmbServerConfiguration -EnableSMB2Protocol $true -Force

# Enable sharing of public folders and password protected sharing OFF
# Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters" -Name "AllowInsecureGuestAuth" -Value 1 -Force
# Set-SmbServerConfiguration -RequireSecuritySignature $false -Force
# Set-SmbServerConfiguration -EnableSecuritySignature $false -Force
# Set-SmbServerConfiguration -EnableAuthenticateUserSharing $false -Force

# === DONE ===
Write-Host "`n✅ All done. SMB Share '$ShareName' is ready and visible on the network."
Read-Host -Prompt "Press Enter to exit"

