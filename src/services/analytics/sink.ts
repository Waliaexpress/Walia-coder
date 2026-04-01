/**
 * Analytics sink — Walia Nexus edition
 *
 * All routing to Datadog and 1P event logging has been replaced with
 * silent no-operation stubs. No data leaves the process.
 */

/** No-op: Walia Nexus does not initialize analytics gates. */
export function initializeAnalyticsGates(): void {}

/** No-op: Walia Nexus does not attach analytics backends. */
export function initializeAnalyticsSink(): void {}
