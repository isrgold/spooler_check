# Get all local user accounts (excluding built-in accounts)
$localUsers = Get-LocalUser | Where-Object {
    $_.Enabled -eq $true -and $_.Name -ne 'Administrator' -and $_.Name -ne 'Guest'
}

# Add each user to "Remote Desktop Users" group
foreach ($user in $localUsers) {
    try {
        Add-LocalGroupMember -Group "Remote Desktop Users" -Member $user.Name -ErrorAction Stop
        Write-Output "Added $($user.Name) to Remote Desktop Users group"
    } catch {
        Write-Warning "Failed to add $($user.Name): $_"
    }
}
