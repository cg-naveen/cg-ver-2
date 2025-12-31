import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

let pool;

if (!global.pgPool) {
  if (process.env.DATABASE_URL) {
    // Production / Supabase on Vercel
    global.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  } else {
    // Local development
    global.pgPool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
      ssl: false,
    });
  }
}

pool = global.pgPool;

export default pool;
