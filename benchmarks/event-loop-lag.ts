// Run with:
//   node --loader ts-node/esm --no-warnings benchmarks/event-loop-lag.ts
import { performance, monitorEventLoopDelay } from 'perf_hooks';
import { setImmediate as yieldToEventLoop } from 'timers/promises';
import { GitHubClient } from '../src/GitHubClient.js';
import {
  installFetchMock,
  makeJsonResponse,
  makeListResponse,
  mockUserFixture,
  mockRepoFixture,
  MOCK_TOKEN,
} from './utils/mock-factory.js';
import { readEnvInt, readEnvFloat } from './utils/bench-helpers.js';

const ITERATIONS = readEnvInt('BENCH_EL_ITERATIONS', 3_000);
const MAX_P99_MS = readEnvFloat('BENCH_EL_MAX_P99_MS', 10);
const EL_RESOLUTION_MS = readEnvInt('BENCH_EL_RESOLUTION_MS', 1);

interface ELResult {
  label: string;
  iterations: number;
  elapsedMs: number;
  meanMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
  exceededThreshold: boolean;
}

async function measureEventLoopLag(
  label: string,
  operation: () => Promise<unknown>,
  iterations = ITERATIONS,
): Promise<ELResult> {
  // warmup before starting the monitor
  for (let i = 0; i < 50; i++) {await operation();}

  const h = monitorEventLoopDelay({ resolution: EL_RESOLUTION_MS });
  h.enable();
  await yieldToEventLoop();
  const t0 = performance.now();

  for (let i = 0; i < iterations; i++) {
    await operation();
  }

  const elapsed = performance.now() - t0;
  await yieldToEventLoop();
  h.disable();

  const result: ELResult = {
    label,
    iterations,
    elapsedMs: elapsed,
    meanMs: h.mean / 1e6,
    p50Ms: h.percentile(50) / 1e6,
    p95Ms: h.percentile(95) / 1e6,
    p99Ms: h.percentile(99) / 1e6,
    maxMs: h.max / 1e6,
    exceededThreshold: h.percentile(99) / 1e6 > MAX_P99_MS,
  };

  console.log(`\n--- ${label} ---`);
  console.log(`  iterations  : ${iterations.toLocaleString()}`);
  console.log(`  elapsed ms  : ${elapsed.toFixed(2)}`);
  console.log(`  avg op ms   : ${(elapsed / iterations).toFixed(4)}`);
  const fmt = (v: number) => Number.isNaN(v) ? '<1ms' : v.toFixed(4);
  console.log(`  EL mean ms  : ${fmt(result.meanMs)}`);
  console.log(`  EL p50  ms  : ${fmt(result.p50Ms)}`);
  console.log(`  EL p95  ms  : ${fmt(result.p95Ms)}`);
  console.log(`  EL p99  ms  : ${fmt(result.p99Ms)}`);
  console.log(`  EL max  ms  : ${fmt(result.maxMs)}`);

  if (result.exceededThreshold) {
    console.log(`  WARN: p99 (${result.p99Ms.toFixed(2)}ms) exceeds threshold (${MAX_P99_MS}ms)`);
  }

  return result;
}

async function main(): Promise<void> {
  console.log('=== GitHubClient Event Loop Lag Benchmarks ===');
  console.log(`Node.js    : ${process.version}`);
  console.log(`iterations : ${ITERATIONS.toLocaleString()}`);
  console.log(`p99 limit  : ${MAX_P99_MS}ms`);
  console.log(`EL res     : ${EL_RESOLUTION_MS}ms\n`);

  // 1. Serial GET /user — baseline lag per await
  installFetchMock(() => makeJsonResponse(mockUserFixture));
  let gh = new GitHubClient({ token: MOCK_TOKEN });
  await measureEventLoopLag('EL: serial GET /user (baseline)', () => gh.currentUser());

  // 2. Serial GET list + Link header — regex path in event loop
  const link = '<https://api.github.com/users/octocat/repos?page=2>; rel="next", <https://api.github.com/users/octocat/repos?page=5>; rel="last"';
  installFetchMock(() => makeListResponse(Array(30).fill(mockRepoFixture), link));
  gh = new GitHubClient({ token: MOCK_TOKEN });
  await measureEventLoopLag(
    'EL: serial GET list with Link header (parseNextPage regex)',
    () => gh.user('octocat').repos(),
  );

  // 3. Serial GET list — no Link header (regex short-circuit)
  installFetchMock(() => makeListResponse([mockRepoFixture]));
  gh = new GitHubClient({ token: MOCK_TOKEN });
  await measureEventLoopLag(
    'EL: serial GET list without Link header (regex skipped)',
    () => gh.user('octocat').repos(),
  );

  // 4. URL construction with many params — URLSearchParams cost in EL
  installFetchMock(() => makeListResponse([mockRepoFixture]));
  gh = new GitHubClient({ token: MOCK_TOKEN });
  await measureEventLoopLag(
    'EL: URL construction (5 query params)',
    () => gh.user('octocat').repos({ sort: 'updated', direction: 'desc', per_page: 100, page: 1, type: 'public' }),
  );

  // 5. Concurrent batches — event loop lag under Promise.all pressure
  installFetchMock(() => makeJsonResponse(mockUserFixture));
  gh = new GitHubClient({ token: MOCK_TOKEN });

  for (const concurrency of [10, 50, 100] as const) {
    const batchIterations = Math.max(Math.floor(ITERATIONS / concurrency), 50);
    await measureEventLoopLag(
      `EL: Promise.all(${concurrency}) concurrent GETs`,
      async () => {
        await Promise.all(Array.from({ length: concurrency }, () => gh.currentUser()));
      },
      batchIterations,
    );
  }

  // 6. Listeners with JSON serialization — simulates real logging in the EL
  installFetchMock(() => makeJsonResponse(mockUserFixture));
  gh = new GitHubClient({ token: MOCK_TOKEN });
  for (let i = 0; i < 10; i++) {
    gh.on('request', (event) => {
      void JSON.stringify(event);
    });
  }

  await measureEventLoopLag(
    'EL: GET /user with 10 JSON-serializing listeners',
    () => gh.currentUser(),
  );

  // 7. Empty listeners — isolates listener fanout from serialization cost
  installFetchMock(() => makeJsonResponse(mockUserFixture));
  gh = new GitHubClient({ token: MOCK_TOKEN });
  for (let i = 0; i < 10; i++) {
    gh.on('request', () => {
      // intentionally empty
    });
  }

  await measureEventLoopLag(
    'EL: GET /user with 10 empty listeners (array fanout only)',
    () => gh.currentUser(),
  );

  console.log('\n=== Done ===');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
