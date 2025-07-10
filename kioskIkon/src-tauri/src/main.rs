#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use nosleep::{NoSleep, NoSleepType};
use std::env;
use std::fs;
use std::os::windows::process::CommandExt;
use std::path::PathBuf;
use std::process::{Command, Stdio};

const CREATE_NO_WINDOW: u32 = 0x08000000;

fn main() {
    let mut nosleep = NoSleep::new().unwrap();
    let _handle = nosleep
        .start(NoSleepType::PreventUserIdleDisplaySleep)
        .unwrap();

    for argument in env::args() {
        eprintln!("arg: {}", argument);
        if argument == "--install" {
            std::process::exit(0);
        }
        if argument == "--run" {
            kioskikon_lib::run();
            std::process::exit(0);
        }
    }
    // 1. Get USERPROFILE
    let userprofile = env::var("USERPROFILE").expect("USERPROFILE not found");

    // 2. Set source and destination paths
    let source_file = "kioskikon.exe";
    let source_path = PathBuf::from(source_file);
    let destination_path = PathBuf::from(&userprofile).join("kkk").join(source_file);

    // 3. Copy the file
    // if let Err(e) = fs::remove_file(&destination_path) {
    //     eprintln!("Failed to delete existing file: {}", e);
    // }
    // if let Err(e) = fs::copy(&source_path, &destination_path) {
    //     eprintln!(
    //         "Failed to copy {} to {}: {}",
    //         source_file,
    //         destination_path.display(),
    //         e
    //     );
    //     return;
    // }

    // 4. Start the copied file silently
    let _ = Command::new(&destination_path).args(&["--run"]).spawn();

    // 5. Check if running as administrator using `net session`
    let output = Command::new("whoami")
        .arg("/groups")
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .output();

    // 2. Check if the output contains the Administrator group SID
    if let Ok(output) = output {
        let groups = String::from_utf8_lossy(&output.stdout);

        if groups.contains("S-1-5-32-544") {
            // Is administrator
            let _ = Command::new("explorer.exe")
                .creation_flags(0x08000000) // CREATE_NO_WINDOW
                .spawn();
        } else {
            eprintln!("Not running as administrator. Skipping explorer.exe.");
        }
    } else {
        eprintln!("Failed to check group membership.");
    }
}
