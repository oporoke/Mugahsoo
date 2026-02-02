
import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';

// Use a global variable to ensure the database is initialized only once
// in a development environment.
// @ts-ignore
let dbInstance: Database | null = global.dbInstance || null;


export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const db = await open({
    filename: './welfare.db',
    driver: sqlite3.Database,
  });

  await db.exec(`
      CREATE TABLE IF NOT EXISTS members (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          memberSince TEXT NOT NULL,
          avatarUrl TEXT,
          status TEXT NOT NULL CHECK(status IN ('active', 'inactive'))
      );

      CREATE TABLE IF NOT EXISTS contributions (
          id TEXT PRIMARY KEY,
          memberId TEXT NOT NULL,
          memberName TEXT NOT NULL,
          date TEXT NOT NULL,
          amount REAL NOT NULL,
          method TEXT NOT NULL CHECK(method IN ('Paybill', 'Bank Transfer')),
          isAnomalous BOOLEAN,
          anomalyReason TEXT,
          FOREIGN KEY(memberId) REFERENCES members(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS welfare_requests (
          id TEXT PRIMARY KEY,
          memberId TEXT NOT NULL,
          memberName TEXT NOT NULL,
          requestDate TEXT NOT NULL,
          amount REAL NOT NULL,
          reason TEXT NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Disbursed')),
          FOREIGN KEY(memberId) REFERENCES members(id) ON DELETE CASCADE
      );
  `);

  dbInstance = db;
  // @ts-ignore
  global.dbInstance = db;
  return db;
}
