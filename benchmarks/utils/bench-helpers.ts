// Env vars recognized by benchmarks:
// BENCH_THROUGHPUT_ITERATIONS  — iterations for Jest throughput tests   (default: 2000)
// BENCH_CONCURRENT_BATCHES     — batches per concurrency level           (default: 20)
// BENCH_HEAP_ITERATIONS        — iterations for heap-pressure script     (default: 5000)
// BENCH_EL_ITERATIONS          — iterations for event-loop-lag script    (default: 3000)
// BENCH_EL_RESOLUTION_MS       — histograma resolution in ms             (default: 1)
// BENCH_LEAK_THRESHOLD_KB      — heap growth threshold for leak warn      (default: 500)
// BENCH_JSON                   — if "1", emit JSON results to stdout

export function readEnvInt(name: string, fallback: number): number {
  const v = Number(process.env[name]);

  return Number.isInteger(v) && v > 0 ? v : fallback;
}

export function readEnvFloat(name: string, fallback: number): number {
  const v = Number(process.env[name]);

  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export function requireExposeGc(): void {
  if (typeof (global as unknown as Record<string, unknown>)['gc'] !== 'function') {
    console.error('Error: run with --expose-gc flag for deterministic GC control');
    console.error('  node --expose-gc --loader ts-node/esm benchmarks/heap-pressure.ts');
    process.exit(1);
  }
}

export function forceGc(): void {
  const g = global as unknown as Record<string, unknown>;

  if (typeof g['gc'] === 'function') {
    (g['gc'] as () => void)();
  }
}

export function emitJsonResults(results: unknown[]): void {
  const { BENCH_JSON } = process.env;

  if (BENCH_JSON === '1') {
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');
  }
}
