import { pool } from '../../db/pool';
import type { MachineState } from './machine.types';

export async function getMachineState(): Promise<MachineState> {
  const { rows } = await pool.query(
    `SELECT power_available, estop_released, door_closed, alarm_active,
            lubrication_ready, coolant_ready, reference_complete
     FROM machine_state WHERE session_id = 1 LIMIT 1`
  );
  
  if (!rows.length) throw new Error('Machine state not found');
  
  const state = rows[0];
  return {
    powerAvailable: state.power_available,
    eStopReleased: state.estop_released,
    doorClosed: state.door_closed,
    alarmActive: state.alarm_active,
    lubricationReady: state.lubrication_ready,
    coolantReady: state.coolant_ready,
    referenceComplete: state.reference_complete,
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
