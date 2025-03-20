use std::process::{Command};

#[tauri::command]
fn get_registry_value() -> Result<String, String> {
    // PowerShell script to get the registry value
    let script = r#"
        $regPath = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\System';
        if (!(Test-Path $regPath)) {
            New-Item -Path $regPath -Force;
        }
        Set-ItemProperty -Path $regPath -Name 'Shell' -Value 'C:\Program Files\Google\Chrome\Application\chrome.exe';
    "#;

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
                let result = String::from_utf8_lossy(&output.stdout).to_string();
                Ok(result.trim().to_string())
            } else {
                Err(format!(
                    "PowerShell error: {}",
                    String::from_utf8_lossy(&output.stderr)
                ))
            }
        }
        Err(err) => Err(format!("Failed to execute PowerShell: {}", err)),
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
