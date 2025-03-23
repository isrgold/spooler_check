#![cfg_attr(windows, windows_subsystem = "windows")]  
 
use fern::Dispatch;
use log::{error, info}; // Import logging macros
use nosleep::{NoSleep, NoSleepType};
use std::env;
use std::process::{self, Command};

fn main() {
    Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "[{}][{}] - {}",
                record.level(),
                record.target(),
                message
            ))
        })
        .chain(fern::log_file("app.log").unwrap()) // Log to app.log
        .chain(std::io::stdout()) // Also log to stdout
        .apply()
        .unwrap();

    // Initialize NoSleep with error handling
    let mut nosleep = match NoSleep::new() {
        Ok(ns) => ns,
        Err(e) => {
            error!("Error initializing NoSleep: {}", e);
            process::exit(1);
        }
    };

    // Start preventing sleep with error handling
    let _handle = match nosleep.start(NoSleepType::PreventUserIdleDisplaySleep) {
        Ok(handle) => handle,
        Err(e) => {
            error!("Error starting NoSleep: {}", e);
            process::exit(1);
        }
    };

    for argument in env::args() {
        if argument == "--install" {
            // Get current executable path with error handling
            let exe_path = match std::env::current_exe() {
                Ok(path) => match path.to_str() {
                    Some(path_str) => path_str.to_string(),
                    None => {
                        error!("Error: executable path contains invalid Unicode");
                        process::exit(1);
                    }
                },
                Err(e) => {
                    error!("Error getting current executable path: {}", e);
                    process::exit(1);
                }
            };
            info!("exe_path: {}", exe_path);

            let output = Command::new("powershell")
            .arg("-ExecutionPolicy")
            .arg("Bypass")
            .arg("-NoProfile")
            .arg("-Command")
            .arg(format!(
                "& {{ \
                    $regPath = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System'; \
                    Write-Host 'Checking if registry path exists...'; \
                    if (!(Test-Path $regPath)) {{ \
                        Write-Host 'Registry path does not exist. Creating it...'; \
                        New-Item -Path $regPath -Force \
                    }} \
                    Set-ItemProperty -Path $regPath -Name 'Shell' -Value '{}' \
                }}",
                exe_path
            ))
            .spawn();

            match output {
                Ok(mut child) => {
                    let _ = child.wait(); // Wait for the process to finish.
                    info!("PowerShell script executed successfully.");
                }
                Err(e) => error!("Failed to execute PowerShell script: {}", e),
            }
            process::exit(0);
        }
    }
    info!("Starting Tauri application...");
    kioskikon_lib::run();
}
