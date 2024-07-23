use std::path::PathBuf;

use reqwest::Client;

use crate::token_manager::TokenManager;

pub struct TauriState {
    pub client: Client,
    pub path: PathBuf,
    pub token_manager: TokenManager,
}

impl TauriState {
    pub fn new(path: PathBuf, token_manager: TokenManager) -> Self {
        Self {
            client: Client::new(),
            path,
            token_manager,
        }
    }
}
