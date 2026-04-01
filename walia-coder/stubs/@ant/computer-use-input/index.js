/**
 * Graceful no-op stub for @ant/computer-use-input
 * All imports from this package are `import type` only, so this file
 * only needs to exist.  The `inputLoader.ts` consumer reads `isSupported`
 * before calling any method, so an object with isSupported=false is safe.
 */
export const ComputerUseInputAPI = {
  isSupported: false,
}
export const ComputerUseInput = {}
