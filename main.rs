#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Initialize the updater plugin
        .plugin(tauri_plugin_updater::Builder::new().build())
        // Include the process plugin so we can restart the app after updating
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            // Optional: you can perform background checks here
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}