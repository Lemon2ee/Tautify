use reqwest::Client;
use tauri::async_runtime::Mutex;
use tauri::Wry;
use tauri_plugin_store::Store;

pub struct TauriState {
    pub client: Client,
    pub store: Mutex<Store<Wry>>,
}

impl TauriState {
    pub fn new(store: Store<Wry>) -> Self {
        Self {
            client: Client::new(),
            store: Mutex::new(store),
        }
    }
}
