#[tauri::command]
pub fn get_device_name() -> String {
    log::info!("Getting device info");

    whoami::devicename()
}
