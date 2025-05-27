// move-db.js
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// adjust these paths as needed
const DB_FILE = path.resolve('src/data/app.sqlite');
const SQL_FILE = path.resolve('./healthflow_db.sql');

// 1) Read your dump
let sql = fs.readFileSync(SQL_FILE, 'utf8');

// 2) Clean out MySQL‐isms
sql = sql
  // drop /*! … */ version-checks and other special comments
  .replace(/\/\*![\s\S]*?\*\//g, '')
  // remove ENGINE, CHARSET, COLLATE clauses
  .replace(/\s+ENGINE=[^;]+/gi, '')
  .replace(/\s+DEFAULT CHARSET=[^;]+/gi, '')
  .replace(/\s+COLLATE=[^;]+/gi, '')
  // strip AUTO_INCREMENT definitions
  .replace(/AUTO_INCREMENT=\d+/gi, '')
  // strip UNSIGNED keyword
  .replace(/\bUNSIGNED\b/gi, '')
  // remove UNIQUE KEY lines
  .replace(/^\s*UNIQUE KEY.*$/gim, '')
  // drop foreign-key toggles
  .replace(/SET FOREIGN_KEY_CHECKS=[01];/gi, '')
  // remove lock/unlock statements
  .replace(/LOCK TABLES.*?;/gi, '')
  .replace(/UNLOCK TABLES.*?;/gi, '')
  // drop MySQL single-line comments
  .replace(/--.*$/gm, '');

// 3) Open (or create) the SQLite file
const db = new sqlite3.Database(
  DB_FILE,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error('❌ Could not open database:', err);
      process.exit(1);
    }
    console.log('✔ Opened', DB_FILE);
  },
);

// 4) Run the cleaned SQL
db.serialize(() => {
  // temporarily disable FK checks while importing
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec(sql, (err) => {
    if (err) {
      console.error('❌ Error running SQL:', err);
    } else {
      console.log('🎉 Import complete!');
    }
    // re-enable FK checks & close
    db.exec('PRAGMA foreign_keys = ON;');
    db.close();
  });
});
