/**
 * Datadog analytics — Walia Nexus edition
 *
 * All Datadog telemetry replaced with silent no-operation stubs.
 * No data is sent to any external endpoint.
 */

/** No-op: Walia Nexus does not initialize Datadog. */
export const initializeDatadog = async (): Promise<boolean> => false

/** No-op: Walia Nexus does not use Datadog. */
export async function shutdownDatadog(): Promise<void> {}

/** No-op: event discarded silently. */
export async function trackDatadogEvent(
  _eventName: string,
  _metadata: Record<string, unknown>,
): Promise<void> {}
