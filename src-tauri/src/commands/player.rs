use anyhow::anyhow;
use reqwest::Client;
use serde::{Deserialize, Serialize};

use tauri::{AppHandle, State, Wry};
use tauri_plugin_store::Store;

use crate::auth::user::refresh_user_token;
use crate::state::TauriState;

#[tauri::command]
pub async fn play_track(
    state: State<'_, TauriState>,
    app: AppHandle,
    track_uri: String,
    device_id: String,
) -> Result<String, String> {
    log::info!("Trying to play track: {}", track_uri);
    refresh_user_token(app).await.map_err(|e| e.to_string())?;
    let store = state.store.lock().await;
    match post_play_track(&store, &state.client, track_uri, device_id).await {
        Ok(user_profile) => Ok(user_profile),
        Err(error) => Err(format!("Error while fetching user profile: {}", error)),
    }
}

#[derive(Serialize, Deserialize)]
struct Offset {
    position: u32,
}

#[derive(Serialize, Deserialize)]
struct PlayRequest {
    context_uri: Option<String>,
    offset: Option<Offset>,
    position_ms: Option<u32>,
    uris: Option<Vec<String>>,
}

async fn post_play_track(
    store: &Store<Wry>,
    client: &Client,
    track_uri: String,
    device_id: String,
) -> anyhow::Result<String> {
    let key = "access_token";
    let url = format!(
        "https://api.spotify.com/v1/me/player/play?device_id={}",
        device_id
    );

    if !store.has(key) {
        return Err(anyhow!("Token not found in the store"));
    };

    let token = store
        .get(key)
        .expect("Failed to get token")
        .as_str()
        .unwrap();

    let play_request = PlayRequest {
        context_uri: None,
        offset: None,
        position_ms: None,
        uris: Some(vec![track_uri]),
    };

    let response = client
        .put(url)
        .bearer_auth(token)
        .json(&play_request)
        .send()
        .await?;

    // Check if the request was successful
    if response.status().is_success() {
        let body = response.text().await?;
        Ok(body)
    } else {
        Err(anyhow!(response.text().await.unwrap()))
    }
}
