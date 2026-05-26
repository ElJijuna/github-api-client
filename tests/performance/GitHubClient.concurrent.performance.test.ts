import { performance } from 'perf_hooks';
import v8 from 'v8';
import { GitHubClient } from '../../src/GitHubClient';
import {
  makeJsonResponse,
  makeListResponse,
  makeVoidResponse,
  mockUserFixture,
  mockRepoFixture,
  mockGistFixture,
  MOCK_TOKEN,
} from '../../benchmarks/utils/mock-factory';

function readEnvInt(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isInteger(v) && v > 0 ? v : fallback;
}

function readEnvFloat(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

const BATCHES = readEnvInt('BENCH_CONCURRENT_BATCHES', 20);
const MAX_HEAP_KB = readEnvFloat('BENCH_CONCURRENT_MAX_HEAP_KB', 10_240);
const MAX_DEGRADATION = readEnvFloat('BENCH_MAX_LISTENER_DEGRADATION', 0.50);

const CONCURRENCY_LEVELS = [10, 50, 100] as const;

expect.extend({
  toHaveAcceptableThroughput(received: number, minOpsPerSec: number) {
    const pass = minOpsPerSec === 0 || received >= minOpsPerSec;
    return {
      pass,
      message: () => `expected ${received.toLocaleString()} ops/s to be >= ${minOpsPerSec.toLocaleString()} ops/s`,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveAcceptableThroughput(minOpsPerSec: number): R;
    }
  }
}

describe('GitHubClient concurrency benchmarks', () => {
  jest.setTimeout(300_000);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  for (const concurrency of CONCURRENCY_LEVELS) {
    it(`Promise.all(${concurrency}) concurrent GET requests — ${BATCHES} batches`, async () => {
      global.fetch = jest.fn().mockResolvedValue(makeJsonResponse(mockUserFixture));
      const gh = new GitHubClient({ token: MOCK_TOKEN });

      // warmup
      for (let b = 0; b < 5; b++) {
        await Promise.all(Array.from({ length: concurrency }, () => gh.currentUser()));
      }

      const heapBefore = v8.getHeapStatistics().used_heap_size;
      const t0 = performance.now();

      for (let b = 0; b < BATCHES; b++) {
        await Promise.all(Array.from({ length: concurrency }, () => gh.currentUser()));
      }

      const elapsed = performance.now() - t0;
      const heapAfter = v8.getHeapStatistics().used_heap_size;

      const totalOps = concurrency * BATCHES;
      const throughput = Math.round(totalOps / (elapsed / 1000));
      const heapDeltaKb = (heapAfter - heapBefore) / 1024;
      const avgBatchMs = elapsed / BATCHES;

      console.log(
        `[c=${concurrency}] ${throughput.toLocaleString()} ops/s | ` +
        `avg batch ${avgBatchMs.toFixed(2)}ms | heap Δ ${heapDeltaKb.toFixed(1)} KB`,
      );

      expect(throughput).toHaveAcceptableThroughput(
        readEnvInt(`BENCH_CONCURRENT_${concurrency}_MIN_OPS`, 0),
      );
      expect(heapDeltaKb).toBeLessThan(MAX_HEAP_KB);
    });
  }

  it('Promise.all(100) mixed HTTP methods — detects accidental serialization', async () => {
    global.fetch = jest.fn().mockImplementation(
      async (_url: RequestInfo | URL, init?: RequestInit) => {
        const method = init?.method ?? 'GET';
        const url = String(_url);
        if (method === 'GET' && url.includes('/users/')) return makeListResponse([mockRepoFixture]);
        if (method === 'POST') return makeJsonResponse(mockGistFixture, 201);
        return makeJsonResponse(mockUserFixture);
      },
    );
    const gh = new GitHubClient({ token: MOCK_TOKEN });

    // warmup
    await Promise.all([
      gh.currentUser(),
      gh.user('octocat').repos(),
      gh.createGist({ files: { 'f.ts': { content: 'x' } }, public: false }),
    ]);

    const t0 = performance.now();
    const ops = Array.from({ length: 100 }, (_, i) => {
      if (i % 3 === 0) return gh.currentUser();
      if (i % 3 === 1) return gh.user('octocat').repos();
      return gh.createGist({ files: { 'f.ts': { content: 'x' } }, public: false });
    });
    await Promise.all(ops);
    const elapsed = performance.now() - t0;

    console.log(`Mixed 100 concurrent ops: ${elapsed.toFixed(2)}ms total`);
    expect(elapsed).toBeLessThan(readEnvFloat('BENCH_MIXED_MAX_ELAPSED_MS', 500));
  });

  it('emit() Map overhead — 0 vs 1 vs 10 listeners under c=50 concurrency', async () => {
    const results: Record<string, number> = {};

    for (const listenerCount of [0, 1, 10]) {
      global.fetch = jest.fn().mockResolvedValue(makeJsonResponse(mockUserFixture));
      const gh = new GitHubClient({ token: MOCK_TOKEN });

      for (let n = 0; n < listenerCount; n++) {
        gh.on('request', () => {
          // empty listener — only exercises the Map iteration path
        });
      }

      // warmup
      for (let b = 0; b < 5; b++) {
        await Promise.all(Array.from({ length: 50 }, () => gh.currentUser()));
      }

      const t0 = performance.now();
      for (let b = 0; b < BATCHES; b++) {
        await Promise.all(Array.from({ length: 50 }, () => gh.currentUser()));
      }
      const elapsed = performance.now() - t0;

      const throughput = Math.round((50 * BATCHES) / (elapsed / 1000));
      results[`listeners_${listenerCount}`] = throughput;
      console.log(`[listeners=${listenerCount}] ${throughput.toLocaleString()} ops/s`);

      jest.restoreAllMocks();
    }

    const baseline = results['listeners_0'] ?? 1;
    const withTen = results['listeners_10'] ?? 0;
    const degradation = (baseline - withTen) / baseline;
    console.log(`Listener degradation (0→10): ${(degradation * 100).toFixed(1)}%`);
    expect(degradation).toBeLessThan(MAX_DEGRADATION);
  });

  it('emit() with serializing listeners — simulates real logging overhead under c=50', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeJsonResponse(mockUserFixture));
    const gh = new GitHubClient({ token: MOCK_TOKEN });

    for (let i = 0; i < 3; i++) {
      gh.on('request', (event) => {
        // Simulates a JSON-based logger serializing the event
        void JSON.stringify(event);
      });
    }

    // warmup
    for (let b = 0; b < 5; b++) {
      await Promise.all(Array.from({ length: 50 }, () => gh.currentUser()));
    }

    const t0 = performance.now();
    for (let b = 0; b < BATCHES; b++) {
      await Promise.all(Array.from({ length: 50 }, () => gh.currentUser()));
    }
    const elapsed = performance.now() - t0;
    const throughput = Math.round((50 * BATCHES) / (elapsed / 1000));

    console.log(`[3 JSON listeners, c=50] ${throughput.toLocaleString()} ops/s | ${elapsed.toFixed(2)}ms total`);
    expect(throughput).toHaveAcceptableThroughput(0);
  });

  it('AbortSignal cancellation — overhead of passing signal to every request', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeVoidResponse(204));
    const gh = new GitHubClient({ token: MOCK_TOKEN });

    const iters = readEnvInt('BENCH_THROUGHPUT_ITERATIONS', 2_000);
    const warmup = 100;
    for (let i = 0; i < warmup; i++) {
      const ac = new AbortController();
      await gh.markAllNotificationsRead(ac.signal);
    }

    const t0 = performance.now();
    for (let i = 0; i < iters; i++) {
      const ac = new AbortController();
      await gh.markAllNotificationsRead(ac.signal);
    }
    const elapsed = performance.now() - t0;
    const avgMs = elapsed / iters;
    const opsPerSec = Math.round(iters / (elapsed / 1000));

    console.log(`AbortSignal per-request: ${opsPerSec.toLocaleString()} ops/s | avg ${avgMs.toFixed(4)}ms`);
    // No hard limit — documents the cost of creating AbortController per request
  });
});
