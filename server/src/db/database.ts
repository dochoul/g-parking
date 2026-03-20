import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../data/parking.db');

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeApplicationsTable(db);
  }
  return db;
}

function initializeApplicationsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quarter TEXT NOT NULL,
      application_type TEXT NOT NULL,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      contact TEXT NOT NULL,
      vehicle_number TEXT NOT NULL,
      vehicle_type TEXT NOT NULL,
      fuel_type TEXT NOT NULL,
      address TEXT NOT NULL,
      distance_km REAL NOT NULL,
      privacy_agreed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `);
}

export default getDatabase;
