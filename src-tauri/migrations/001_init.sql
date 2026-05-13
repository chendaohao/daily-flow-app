CREATE TABLE IF NOT EXISTS frogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    position INTEGER NOT NULL CHECK(position BETWEEN 1 AND 3),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'abandoned')),
    pomodoros INTEGER NOT NULL DEFAULT 0,
    estimated_pomodoros INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_frogs_date ON frogs(date);

CREATE TABLE IF NOT EXISTS pomodoros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    frog_id INTEGER REFERENCES frogs(id) ON DELETE SET NULL,
    date TEXT NOT NULL,
    started_at TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 50,
    completed INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_pomodoros_date ON pomodoros(date);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    gains TEXT,
    blockers TEXT,
    tomorrow_plan TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES
    ('pomodoro_minutes', '50'),
    ('break_minutes', '10'),
    ('theme', 'light'),
    ('claude_api_key', ''),
    ('claude_model', 'claude-sonnet-4-20250514');
