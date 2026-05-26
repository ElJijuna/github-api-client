import type { GitHubUser } from '../../src/domain/User.js';
import type { GitHubRepository } from '../../src/domain/Repository.js';
import type { GitHubGist } from '../../src/domain/Gist.js';

export const MOCK_TOKEN = 'ghp_benchToken';
export const MOCK_API_URL = 'https://api.github.com';

export const mockUserFixture: GitHubUser = Object.freeze({
  id: 1,
  login: 'octocat',
  name: 'The Octocat',
  email: 'octocat@github.com',
  avatar_url: 'https://github.com/images/error/octocat_happy.gif',
  html_url: 'https://github.com/octocat',
  type: 'User' as const,
  site_admin: false,
  public_repos: 2,
  followers: 20,
  following: 0,
  created_at: '2008-01-14T04:33:35Z',
  updated_at: '2008-01-14T04:33:35Z',
});

export const mockRepoFixture: GitHubRepository = Object.freeze({
  id: 1296269,
  name: 'Hello-World',
  full_name: 'octocat/Hello-World',
  owner: mockUserFixture,
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
  visibility: 'public' as const,
  pushed_at: '2011-01-26T19:06:43Z',
  created_at: '2011-01-26T19:01:12Z',
  updated_at: '2011-01-26T19:14:43Z',
});

export const mockGistFixture: GitHubGist = Object.freeze({
  id: 'abc123def456',
  description: 'bench gist',
  public: false,
  owner: mockUserFixture,
  user: null,
  files: {
    'bench.ts': Object.freeze({
      filename: 'bench.ts',
      type: 'text/plain',
      language: 'TypeScript',
      raw_url: 'https://gist.githubusercontent.com/raw/bench.ts',
      size: 12,
    }),
  },
  comments: 0,
  comments_url: 'https://api.github.com/gists/abc123def456/comments',
  html_url: 'https://gist.github.com/abc123def456',
  git_pull_url: 'https://gist.github.com/abc123def456.git',
  git_push_url: 'https://gist.github.com/abc123def456.git',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  node_id: 'G_abc123',
});

export function makeJsonResponse(data: unknown, status = 200): Response {
  return {
    ok: true,
    status,
    statusText: 'OK',
    headers: new Headers(),
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response;
}

export function makeListResponse(data: unknown[], linkHeader?: string): Response {
  const headers = new Headers();
  if (linkHeader) headers.set('Link', linkHeader);
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response;
}

export function makeVoidResponse(status = 204): Response {
  return {
    ok: true,
    status,
    statusText: 'No Content',
    headers: new Headers(),
    json: async () => undefined,
    text: async () => '',
  } as Response;
}

export function makeGraphQLResponse<T>(data: T): Response {
  return makeJsonResponse({ data });
}

export function makeTextResponse(content: string): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    json: async () => undefined,
    text: async () => content,
  } as Response;
}

export function installFetchMock(responseFn: (url: string) => Response): void {
  (global as typeof globalThis & { fetch: typeof fetch }).fetch =
    async (url: RequestInfo | URL) => responseFn(String(url));
}
