mod auth;
mod state;
mod utils;

use crate::auth::sign_in::handle_sign_in;
use crate::state::TauriState;
use reqwest::{Client, Error, Response, Url};
use serde_json::Value;
use std::any::type_name;
use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Listener, Manager, State, Wry};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
use tauri_plugin_store::{with_store, StoreCollection};

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
                tauri::async_runtime::block_on(deep_link(&event, &handle))
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![handle_sign_in])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn deep_link(event: &tauri::Event, app: &AppHandle) {
    log::info!("received deep link");
    let callback_url = "taurispotify://api/callback/";
    let payload = event.payload();
    let Some(link) = payload.get(2..payload.len() - 2) else {
        return;
    };

    let state = app.state::<TauriState>();
    let stores = app.state::<StoreCollection<Wry>>();
    let (auth_state, auth_verifier) =
        with_store(app.app_handle().clone(), stores, &state.path, |store| {
            // Use match to handle potential errors from store.get()
            let auth_state = store
                .get("auth_state")
                .expect("Failed to get value from store")
                .as_str()
                .expect("auth_state is not a string")
                .to_string(); // Clone the string

            let auth_verifier = store
                .get("auth_verifier")
                .expect("Failed to get value from store")
                .as_str()
                .expect("auth_verifier is not a string")
                .to_string(); // Clone the string

            // Ensure the types match the expected return type of the closure
            Ok((auth_state, auth_verifier))
        })
        .expect("Failed to execute with_store"); // Handle the result of `with_store`

    if !link.starts_with(callback_url) {
        pop_up(app, link, "link_mismatch");
        return;
    }

    let url = Url::parse(link).expect("some ain't right");
    let pairs = url.query_pairs();
    let mut callback_auth_code: Option<String> = None;
    let mut callback_auth_state: Option<String> = None;

    for (key, value) in pairs {
        if key == "code" {
            callback_auth_code = Some(value.to_string());
        } else if key == "state" {
            callback_auth_state = Some(value.to_string());
        }
    }

    let callback_auth_code = callback_auth_code.unwrap();
    let callback_auth_state = callback_auth_state.unwrap();

    // Check if both 'code' and 'state' parameters are present
    if callback_auth_code.is_empty() {
        pop_up(
            app,
            "Error processing Spotify OAuth authentication code, aborting",
            "GTFO",
        );
        return;
    }

    if callback_auth_state.is_empty() || callback_auth_state != auth_state {
        pop_up(
            app,
            "Error processing Spotify OAuth authentication state, aborting",
            "GTFO",
        );
        return;
    }

    // TODO: this is bullshit
    let client_id = "cae266e13c41412ead421bf581bc0609";
    let redirect_uri = "taurispotify://api/callback/";

    let request = AccessTokenRequest {
        grant_type: "authorization_code".to_string(),
        code: callback_auth_code.clone(),
        redirect_uri: redirect_uri.to_string(),
        client_id: client_id.to_string(),
        code_verifier: auth_verifier.clone(),
    };

    // TODO: this should be replace by the client within the state.
    let response = state
        .client
        .post("https://accounts.spotify.com/api/token")
        .form(&request)
        .send()
        .await
        .unwrap();

    pop_up(app, &*response.text().await.unwrap(), "Auth Successful")
}

fn pop_up(app: &AppHandle, message: &str, title: &str) {
    app.dialog()
        .message(message)
        .kind(MessageDialogKind::Info)
        .title(title)
        .ok_button_label("Absolutely")
        .show(|result| match result {
            true => log::info!("received deep link"),
            false => log::info!("received deep link"),
        });
}
