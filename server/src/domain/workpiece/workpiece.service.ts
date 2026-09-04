import { pool } from '../../db/pool';
import type { WorkpieceState } from './workpiece.types';

export async function getWorkpiece(): Promise<WorkpieceState> {
  const { rows } = await pool.query(
    `SELECT fixture, orientation_correct, clamped, part_zero_established,
            work_offset, work_offset_set, material, drawing_revision
     FROM workpiece_setup WHERE session_id = 1 LIMIT 1`
  );
  
  if (!rows.length) throw new Error('Workpiece state not found');
  
  const setup = rows[0];
  return {
    fixture: setup.fixture,
    orientationCorrect: setup.orientation_correct,
    clamped: setup.clamped,
    partZeroEstablished: setup.part_zero_established,
    workOffset: setup.work_offset,
    workOffsetSet: setup.work_offset_set,
    material: setup.material,
    drawingRevision: setup.drawing_revision,
  };
}

async function setField(field: string, value: boolean | string): Promise<void> {
  await pool.query(
    `UPDATE workpiece_setup SET ${field} = $1, updated_at = NOW() WHERE session_id = 1`,
    [value]
  );
}

export const workpieceService = {
  getWorkpiece,

  orientWorkpiece:    () => setField('orientation_correct', true),
  clampWorkpiece:     () => setField('clamped', true),
  establishPartZero:  () => setField('part_zero_established', true),

  async setWorkOffset(offset: string = 'G54'): Promise<void> {
    await pool.query(
      `UPDATE workpiece_setup
       SET work_offset = $1, work_offset_set = true, updated_at = NOW()
       WHERE session_id = 1`,
      [offset]
    );
  },

  async resetWorkpiece(): Promise<void> {
    await pool.query(
      `UPDATE workpiece_setup
       SET orientation_correct = false, clamped = false,
           part_zero_established = false, work_offset_set = false,
           updated_at = NOW()
       WHERE session_id = 1`
    );
  },
};
