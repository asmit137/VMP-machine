import { pool } from '../../db/pool';
import type { ToolState } from './tool.types';
import { HmiError } from '../../errors/HmiError';

export async function getAllTools(): Promise<ToolState[]> {
  const { rows } = await pool.query(
    `SELECT id, tool_number, name, required, loaded,
            tool_number_correct, type_correct, offset_available, confirmed
     FROM tools WHERE session_id = 1 ORDER BY id`
  );
  
  return rows.map(row => ({
    id: row.id,
    toolNumber: row.tool_number,
    name: row.name,
    required: row.required,
    loaded: row.loaded,
    toolNumberCorrect: row.tool_number_correct,
    typeCorrect: row.type_correct,
    offsetAvailable: row.offset_available,
    confirmed: row.confirmed,
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
