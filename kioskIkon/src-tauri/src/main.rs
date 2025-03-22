// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use nosleep::{NoSleep, NoSleepType};

fn main() {
    let mut nosleep = NoSleep::new().unwrap();
    let _handle = nosleep
        .start(NoSleepType::PreventUserIdleDisplaySleep)
        .unwrap();
    kioskikon_lib::run()
}
