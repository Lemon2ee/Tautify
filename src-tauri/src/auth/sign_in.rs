use base64::{engine::general_purpose::URL_SAFE, Engine as _};
use reqwest::Url;
use serde_json::json;
use sha2::{Digest, Sha256};
use tauri::{AppHandle, State};
use tauri_plugin_shell::ShellExt;

use crate::state::TauriState;
use crate::utils::oauth::generate_random_string;

const VERIFIER_LENGTH: i32 = 64;
const AUTH_STATE_LENGTH: i32 = 16;

#[tauri::command]
pub async fn handle_sign_in(state: State<'_, TauriState>, app: AppHandle) -> Result<(), ()> {
    // TODO: Find a way to include env variables in the built app.
    let client_id = dotenvy_macro::dotenv!("CLIENT_ID").to_string();
    let redirect_uri = "taurispotify://api/callback/";
    let scope = "user-read-private user-read-email streaming";

    // Following the instruction provided at
    // https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
    let code_verifier: String = generate_random_string(VERIFIER_LENGTH);
    let code_verifier_hash = Sha256::digest(&code_verifier);
    let code_verifier_hash_encoded: String = URL_SAFE.encode(code_verifier_hash);

    // Must have, the URL_SAFE engine provided by base64 is not the same as what is provided on
    // Spotify tutorial. Falsely generated/encoded/hashed challenge would most likely result in
    // {"error":"invalid_grant","error_description":"code_verifier was invalid"}
    //
    // ```js
    // const base64encode = (input) => {
    //   return btoa(String.fromCharCode(...new Uint8Array(input)))
    //     .replace(/=/g, '') <= here, we need to use trim_end_matches to meet with the "standard"
    //     .replace(/\+/g, '-')
    //     .replace(/\//g, '_');
    // }
    // ```
    let trimmed = code_verifier_hash_encoded.trim_end_matches('=').to_string();
    let spotify_auth_state: String = generate_random_string(AUTH_STATE_LENGTH);

    let auth_url = Url::parse_with_params(
        "https://accounts.spotify.com/authorize",
        &[
            ("response_type", "code"),
            ("client_id", &client_id),
            ("scope", &scope),
            ("state", &spotify_auth_state),
            ("code_challenge_method", "S256"),
            ("code_challenge", &trimmed),
            ("redirect_uri", &redirect_uri),
        ],
    )
    .expect("Failed to construct authorization URL");

    app.shell()
        .open(auth_url.as_str(), None)
        .expect("Failed to open authorization URL in browser");

    state
        .store
        .lock()
        .await
        .insert("auth_verifier".to_string(), json!(code_verifier))
        .expect("Failed adding auth_verifier during sign_in");

    state
        .store
        .lock()
        .await
        .insert("auth_state".to_string(), json!(spotify_auth_state))
        .expect("Failed adding auth_state during sign_in");

    state
        .store
        .lock()
        .await
        .save()
        .expect("Failed to save state to file");

    Ok(())
    //
    // with_store(app.app_handle().clone(), stores, &state.path, |store| {
    //     store.insert("auth_verifier".to_string(), json!(code_verifier))?;
    //     store.insert("auth_state".to_string(), json!(spotify_auth_state))?;
    //     store.save()?;
    //     Ok(())
    // })
    // .map_err(|_| "An error occurred while storing the data".to_string())
}
