use anyhow::anyhow;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::{State, Wry};
use tauri_plugin_store::Store;

use crate::state::TauriState;

#[tauri::command]
pub async fn get_user_info(state: State<'_, TauriState>) -> Result<SpotifyResponse, String> {
    let store = state.store.lock().await;
    match user_info_fetch(&*store, &state.client).await {
        Ok(user_profile) => Ok(user_profile),
        Err(error) => Err(format!(
            "Error while fetching user profile: {}",
            error.to_string()
        )),
    }
}

#[tauri::command]
pub async fn get_user_token(state: State<'_, TauriState>) -> Result<String, String> {
    let store = state.store.lock().await;

    let keys = store.keys();

    // Print each key
    for key in keys {
        println!("{}", key);
    }

    match store.get("access_token") {
        Some(value) => Ok(value.to_string()),
        None => Err("Access token not found".to_string()),
    }
}

#[derive(Deserialize, Serialize, Debug)]
struct Image {
    url: String,
    height: Option<u32>,
    width: Option<u32>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct SpotifyResponse {
    country: String,
    display_name: String,
    email: String,
    images: Vec<Image>,
}

async fn user_info_fetch(store: &Store<Wry>, client: &Client) -> anyhow::Result<SpotifyResponse> {
    let url = "https://api.spotify.com/v1/me";
    let key = "access_token";

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
        let body = response.json::<SpotifyResponse>().await?;
        Ok(body)
    } else {
        return Err(anyhow!(response.text().await.unwrap()));
    }
}
