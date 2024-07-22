use tauri::{AppHandle, Listener};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            println!("hello");
            let handle = app.handle().clone();
            app.listen("deep-link://new-url", move |event| {
                deep_link(&event, &handle)
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn deep_link(event: &tauri::Event, app: &AppHandle) {
    let payload = event.payload();
    app.dialog()
        .message("Tauri is Awesome")
        .kind(MessageDialogKind::Info)
        .title("Information")
        .ok_button_label("Absolutely")
        .show(|result| match result {
            true => log::info!("received deep link"),
            false => log::info!("received deep link")
        });

    let Some(_link) = payload.get(2..payload.len() - 2) else {
        log::info!("received deep link");
        return;
    };
    // Parse deep link
    log::info!("received deep link");
}
