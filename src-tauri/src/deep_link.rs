use anyhow::Result;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
use url::Url;

use crate::state::TauriState;

#[derive(Debug, Serialize, Deserialize)]
struct AccessTokenRequest {
    grant_type: String,
    code: String,
    redirect_uri: String,
    client_id: String,
    code_verifier: String,
}

#[derive(Deserialize)]
pub struct SpotifyTokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i64,
    pub refresh_token: String,
    pub scope: String,
}

pub(crate) async fn handler(event: &tauri::Event, app: &AppHandle) -> Result<()> {
    log::info!("received deep link");
    let callback_url = "taurispotify://api/callback/";
    let payload = event.payload();

    // remove []'s
    let Some(link) = payload.get(2..payload.len() - 2) else {
        return Err(anyhow::anyhow!("Something went wrong"));
    };

    // Right now, it would only have a callback route to handle spotify OAUTH redirect, more route
    // is definitely possible, but need to figure out a better way to handle the routing (aka not if
    // else loop)
    if !link.starts_with(callback_url) {
        pop_up(app, link, "link_mismatch");
        return Err(anyhow::anyhow!(
            "deep-link: bad request, unrecognized route"
        ));
    }

    let state = app.state::<TauriState>();

    let mut store = state.store.lock().await;

    let (auth_state, auth_verifier) = (
        store.get("auth_state").unwrap().as_str().unwrap(),
        store.get("auth_verifier").unwrap().as_str().unwrap(),
    );

    let url = Url::parse(link).expect("Error parsing URL for sign in");
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
    if callback_auth_code.is_empty()
        || callback_auth_state.is_empty()
        || callback_auth_state != auth_state
    {
        pop_up(
            app,
            "Error processing Spotify OAUTH authentication, aborting",
            "GTFO",
        );
        return Err(anyhow::anyhow!("deep-link: Spotify call back missing either authentication state or authentication code, or authentication state mismatch"));
    }

    // TODO: this is bullshit
    // let client_id = std::env::var("CLIENT_ID").expect("CLIENT_ID not found");
    // let redirect_uri = std::env::var("REDIRECT_URI").expect("CLIENT_ID not found");

    let redirect_uri = "taurispotify://api/callback/".to_string();
    let request = AccessTokenRequest {
        grant_type: "authorization_code".to_string(),
        code: callback_auth_code.clone(),
        redirect_uri,
        client_id: state.client_id.clone(),
        code_verifier: auth_verifier.to_string(),
    };

    // TODO: this should be replace by the client within the state.
    let response = state
        .client
        .post("https://accounts.spotify.com/api/token")
        .form(&request)
        .send()
        .await
        .unwrap();

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

#[derive(Debug, Serialize, Deserialize)]
struct ProfileRequest {
    grant_type: String,
    code: String,
    redirect_uri: String,
    client_id: String,
    code_verifier: String,
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
