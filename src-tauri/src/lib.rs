use tauri::AppHandle;
use tauri::{Emitter, Listener, Manager};
use tauri_plugin_store::StoreBuilder;
use window_vibrancy::*;

use crate::auth::sign_in::handle_sign_in;
use crate::auth::user::get_user_info;
use crate::auth::user::get_user_playlists;
use crate::auth::user::get_user_token;
use crate::commands::player::play_track;
use crate::commands::playlist::get_playlist_info;
use crate::state::TauriState;

mod auth;
mod commands;
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
            let handle: AppHandle = app.handle().clone();
            let mut store = StoreBuilder::new("app_data.bin").build(app.handle().clone());

            // if handle.path().app_data_dir().expect("Failed to get PathResolver").join("app_data.bin").exists() {
            //     store.load().expect("Failed to load store from disk");
            // };

            let file_path: std::path::PathBuf =
                handle.path().app_data_dir().unwrap().join("app_data.bin");
            if file_path.exists() {
                store.load().expect("Failed to load store from disk");
            };

            app.manage(TauriState::new(store));
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
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::Destroyed => {
                window
                    .app_handle()
                    .emit("app_closed", "")
                    .expect("Failed to emit message when unfocused");
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            handle_sign_in,
            get_user_info,
            get_user_token,
            get_user_playlists,
            get_playlist_info,
            play_track
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
