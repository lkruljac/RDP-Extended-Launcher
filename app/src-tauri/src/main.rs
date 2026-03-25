// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod monitor;
mod rdp;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::get_monitors,
            commands::launch_connection,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
