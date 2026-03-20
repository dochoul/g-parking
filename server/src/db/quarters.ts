import { getDatabase } from './database';

export function initializeQuartersTable(): void {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS quarters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `);
}

export interface Quarter {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: number;
  created_at: string;
}

export function getAllQuarters(): Quarter[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM quarters ORDER BY name DESC').all() as Quarter[];
}

export function createQuarter(name: string, startDate: string, endDate: string, isActive: boolean): Quarter {
  const db = getDatabase();

  if (isActive) {
    db.prepare('UPDATE quarters SET is_active = 0 WHERE is_active = 1').run();
  }

  const result = db.prepare(
    'INSERT INTO quarters (name, start_date, end_date, is_active) VALUES (?, ?, ?, ?)'
  ).run(name, startDate, endDate, isActive ? 1 : 0);

  return db.prepare('SELECT * FROM quarters WHERE id = ?').get(result.lastInsertRowid) as Quarter;
}
