// Run with:
//   node --expose-gc --loader ts-node/esm --no-warnings benchmarks/heap-pressure.ts
import v8 from 'v8';
import { GitHubClient } from '../src/GitHubClient.js';
import { runBenchmark, printResult, snapshotHeap } from './utils/metrics.js';
import {
  installFetchMock,
  makeJsonResponse,
  makeListResponse,
  mockUserFixture,
  mockRepoFixture,
  MOCK_TOKEN,
} from './utils/mock-factory.js';
import { readEnvInt, requireExposeGc, forceGc, emitJsonResults } from './utils/bench-helpers.js';

requireExposeGc();

const ITERATIONS = readEnvInt('BENCH_HEAP_ITERATIONS', 5_000);
const LEAK_THRESHOLD_KB = readEnvInt('BENCH_LEAK_THRESHOLD_KB', 500);

async function benchHeapSingleGet(): Promise<void> {
  installFetchMock(() => makeJsonResponse(mockUserFixture));
  const gh = new GitHubClient({ token: MOCK_TOKEN });

  const result = await runBenchmark(
    'Heap: GET /user (single)',
    () => gh.currentUser(),
    { iterations: ITERATIONS, warmupIterations: 100, forceGcBeforeStart: true },
  );

  printResult(result);

  if (result.heapDeltaKb > LEAK_THRESHOLD_KB) {
    console.warn(`  WARN: ${result.heapDeltaKb.toFixed(1)} KB retained after GC — candidates: Date objects, listener closures`);
  }
}

async function benchHeapListParsing(): Promise<void> {
  const link = '<https://api.github.com/users/octocat/repos?page=2>; rel="next", <https://api.github.com/users/octocat/repos?page=5>; rel="last"';
  installFetchMock(() => makeListResponse(Array(30).fill(mockRepoFixture), link));
  const gh = new GitHubClient({ token: MOCK_TOKEN });

  const result = await runBenchmark(
    'Heap: GET list with Link header (parseNextPage regex)',
    () => gh.user('octocat').repos({ per_page: 30 }),
    { iterations: ITERATIONS, warmupIterations: 100, forceGcBeforeStart: true },
  );

  printResult(result);
}

async function benchHeapUrlConstruction(): Promise<void> {
  installFetchMock(() => makeJsonResponse(mockUserFixture));
  const gh = new GitHubClient({ token: MOCK_TOKEN });

  const params = { sort: 'updated', direction: 'desc', per_page: 100, page: 1, type: 'public' } as const;

  const result = await runBenchmark(
    'Heap: URL construction with URLSearchParams (5 params)',
    () => gh.user('octocat').repos(params),
    { iterations: ITERATIONS, warmupIterations: 100, forceGcBeforeStart: true },
  );

  printResult(result);
}

async function benchHeapClientCreation(): Promise<void> {
  installFetchMock(() => makeJsonResponse(mockUserFixture));
  const ctorIterations = Math.min(ITERATIONS, 10_000);

  forceGc();
  const before = v8.getHeapStatistics().used_heap_size;

  for (let i = 0; i < ctorIterations; i++) {
    const gh = new GitHubClient({ token: MOCK_TOKEN });
    void gh;
  }

  forceGc();
  const after = v8.getHeapStatistics().used_heap_size;
  const deltaKb = (after - before) / 1024;
  const bytesPerCtor = (after - before) / ctorIterations;

  console.log(`\n--- Heap: GitHubClient constructor (${ctorIterations.toLocaleString()}x) ---`);
  console.log(`  heap delta after GC: ${deltaKb.toFixed(1)} KB`);
  console.log(`  bytes per ctor     : ${bytesPerCtor.toFixed(1)}`);
  if (deltaKb > 0) {
    console.log('  Candidates: request listener array, cached request adapters, Security instance');
  }
}

async function benchLeakDetection(): Promise<void> {
  installFetchMock(() => makeJsonResponse(mockUserFixture));
  const gh = new GitHubClient({ token: MOCK_TOKEN });

  const EPOCHS = 5;
  const opsPerEpoch = Math.floor(ITERATIONS / EPOCHS);
  const heapSamples: number[] = [];

  console.log(`\n--- Leak detection: ${EPOCHS} epochs × ${opsPerEpoch.toLocaleString()} ops ---`);

  for (let epoch = 0; epoch < EPOCHS; epoch++) {
    for (let i = 0; i < opsPerEpoch; i++) {
      await gh.currentUser();
    }

    forceGc();
    const heapKb = v8.getHeapStatistics().used_heap_size / 1024;
    heapSamples.push(heapKb);
    console.log(`  epoch ${epoch + 1}: heap = ${heapKb.toFixed(1)} KB`);
  }

  const heapGrowthKb = (heapSamples[EPOCHS - 1] ?? 0) - (heapSamples[0] ?? 0);
  console.log(`  total growth across epochs: ${heapGrowthKb.toFixed(1)} KB`);

  if (heapGrowthKb > LEAK_THRESHOLD_KB) {
    console.warn('  WARN: monotonic heap growth detected — possible leak');
    console.warn('  Inspect: event listeners accumulation, uncollected Promises');
  } else {
    console.log(`  OK: heap stable across epochs (Δ ${heapGrowthKb.toFixed(1)} KB)`);
  }
}

async function benchSecurityHeaders(): Promise<void> {
  const { Security } = await import('../src/security/Security.js');
  const security = new Security(MOCK_TOKEN);
  const headerIterations = ITERATIONS * 5;

  forceGc();
  const heapBefore = snapshotHeap();
  const t0 = performance.now();

  for (let i = 0; i < headerIterations; i++) {
    security.getHeaders();
  }

  const elapsed = performance.now() - t0;
  forceGc();
  const heapAfter = snapshotHeap();

  const opsPerSec = Math.round(headerIterations / (elapsed / 1000));
  const nsPerCall = (elapsed / headerIterations) * 1e6;
  const heapDeltaKb = (heapAfter.usedHeapSize - heapBefore.usedHeapSize) / 1024;

  console.log(`\n--- Heap: Security.getHeaders() isolated (${headerIterations.toLocaleString()}x) ---`);
  console.log(`  throughput  : ${opsPerSec.toLocaleString()} ops/s`);
  console.log(`  ns/call     : ${nsPerCall.toFixed(0)}`);
  console.log(`  heap delta  : ${heapDeltaKb.toFixed(1)} KB`);
  console.log('  Note: recreates {Authorization,Accept,Content-Type,X-GitHub-Api-Version} every call');
}

import { performance } from 'perf_hooks';

async function main(): Promise<void> {
  const initialHeapKb = v8.getHeapStatistics().used_heap_size / 1024;

  console.log('=== GitHubClient Heap Pressure Benchmarks ===');
  console.log(`Node.js : ${process.version}`);
  console.log(`iterations : ${ITERATIONS.toLocaleString()}`);
  console.log(`initial heap : ${initialHeapKb.toFixed(1)} KB\n`);

  const results: unknown[] = [];

  await benchHeapSingleGet();
  await benchHeapListParsing();
  await benchHeapUrlConstruction();
  await benchHeapClientCreation();
  await benchLeakDetection();
  await benchSecurityHeaders();

  emitJsonResults(results);
  console.log('\n=== Done ===');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
