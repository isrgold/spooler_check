use std::process::Command;
use winreg::enums::*;
use winreg::RegKey;

#[cfg(windows)]
fn is_admin() -> bool {
    // Run a command that requires admin privileges (e.g., `whoami /groups`)
    let output = Command::new("whoami").arg("/groups").output();

    match output {
        Ok(output) => {
            // Check if the output includes 'S-1-5-32-544' which represents the Administrators group
            return String::from_utf8_lossy(&output.stdout).contains("S-1-5-32-544");
        }
        Err(_) => false,
    }
}

#[tauri::command]
fn request_admin(action: String) {
    let exe_path = std::env::current_exe()
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();

    let output = Command::new("powershell")
        .args(&[
            "Start-Process",
            "-WindowStyle",
            "Hidden", // Prevents the console window from appearing
            "-Verb",
            "RunAs",
            "-FilePath",
            &exe_path,
            "-ArgumentList",
            "--install",
        ])
        .output();
    if output.unwrap().status.success() {
        // Access the registry root for HKCU
        let reg_key = RegKey::predef(HKEY_CURRENT_USER);

        // Path to the registry key
        let path = r"Software\Microsoft\Windows NT\CurrentVersion\Winlogon";   
        // Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\System" -Name "DisableTaskMgr" -Value 1
    

        // Try to open the registry path or create it if it doesn't exist
        let system_key = match reg_key.open_subkey_with_flags(path, KEY_WRITE) {
            Ok(key) => key,
            Err(_) => {
                // If the path doesn't exist, create it
                let (key, _) = reg_key.create_subkey(path).unwrap();
                key
            }
        };

        if action == "uninstall" {
            let _ = system_key.delete_value("Shell").unwrap();
        } else {
            system_key.set_value("Shell", &exe_path).unwrap();
        }
    }
}

#[tauri::command]
fn get_registry_value() -> Result<String, String> {
    if is_admin() {
        return Err("Administrator user".to_string());
    };
    // Define the registry path and key
    let reg_path = r"Software\Microsoft\Windows NT\CurrentVersion\Winlogon";
    let reg_key = "Shell";

    // Open the registry key
    match RegKey::predef(HKEY_CURRENT_USER).open_subkey_with_flags(reg_path, KEY_READ) {
        Ok(key) => {
            // Try to get the value of the "Shell" key
            match key.get_value::<String, _>(reg_key) {
                Ok(value) => Ok(value),
                Err(_) => Err("Key not found".to_string()),
            }
        }
        Err(_) => Err("Registry path not found".to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_registry_value, request_admin])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
