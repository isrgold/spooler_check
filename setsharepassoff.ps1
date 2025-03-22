$regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"
$regName = "LimitBlankPasswordUse"
$regValue = 0

Set-ItemProperty -Path $regPath -Name $regName -Value $regValue