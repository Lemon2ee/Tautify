use reqwest::Client;
use tauri::async_runtime::Mutex;
use tauri::Wry;
use tauri_plugin_store::Store;

pub struct TauriState {
    pub client: Client,
    pub store: Mutex<Store<Wry>>,
    pub client_id: String,
}

impl TauriState {
    pub fn new(store: Store<Wry>) -> Self {
        Self {
            client: Client::new(),
            store: Mutex::new(store),
            client_id: dotenvy_macro::dotenv!("CLIENT_ID").to_string(),
        }
    }
}
