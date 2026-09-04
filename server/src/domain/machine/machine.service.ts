import { pool } from '../../db/pool';
import type { MachineState } from './machine.types';

/** Read machine state for session 1 from the database. */
export async function getMachineState(): Promise<MachineState> {
  const { rows } = await pool.query(
    `SELECT power_available, estop_released, door_closed, alarm_active,
            lubrication_ready, coolant_ready, reference_complete
     FROM machine_state WHERE session_id = 1 LIMIT 1`
  );
  if (rows.length === 0) throw new Error('Machine state not found');
  const r = rows[0];
  return {
    powerAvailable:    r.power_available,
    eStopReleased:     r.estop_released,
    doorClosed:        r.door_closed,
    alarmActive:       r.alarm_active,
    lubricationReady:  r.lubrication_ready,
    coolantReady:      r.coolant_ready,
    referenceComplete: r.reference_complete,
  };
}

async function setField(field: string, value: boolean): Promise<void> {
  await pool.query(
    `UPDATE machine_state SET ${field} = $1, updated_at = NOW() WHERE session_id = 1`,
    [value]
  );
}

export const machineService = {
  closeDoor:            () => setField('door_closed', true),
  openDoor:             () => setField('door_closed', false),
  releaseEstop:         () => setField('estop_released', true),
  pressEstop:           () => setField('estop_released', false),
  triggerAlarm:         () => setField('alarm_active', true),
  clearAlarm:           () => setField('alarm_active', false),
  setPowerOn:           () => setField('power_available', true),
  setPowerOff:          () => setField('power_available', false),
  setLubricationReady:  () => setField('lubrication_ready', true),
  setCoolantReady:      () => setField('coolant_ready', true),
  completeReference:    () => setField('reference_complete', true),
  resetReference:       () => setField('reference_complete', false),
  getMachineState,
};
