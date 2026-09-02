import type { StageKey } from '../domain/workflow';

export interface ScenarioMeta {
  operation: string;
  quantity: number;
  material: string;
  drawingRevision: string;
  cncProgram: string;
  cncRevision: string;
  fixture: string;
  workOffset: string;
}

export const SCENARIO: ScenarioMeta = {
  operation: 'OP20 - Face & Bore Housing',
  quantity: 25,
  material: 'Aluminium 6061-T6',
  drawingRevision: 'DRW-4471 Rev C',
  cncProgram: 'O2040',
  cncRevision: 'Rev 3',
  fixture: 'Vise FX-02 with soft jaws',
  workOffset: 'G54',
};

export interface SeedItem {
  id: string;
  stage: StageKey;
  title: string;
  detail: string;
}

// Ordered list of every confirmable item, across the three checklist stages.
export const ITEM_SEED: SeedItem[] = [
  // Stage 1 - Machine checks
  { id: 'chk-power', stage: 'machine_checks', title: 'Power / control available', detail: 'Control powered on and responsive.' },
  { id: 'chk-estop', stage: 'machine_checks', title: 'E-stop released', detail: 'Emergency stop is reset and not latched.' },
  { id: 'chk-guard', stage: 'machine_checks', title: 'Guard / door closed', detail: 'Enclosure door closed, interlock engaged.' },
  { id: 'chk-alarm', stage: 'machine_checks', title: 'No active alarm', detail: 'Alarm screen is clear.' },
  { id: 'chk-lube', stage: 'machine_checks', title: 'Lubrication / coolant ready', detail: 'Way-lube and coolant levels OK.' },
  { id: 'chk-home', stage: 'machine_checks', title: 'Reference return complete', detail: 'All axes homed (X, Y, Z).' },

  // Stage 2 - Required tools (for CNC program O2040 Rev 3)
  { id: 'tool-t01', stage: 'tools', title: 'T01 - 63mm Face Mill', detail: 'Load in pocket 1. Faces the top surface.' },
  { id: 'tool-t02', stage: 'tools', title: 'T02 - 12mm Flat End Mill', detail: 'Load in pocket 2. Roughs the bore.' },
  { id: 'tool-t03', stage: 'tools', title: 'T03 - 10mm Spot Drill', detail: 'Load in pocket 3. Spots hole centres.' },
  { id: 'tool-t04', stage: 'tools', title: 'T04 - 8.5mm Drill', detail: 'Load in pocket 4. Drills through holes.' },
  { id: 'tool-t05', stage: 'tools', title: 'T05 - 25mm Boring Bar', detail: 'Load in pocket 5. Finish-bores to spec.' },

  // Stage 3 - Workpiece setup
  { id: 'wp-fixture', stage: 'workpiece', title: 'Mount fixture FX-02', detail: 'Bolt vise to table, wipe locating faces.' },
  { id: 'wp-orient', stage: 'workpiece', title: 'Orient workpiece', detail: 'Datum corner front-left, cast face up.' },
  { id: 'wp-clamp', stage: 'workpiece', title: 'Clamp workpiece', detail: 'Torque jaws to 40 Nm, verify part seated.' },
  { id: 'wp-verify', stage: 'workpiece', title: 'Verify material & drawing', detail: 'Aluminium 6061-T6, DRW-4471 Rev C.' },
  { id: 'wp-offset', stage: 'workpiece', title: 'Set work offset G54', detail: 'Edge-find X0 Y0 Z0 to part datum.' },
];
