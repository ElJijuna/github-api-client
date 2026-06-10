import { performance } from 'perf_hooks';
import v8 from 'v8';
import { GitHubClient } from '../../src/GitHubClient';
import { Security } from '../../src/security/Security';
import {
  makeJsonResponse,
  makeListResponse,
  makeVoidResponse,
  makeGraphQLResponse,
  makeTextResponse,
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

const ITERATIONS = readEnvInt('BENCH_THROUGHPUT_ITERATIONS', 2_000);
// Heap delta without --expose-gc is noisy in Jest — use `npm run bench:heap` for precise analysis.

interface ThroughputResult {
  averageMs: number;
  throughputOpsPerSec: number;
  heapDeltaKb: number;
}

async function measureThroughput(
  operation: () => Promise<unknown>,
  iterations = ITERATIONS,
  warmup = 100,
): Promise<ThroughputResult> {
  for (let i = 0; i < warmup; i++) {
    await operation();
  }

  const heapBefore = v8.getHeapStatistics().used_heap_size;
  const t0 = performance.now();

  for (let i = 0; i < iterations; i++) {
    await operation();
  }

  const elapsed = performance.now() - t0;
  const heapAfter = v8.getHeapStatistics().used_heap_size;

  return {
    averageMs: elapsed / iterations,
    throughputOpsPerSec: Math.round(iterations / (elapsed / 1000)),
    heapDeltaKb: (heapAfter - heapBefore) / 1024,
  };
}

expect.extend({
  toBeWithinAverageMs(received: number, limit: number) {
    const pass = received <= limit;

    return {
      pass,
      message: () => `expected ${received.toFixed(4)}ms average to be <= ${limit}ms`,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinAverageMs(limit: number): R;
    }
  }
}

describe('GitHubClient throughput — all HTTP verbs', () => {
  jest.setTimeout(180_000);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('GET /user — single object throughput', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeJsonResponse(mockUserFixture));
    const gh = new GitHubClient({ token: MOCK_TOKEN });

    const result = await measureThroughput(() => gh.currentUser());

    console.log(
      `GET /user: ${result.throughputOpsPerSec.toLocaleString()} ops/s | avg ${result.averageMs.toFixed(4)}ms | heap Δ ${result.heapDeltaKb.toFixed(1)} KB`,
    );
    expect(result.averageMs).toBeWithinAverageMs(readEnvFloat('BENCH_GET_MAX_AVG_MS', 1));
  });

  it('GET /users/:login/repos — list without Link header', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeListResponse([mockRepoFixture]));
    const gh = new GitHubClient({ token: MOCK_TOKEN });

    const result = await measureThroughput(() => gh.user('octocat').repos({ per_page: 100 }));

    console.log(
      `GET list (no Link): ${result.throughputOpsPerSec.toLocaleString()} ops/s | avg ${result.averageMs.toFixed(4)}ms | heap Δ ${result.heapDeltaKb.toFixed(1)} KB`,
    );
    expect(result.averageMs).toBeWithinAverageMs(readEnvFloat('BENCH_LIST_MAX_AVG_MS', 1));
  });

  it('GET list WITH Link header — parseNextPage regex overhead', async () => {
    const linkHeader =
      '<https://api.github.com/users/octocat/repos?page=2>; rel="next", <https://api.github.com/users/octocat/repos?page=5>; rel="last"';

    global.fetch = jest.fn().mockResolvedValue(makeListResponse([mockRepoFixture], linkHeader));
    const gh = new GitHubClient({ token: MOCK_TOKEN });

    const result = await measureThroughput(() => gh.user('octocat').repos({ per_page: 100 }));

    console.log(
      `GET list (with Link): ${result.throughputOpsPerSec.toLocaleString()} ops/s | avg ${result.averageMs.toFixed(4)}ms | heap Δ ${result.heapDeltaKb.toFixed(1)} KB`,
    );
    expect(result.averageMs).toBeWithinAverageMs(readEnvFloat('BENCH_LIST_LINK_MAX_AVG_MS', 2));
  });

  it('GET raw file content — requestText + getRawHeaders double-spread', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeTextResponse('# README'));
    const gh = new GitHubClient({ token: MOCK_TOKEN });

    const result = await measureThroughput(() =>
      gh.repo('octocat', 'Hello-World').raw('README.md'),
    );

    console.log(
      `GET text: ${result.throughputOpsPerSec.toLocaleString()} ops/s | avg ${result.averageMs.toFixed(4)}ms | heap Δ ${result.heapDeltaKb.toFixed(1)} KB`,
    );
    expect(result.averageMs).toBeWithinAverageMs(readEnvFloat('BENCH_TEXT_MAX_AVG_MS', 1));
  });

  it('POST /gists — requestPost + JSON.stringify overhead', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeJsonResponse(mockGistFixture, 201));
    const gh = new GitHubClient({ token: MOCK_TOKEN });

    const result = await measureThroughput(() =>
      gh.createGist({ files: { 'bench.ts': { content: 'const x = 1;' } }, public: false }),
    );

    console.log(
      `POST: ${result.throughputOpsPerSec.toLocaleString()} ops/s | avg ${result.averageMs.toFixed(4)}ms | heap Δ ${result.heapDeltaKb.toFixed(1)} KB`,
    );
    expect(result.averageMs).toBeWithinAverageMs(readEnvFloat('BENCH_POST_MAX_AVG_MS', 2));
  });

  it('PATCH /notifications/threads/:id — requestPatchVoid path', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeVoidResponse(205));
    const gh = new GitHubClient({ token: MOCK_TOKEN });

    const result = await measureThroughput(() => gh.markNotificationRead('123456789'));

    console.log(
      `PATCH void: ${result.throughputOpsPerSec.toLocaleString()} ops/s | avg ${result.averageMs.toFixed(4)}ms | heap Δ ${result.heapDeltaKb.toFixed(1)} KB`,
    );
    expect(result.averageMs).toBeWithinAverageMs(readEnvFloat('BENCH_PATCH_MAX_AVG_MS', 1));
  });

  it('DELETE /gists/:id — requestDelete path', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeVoidResponse(204));
    const gh = new GitHubClient({ token: MOCK_TOKEN });

    const result = await measureThroughput(() => gh.gist('abc123def456').delete());

    console.log(
      `DELETE: ${result.throughputOpsPerSec.toLocaleString()} ops/s | avg ${result.averageMs.toFixed(4)}ms | heap Δ ${result.heapDeltaKb.toFixed(1)} KB`,
    );
    expect(result.averageMs).toBeWithinAverageMs(readEnvFloat('BENCH_DELETE_MAX_AVG_MS', 1));
  });

  it('PUT /notifications — requestPut void path', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeVoidResponse(205));
    const gh = new GitHubClient({ token: MOCK_TOKEN });

    const result = await measureThroughput(() => gh.markAllNotificationsRead());

    console.log(
      `PUT void: ${result.throughputOpsPerSec.toLocaleString()} ops/s | avg ${result.averageMs.toFixed(4)}ms | heap Δ ${result.heapDeltaKb.toFixed(1)} KB`,
    );
    expect(result.averageMs).toBeWithinAverageMs(readEnvFloat('BENCH_PUT_MAX_AVG_MS', 1));
  });

  it('POST /graphql — requestGraphQL query overhead', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(makeGraphQLResponse({ viewer: { login: 'octocat' } }));
    const gh = new GitHubClient({ token: MOCK_TOKEN });

    const result = await measureThroughput(() =>
      gh.graphql<{ viewer: { login: string } }>('query { viewer { login } }'),
    );

    console.log(
      `GraphQL: ${result.throughputOpsPerSec.toLocaleString()} ops/s | avg ${result.averageMs.toFixed(4)}ms | heap Δ ${result.heapDeltaKb.toFixed(1)} KB`,
    );
    expect(result.averageMs).toBeWithinAverageMs(readEnvFloat('BENCH_GRAPHQL_MAX_AVG_MS', 2));
  });

  it('Security.getHeaders() isolated — object recreation ns/call', () => {
    const security = new Security(MOCK_TOKEN);
    const isolated_iters = ITERATIONS * 5;

    const t0 = performance.now();

    for (let i = 0; i < isolated_iters; i++) {
      security.getHeaders();
    }

    const elapsed = performance.now() - t0;

    const opsPerSec = Math.round(isolated_iters / (elapsed / 1000));
    const nsPerCall = (elapsed / isolated_iters) * 1e6;

    console.log(
      `getHeaders(): ${opsPerSec.toLocaleString()} ops/s | ${nsPerCall.toFixed(0)} ns/call`,
    );
    // No assertion — documents baseline for future optimization of cached headers
  });

  it('buildUrl() with 4 query params — URLSearchParams allocation overhead', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeListResponse([mockRepoFixture]));
    const gh = new GitHubClient({ token: MOCK_TOKEN });

    const params = { sort: 'updated', direction: 'desc', per_page: 100, page: 1 } as const;
    const result = await measureThroughput(() => gh.user('octocat').repos(params));

    console.log(
      `URL(4 params): ${result.throughputOpsPerSec.toLocaleString()} ops/s | avg ${result.averageMs.toFixed(4)}ms`,
    );
    expect(result.averageMs).toBeWithinAverageMs(readEnvFloat('BENCH_URL_PARAMS_MAX_AVG_MS', 2));
  });
});
