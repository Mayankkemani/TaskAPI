const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'taskuser',
  password: process.env.DB_PASSWORD || 'taskpass',
  database: process.env.DB_NAME || 'taskdb',
});

async function initDB() {
  // Retry a few times in case the DB container isn't ready yet
  let retries = 10;
  while (retries) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          done BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('Database ready.');
      return;
    } catch (err) {
      retries -= 1;
      console.log(`DB not ready yet, retrying... (${retries} left)`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error('Could not connect to database after multiple retries.');
}

module.exports = { pool, initDB };
