use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::{Listener, Manager};

use crate::auth::sign_in::handle_sign_in;
use crate::state::TauriState;

mod auth;
mod deep_link;
mod state;
mod utils;

#[derive(Debug, Serialize, Deserialize)]
struct AccessTokenRequest {
    grant_type: String,
    code: String,
    redirect_uri: String,
    client_id: String,
    code_verifier: String,
}

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
            app.manage(TauriState::new(path));
            app.listen("deep-link://new-url", move |event| {
                tauri::async_runtime::block_on(deep_link::handler(&event, &handle))
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![handle_sign_in])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
