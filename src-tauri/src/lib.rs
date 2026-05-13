mod db;
mod llm;
mod notify;

use db::DbState;
use std::sync::{Mutex, OnceLock};
use tauri::Manager;

static TAURI_APP_HANDLE: Mutex<Option<tauri::AppHandle>> = Mutex::new(None);
static DB: OnceLock<DbState> = OnceLock::new();

fn db() -> &'static DbState {
    DB.get().expect("Database not initialized")
}

// ── Tauri Commands ──

#[tauri::command]
fn get_frogs(date: String) -> Vec<db::Frog> {
    db().get_frogs(&date)
}

#[tauri::command]
fn create_frog(date: String, position: i32, title: String) -> db::Frog {
    db().create_frog(&date, position, &title)
}

#[tauri::command]
fn update_frog(
    id: i64,
    title: Option<String>,
    status: Option<String>,
    pomodoros: Option<i32>,
    estimated_pomodoros: Option<i32>,
) -> db::Frog {
    db().update_frog(
        id,
        title.as_deref(),
        status.as_deref(),
        pomodoros,
        estimated_pomodoros,
    )
}

#[tauri::command]
fn delete_frog(id: i64) {
    db().delete_frog(id);
}

#[tauri::command]
fn start_pomodoro(frog_id: i64, date: String) -> db::PomodoroRecord {
    db().start_pomodoro(frog_id, &date)
}

#[tauri::command]
fn complete_pomodoro(id: i64) {
    db().complete_pomodoro(id);
}

#[tauri::command]
fn get_pomodoro_stats(date: String) -> db::PomodoroStats {
    db().get_pomodoro_stats(&date)
}

#[tauri::command]
fn get_review(date: String) -> Option<db::Review> {
    db().get_review(&date)
}

#[tauri::command]
fn save_review(
    date: String,
    gains: String,
    blockers: String,
    tomorrow_plan: String,
) -> db::Review {
    db().save_review(&date, &gains, &blockers, &tomorrow_plan)
}

#[tauri::command]
fn get_setting(key: String) -> Option<String> {
    db().get_setting(&key)
}

#[tauri::command]
fn set_setting(key: String, value: String) {
    db().set_setting(&key, &value);
}

#[tauri::command]
fn send_notification(title: String, body: String) {
    let handle = TAURI_APP_HANDLE.lock().unwrap();
    if let Some(app) = handle.as_ref() {
        notify::send_notification(app, &title, &body);
    }
}

#[tauri::command]
async fn claude_complete(
    prompt: String,
    context: String,
    api_key: String,
    model: String,
) -> Result<String, String> {
    llm::claude_complete(&prompt, &context, &api_key, &model).await
}

// ── App Setup ──

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            *TAURI_APP_HANDLE.lock().unwrap() = Some(app.handle().clone());

            let app_data = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir");
            std::fs::create_dir_all(&app_data).ok();

            let _ = DB.set(db::init_db(app_data));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_frogs,
            create_frog,
            update_frog,
            delete_frog,
            start_pomodoro,
            complete_pomodoro,
            get_pomodoro_stats,
            get_review,
            save_review,
            get_setting,
            set_setting,
            send_notification,
            claude_complete,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
