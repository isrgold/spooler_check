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
fn request_admin() {
    let _ = Command::new("powershell")
        .args(&[
            "Start-Process",
            // "-WindowStyle",
            // // "Hidden", // Prevents the console window from appearing
            "-Verb",
            "RunAs",
            "-FilePath",
            std::env::current_exe().unwrap().to_str().unwrap(),
            "-ArgumentList",
            "--install",
        ])
        .spawn();
}

#[tauri::command]
fn get_registry_value() -> Result<String, String> {
    if is_admin() {
        return Err("Administrator user".to_string());
    };
    // Define the registry path and key
    let reg_path = r"Software\Microsoft\Windows\CurrentVersion\Policies\System";
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
