import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool';
import { ITEM_SEED } from '../data/scenario';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initDb(): Promise<void> {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  // Ensure session exists
  await pool.query(
    'INSERT INTO session (id, current_stage, status) VALUES (1, $1, $2) ON CONFLICT DO NOTHING',
    ['POWER_ON', 'STOPPED']
  );

  // Seed items if empty
  const { rows } = await pool.query('SELECT COUNT(*) as count FROM checklist_items');
  if (parseInt(rows[0].count, 10) === 0) {
    for (const item of ITEM_SEED) {
      await pool.query(
        'INSERT INTO checklist_items (id, stage, title, detail) VALUES ($1, $2, $3, $4)',
        [item.id, item.stage, item.title, item.detail]
      );
    }
  }
}
