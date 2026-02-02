
import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import { members, contributions, welfareRequests as mockWelfareRequests } from './data';

// Use a global variable to ensure the database is initialized only once
// in a development environment.
// @ts-ignore
let dbInstance: Database | null = global.dbInstance || null;


async function seed(db: Database) {
    // Enable foreign key support
    await db.exec('PRAGMA foreign_keys = ON;');
  
    console.log('Seeding members...');
    const memberStmt = await db.prepare(
      'INSERT OR IGNORE INTO members (id, name, email, memberSince, avatarUrl, status) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const member of members) {
      await memberStmt.run(
        member.id,
        member.name,
        member.email,
        member.memberSince,
        member.avatarUrl,
        member.status
      );
    }
    await memberStmt.finalize();
  
    console.log('Seeding contributions...');
    const contributionStmt = await db.prepare(
      'INSERT OR IGNORE INTO contributions (id, memberId, memberName, date, amount, method, isAnomalous, anomalyReason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const contribution of contributions) {
      await contributionStmt.run(
        contribution.id,
        contribution.memberId,
        contribution.memberName,
        contribution.date,
        contribution.amount,
        contribution.method,
        contribution.isAnomalous ?? null,
        contribution.anomalyReason ?? null
      );
    }
    await contributionStmt.finalize();
  
    console.log('Seeding welfare requests...');
    const welfareStmt = await db.prepare(
      'INSERT OR IGNORE INTO welfare_requests (id, memberId, memberName, requestDate, amount, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const request of mockWelfareRequests) {
      await welfareStmt.run(
        request.id,
        request.memberId,
        request.memberName,
        request.requestDate,
        request.amount,
        request.reason,
        request.status
      );
    }
    await welfareStmt.finalize();
  
    console.log('Database seeded!');
}

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

  const memberCount = await db.get('SELECT COUNT(*) as count FROM members');
  if (memberCount.count === 0) {
      console.log('Database is empty. Seeding data...');
      await seed(db);
  }

  dbInstance = db;
  // @ts-ignore
  global.dbInstance = db;
  return db;
}
