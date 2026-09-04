import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initDb(): Promise<void> {
  // Schema drops and recreates all tables on every startup — idempotent migration.
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  // Create the single VMC session
  await pool.query(
    `INSERT INTO sessions (current_stage, operation_state)
     VALUES ('POWER_ON', 'STOPPED')`
  );

  // Seed machine state: door open + reference incomplete → operator must act
  await pool.query(
    `INSERT INTO machine_state
      (session_id, power_available, estop_released, door_closed,
       alarm_active, lubrication_ready, coolant_ready, reference_complete)
     VALUES (1, true, true, false, false, true, true, false)`
  );

  // Seed tools: T1 ready, T2 missing offset+confirm, T3 ready
  const tools = [
    { id: 'T1', num: 'T01', name: '10mm Face Mill',  offset: true,  confirmed: true  },
    { id: 'T2', num: 'T02', name: '6mm End Mill',    offset: false, confirmed: false },
    { id: 'T3', num: 'T03', name: '5mm Drill',       offset: true,  confirmed: true  },
  ];
  for (const t of tools) {
    await pool.query(
      `INSERT INTO tools
        (id, session_id, tool_number, name, required, loaded,
         tool_number_correct, type_correct, offset_available, confirmed)
       VALUES ($1, 1, $2, $3, true, true, true, true, $4, $5)`,
      [t.id, t.num, t.name, t.offset, t.confirmed]
    );
  }

  // Seed workpiece: fixture/orientation/clamp/partZero set, G54 NOT yet set
  await pool.query(
    `INSERT INTO workpiece_setup
      (session_id, fixture, orientation_correct, clamped,
       part_zero_established, work_offset, work_offset_set, material, drawing_revision)
     VALUES (1, '4-jaw / vise fixture', true, true, true, 'G54', false,
             'Aluminium 6061', 'PART-001 Rev B')`
  );
}
