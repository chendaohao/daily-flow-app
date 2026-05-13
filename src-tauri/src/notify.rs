use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;

pub fn send_notification(app: &AppHandle, title: &str, body: &str) {
    let _ = app
        .notification()
        .builder()
        .title(title)
        .body(body)
        .show();
}
