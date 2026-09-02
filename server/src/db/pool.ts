import pkg from 'pg';
import { config } from '../config/env';

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.pgSsl ? { rejectUnauthorized: false } : undefined,
});
