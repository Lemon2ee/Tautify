use std::path::PathBuf;

use reqwest::Client;
use tauri::async_runtime::Mutex;
use tauri::Wry;
use tauri_plugin_store::Store;

pub struct TauriState {
    pub client: Client,
    pub path: PathBuf,
    pub store: Mutex<Store<Wry>>,
}

impl TauriState {
    pub fn new(path: PathBuf, store: Store<Wry>) -> Self {
        Self {
            client: Client::new(),
            path,
            store: Mutex::new(store),
        }
    }
}
