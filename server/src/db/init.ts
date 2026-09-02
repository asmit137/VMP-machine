import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool';
import { sessionRepository } from '../repositories/session.repository';
import { itemRepository } from '../repositories/item.repository';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initDb(): Promise<void> {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
  await sessionRepository.ensure();
  await itemRepository.seedIfEmpty();
}
