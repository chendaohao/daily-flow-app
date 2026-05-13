use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Frog {
    pub id: i64,
    pub date: String,
    pub position: i32,
    pub title: String,
    pub status: String,
    pub pomodoros: i32,
    pub estimated_pomodoros: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PomodoroRecord {
    pub id: i64,
    pub frog_id: Option<i64>,
    pub date: String,
    pub started_at: String,
    pub duration_minutes: i32,
    pub completed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PomodoroStats {
    pub total: i32,
    pub completed: i32,
    pub total_minutes: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Review {
    pub id: i64,
    pub date: String,
    pub gains: Option<String>,
    pub blockers: Option<String>,
    pub tomorrow_plan: Option<String>,
    pub created_at: String,
}

pub struct DbState {
    pub conn: Mutex<Connection>,
}

pub fn init_db(app_data_dir: PathBuf) -> DbState {
    println!("[DB] init_db called with dir: {:?}", app_data_dir);

    let db_path = app_data_dir.join("daily-flow.db");
    println!("[DB] Opening database at: {:?}", db_path);

    let conn = match Connection::open(&db_path) {
        Ok(c) => {
            println!("[DB] Database opened successfully");
            c
        }
        Err(e) => {
            eprintln!("[DB ERROR] Failed to open database: {:?}", e);
            panic!("Failed to open database: {:?}", e);
        }
    };

    println!("[DB] Setting pragmas...");
    if let Err(e) = conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;") {
        eprintln!("[DB ERROR] Failed to set pragmas: {:?}", e);
    }

    println!("[DB] Running migrations...");
    let migration = include_str!("../migrations/001_init.sql");
    match conn.execute_batch(migration) {
        Ok(_) => println!("[DB] Migrations completed successfully"),
        Err(e) => {
            eprintln!("[DB ERROR] Migration failed: {:?}", e);
            panic!("Migration failed: {:?}", e);
        }
    }

    println!("[DB] init_db completed OK");
    DbState {
        conn: Mutex::new(conn),
    }
}

impl DbState {
    // ── Frogs ──

    pub fn get_frogs(&self, date: &str) -> Vec<Frog> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT id, date, position, title, status, pomodoros, estimated_pomodoros, created_at, updated_at FROM frogs WHERE date = ?1 ORDER BY position")
            .unwrap();
        stmt.query_map(params![date], |row| {
            Ok(Frog {
                id: row.get(0)?,
                date: row.get(1)?,
                position: row.get(2)?,
                title: row.get(3)?,
                status: row.get(4)?,
                pomodoros: row.get(5)?,
                estimated_pomodoros: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .unwrap()
        .filter_map(|r| r.ok())
        .collect()
    }

    pub fn create_frog(&self, date: &str, position: i32, title: &str) -> Frog {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO frogs (date, position, title) VALUES (?1, ?2, ?3)",
            params![date, position, title],
        )
        .unwrap();
        let id = conn.last_insert_rowid();
        drop(conn);
        self.get_frog_by_id(id).unwrap()
    }

    pub fn update_frog(
        &self,
        id: i64,
        title: Option<&str>,
        status: Option<&str>,
        pomodoros: Option<i32>,
        estimated_pomodoros: Option<i32>,
    ) -> Frog {
        let conn = self.conn.lock().unwrap();
        let mut sets = vec!["updated_at = datetime('now')".to_string()];
        let mut values: Vec<Box<dyn rusqlite::types::ToSql>> = vec![];

        if let Some(t) = title {
            sets.push(format!("title = ?{}", values.len() + 1));
            values.push(Box::new(t.to_string()));
        }
        if let Some(s) = status {
            sets.push(format!("status = ?{}", values.len() + 1));
            values.push(Box::new(s.to_string()));
        }
        if let Some(p) = pomodoros {
            sets.push(format!("pomodoros = ?{}", values.len() + 1));
            values.push(Box::new(p));
        }
        if let Some(e) = estimated_pomodoros {
            sets.push(format!("estimated_pomodoros = ?{}", values.len() + 1));
            values.push(Box::new(e));
        }

        values.push(Box::new(id));
        let sql = format!("UPDATE frogs SET {} WHERE id = ?{}", sets.join(", "), values.len());
        let params_ref: Vec<&dyn rusqlite::types::ToSql> = values.iter().map(|v| v.as_ref()).collect();
        conn.execute(&sql, params_ref.as_slice()).unwrap();
        drop(conn);
        self.get_frog_by_id(id).unwrap()
    }

    pub fn delete_frog(&self, id: i64) {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM frogs WHERE id = ?1", params![id])
            .unwrap();
    }

    fn get_frog_by_id(&self, id: i64) -> Option<Frog> {
        let conn = self.conn.lock().unwrap();
        conn.query_row(
            "SELECT id, date, position, title, status, pomodoros, estimated_pomodoros, created_at, updated_at FROM frogs WHERE id = ?1",
            params![id],
            |row| {
                Ok(Frog {
                    id: row.get(0)?,
                    date: row.get(1)?,
                    position: row.get(2)?,
                    title: row.get(3)?,
                    status: row.get(4)?,
                    pomodoros: row.get(5)?,
                    estimated_pomodoros: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                })
            },
        )
        .ok()
    }

    // ── Pomodoros ──

    pub fn start_pomodoro(&self, frog_id: i64, date: &str) -> PomodoroRecord {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO pomodoros (frog_id, date, started_at) VALUES (?1, ?2, datetime('now'))",
            params![frog_id, date],
        )
        .unwrap();
        let id = conn.last_insert_rowid();
        PomodoroRecord {
            id,
            frog_id: Some(frog_id),
            date: date.to_string(),
            started_at: chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
            duration_minutes: 50,
            completed: false,
        }
    }

    pub fn complete_pomodoro(&self, id: i64) {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE pomodoros SET completed = 1 WHERE id = ?1",
            params![id],
        )
        .unwrap();
    }

    pub fn get_pomodoro_stats(&self, date: &str) -> PomodoroStats {
        let conn = self.conn.lock().unwrap();
        let (total, completed, total_minutes): (i32, i32, i32) = conn
            .query_row(
                "SELECT COUNT(*), SUM(CASE WHEN completed THEN 1 ELSE 0 END), COALESCE(SUM(CASE WHEN completed THEN duration_minutes ELSE 0 END), 0) FROM pomodoros WHERE date = ?1",
                params![date],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .unwrap_or((0, 0, 0));
        PomodoroStats {
            total,
            completed,
            total_minutes,
        }
    }

    // ── Reviews ──

    pub fn get_review(&self, date: &str) -> Option<Review> {
        let conn = self.conn.lock().unwrap();
        conn.query_row(
            "SELECT id, date, gains, blockers, tomorrow_plan, created_at FROM reviews WHERE date = ?1",
            params![date],
            |row| {
                Ok(Review {
                    id: row.get(0)?,
                    date: row.get(1)?,
                    gains: row.get(2)?,
                    blockers: row.get(3)?,
                    tomorrow_plan: row.get(4)?,
                    created_at: row.get(5)?,
                })
            },
        )
        .ok()
    }

    pub fn save_review(
        &self,
        date: &str,
        gains: &str,
        blockers: &str,
        tomorrow_plan: &str,
    ) -> Review {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO reviews (date, gains, blockers, tomorrow_plan) VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(date) DO UPDATE SET gains=?2, blockers=?3, tomorrow_plan=?4",
            params![date, gains, blockers, tomorrow_plan],
        )
        .expect("Failed to save review");
        let id = conn.last_insert_rowid();
        Review {
            id,
            date: date.to_string(),
            gains: Some(gains.to_string()),
            blockers: Some(blockers.to_string()),
            tomorrow_plan: Some(tomorrow_plan.to_string()),
            created_at: chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        }
    }

    // ── Settings ──

    pub fn get_setting(&self, key: &str) -> Option<String> {
        let conn = self.conn.lock().unwrap();
        conn.query_row(
            "SELECT value FROM settings WHERE key = ?1",
            params![key],
            |row| row.get(0),
        )
        .ok()
    }

    pub fn set_setting(&self, key: &str, value: &str) {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value=?2",
            params![key, value],
        )
        .unwrap();
    }
}
