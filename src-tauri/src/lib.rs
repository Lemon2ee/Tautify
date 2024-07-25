use std::path::PathBuf;

use tauri::{Listener, Manager};
use tauri_plugin_store::StoreBuilder;
use window_vibrancy::*;

use crate::auth::sign_in::handle_sign_in;
use crate::auth::user::get_user_info;
use crate::auth::user::get_user_token;
use crate::state::TauriState;

mod auth;
mod deep_link;
mod state;
mod token_manager;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            let handle = app.handle().clone();
            let path = PathBuf::from("store.bin");
            let mut store = StoreBuilder::new("app_data.bin").build(app.handle().clone());
            store.load().expect("Failed to load store from disk");
            app.manage(TauriState::new(path, store));
            app.listen("deep-link://new-url", move |event| {
                tauri::async_runtime::block_on(deep_link::handler(&event, &handle))
                    .expect("Error while handling deep link");
            });

            let window = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "macos")]
            apply_vibrancy(
                &window,
                NSVisualEffectMaterial::HudWindow,
                Some(NSVisualEffectState::Active),
                Some(3.7_f64),
            )
            .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            #[cfg(target_os = "windows")]
            apply_blur(&window, Some((18, 18, 18, 125)))
                .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            handle_sign_in,
            get_user_info,
            get_user_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
