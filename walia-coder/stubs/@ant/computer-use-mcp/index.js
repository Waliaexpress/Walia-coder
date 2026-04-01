/**
 * Graceful no-op stub for @ant/computer-use-mcp
 * All exports return safe defaults so that code paths that check
 * `isSupported` or similar flags stay dormant rather than crashing.
 */

// Runtime constants used in executor.ts
export const API_RESIZE_PARAMS = { width: 1280, height: 800 }
export const DEFAULT_GRANT_FLAGS = {}
export const CoordinateMode = { Scale: 'scale', Logical: 'logical' }

// Functions that return safe no-op values
export function targetImageSize(_geometry) {
  return { width: 1280, height: 800 }
}

export function buildComputerUseTools() {
  return []
}

export function bindSessionContext(_ctx) {
  return () => {}
}

export function getSentinelCategory(_bundleId) {
  return null
}

// Type-only classes/interfaces referenced as values in some guards
export class ComputerExecutor {}
