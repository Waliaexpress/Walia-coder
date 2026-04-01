/**
 * Walia Coder — Bun build script
 *
 * Plugin stack:
 *   1. bun-bundle-stub       — feature() → false  (kills internal gates)
 *   2. src-alias             — src/* → walia-coder/src/* (via symlink)
 *   3. react-compiler-alias  — react/compiler-runtime → react-compiler-runtime
 *   4. js-resolver           — onResolve:  .js → try .ts/.tsx, or virtual stub
 *   5. js-loader             — onLoad:     .js abspath → serve .ts content / stub
 *   6. bare-stub             — onLoad:     .md/.d.ts → empty stub
 */

import { join, dirname } from 'path'
import { existsSync, mkdirSync } from 'fs'

const WALIA_DIR = import.meta.dir
const SRC_VIA_SYMLINK = join(WALIA_DIR, 'src')
const OUT = join(WALIA_DIR, 'dist')
const STUB_NS = 'walia-stub'

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

// ─── helpers ──────────────────────────────────────────────────────────────────
function tryFindTs(base: string): string | null {
  for (const ext of ['.ts', '.tsx', '.mts']) {
    if (existsSync(base + ext)) return base + ext
  }
  return null
}

// Stub content uses CJS module.exports so Bun skips static named-export
// validation.  A Proxy satisfies any { NamedImport } without knowing the
// export list ahead of time.  All named imports resolve to no-op functions.
function stubContents(label: string): string {
  return `// Walia Coder auto-stub: ${label}
// Source not included; only referenced behind feature() = false gates.
var _stub = new Proxy({}, {
  get: function(_, k) {
    if (k === '__esModule') return true;
    if (k === 'default') return _stub;
    if (k === Symbol.toPrimitive || k === Symbol.iterator) return undefined;
    return function NoOpStub() { return _stub; };
  }
});
module.exports = _stub;
`
}

// ─── 1. bun:bundle stub ───────────────────────────────────────────────────────
const bunBundlePlugin = {
  name: 'bun-bundle-stub',
  setup(build: import('bun').PluginBuilder) {
    build.onResolve({ filter: /^bun:bundle$/ }, () => ({
      path: join(WALIA_DIR, 'stubs', 'bun-bundle', 'index.ts'),
    }))
  },
}

// ─── 2. src/* alias ───────────────────────────────────────────────────────────
const srcAliasPlugin = {
  name: 'src-alias',
  setup(build: import('bun').PluginBuilder) {
    build.onResolve({ filter: /^src\// }, args => ({
      path: join(SRC_VIA_SYMLINK, args.path.slice(4)),
    }))
  },
}

// ─── 3. react/compiler-runtime alias ─────────────────────────────────────────
// React Compiler pre-compiles components with `import { c } from "react/compiler-runtime"`.
// In React 18 this sub-path does not exist; react-compiler-runtime is the polyfill.
const reactCompilerPlugin = {
  name: 'react-compiler-alias',
  setup(build: import('bun').PluginBuilder) {
    build.onResolve({ filter: /^react\/compiler-runtime$/ }, () => ({
      path: join(WALIA_DIR, 'node_modules', 'react-compiler-runtime', 'dist', 'index.js'),
    }))
  },
}

// ─── 4. .js resolver — onResolve ─────────────────────────────────────────────
// Handles "Could not resolve: ./foo.js" errors: Bun couldn't even find the path.
// We try .ts/.tsx; if still missing we return a stub namespace.
const jsResolverPlugin = {
  name: 'js-resolver',
  setup(build: import('bun').PluginBuilder) {
    // Stub namespace loader
    build.onLoad({ filter: /.*/, namespace: STUB_NS }, args => ({
      contents: stubContents(args.path),
      loader: 'js',
    }))

    // Relative .js imports
    build.onResolve({ filter: /\.(js|jsx)$/ }, args => {
      const p = args.path
      if (!p.startsWith('.') && !p.startsWith('/')) return undefined // bare npm import

      let absBase: string
      if (p.startsWith('/')) {
        absBase = p.replace(/\.(js|jsx)$/, '')
      } else {
        absBase = join(dirname(args.importer), p).replace(/\.(js|jsx)$/, '')
      }

      // Check .js first (in case it physically exists)
      const jsPath = absBase + (p.endsWith('.jsx') ? '.jsx' : '.js')
      if (existsSync(jsPath)) return { path: jsPath }

      // Try TypeScript equivalents
      const tsPath = tryFindTs(absBase)
      if (tsPath) return { path: tsPath }

      // Genuinely missing — route to stub
      return { path: p, namespace: STUB_NS }
    })
  },
}

// ─── 5. .js loader — onLoad ───────────────────────────────────────────────────
// Handles "File not found" for absolute .js paths that exist only as .ts.
// (Bun resolves the absolute path itself, then calls onLoad before erroring.)
const jsLoaderPlugin = {
  name: 'js-to-ts-loader',
  setup(build: import('bun').PluginBuilder) {
    build.onLoad({ filter: /\.(js|jsx)$/ }, async (args) => {
      if (existsSync(args.path)) return undefined  // file is fine, pass through

      const base = args.path.replace(/\.(js|jsx)$/, '')
      const tsPath = tryFindTs(base)
      if (tsPath) {
        return {
          contents: await Bun.file(tsPath).text(),
          loader: tsPath.endsWith('.tsx') ? 'tsx' : 'ts',
        }
      }

      // Still missing — return empty stub
      return { contents: stubContents(args.path), loader: 'js' }
    })
  },
}

// ─── 6. Misc text/declaration stubs ──────────────────────────────────────────
const miscStubPlugin = {
  name: 'misc-stub',
  setup(build: import('bun').PluginBuilder) {
    build.onLoad({ filter: /.*/, namespace: 'misc-stub' }, () => ({
      contents: 'export default ""; export const __waliaStub = true;\n',
      loader: 'js',
    }))
    // .md, .txt, and .d.ts text/declaration imports
    build.onResolve({ filter: /\.(md|txt|d\.ts)$/ }, args => ({
      path: args.path,
      namespace: 'misc-stub',
    }))
  },
}

// ─── Build ────────────────────────────────────────────────────────────────────
const OPTIONAL_EXTERNALS = [
  '@anthropic-ai/bedrock-sdk', '@anthropic-ai/vertex-sdk', '@anthropic-ai/foundry-sdk',
  '@azure/identity', '@aws-sdk/client-bedrock', '@aws-sdk/client-sts',
  'fsevents', 'cpu-features', 'ssh2', '@mapbox/node-pre-gyp',
  'node-pre-gyp', 'node-gyp', 'node-addon-api', 'bufferutil', 'utf-8-validate', 'sharp',
  '@opentelemetry/exporter-logs-otlp-grpc', '@opentelemetry/exporter-logs-otlp-http',
  '@opentelemetry/exporter-logs-otlp-proto', '@opentelemetry/exporter-metrics-otlp-grpc',
  '@opentelemetry/exporter-metrics-otlp-http', '@opentelemetry/exporter-metrics-otlp-proto',
  '@opentelemetry/exporter-prometheus', '@opentelemetry/exporter-trace-otlp-grpc',
  '@opentelemetry/exporter-trace-otlp-http', '@opentelemetry/exporter-trace-otlp-proto',
]

console.log('Building Walia Coder…')
console.log(`  Entry : ${join(SRC_VIA_SYMLINK, 'entrypoints', 'cli.tsx')}`)
console.log(`  Output: ${OUT}`)

const result = await Bun.build({
  entrypoints: [join(SRC_VIA_SYMLINK, 'entrypoints', 'cli.tsx')],
  outdir: OUT,
  target: 'bun',
  format: 'esm',
  sourcemap: 'none',
  minify: false,
  splitting: false,
  naming: { entry: 'cli.js' },
  plugins: [
    bunBundlePlugin,
    srcAliasPlugin,
    reactCompilerPlugin,
    jsResolverPlugin,
    jsLoaderPlugin,
    miscStubPlugin,
  ],
  define: {
    'MACRO.VERSION': JSON.stringify('1.0.0'),
    'MACRO.BUILD_TIME': JSON.stringify(new Date().toISOString()),
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  external: OPTIONAL_EXTERNALS,
})

// ─── Output ───────────────────────────────────────────────────────────────────
if (!result.success) {
  console.error('\nBuild failed:')
  for (const log of result.logs) {
    const pos = log.position ? ` (${log.position.file}:${log.position.line})` : ''
    console.error(`  [${log.level.toUpperCase()}] ${log.message}${pos}`)
  }
  process.exit(1)
}

const outFile = join(OUT, 'cli.js')
const content = await Bun.file(outFile).text()
if (!content.startsWith('#!')) {
  await Bun.write(outFile, '#!/usr/bin/env bun\n' + content)
}
await Bun.spawn(['chmod', '+x', outFile]).exited

console.log('')
console.log(`Build succeeded → ${outFile}`)
for (const o of result.outputs) {
  console.log(`  ${o.path}  (${(o.size / 1024).toFixed(1)} KB)`)
}
