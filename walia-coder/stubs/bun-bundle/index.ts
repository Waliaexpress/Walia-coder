/**
 * Stub for `bun:bundle` Anthropic-internal bundler macros.
 * Returns false for all feature flags — disables internal-only Anthropic
 * features while keeping the public CLI code paths intact.
 */

/**
 * Build-time feature flag.  In the original Anthropic build pipeline this is
 * evaluated by the Bun bundler and tree-shaken.  In the Walia Coder build we
 * return false so every internal feature gate is dormant.
 */
export function feature(_flag: string): boolean {
  return false
}
