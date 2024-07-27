use anyhow::anyhow;
use chrono::Utc;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{Emitter, Manager};

use tauri::{AppHandle, State, Wry};
use tauri_plugin_store::Store;

use crate::{deep_link::SpotifyTokenResponse, state::TauriState};

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

#[derive(Debug, Serialize, Deserialize)]
struct AccessTokenRefreshRequest {
    grant_type: String,
    refresh_token: String,
    client_id: String,
}

#[tauri::command]
pub async fn get_user_info(
    state: State<'_, TauriState>,
    app: AppHandle,
) -> Result<SpotifyResponse, String> {
    println!("Getting user info");
    refresh_user_token(app).await.map_err(|e| e.to_string())?;

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

    match store.get("access_token") {
        Some(value) => Ok(value.to_string()),
        None => Err("Access token not found".to_string()),
    }
}

pub async fn refresh_user_token(app: AppHandle) -> anyhow::Result<()> {
    let url = "https://accounts.spotify.com/api/token";
    let state = app.state::<TauriState>();
    let client = state.client.clone();
    let mut store = state.store.lock().await;

    if store.has("expires_at") {
        let expire_at = store
            .get("expires_at")
            .expect("Failed to get token")
            .as_i64()
            .unwrap();

        if expire_at > Utc::now().timestamp() {
            println!("Token is still valid");
            return Ok(());
        };
    } else {
        return Err(anyhow!("Refresh time not found in the store"));
    }

    if !store.has("refresh_token") {
        return Err(anyhow!("Refresh token not found in the store"));
    };

    let token = store
        .get("refresh_token")
        .expect("Failed to get token")
        .as_str()
        .unwrap();

    let client_id = "cae266e13c41412ead421bf581bc0609";

    let request_body = AccessTokenRefreshRequest {
        grant_type: "refresh_token".to_string(),
        refresh_token: token.to_string(),
        client_id: client_id.to_string(),
    };

    let response = client.post(url).form(&request_body).send().await.unwrap();

    let response_json = response.json::<SpotifyTokenResponse>().await.unwrap();

    store
        .insert(
            "access_token".to_string(),
            json!(response_json.access_token),
        )
        .expect("Failed to store access_token");
    store
        .insert("token_type".to_string(), json!(response_json.token_type))
        .expect("Failed to store token_type");
    store
        .insert("scope".to_string(), json!(response_json.scope))
        .expect("Failed to store Spotify API scope");

    store
        .insert(
            "refresh_token".to_string(),
            json!(response_json.refresh_token),
        )
        .expect("Failed to store Spotify API refresh token");

    let current_time = Utc::now().timestamp();
    let expire_time = current_time + response_json.expires_in;

    store
        .insert("expires_at".to_string(), json!(expire_time))
        .expect("Failed to store expires time");

    store.save().expect("Failed to save to store");
    // store.save_expire_in(response_json.expires_in);
    app.emit("login_complete", "")
        .expect("Failed to emit login_complete event");

    // user_info_fetch(app).await.unwrap();

    Ok(())
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

#[derive(Debug, Serialize, Deserialize)]
pub struct CurrentUserPlaylistsResponse {
    href: String,
    limit: u32,
    next: Option<String>,
    offset: u32,
    previous: Option<String>,
    total: u32,
    items: Vec<Playlist>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Playlist {
    collaborative: bool,
    description: String,
    external_urls: ExternalUrls,
    href: String,
    id: String,
    images: Option<Vec<Image>>, // Changed to Option<Vec<Image>> for possible null value
    name: String,
    owner: Owner,
    primary_color: Option<String>,
    public: bool,
    snapshot_id: String,
    tracks: Tracks,
    #[serde(rename = "type")]
    playlist_type: String,
    uri: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ExternalUrls {
    spotify: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Owner {
    display_name: String,
    external_urls: ExternalUrls,
    href: String,
    id: String,
    #[serde(rename = "type")]
    owner_type: String,
    uri: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Tracks {
    href: String,
    total: u32,
}

#[tauri::command]
pub async fn get_user_playlists(
    state: State<'_, TauriState>,
    app: AppHandle,
) -> Result<CurrentUserPlaylistsResponse, String> {
    println!("Getting current user playlists");
    refresh_user_token(app).await.map_err(|e| e.to_string())?;
    let store = state.store.lock().await;
    match fetch_current_user_playlists(&*store, &state.client).await {
        Ok(user_profile) => Ok(user_profile),
        Err(error) => Err(format!(
            "Error while fetching user profile: {}",
            error.to_string()
        )),
    }
}

async fn fetch_current_user_playlists(
    store: &Store<Wry>,
    client: &Client,
) -> anyhow::Result<CurrentUserPlaylistsResponse> {
    // TODO: add limit and offset?
    let url = "https://api.spotify.com/v1/me/playlists";
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
        let body = response.json::<CurrentUserPlaylistsResponse>().await?;
        Ok(body)
    } else {
        return Err(anyhow!(response.text().await.unwrap()));
    }
}
