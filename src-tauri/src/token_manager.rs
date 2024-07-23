use chrono::{Duration, Utc};
use serde_json::{json, Value};
use tauri::{Manager, Wry};
use tauri::AppHandle;
use tauri_plugin_store::{StoreCollection, with_store};

use crate::state::TauriState;

pub struct TokenManager {
    app: AppHandle,
}

#[macro_export]
macro_rules! kv_store_read {
    ($app:expr, $key:expr, $type:ty, $matcher:pat => $converter:expr) => {{
        let state = $app.state::<TauriState>().clone();
        let stores = $app.state::<StoreCollection<Wry>>().clone();
        with_store($app.app_handle().clone(), stores, &state.path, |store| {
            let value = store
                .get($key)
                .expect(&*format!("Failed to get value from store for {}", $key));
            match value {
                $matcher => Ok(Some($converter)),
                _ => Ok(None),
            }
        })
        .expect("Panic during adding kv to tauri store plugin")
    }};
}

impl TokenManager {
    pub fn new(app: AppHandle) -> Self {
        TokenManager { app }
    }

    pub fn save(&self, key: &str, value: Value) -> () {
        let state = self.app.state::<TauriState>().clone();
        let stores = self.app.state::<StoreCollection<Wry>>().clone();
        with_store(
            self.app.app_handle().clone(),
            stores,
            &state.path,
            |store| {
                store.insert(key.to_string(), json!(value))?;
                store.save()?;
                Ok(())
            },
        )
        .map_err(|_| "An error occurred while storing the data".to_string())
        .expect("Panic during adding kv to tauri store plugin");
    }

    pub fn save_expire_in(&self, expire_in: u64) -> () {
        let current_time = Utc::now();
        let expiration_time = current_time + Duration::seconds(expire_in as i64);
        let expiration_timestamp = expiration_time.timestamp();
        self.save("expire_at", json!(expiration_timestamp))
    }

    pub fn kv_store_read_str(&self, key: &str) -> Option<String> {
        kv_store_read!(self.app, key, String, Value::String(s) => s.to_string())
    }

    pub fn kv_store_read_u64(&self, key: &str) -> Option<u64> {
        kv_store_read!(self.app, key, u64, Value::Number(n) => n.as_u64().unwrap())
    }

    pub fn kv_store_read_i64(&self, key: &str) -> Option<i64> {
        kv_store_read!(self.app, key, u64, Value::Number(n) => n.as_i64().unwrap())
    }
}
