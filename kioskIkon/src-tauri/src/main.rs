// Prevents additional console window on Windows in release, DO NOT REMOVE!!
use nosleep::{NoSleep, NoSleepType};

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
    
    let mut nosleep = NoSleep::new().unwrap();
    let handle = nosleep
        .start(NoSleepType::PreventUserIdleDisplaySleep)
        .unwrap();
    kioskikon_lib::run()
}
