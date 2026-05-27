import { PerformanceObserver, monitorEventLoopDelay, performance } from 'perf_hooks';
import { setImmediate as yieldToEventLoop } from 'timers/promises';
import v8 from 'v8';
import { forceGc } from './bench-helpers.js';

export interface HeapSnapshot {
  usedHeapSize: number;
  totalHeapSize: number;
  externalMemory: number;
  heapUsedRss: number;
}

export interface GcStats {
  minorCount: number;
  majorCount: number;
  incrementalCount: number;
  totalDurationMs: number;
}

export interface EventLoopStats {
  meanMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
}

export interface BenchmarkResult {
  label: string;
  iterations: number;
  elapsedMs: number;
  throughputOpsPerSec: number;
  heapBefore: HeapSnapshot;
  heapAfter: HeapSnapshot;
  heapDeltaKb: number;
  gcStats: GcStats;
  eventLoop: EventLoopStats;
}

export function snapshotHeap(): HeapSnapshot {
  const s = v8.getHeapStatistics();
  const m = process.memoryUsage();
  return {
    usedHeapSize: s.used_heap_size,
    totalHeapSize: s.total_heap_size,
    externalMemory: s.external_memory,
    heapUsedRss: m.heapUsed,
  };
}

// GC kinds as defined by V8 internals (stable since Node 16)
const GC_KIND_SCAVENGE = 1;
const GC_KIND_MARK_COMPACT = 2;
const GC_KIND_INCREMENTAL = 4;

type GcEntry = PerformanceEntry & { detail?: { kind: number } };

export function setupGcObserver(): { gcStats: GcStats; disconnect: () => void } {
  const gcStats: GcStats = {
    minorCount: 0,
    majorCount: 0,
    incrementalCount: 0,
    totalDurationMs: 0,
  };

  const obs = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as GcEntry[]) {
      const kind = entry.detail?.kind ?? 0;
      gcStats.totalDurationMs += entry.duration;
      if (kind === GC_KIND_SCAVENGE) gcStats.minorCount++;
      else if (kind === GC_KIND_MARK_COMPACT) gcStats.majorCount++;
      else if (kind === GC_KIND_INCREMENTAL) gcStats.incrementalCount++;
    }
  });

  obs.observe({ entryTypes: ['gc'], buffered: false });
  return { gcStats, disconnect: () => obs.disconnect() };
}

export function setupEventLoopMonitor(resolutionMs = 1): {
  disable: () => void;
  getStats: () => EventLoopStats;
} {
  const h = monitorEventLoopDelay({ resolution: resolutionMs });
  h.enable();
  return {
    disable: () => h.disable(),
    getStats: (): EventLoopStats => ({
      meanMs: h.mean / 1e6,
      p50Ms: h.percentile(50) / 1e6,
      p95Ms: h.percentile(95) / 1e6,
      p99Ms: h.percentile(99) / 1e6,
      maxMs: h.max / 1e6,
    }),
  };
}

export async function runBenchmark(
  label: string,
  operation: () => Promise<unknown>,
  options: {
    warmupIterations?: number;
    iterations: number;
    forceGcBeforeStart?: boolean;
  },
): Promise<BenchmarkResult> {
  const { warmupIterations = 50, iterations, forceGcBeforeStart = false } = options;

  for (let i = 0; i < warmupIterations; i++) await operation();

  if (forceGcBeforeStart) forceGc();

  const { gcStats, disconnect: gcDisconnect } = setupGcObserver();
  const elMonitor = setupEventLoopMonitor(1);
  const heapBefore = snapshotHeap();
  await yieldToEventLoop();
  const t0 = performance.now();

  for (let i = 0; i < iterations; i++) await operation();

  const elapsedMs = performance.now() - t0;
  await yieldToEventLoop();
  elMonitor.disable();
  gcDisconnect();

  if (forceGcBeforeStart) forceGc();
  const heapAfter = snapshotHeap();

  return {
    label,
    iterations,
    elapsedMs,
    throughputOpsPerSec: Math.round(iterations / (elapsedMs / 1000)),
    heapBefore,
    heapAfter,
    heapDeltaKb: (heapAfter.usedHeapSize - heapBefore.usedHeapSize) / 1024,
    gcStats,
    eventLoop: elMonitor.getStats(),
  };
}

export function printResult(result: BenchmarkResult): void {
  console.log(`\n--- ${result.label} ---`);
  console.log(`  iterations  : ${result.iterations.toLocaleString()}`);
  console.log(`  elapsed ms  : ${result.elapsedMs.toFixed(2)}`);
  console.log(`  avg op ms   : ${(result.elapsedMs / result.iterations).toFixed(4)}`);
  console.log(`  throughput  : ${result.throughputOpsPerSec.toLocaleString()} ops/s`);
  console.log(`  heap delta  : ${result.heapDeltaKb.toFixed(1)} KB`);
  console.log(`  GC minor    : ${result.gcStats.minorCount}`);
  console.log(`  GC major    : ${result.gcStats.majorCount}`);
  console.log(`  GC total ms : ${result.gcStats.totalDurationMs.toFixed(2)}`);
  const fmt = (v: number) => Number.isNaN(v) ? '<1ms' : v.toFixed(4);
  console.log(`  EL mean ms  : ${fmt(result.eventLoop.meanMs)}`);
  console.log(`  EL p95  ms  : ${fmt(result.eventLoop.p95Ms)}`);
  console.log(`  EL p99  ms  : ${fmt(result.eventLoop.p99Ms)}`);
  console.log(`  EL max  ms  : ${fmt(result.eventLoop.maxMs)}`);
}
