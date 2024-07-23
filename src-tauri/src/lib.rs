use std::path::PathBuf;

use tauri::{Listener, Manager};

use crate::auth::sign_in::handle_sign_in;
use crate::state::TauriState;

mod auth;
mod deep_link;
mod state;
mod token_manager;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            let handle = app.handle().clone();
            let path = PathBuf::from("store.bin");
            let token_manager = token_manager::TokenManager::new(app.handle().clone());
            app.manage(TauriState::new(path, token_manager));
            app.listen("deep-link://new-url", move |event| {
                tauri::async_runtime::block_on(deep_link::handler(&event, &handle))
                    .expect("Error while handling deep link");
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![handle_sign_in])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
