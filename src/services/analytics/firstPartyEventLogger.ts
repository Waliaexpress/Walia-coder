/**
 * First-party event logger — Walia Nexus edition
 *
 * All 1P event logging replaced with silent no-operation stubs.
 * No data is collected or transmitted to Anthropic or any backend.
 */

export type EventSamplingConfig = {
  [eventName: string]: { sample_rate: number }
}

export type GrowthBookExperimentData = {
  experimentKey: string
  variationId: number
  [key: string]: unknown
}

/** Always returns empty sampling config. */
export function getEventSamplingConfig(): EventSamplingConfig { return {} }

/** Always returns null — no sampling applied. */
export function shouldSampleEvent(_eventName: string): number | null { return null }

/** No-op: 1P event logging not initialized. */
export async function shutdown1PEventLogging(): Promise<void> {}

/** Always false — 1P event logging disabled. */
export function is1PEventLoggingEnabled(): boolean { return false }

/** No-op: event discarded silently. */
export function logEventTo1P(_eventName: string, _metadata: Record<string, unknown>): void {}

/** No-op: experiment data discarded silently. */
export function logGrowthBookExperimentTo1P(_data: GrowthBookExperimentData): void {}

/** No-op: 1P event logging not initialized. */
export function initialize1PEventLogging(): void {}

/** No-op: 1P event logging not reinitialized. */
export async function reinitialize1PEventLoggingIfConfigChanged(): Promise<void> {}
