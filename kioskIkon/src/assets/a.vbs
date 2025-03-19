Dim chromePath, guestModeCmd

' Path to the Chrome executable (adjust this to where Chrome is installed on your system)
chromePath = """C:\Program Files\Google\Chrome\Application\chrome.exe"""

' Command to open Chrome in Guest Mode
guestModeCmd = chromePath & " --guest"

' Create a Shell object to run the command
Set objShell = CreateObject("WScript.Shell")
objShell.Run guestModeCmd, 1, False
