import { pool } from '../../db/pool';
import type { ToolState } from './tool.types';
import { HmiError } from '../../errors/HmiError';

/** Read all tools for session 1. */
export async function getAllTools(): Promise<ToolState[]> {
  const { rows } = await pool.query(
    `SELECT id, tool_number, name, required, loaded,
            tool_number_correct, type_correct, offset_available, confirmed
     FROM tools WHERE session_id = 1 ORDER BY id`
  );
  return rows.map(r => ({
    id:                r.id,
    toolNumber:        r.tool_number,
    name:              r.name,
    required:          r.required,
    loaded:            r.loaded,
    toolNumberCorrect: r.tool_number_correct,
    typeCorrect:       r.type_correct,
    offsetAvailable:   r.offset_available,
    confirmed:         r.confirmed,
  }));
}

async function requireTool(id: string): Promise<ToolState> {
  const tools = await getAllTools();
  const tool = tools.find(t => t.id === id);
  if (!tool) throw new HmiError(`Tool ${id} not found`, 404);
  return tool;
}

async function setToolField(id: string, field: string, value: boolean): Promise<void> {
  await pool.query(
    `UPDATE tools SET ${field} = $1, updated_at = NOW() WHERE id = $2 AND session_id = 1`,
    [value, id]
  );
}

export const toolService = {
  getAllTools,

  async loadTool(id: string): Promise<void> {
    await requireTool(id);
    await setToolField(id, 'loaded', true);
  },

  async unloadTool(id: string): Promise<void> {
    await requireTool(id);
    // Unloading also clears confirmation — tool must be re-confirmed after re-loading
    await pool.query(
      `UPDATE tools SET loaded = false, confirmed = false, updated_at = NOW()
       WHERE id = $1 AND session_id = 1`,
      [id]
    );
  },

  async setToolOffset(id: string): Promise<void> {
    await requireTool(id);
    await setToolField(id, 'offset_available', true);
  },

  async confirmTool(id: string): Promise<void> {
    const tool = await requireTool(id);
    // Cannot confirm a tool that isn't loaded and doesn't have an offset
    if (!tool.loaded || !tool.offsetAvailable) {
      throw new HmiError('Tool must be loaded and have offset set before confirming', 409);
    }
    await setToolField(id, 'confirmed', true);
  },

  async resetTool(id: string): Promise<void> {
    await requireTool(id);
    await pool.query(
      `UPDATE tools
       SET offset_available = false, confirmed = false, updated_at = NOW()
       WHERE id = $1 AND session_id = 1`,
      [id]
    );
  },
};
