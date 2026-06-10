import { performance } from 'perf_hooks';
import { GitHubClient } from '../../src/GitHubClient';
import type { GitHubUser } from '../../src/domain/User';
import type { GitHubRepository } from '../../src/domain/Repository';

const API_URL = 'https://api.github.com';
const TOKEN = 'ghp_perfToken';
const ITERATIONS = readPositiveInt('PERF_ITERATIONS', 1_000);

const mockUser: GitHubUser = {
  id: 1,
  login: 'octocat',
  name: 'The Octocat',
  email: 'octocat@github.com',
  avatar_url: 'https://github.com/images/error/octocat_happy.gif',
  html_url: 'https://github.com/octocat',
  type: 'User',
  site_admin: false,
  public_repos: 2,
  followers: 20,
  following: 0,
  created_at: '2008-01-14T04:33:35Z',
  updated_at: '2008-01-14T04:33:35Z',
};

const mockRepo: GitHubRepository = {
  id: 1296269,
  name: 'Hello-World',
  full_name: 'octocat/Hello-World',
  owner: mockUser,
  private: false,
  description: 'This your first repo!',
  fork: false,
  html_url: 'https://github.com/octocat/Hello-World',
  clone_url: 'https://github.com/octocat/Hello-World.git',
  ssh_url: 'git@github.com:octocat/Hello-World.git',
  default_branch: 'main',
  language: null,
  forks_count: 9,
  stargazers_count: 80,
  watchers_count: 80,
  open_issues_count: 0,
  topics: [],
  archived: false,
  disabled: false,
  visibility: 'public',
  pushed_at: '2011-01-26T19:06:43Z',
  created_at: '2011-01-26T19:01:12Z',
  updated_at: '2011-01-26T19:14:43Z',
};

type FetchMock = jest.Mock<Promise<Response>, Parameters<typeof fetch>>;

function readPositiveInt(name: string, fallback: number): number {
  const value = Number(process.env[name]);

  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function readPositiveFloat(name: string, fallback: number): number {
  const value = Number(process.env[name]);

  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function jsonResponse(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response;
}

function createFetchMock(data: unknown): FetchMock {
  return jest.fn<Promise<Response>, Parameters<typeof fetch>>(async () => jsonResponse(data));
}

async function measureAverageMs(
  operation: () => Promise<unknown>,
  iterations = ITERATIONS,
): Promise<number> {
  for (let i = 0; i < 50; i += 1) {
    await operation();
  }

  const startedAt = performance.now();

  for (let i = 0; i < iterations; i += 1) {
    await operation();
  }

  return (performance.now() - startedAt) / iterations;
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

describe('GitHubClient performance', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps authenticated GET overhead low', async () => {
    const fetchMock = createFetchMock(mockUser);

    global.fetch = fetchMock;
    const gh = new GitHubClient({ token: TOKEN });
    const maxAverageMs = readPositiveFloat('PERF_GET_MAX_AVG_MS', 1);

    const averageMs = await measureAverageMs(() => gh.currentUser());

    expect(averageMs).toBeWithinAverageMs(maxAverageMs);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/user`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      }),
    );
  });

  it('keeps paginated list parsing overhead low', async () => {
    const fetchMock = createFetchMock([mockRepo]);

    global.fetch = fetchMock;
    const gh = new GitHubClient({ token: TOKEN });
    const maxAverageMs = readPositiveFloat('PERF_LIST_MAX_AVG_MS', 1);

    const averageMs = await measureAverageMs(() => gh.user('octocat').repos({ per_page: 100 }));

    expect(averageMs).toBeWithinAverageMs(maxAverageMs);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/octocat/repos?per_page=100`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      }),
    );
  });
});
