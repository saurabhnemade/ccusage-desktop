mod bridge;
mod cache;
mod commands;

use cache::Cache;
use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(Cache::new())
        .invoke_handler(tauri::generate_handler![
            get_daily_usage,
            get_weekly_usage,
            get_monthly_usage,
            get_session_usage,
            get_session_blocks,
            get_totals,
            clear_cache,
            debug_bridge,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
