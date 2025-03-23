#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use nosleep::{NoSleep, NoSleepType};
use std::env;
// use winreg::RegKey;
// use winreg::enums::{HKEY_CURRENT_USER, KEY_WRITE};

fn main() {
    let mut nosleep = NoSleep::new().unwrap();
    let _handle = nosleep
        .start(NoSleepType::PreventUserIdleDisplaySleep)
        .unwrap();

    for argument in env::args() {
        if argument == "--install" {
            std::process::exit(0);
        }
    }

    kioskikon_lib::run();
}
