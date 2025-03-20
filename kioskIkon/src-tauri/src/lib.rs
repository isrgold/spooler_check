use std::process::Command;

#[tauri::command]
fn get_registry_value() -> Result<String, String> {
    // PowerShell script to get the registry value first
    let reg_script = r#"
        $regPath = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\System';
        $regKey = 'Shell';
        if (Test-Path $regPath) {
            $value = Get-ItemProperty -Path $regPath -Name $regKey -ErrorAction SilentlyContinue;
            if ($null -ne $value) {
                return $value.Shell;
            } else {
                return "Key not found";
            }
        } else {
            return "Registry path not found";
        }
    "#;

    // Run the registry check script
    match run_powershell_script(reg_script) {
        Ok(reg_result) => {
            // Return the registry value if found, or an error message if not
            if reg_result.trim() == "Key not found" || reg_result.trim() == "Registry path not found" {
                Err(reg_result.trim().to_string()) // If not found, return the appropriate message
            } else {
                Ok(reg_result.trim().to_string()) // Return the registry value
            }
        }
        Err(err) => Err(format!("Failed to execute PowerShell for registry: {}", err)),
    }
}

// Function to run a PowerShell script and return the result
fn run_powershell_script(script: &str) -> Result<String, String> {
    let output = Command::new("powershell")
        .arg("-ExecutionPolicy")
        .arg("Bypass")
        .arg("-NoProfile")
        .arg("-Command")
        .arg(script)
        .output();

    match output {
        Ok(output) => {
            if output.status.success() {
                Ok(String::from_utf8_lossy(&output.stdout).to_string())
            } else {
                Err(format!("PowerShell error: {}", String::from_utf8_lossy(&output.stderr)))
            }
        }
        Err(err) => Err(format!("Failed to execute PowerShell script: {}", err)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_registry_value])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
