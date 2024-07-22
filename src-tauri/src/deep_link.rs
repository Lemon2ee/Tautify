use tauri::{AppHandle, Manager, State, Wry};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
use tauri_plugin_store::{StoreCollection, with_store};
use url::Url;

use crate::AccessTokenRequest;
use crate::state::TauriState;

pub(crate) async fn handler(event: &tauri::Event, app: &AppHandle) {
    log::info!("received deep link");
    let callback_url = "taurispotify://api/callback/";
    let payload = event.payload();

    // remove []'s
    let Some(link) = payload.get(2..payload.len() - 2) else {
        return;
    };

    // Right now, it would only have a callback route to handle spotify OAUTH redirect, more route
    // is definitely possible, but need to figure out a better way to handle the routing (aka not if
    // else loop)
    if !link.starts_with(callback_url) {
        pop_up(app, link, "link_mismatch");
        return;
    }

    let state = app.state::<TauriState>();
    let stores = app.state::<StoreCollection<Wry>>();

    let (auth_state, auth_verifier) = get_auth_from_store(app, &state, stores);

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

fn get_auth_from_store(
    app: &AppHandle,
    state: &State<TauriState>,
    stores: State<StoreCollection<Wry>>,
) -> (String, String) {
    // Extract the following value from local storage:
    //  1. Authentication state: Used for authenticating callback and prevent CSRF
    //  2. Authentication Verifier: Generated at the initial login request, appending it now for
    //     validation.
    with_store(app.app_handle().clone(), stores, &state.path, |store| {
        // Use match to handle potential errors from store.get()
        let auth_state = store
            .get("auth_state")
            .expect("Failed to get value from store")
            // Not essentially the `as` keyword in Typescript, check:
            // https://docs.rs/serde_json/latest/serde_json/value/enum.Value.html#method.as_str
            // to_string() does not work well here.
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
    .expect("Failed to execute with_store")
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
