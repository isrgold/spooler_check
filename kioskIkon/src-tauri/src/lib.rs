use winreg::RegKey;
use winreg::enums::*;

#[tauri::command]
fn get_registry_value() -> Result<String, String> {
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
        .invoke_handler(tauri::generate_handler![get_registry_value])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
