package main

import (
	"fmt"
	"log"
	"os/exec"
	"golang.org/x/sys/windows/registry"
)

func main() {
	// Define the registry path
	keyPath := `Software\Microsoft\Windows\CurrentVersion\Policies\System`
	valueName := "Shell"
	appPath := `C:\Path\To\YourApp.exe` // Change this to your app's path

	// Open or create the registry key
	key, _, err := registry.CreateKey(registry.CURRENT_USER, keyPath, registry.SET_VALUE)
	if err != nil {
		log.Fatalf("Error opening registry key: %v", err)
	}
	defer key.Close()

	// Set the Shell value to your custom app
	err = key.SetStringValue(valueName, appPath)
	if err != nil {
		log.Fatalf("Error setting registry value: %v", err)
	}

	fmt.Println("Registry updated successfully. Setting kiosk mode...")

	// Restart Explorer to apply changes
	restartExplorer()
}

func restartExplorer() {
	// Kill Explorer process
	exec.Command("taskkill", "/F", "/IM", "explorer.exe").Run()

	// Restart Explorer
	exec.Command("cmd", "/C", "start explorer").Run()

	fmt.Println("Explorer restarted.")
}
