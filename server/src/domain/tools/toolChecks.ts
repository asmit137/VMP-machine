import type { ToolState, ToolSubstageStatus } from './tool.types';

/** A required tool is ready only when ALL five conditions are satisfied. */
export function isToolReady(tool: ToolState): boolean {
  return (
    tool.required &&
    tool.loaded &&
    tool.toolNumberCorrect &&
    tool.typeCorrect &&
    tool.offsetAvailable &&
    tool.confirmed
  );
}

/** All required tools must be ready before the workflow can advance. */
export function allToolsReady(tools: ToolState[]): boolean {
  return tools.filter(t => t.required).every(t => isToolReady(t));
}

/** Detailed per-tool status for the frontend — includes individual property flags. */
export function getToolStatuses(tools: ToolState[]): ToolSubstageStatus[] {
  return tools.map(tool => ({
    id: tool.id,
    title: `${tool.toolNumber} - ${tool.name}`,
    completed: isToolReady(tool),
    details: {
      loaded:            tool.loaded,
      toolNumberCorrect: tool.toolNumberCorrect,
      typeCorrect:       tool.typeCorrect,
      offsetAvailable:   tool.offsetAvailable,
      confirmed:         tool.confirmed,
    },
  }));
}

/** Returns the properties that prevent a specific tool from being ready. */
export function getToolBlockingReasons(tool: ToolState): string[] {
  const missing: string[] = [];
  if (!tool.loaded)            missing.push('loaded');
  if (!tool.toolNumberCorrect) missing.push('toolNumberCorrect');
  if (!tool.typeCorrect)       missing.push('typeCorrect');
  if (!tool.offsetAvailable)   missing.push('offsetAvailable');
  if (!tool.confirmed)         missing.push('confirmed');
  return missing;
}
