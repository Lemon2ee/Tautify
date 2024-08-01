use anyhow::anyhow;
use reqwest::Client;

use tauri::{AppHandle, State, Wry};
use tauri_plugin_store::Store;

use crate::auth::user::refresh_user_token;
use crate::state::TauriState;

#[tauri::command]
pub async fn get_playlist_info(
    state: State<'_, TauriState>,
    app: AppHandle,
    playlist_id: String,
) -> Result<String, String> {
    println!("Getting current user playlists");
    refresh_user_token(app).await.map_err(|e| e.to_string())?;
    let store = state.store.lock().await;
    match fetch_playlist_info(&store, &state.client, playlist_id).await {
        Ok(user_profile) => Ok(user_profile),
        Err(error) => Err(format!("Error while fetching user profile: {}", error)),
    }
}

async fn fetch_playlist_info(
    store: &Store<Wry>,
    client: &Client,
    playlist_id: String,
) -> anyhow::Result<String> {
    let key = "access_token";
    let url = format!("https://api.spotify.com/v1/playlists/{}", playlist_id);

    if !store.has(key) {
        return Err(anyhow!("Token not found in the store"));
    };

    let token = store
        .get(key)
        .expect("Failed to get token")
        .as_str()
        .unwrap();

    let response = client
        .get(url)
        .header("Authorization", format!("Bearer {}", &token))
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
