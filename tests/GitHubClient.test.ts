import { GitHubClient } from '../src/GitHubClient';
import { GitHubApiError } from '../src/errors/GitHubApiError';
import type { GitHubUser } from '../src/domain/User';
import type { GitHubOrganization } from '../src/domain/Organization';
import type { GitHubRepository, RepoLanguages } from '../src/domain/Repository';
import type { GitHubPullRequest } from '../src/domain/PullRequest';
import type { GitHubCommit } from '../src/domain/Commit';
import type { GitHubBranch } from '../src/domain/Branch';
import type { GitHubTag } from '../src/domain/Tag';
import type { GitHubRelease, CreateReleaseData } from '../src/domain/Release';
import type { GitHubWebhook } from '../src/domain/Webhook';
import type { GitHubReview, GitHubReviewComment } from '../src/domain/Review';
import type { MergeResult } from '../src/domain/PullRequest';
import type { GitHubPullRequestFile } from '../src/domain/PullRequestFile';
import type { GitHubCommitStatus, GitHubCombinedStatus, GitHubCommitComment } from '../src/domain/CommitStatus';
import type { GitHubIssue } from '../src/domain/Issue';
import type { GitHubEvent } from '../src/domain/Event';
import type { GitHubAdvisory, GitHubRepositoryAdvisory } from '../src/domain/Advisory';
import type { ContributionCalendar } from '../src/domain/Contribution';
import type { SocialAccount } from '../src/domain/User';

const API_URL = 'https://api.github.com';
const TOKEN = 'ghp_myToken';

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

const mockOrg: GitHubOrganization = {
  id: 9919,
  login: 'github',
  name: 'GitHub',
  description: 'How people build software.',
  avatar_url: 'https://github.com/images/error/octocat_happy.gif',
  html_url: 'https://github.com/github',
  repos_url: 'https://api.github.com/orgs/github/repos',
  public_repos: 355,
  public_gists: 0,
  followers: 0,
  following: 0,
  created_at: '2008-05-11T04:37:31Z',
  updated_at: '2014-03-03T18:58:10Z',
  type: 'Organization',
};

const mockLanguages: RepoLanguages = {
  TypeScript: 123456,
  JavaScript: 78901,
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

const mockPullRequest: GitHubPullRequest = {
  id: 1,
  number: 1,
  title: 'Amazing new feature',
  body: 'Please pull these awesome changes',
  state: 'open',
  locked: false,
  merged: false,
  mergeable: null,
  merge_commit_sha: null,
  merged_at: null,
  closed_at: null,
  created_at: '2011-01-26T19:01:12Z',
  updated_at: '2011-01-26T19:01:12Z',
  user: mockUser,
  assignees: [],
  requested_reviewers: [],
  labels: [],
  milestone: null,
  head: {
    ref: 'new-topic',
    sha: 'abc123def456',
    label: 'octocat:new-topic',
    repo: mockRepo,
    user: mockUser,
  },
  base: {
    ref: 'main',
    sha: '0000000',
    label: 'octocat:main',
    repo: mockRepo,
    user: mockUser,
  },
  draft: false,
  html_url: 'https://github.com/octocat/Hello-World/pull/1',
  commits: 1,
  additions: 10,
  deletions: 2,
  changed_files: 1,
  merged_by: null,
  review_comments: 0,
  comments: 0,
};

const mockCommit: GitHubCommit = {
  sha: 'abc123def456',
  commit: {
    message: 'feat: add new feature',
    author: { name: 'The Octocat', email: 'octocat@github.com', date: '2011-01-26T19:01:12Z' },
    committer: { name: 'The Octocat', email: 'octocat@github.com', date: '2011-01-26T19:01:12Z' },
  },
  author: mockUser,
  committer: mockUser,
  parents: [],
  html_url: 'https://github.com/octocat/Hello-World/commit/abc123def456',
};

const mockBranch: GitHubBranch = {
  name: 'main',
  protected: false,
  commit: { sha: 'abc123', url: 'https://api.github.com/repos/octocat/Hello-World/commits/abc123' },
};

const mockTag: GitHubTag = {
  name: 'v1.0.0',
  commit: { sha: 'abc123', url: 'https://api.github.com/repos/octocat/Hello-World/commits/abc123' },
  zipball_url: 'https://api.github.com/repos/octocat/Hello-World/zipball/v1.0.0',
  tarball_url: 'https://api.github.com/repos/octocat/Hello-World/tarball/v1.0.0',
  node_id: 'MDM6UmVm...',
};

const mockRelease: GitHubRelease = {
  id: 1,
  tag_name: 'v1.0.0',
  name: 'v1.0.0',
  body: 'Release notes',
  draft: false,
  prerelease: false,
  created_at: '2013-02-27T19:35:32Z',
  published_at: '2013-02-27T19:35:32Z',
  author: mockUser,
  html_url: 'https://github.com/octocat/Hello-World/releases/tag/v1.0.0',
  tarball_url: 'https://api.github.com/repos/octocat/Hello-World/tarball/v1.0.0',
  zipball_url: 'https://api.github.com/repos/octocat/Hello-World/zipball/v1.0.0',
  assets: [],
};

const mockWebhook: GitHubWebhook = {
  id: 1,
  name: 'web',
  active: true,
  events: ['push', 'pull_request'],
  config: { url: 'https://example.com/webhook', content_type: 'json' },
  created_at: '2019-06-03T00:57:16Z',
  updated_at: '2019-06-03T00:57:16Z',
  ping_url: 'https://api.github.com/repos/octocat/Hello-World/hooks/1/pings',
  deliveries_url: 'https://api.github.com/repos/octocat/Hello-World/hooks/1/deliveries',
};

const mockMergeResult: MergeResult = {
  sha: 'abc123def456',
  merged: true,
  message: 'Pull Request successfully merged',
};

const mockReview: GitHubReview = {
  id: 80,
  user: mockUser,
  body: 'LGTM',
  state: 'APPROVED',
  html_url: 'https://github.com/octocat/Hello-World/pull/1#pullrequestreview-80',
  submitted_at: '2019-01-15T23:58:30Z',
  commit_id: 'abc123def456',
};

const mockReviewComment: GitHubReviewComment = {
  id: 10,
  user: mockUser,
  body: 'Great stuff!',
  created_at: '2011-04-14T16:00:49Z',
  updated_at: '2011-04-14T16:00:49Z',
  html_url: 'https://github.com/octocat/Hello-World/pull/1#discussion_r10',
  path: 'file.txt',
  position: 1,
  diff_hunk: '@@ -16,33 +16,40 @@',
  commit_id: 'abc123def456',
  pull_request_review_id: 80,
};

const mockFile: GitHubPullRequestFile = {
  sha: 'bbcd538c8e72b8c175046e27cc8f907076331401',
  filename: 'file.txt',
  status: 'added',
  additions: 124,
  deletions: 4,
  changes: 128,
  blob_url: 'https://github.com/octocat/Hello-World/blob/abc123/file.txt',
  raw_url: 'https://github.com/octocat/Hello-World/raw/abc123/file.txt',
  contents_url: 'https://api.github.com/repos/octocat/Hello-World/contents/file.txt',
  patch: '@@ -52,7 +52,7 @@',
};

const mockStatus: GitHubCommitStatus = {
  id: 1,
  state: 'success',
  description: 'Build passed',
  target_url: 'https://ci.example.com/1',
  context: 'ci/circleci',
  created_at: '2012-07-20T01:19:13Z',
  updated_at: '2012-07-20T01:19:13Z',
  creator: mockUser,
};

const mockCombinedStatus: GitHubCombinedStatus = {
  state: 'success',
  statuses: [mockStatus],
  sha: 'abc123def456',
  total_count: 1,
  repository: mockRepo,
};

const mockGlobalAdvisory: GitHubAdvisory = {
  ghsa_id: 'GHSA-1234-5678-9abc',
  cve_id: 'CVE-2023-12345',
  url: 'https://api.github.com/advisories/GHSA-1234-5678-9abc',
  html_url: 'https://github.com/advisories/GHSA-1234-5678-9abc',
  summary: 'Remote code execution via crafted input',
  description: 'A vulnerability in...',
  type: 'reviewed',
  severity: 'critical',
  source_code_location: null,
  identifiers: [{ type: 'GHSA', value: 'GHSA-1234-5678-9abc' }],
  references: ['https://example.com/vuln'],
  published_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-02T00:00:00Z',
  withdrawn_at: null,
  vulnerabilities: [],
  cvss: { score: 9.8, vector_string: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H' },
  cwes: [{ cwe_id: 'CWE-94', name: 'Improper Control of Generation of Code' }],
  credits: null,
};

const mockRepoAdvisory: GitHubRepositoryAdvisory = {
  ghsa_id: 'GHSA-1234-5678-9abc',
  cve_id: null,
  url: 'https://api.github.com/repos/octocat/Hello-World/security-advisories/GHSA-1234-5678-9abc',
  html_url: 'https://github.com/octocat/Hello-World/security/advisories/GHSA-1234-5678-9abc',
  summary: 'Remote code execution via crafted input',
  description: 'A vulnerability in...',
  severity: 'critical',
  author: mockUser,
  publisher: null,
  identifiers: [{ type: 'GHSA', value: 'GHSA-1234-5678-9abc' }],
  state: 'draft',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-02T00:00:00Z',
  published_at: null,
  closed_at: null,
  withdrawn_at: null,
  submission: null,
  vulnerabilities: [],
  cvss: null,
  cwes: null,
  credits: null,
  credits_detailed: null,
  collaborating_users: null,
  collaborating_teams: null,
  private_fork: null,
};

const mockCommitComment: GitHubCommitComment = {
  id: 42,
  body: 'Looks good!',
  user: mockUser,
  created_at: '2012-07-20T01:19:13Z',
  updated_at: '2012-07-20T01:19:13Z',
  html_url: 'https://github.com/octocat/Hello-World/commit/abc123def456#commitcomment-42',
  commit_id: 'abc123def456',
  path: null,
  position: null,
  line: null,
};

function pagedOf<T>(...values: T[]) {
  return values;
}

function makeLinkHeader(nextPage: number): string {
  return `<https://api.github.com/resource?page=${nextPage}>; rel="next", <https://api.github.com/resource?page=5>; rel="last"`;
}

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = jest.fn();
  global.fetch = fetchMock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

function mockJsonResponse(data: unknown, headers: Record<string, string> = {}, status = 200) {
  fetchMock.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : status === 404 ? 'Not Found' : 'Error',
    json: async () => data,
    text: async () => (typeof data === 'string' ? data : JSON.stringify(data)),
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? null,
    },
  });
}

function mockTextResponse(text: string, status = 200) {
  fetchMock.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    text: async () => text,
    json: async () => { throw new Error('not json'); },
    headers: { get: () => null },
  });
}

function mockPatchResponse(data: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status,
    statusText: 'OK',
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: { get: () => null },
  });
}

function mockDeleteResponse(status = 204) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status,
    statusText: 'No Content',
    json: async () => ({}),
    text: async () => '',
    headers: { get: () => null },
  });
}

function mockPostResponse(data: unknown, status = 201) {
  fetchMock.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 201 ? 'Created' : 'OK',
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: { get: () => null },
  });
}

function mockErrorResponse(status: number, statusText: string) {
  fetchMock.mockResolvedValueOnce({
    ok: false,
    status,
    statusText,
    json: async () => ({}),
    text: async () => '',
    headers: { get: () => null },
  });
}

describe('GitHubClient constructor', () => {
  it('creates a client with default API URL', () => {
    expect(() => new GitHubClient({ token: TOKEN })).not.toThrow();
  });

  it('creates a client with a custom API URL', () => {
    expect(() => new GitHubClient({ token: TOKEN, apiUrl: 'https://github.example.com/api/v3' })).not.toThrow();
  });

  it('creates a client without any options (unauthenticated)', () => {
    expect(() => new GitHubClient()).not.toThrow();
  });

  it('creates a client with empty options (unauthenticated)', () => {
    expect(() => new GitHubClient({})).not.toThrow();
  });

  it('creates a client with only apiUrl and no token', () => {
    expect(() => new GitHubClient({ apiUrl: 'https://api.github.com' })).not.toThrow();
  });

  it('throws TypeError for an invalid API URL', () => {
    expect(() => new GitHubClient({ token: TOKEN, apiUrl: 'not-a-url' })).toThrow(TypeError);
  });
});

describe('GitHubClient.currentUser()', () => {
  it('fetches the authenticated user', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockUser);

    const result = await gh.currentUser();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/user`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }) }),
    );
    expect(result).toEqual(mockUser);
  });

  it('throws GitHubApiError on 401', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(401, 'Unauthorized');

    try {
      await gh.currentUser();
      fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(GitHubApiError);
      expect((err as GitHubApiError).status).toBe(401);
    }
  });
});

describe('GitHubClient.user(login)', () => {
  it('fetches user info when awaited directly', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockUser);

    const result = await gh.user('octocat');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/octocat`,
      expect.anything(),
    );
    expect(result.login).toBe('octocat');
  });

  it('fetches user repos', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockRepo));

    const result = await gh.user('octocat').repos();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/octocat/repos`,
      expect.anything(),
    );
    expect(result.values).toHaveLength(1);
    expect(result.hasNextPage).toBe(false);
  });

  it('parses the Link header for pagination', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockRepo), { link: makeLinkHeader(2) });

    const result = await gh.user('octocat').repos({ per_page: 1 });

    expect(result.hasNextPage).toBe(true);
    expect(result.nextPage).toBe(2);
  });

  it('forwards per_page and page params', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockRepo));

    await gh.user('octocat').repos({ per_page: 50, page: 2 });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/octocat/repos?per_page=50&page=2`,
      expect.anything(),
    );
  });

  it('fetches user followers', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockUser));

    const result = await gh.user('octocat').followers();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/octocat/followers`,
      expect.anything(),
    );
    expect(result.values[0].login).toBe('octocat');
  });

  it('fetches user following', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockUser));

    await gh.user('octocat').following();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/octocat/following`,
      expect.anything(),
    );
  });

  it('fetches public events for a user', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    const mockEvent: GitHubEvent = {
      id: '123456789',
      type: 'PushEvent',
      actor: {
        id: 1,
        login: 'octocat',
        avatar_url: 'https://github.com/images/error/octocat_happy.gif',
        url: 'https://api.github.com/users/octocat',
        gravatar_id: '',
      },
      repo: {
        id: 1296269,
        name: 'octocat/Hello-World',
        url: 'https://api.github.com/repos/octocat/Hello-World',
      },
      payload: { push_id: 1, size: 1, distinct_size: 1, ref: 'refs/heads/main' },
      public: true,
      created_at: '2011-09-06T17:26:27Z',
    };
    mockJsonResponse(pagedOf(mockEvent));

    const result = await gh.user('octocat').publicEvents();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/octocat/events/public`,
      expect.anything(),
    );
    expect(result.values[0].type).toBe('PushEvent');
    expect(result.values[0].public).toBe(true);
  });

  it('forwards per_page and page params to publicEvents', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse([]);

    await gh.user('octocat').publicEvents({ per_page: 10, page: 2 });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/octocat/events/public?per_page=10&page=2`,
      expect.anything(),
    );
  });
});

describe('GitHubClient.org(name)', () => {
  it('fetches org info when awaited directly', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockOrg);

    const result = await gh.org('github');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/orgs/github`,
      expect.anything(),
    );
    expect(result.login).toBe('github');
  });

  it('fetches org repos', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockRepo));

    const result = await gh.org('github').repos({ type: 'public' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/orgs/github/repos?type=public`,
      expect.anything(),
    );
    expect(result.values[0].name).toBe('Hello-World');
  });

  it('fetches org members', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockUser));

    const result = await gh.org('github').members({ role: 'admin' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/orgs/github/members?role=admin`,
      expect.anything(),
    );
    expect(result.values[0].login).toBe('octocat');
  });
});

describe('OrganizationResource.createRepo()', () => {
  it('creates a repository and returns it', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({ ...mockRepo, name: 'new-repo', full_name: 'github/new-repo', private: true });

    const result = await gh.org('github').createRepo({ name: 'new-repo', private: true });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/orgs/github/repos`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'new-repo', private: true }),
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      }),
    );
    expect(result.name).toBe('new-repo');
    expect(result.private).toBe(true);
  });

  it('passes all optional fields in the request body', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse(mockRepo);

    await gh.org('github').createRepo({
      name: 'my-repo',
      description: 'A new repo',
      private: false,
      auto_init: true,
      gitignore_template: 'Node',
      license_template: 'mit',
      delete_branch_on_merge: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/orgs/github/repos`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'my-repo',
          description: 'A new repo',
          private: false,
          auto_init: true,
          gitignore_template: 'Node',
          license_template: 'mit',
          delete_branch_on_merge: true,
        }),
      }),
    );
  });

  it('throws GitHubApiError on 422 (validation failed)', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(422, 'Unprocessable Entity');

    await expect(gh.org('github').createRepo({ name: 'invalid name!' })).rejects.toThrow(GitHubApiError);
  });
});

describe('GitHubClient.repo(owner, name)', () => {
  it('fetches repo info when awaited directly', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockRepo);

    const result = await gh.repo('octocat', 'Hello-World');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World`,
      expect.anything(),
    );
    expect(result.full_name).toBe('octocat/Hello-World');
  });

  it('also accessible via org().repo()', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockRepo);

    const result = await gh.org('github').repo('linguist');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/github/linguist`,
      expect.anything(),
    );
    expect(result.name).toBe('Hello-World');
  });

  it('also accessible via user().repo()', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockRepo);

    await gh.user('octocat').repo('Hello-World');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World`,
      expect.anything(),
    );
  });
});

describe('RepositoryResource', () => {
  describe('pullRequests()', () => {
    it('fetches pull requests', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockPullRequest));

      const result = await gh.repo('octocat', 'Hello-World').pullRequests({ state: 'open' });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/pulls?state=open`,
        expect.anything(),
      );
      expect(result.values[0].number).toBe(1);
    });
  });

  describe('languages()', () => {
    it('fetches repo languages', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(mockLanguages);

      const result = await gh.repo('octocat', 'Hello-World').languages();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/languages`,
        expect.anything(),
      );
      expect(result).toEqual(mockLanguages);
    });
  });

  describe('commits()', () => {
    it('fetches commits', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockCommit));

      const result = await gh.repo('octocat', 'Hello-World').commits({ per_page: 10 });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/commits?per_page=10`,
        expect.anything(),
      );
      expect(result.values[0].sha).toBe('abc123def456');
    });
  });

  describe('branches()', () => {
    it('fetches branches', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockBranch));

      const result = await gh.repo('octocat', 'Hello-World').branches();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/branches`,
        expect.anything(),
      );
      expect(result.values[0].name).toBe('main');
    });

    it('filters protected branches', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockBranch));

      await gh.repo('octocat', 'Hello-World').branches({ protected: true });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/branches?protected=true`,
        expect.anything(),
      );
    });
  });

  describe('branch()', () => {
    it('fetches a single branch by name', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(mockBranch);

      const result = await gh.repo('octocat', 'Hello-World').branch('main');

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/branches/main`,
        expect.anything(),
      );
      expect(result.name).toBe('main');
    });
  });

  describe('tags()', () => {
    it('fetches tags', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockTag));

      const result = await gh.repo('octocat', 'Hello-World').tags();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/tags`,
        expect.anything(),
      );
      expect(result.values[0].name).toBe('v1.0.0');
    });
  });

  describe('releases()', () => {
    it('fetches releases', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockRelease));

      const result = await gh.repo('octocat', 'Hello-World').releases();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/releases`,
        expect.anything(),
      );
      expect(result.values[0].tag_name).toBe('v1.0.0');
    });
  });

  describe('latestRelease()', () => {
    it('fetches the latest release', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(mockRelease);

      const result = await gh.repo('octocat', 'Hello-World').latestRelease();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/releases/latest`,
        expect.anything(),
      );
      expect(result.tag_name).toBe('v1.0.0');
    });
  });

  describe('release()', () => {
    it('fetches a release by id', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(mockRelease);

      const result = await gh.repo('octocat', 'Hello-World').release(1);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/releases/1`,
        expect.anything(),
      );
      expect(result.tag_name).toBe('v1.0.0');
    });
  });

  describe('createRelease()', () => {
    it('creates a release', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      const data: CreateReleaseData = { tag_name: 'v1.1.0', name: 'v1.1.0', body: 'Changelog' };
      mockPostResponse({ ...mockRelease, tag_name: 'v1.1.0' });

      const result = await gh.repo('octocat', 'Hello-World').createRelease(data);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/releases`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        }),
      );
      expect(result.tag_name).toBe('v1.1.0');
    });
  });

  describe('updateRelease()', () => {
    it('updates a release', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse({ ...mockRelease, draft: false });

      const result = await gh.repo('octocat', 'Hello-World').updateRelease(1, { draft: false });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/releases/1`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ draft: false }),
        }),
      );
      expect(result.draft).toBe(false);
    });
  });

  describe('deleteRelease()', () => {
    it('deletes a release', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockDeleteResponse();

      await gh.repo('octocat', 'Hello-World').deleteRelease(1);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/releases/1`,
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('forks()', () => {
    it('fetches forks', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockRepo));

      const result = await gh.repo('octocat', 'Hello-World').forks({ sort: 'newest' });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/forks?sort=newest`,
        expect.anything(),
      );
      expect(result.values).toHaveLength(1);
    });
  });

  describe('webhooks()', () => {
    it('fetches webhooks', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockWebhook));

      const result = await gh.repo('octocat', 'Hello-World').webhooks();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/hooks`,
        expect.anything(),
      );
      expect(result.values[0].id).toBe(1);
    });
  });

  describe('raw()', () => {
    it('fetches raw file content with Accept: vnd.github.raw+json', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockTextResponse('# Hello World');

      const content = await gh.repo('octocat', 'Hello-World').raw('README.md');

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/contents/README.md`,
        expect.objectContaining({
          headers: expect.objectContaining({ Accept: 'application/vnd.github.raw+json' }),
        }),
      );
      expect(content).toBe('# Hello World');
    });

    it('passes ref param', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockTextResponse('content');

      await gh.repo('octocat', 'Hello-World').raw('README.md', { ref: 'dev' });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/contents/README.md?ref=dev`,
        expect.anything(),
      );
    });
  });

  describe('multipleRaw()', () => {
    it('fetches multiple raw files and maps content by file path', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockTextResponse('# Hello World');
      mockTextResponse('export const ok = true;');

      const content = await gh.repo('octocat', 'Hello-World').multipleRaw(
        ['README.md', 'src/index.ts'],
        { ref: 'main' },
      );

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/contents/README.md?ref=main`,
        expect.objectContaining({
          headers: expect.objectContaining({ Accept: 'application/vnd.github.raw+json' }),
        }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/contents/src/index.ts?ref=main`,
        expect.objectContaining({
          headers: expect.objectContaining({ Accept: 'application/vnd.github.raw+json' }),
        }),
      );
      expect(content).toEqual({
        'README.md': '# Hello World',
        'src/index.ts': 'export const ok = true;',
      });
    });

    it('omits files that fail to fetch', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockTextResponse('# Hello World');
      mockTextResponse('not found', 404);

      const content = await gh.repo('octocat', 'Hello-World').multipleRaw(['README.md', 'missing.md']);

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(content).toEqual({ 'README.md': '# Hello World' });
    });
  });

  describe('topics()', () => {
    it('fetches repository topics', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse({ names: ['typescript', 'api-client'] });

      const topics = await gh.repo('octocat', 'Hello-World').topics();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/topics`,
        expect.anything(),
      );
      expect(topics).toEqual(['typescript', 'api-client']);
    });
  });

  describe('contributors()', () => {
    it('fetches contributors', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf({ login: 'octocat', id: 1, contributions: 32 }));

      const result = await gh.repo('octocat', 'Hello-World').contributors();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/contributors`,
        expect.anything(),
      );
      expect(result.values[0].contributions).toBe(32);
    });
  });
});

describe('PullRequestResource', () => {
  describe('get()', () => {
    it('fetches the pull request when awaited directly', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(mockPullRequest);

      const result = await gh.repo('octocat', 'Hello-World').pullRequest(1);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/pulls/1`,
        expect.anything(),
      );
      expect(result.number).toBe(1);
    });
  });

  describe('commits()', () => {
    it('fetches PR commits', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockCommit));

      const result = await gh.repo('octocat', 'Hello-World').pullRequest(1).commits();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/pulls/1/commits`,
        expect.anything(),
      );
      expect(result.values[0].sha).toBe('abc123def456');
    });
  });

  describe('files()', () => {
    it('fetches changed files', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockFile));

      const result = await gh.repo('octocat', 'Hello-World').pullRequest(1).files();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/pulls/1/files`,
        expect.anything(),
      );
      expect(result.values[0].filename).toBe('file.txt');
      expect(result.values[0].status).toBe('added');
    });
  });

  describe('reviews()', () => {
    it('fetches PR reviews', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockReview));

      const result = await gh.repo('octocat', 'Hello-World').pullRequest(1).reviews();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/pulls/1/reviews`,
        expect.anything(),
      );
      expect(result.values[0].state).toBe('APPROVED');
    });
  });

  describe('reviewComments()', () => {
    it('fetches inline review comments', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockReviewComment));

      const result = await gh.repo('octocat', 'Hello-World').pullRequest(1).reviewComments();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/pulls/1/comments`,
        expect.anything(),
      );
      expect(result.values[0].body).toBe('Great stuff!');
    });
  });

  describe('merge()', () => {
    it('merges the pull request with default options', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockPostResponse(mockMergeResult, 200);

      const result = await gh.repo('octocat', 'Hello-World').pullRequest(1).merge();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/pulls/1/merge`,
        expect.objectContaining({ method: 'PUT' }),
      );
      expect(result.merged).toBe(true);
      expect(result.sha).toBe('abc123def456');
    });

    it('passes merge options in the request body', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockPostResponse(mockMergeResult, 200);

      await gh.repo('octocat', 'Hello-World').pullRequest(1).merge({
        merge_method: 'squash',
        commit_title: 'Squash merge',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/pulls/1/merge`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ merge_method: 'squash', commit_title: 'Squash merge' }),
        }),
      );
    });
  });

  describe('createReview()', () => {
    it('submits an approval review', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockPostResponse(mockReview);

      const result = await gh.repo('octocat', 'Hello-World').pullRequest(1).createReview({
        event: 'APPROVE',
        body: 'LGTM',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/pulls/1/reviews`,
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.state).toBe('APPROVED');
    });
  });

  describe('requestReviewers()', () => {
    it('requests reviewers on the pull request', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockPostResponse(mockPullRequest);

      const result = await gh.repo('octocat', 'Hello-World').pullRequest(1).requestReviewers({
        reviewers: ['octocat'],
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/pulls/1/requested_reviewers`,
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.number).toBe(1);
    });
  });

  describe('addComment()', () => {
    it('adds an inline diff comment to the pull request', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockPostResponse(mockReviewComment);

      const result = await gh.repo('octocat', 'Hello-World').pullRequest(1).addComment({
        body: 'Great stuff!',
        commit_id: 'abc123def456',
        path: 'file.txt',
        position: 1,
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/pulls/1/comments`,
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.body).toBe('Great stuff!');
      expect(result.path).toBe('file.txt');
    });
  });

  describe('update()', () => {
    it('updates pull request metadata', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockPatchResponse({ ...mockPullRequest, title: 'Updated title' });

      const result = await gh.repo('octocat', 'Hello-World').pullRequest(1).update({
        title: 'Updated title',
        state: 'closed',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/pulls/1`,
        expect.objectContaining({ method: 'PATCH' }),
      );
      expect(result.title).toBe('Updated title');
    });
  });
});

describe('CommitResource', () => {
  describe('get()', () => {
    it('fetches commit info when awaited directly', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(mockCommit);

      const result = await gh.repo('octocat', 'Hello-World').commit('abc123def456');

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/commits/abc123def456`,
        expect.anything(),
      );
      expect(result.sha).toBe('abc123def456');
    });
  });

  describe('statuses()', () => {
    it('fetches commit statuses', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockStatus));

      const result = await gh.repo('octocat', 'Hello-World').commit('abc123def456').statuses();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/statuses/abc123def456`,
        expect.anything(),
      );
      expect(result.values[0].state).toBe('success');
    });
  });

  describe('combinedStatus()', () => {
    it('fetches the combined commit status', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(mockCombinedStatus);

      const result = await gh.repo('octocat', 'Hello-World').commit('abc123def456').combinedStatus();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/commits/abc123def456/status`,
        expect.anything(),
      );
      expect(result.state).toBe('success');
      expect(result.total_count).toBe(1);
    });
  });

  describe('createStatus()', () => {
    it('posts a new commit status', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockPostResponse(mockStatus);

      const result = await gh.repo('octocat', 'Hello-World').commit('abc123def456').createStatus({
        state: 'success',
        context: 'ci/circleci',
        description: 'Build passed',
        target_url: 'https://ci.example.com/1',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/statuses/abc123def456`,
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.state).toBe('success');
      expect(result.context).toBe('ci/circleci');
    });
  });

  describe('comments()', () => {
    it('fetches commit comments', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf(mockCommitComment));

      const result = await gh.repo('octocat', 'Hello-World').commit('abc123def456').comments();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/commits/abc123def456/comments`,
        expect.anything(),
      );
      expect(result.values[0].body).toBe('Looks good!');
      expect(result.values[0].commit_id).toBe('abc123def456');
    });
  });

  describe('addComment()', () => {
    it('posts a new commit comment', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockPostResponse(mockCommitComment);

      const result = await gh.repo('octocat', 'Hello-World').commit('abc123def456').addComment({
        body: 'Looks good!',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/commits/abc123def456/comments`,
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.body).toBe('Looks good!');
      expect(result.id).toBe(42);
    });
  });
});

describe('GitHubClient.searchRepos()', () => {
  it('searches for repositories and returns totalCount', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse({ total_count: 1, incomplete_results: false, items: [mockRepo] });

    const result = await gh.searchRepos({ q: 'language:typescript' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/search/repositories?q=language%3Atypescript`,
      expect.anything(),
    );
    expect(result.values[0].name).toBe('Hello-World');
    expect(result.totalCount).toBe(1);
    expect(result.hasNextPage).toBe(false);
  });

  it('parses pagination from Link header on search results', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(
      { total_count: 100, incomplete_results: false, items: [mockRepo] },
      { link: makeLinkHeader(2) },
    );

    const result = await gh.searchRepos({ q: 'stars:>1000', per_page: 1 });

    expect(result.hasNextPage).toBe(true);
    expect(result.nextPage).toBe(2);
    expect(result.totalCount).toBe(100);
  });
});

describe('Error handling', () => {
  it('throws GitHubApiError with status and statusText on non-2xx response', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(404, 'Not Found');

    try {
      await gh.repo('octocat', 'nonexistent').get();
      fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(GitHubApiError);
      const apiErr = err as GitHubApiError;
      expect(apiErr.status).toBe(404);
      expect(apiErr.statusText).toBe('Not Found');
      expect(apiErr.message).toBe('GitHub API error: 404 Not Found');
    }
  });

  it('throws GitHubApiError on 403 Forbidden', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(403, 'Forbidden');

    await expect(gh.currentUser()).rejects.toThrow(GitHubApiError);
  });
});

describe('Request event emission', () => {
  it('emits request events with timing info', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockUser);

    const events: unknown[] = [];
    gh.on('request', (event) => events.push(event));

    await gh.currentUser();

    expect(events).toHaveLength(1);
    const event = events[0] as { url: string; method: string; statusCode: number; durationMs: number };
    expect(event.url).toBe(`${API_URL}/user`);
    expect(event.method).toBe('GET');
    expect(event.statusCode).toBe(200);
    expect(typeof event.durationMs).toBe('number');
  });

  it('emits request events with error on failed requests', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(404, 'Not Found');

    const events: unknown[] = [];
    gh.on('request', (event) => events.push(event));

    await gh.currentUser().catch(() => { });

    expect(events).toHaveLength(1);
    const event = events[0] as { error: Error; statusCode: number };
    expect(event.error).toBeInstanceOf(GitHubApiError);
    expect(event.statusCode).toBe(404);
  });

  it('supports multiple listeners', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockUser);

    const calls: number[] = [];
    gh.on('request', () => calls.push(1));
    gh.on('request', () => calls.push(2));

    await gh.currentUser();

    expect(calls).toEqual([1, 2]);
  });

  it('on() returns the client for chaining', () => {
    const gh = new GitHubClient({ token: TOKEN });
    const result = gh.on('request', () => { });
    expect(result).toBe(gh);
  });
});

describe('Request headers', () => {
  it('sends Bearer token authorization', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockUser);

    await gh.currentUser();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        }),
      }),
    );
  });

  it('omits Authorization header when no token is provided', async () => {
    const gh = new GitHubClient();
    mockJsonResponse(pagedOf(mockRepo));

    await gh.repo('octocat', 'Hello-World').branches();

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(init.headers).not.toHaveProperty('Authorization');
    expect(init.headers).toMatchObject({
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    });
  });

  it('makes unauthenticated requests to public endpoints', async () => {
    const gh = new GitHubClient();
    mockJsonResponse(mockUser);

    const result = await gh.user('octocat');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/octocat`,
      expect.anything(),
    );
    expect(result.login).toBe('octocat');
  });
});

describe('Custom API URL (GitHub Enterprise)', () => {
  it('uses custom apiUrl for all requests', async () => {
    const gh = new GitHubClient({ token: TOKEN, apiUrl: 'https://github.example.com/api/v3' });
    mockJsonResponse(mockUser);

    await gh.currentUser();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://github.example.com/api/v3/user',
      expect.anything(),
    );
  });
});

const mockIssue: GitHubIssue = {
  id: 1,
  number: 1,
  title: 'Found a bug',
  body: 'Something is wrong',
  state: 'open',
  locked: false,
  user: mockUser,
  assignees: [],
  labels: [],
  milestone: null,
  created_at: '2011-04-22T13:33:48Z',
  updated_at: '2011-04-22T13:33:48Z',
  closed_at: null,
  comments: 0,
  html_url: 'https://github.com/octocat/Hello-World/issues/1',
};

describe('RepositoryResource.createFork()', () => {
  it('creates a fork with no data', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse(mockRepo);

    const result = await gh.repo('octocat', 'Hello-World').createFork();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/forks`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.name).toBe('Hello-World');
  });

  it('creates a fork with an organization target', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({ ...mockRepo, full_name: 'my-org/Hello-World' });

    const result = await gh.repo('octocat', 'Hello-World').createFork({ organization: 'my-org' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/forks`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ organization: 'my-org' }),
      }),
    );
    expect(result.full_name).toBe('my-org/Hello-World');
  });
});

describe('RepositoryResource.createWebhook()', () => {
  it('creates a webhook and returns it', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse(mockWebhook);

    const result = await gh.repo('octocat', 'Hello-World').createWebhook({
      config: { url: 'https://example.com/webhook', content_type: 'json' },
      events: ['push'],
      active: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/hooks`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'web',
          config: { url: 'https://example.com/webhook', content_type: 'json' },
          events: ['push'],
          active: true,
        }),
      }),
    );
    expect(result.id).toBe(1);
    expect(result.active).toBe(true);
  });
});

describe('RepositoryResource.updateWebhook()', () => {
  it('updates a webhook and returns the updated webhook', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPatchResponse({ ...mockWebhook, events: ['push', 'pull_request', 'release'] });

    const result = await gh.repo('octocat', 'Hello-World').updateWebhook(1, {
      events: ['push', 'pull_request', 'release'],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/hooks/1`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ events: ['push', 'pull_request', 'release'] }),
      }),
    );
    expect(result.events).toEqual(['push', 'pull_request', 'release']);
  });
});

describe('RepositoryResource.deleteWebhook()', () => {
  it('deletes a webhook and returns void', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockDeleteResponse();

    await gh.repo('octocat', 'Hello-World').deleteWebhook(1);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/hooks/1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

describe('RepositoryResource.issues()', () => {
  it('fetches issues', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockIssue));

    const result = await gh.repo('octocat', 'Hello-World').issues({ state: 'open' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/issues?state=open`,
      expect.anything(),
    );
    expect(result.values[0].number).toBe(1);
  });
});

describe('RepositoryResource.createIssue()', () => {
  it('creates an issue and returns it', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse(mockIssue);

    const result = await gh.repo('octocat', 'Hello-World').createIssue({
      title: 'Found a bug',
      body: 'Something is wrong',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/issues`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Found a bug', body: 'Something is wrong' }),
      }),
    );
    expect(result.title).toBe('Found a bug');
    expect(result.state).toBe('open');
  });
});

describe('RepositoryResource.labels()', () => {
  const mockLabel = { id: 1, name: 'bug', color: 'ee0701', description: 'Something broken', default: true };

  it('fetches labels', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockLabel));

    const result = await gh.repo('octocat', 'Hello-World').labels();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/labels`,
      expect.anything(),
    );
    expect(result.values[0].name).toBe('bug');
  });

  it('fetches a single label by name', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockLabel);

    const result = await gh.repo('octocat', 'Hello-World').label('bug');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/labels/bug`,
      expect.anything(),
    );
    expect(result.color).toBe('ee0701');
  });

  it('creates a label', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse(mockLabel);

    const result = await gh.repo('octocat', 'Hello-World').createLabel({ name: 'bug', color: 'ee0701' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/labels`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'bug', color: 'ee0701' }),
      }),
    );
    expect(result.name).toBe('bug');
  });

  it('updates a label', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse({ ...mockLabel, color: 'ff0000' });

    const result = await gh.repo('octocat', 'Hello-World').updateLabel('bug', { color: 'ff0000' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/labels/bug`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ color: 'ff0000' }),
      }),
    );
    expect(result.color).toBe('ff0000');
  });

  it('deletes a label', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockDeleteResponse();

    await gh.repo('octocat', 'Hello-World').deleteLabel('wontfix');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/labels/wontfix`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('encodes label name with spaces in URL', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse({ ...mockLabel, name: 'good first issue' });

    await gh.repo('octocat', 'Hello-World').label('good first issue');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/labels/good%20first%20issue`,
      expect.anything(),
    );
  });
});

describe('RepositoryResource.milestones()', () => {
  const mockMilestone = {
    id: 1,
    number: 1,
    title: 'v1.0',
    description: 'First release',
    state: 'open' as const,
    due_on: '2025-12-31T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    closed_at: null,
    open_issues: 5,
    closed_issues: 2,
  };

  it('fetches milestones', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockMilestone));

    const result = await gh.repo('octocat', 'Hello-World').milestones({ state: 'open' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/milestones?state=open`,
      expect.anything(),
    );
    expect(result.values[0].title).toBe('v1.0');
  });

  it('fetches a single milestone by number', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockMilestone);

    const result = await gh.repo('octocat', 'Hello-World').milestone(1);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/milestones/1`,
      expect.anything(),
    );
    expect(result.number).toBe(1);
  });

  it('creates a milestone', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse(mockMilestone);

    const result = await gh.repo('octocat', 'Hello-World').createMilestone({ title: 'v1.0', due_on: '2025-12-31T00:00:00Z' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/milestones`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'v1.0', due_on: '2025-12-31T00:00:00Z' }),
      }),
    );
    expect(result.title).toBe('v1.0');
  });

  it('updates a milestone', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse({ ...mockMilestone, state: 'closed' });

    const result = await gh.repo('octocat', 'Hello-World').updateMilestone(1, { state: 'closed' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/milestones/1`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ state: 'closed' }),
      }),
    );
    expect(result.state).toBe('closed');
  });

  it('deletes a milestone', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockDeleteResponse();

    await gh.repo('octocat', 'Hello-World').deleteMilestone(1);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/milestones/1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

describe('IssueResource', () => {
  describe('get()', () => {
    it('fetches the issue when awaited directly', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(mockIssue);

      const result = await gh.repo('octocat', 'Hello-World').issue(1);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/issues/1`,
        expect.anything(),
      );
      expect(result.number).toBe(1);
      expect(result.title).toBe('Found a bug');
    });
  });

  describe('comments()', () => {
    it('fetches issue comments', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse(pagedOf({
        id: 1,
        body: 'Me too!',
        user: mockUser,
        created_at: '2011-04-14T16:00:49Z',
        updated_at: '2011-04-14T16:00:49Z',
        html_url: 'https://github.com/octocat/Hello-World/issues/1#issuecomment-1',
      }));

      const result = await gh.repo('octocat', 'Hello-World').issue(1).comments();

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/issues/1/comments`,
        expect.anything(),
      );
      expect(result.values[0].body).toBe('Me too!');
    });
  });

  describe('addComment()', () => {
    it('posts a comment to the issue', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      const mockComment = {
        id: 42,
        body: 'Thanks for the report!',
        user: mockUser,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        html_url: 'https://github.com/octocat/Hello-World/issues/1#issuecomment-42',
      };
      mockPostResponse(mockComment);

      const result = await gh.repo('octocat', 'Hello-World').issue(1).addComment('Thanks for the report!');

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/issues/1/comments`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ body: 'Thanks for the report!' }),
        }),
      );
      expect(result.body).toBe('Thanks for the report!');
    });
  });

  describe('update()', () => {
    it('closes an issue', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse({ ...mockIssue, state: 'closed' });

      const result = await gh.repo('octocat', 'Hello-World').issue(1).update({ state: 'closed', state_reason: 'completed' });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/issues/1`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ state: 'closed', state_reason: 'completed' }),
        }),
      );
      expect(result.state).toBe('closed');
    });

    it('updates title and assignees', async () => {
      const gh = new GitHubClient({ token: TOKEN });
      mockJsonResponse({ ...mockIssue, title: 'New title' });

      await gh.repo('octocat', 'Hello-World').issue(1).update({ title: 'New title', assignees: ['octocat'] });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/repos/octocat/Hello-World/issues/1`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ title: 'New title', assignees: ['octocat'] }),
        }),
      );
    });
  });
});

describe('GitHubClient.advisories()', () => {
  it('fetches global advisories with params', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockGlobalAdvisory));

    const result = await gh.advisories({ severity: 'critical', ecosystem: 'npm' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/advisories?severity=critical&ecosystem=npm`,
      expect.anything(),
    );
    expect(result.values[0].ghsa_id).toBe('GHSA-1234-5678-9abc');
    expect(result.values[0].severity).toBe('critical');
  });

  it('fetches global advisories without params', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockGlobalAdvisory));

    const result = await gh.advisories();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/advisories`,
      expect.anything(),
    );
    expect(result.values).toHaveLength(1);
  });
});

describe('GitHubClient.advisory()', () => {
  it('fetches a single global advisory by GHSA ID', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockGlobalAdvisory);

    const result = await gh.advisory('GHSA-1234-5678-9abc');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/advisories/GHSA-1234-5678-9abc`,
      expect.anything(),
    );
    expect(result.ghsa_id).toBe('GHSA-1234-5678-9abc');
    expect(result.cve_id).toBe('CVE-2023-12345');
  });
});

describe('RepositoryResource.repoAdvisories()', () => {
  it('fetches repository advisories with params', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockRepoAdvisory));

    const result = await gh.repo('octocat', 'Hello-World').repoAdvisories({ state: 'draft' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/security-advisories?state=draft`,
      expect.anything(),
    );
    expect(result.values[0].ghsa_id).toBe('GHSA-1234-5678-9abc');
    expect(result.values[0].state).toBe('draft');
  });
});

describe('RepositoryResource.createAdvisory()', () => {
  it('creates an advisory draft and returns it', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse(mockRepoAdvisory);

    const result = await gh.repo('octocat', 'Hello-World').createAdvisory({
      summary: 'Remote code execution via crafted input',
      description: 'A vulnerability in...',
      severity: 'critical',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/security-advisories`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          summary: 'Remote code execution via crafted input',
          description: 'A vulnerability in...',
          severity: 'critical',
        }),
      }),
    );
    expect(result.summary).toBe('Remote code execution via crafted input');
    expect(result.state).toBe('draft');
  });
});

describe('RepositoryResource.repoAdvisory()', () => {
  it('fetches a single repository advisory by GHSA ID', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockRepoAdvisory);

    const result = await gh.repo('octocat', 'Hello-World').repoAdvisory('GHSA-1234-5678-9abc');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/security-advisories/GHSA-1234-5678-9abc`,
      expect.anything(),
    );
    expect(result.ghsa_id).toBe('GHSA-1234-5678-9abc');
    expect(result.severity).toBe('critical');
  });
});

describe('RepositoryResource.updateAdvisory()', () => {
  it('updates a repository advisory and returns it', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPatchResponse({ ...mockRepoAdvisory, state: 'published', published_at: '2023-02-01T00:00:00Z' });

    const result = await gh.repo('octocat', 'Hello-World').updateAdvisory('GHSA-1234-5678-9abc', {
      state: 'published',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/security-advisories/GHSA-1234-5678-9abc`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ state: 'published' }),
      }),
    );
    expect(result.state).toBe('published');
    expect(result.published_at).toBe('2023-02-01T00:00:00Z');
  });
});

describe('RepositoryResource.requestCve()', () => {
  it('submits a CVE request and returns the updated advisory', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({ ...mockRepoAdvisory, submission: { accepted: true } });

    const result = await gh.repo('octocat', 'Hello-World').requestCve('GHSA-1234-5678-9abc');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/security-advisories/GHSA-1234-5678-9abc/cve`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.submission).toEqual({ accepted: true });
  });
});

describe('GitHubClient.advisoryByCve()', () => {
  it('returns the advisory matching the CVE ID', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockGlobalAdvisory));

    const result = await gh.advisoryByCve('CVE-2023-12345');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/advisories?cve_id=CVE-2023-12345`,
      expect.anything(),
    );
    expect(result).not.toBeNull();
    expect(result!.cve_id).toBe('CVE-2023-12345');
    expect(result!.ghsa_id).toBe('GHSA-1234-5678-9abc');
  });

  it('returns null when no advisory is found for the CVE ID', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse([]);

    const result = await gh.advisoryByCve('CVE-9999-00000');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/advisories?cve_id=CVE-9999-00000`,
      expect.anything(),
    );
    expect(result).toBeNull();
  });

  it('throws GitHubApiError on API error', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(500, 'Internal Server Error');

    await expect(gh.advisoryByCve('CVE-2023-12345')).rejects.toThrow(GitHubApiError);
  });
});

const mockContributionCalendar: ContributionCalendar = {
  totalContributions: 42,
  weeks: [
    {
      contributionDays: [
        { date: '2024-01-01', contributionCount: 3, color: '#216e39' },
        { date: '2024-01-02', contributionCount: 0, color: '#ebedf0' },
      ],
    },
    {
      contributionDays: [
        { date: '2024-01-08', contributionCount: 5, color: '#39d353' },
      ],
    },
  ],
};

describe('UserResource.contributionMap()', () => {
  it('returns the contribution calendar for a user', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: mockContributionCalendar,
          },
        },
      },
    }, 200);

    const result = await gh.user('octocat').contributionMap();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/graphql`,
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('contributionCalendar'),
      }),
    );
    expect(result.totalContributions).toBe(42);
    expect(result.weeks).toHaveLength(2);
    expect(result.weeks[0].contributionDays[0].date).toBe('2024-01-01');
    expect(result.weeks[0].contributionDays[0].contributionCount).toBe(3);
  });

  it('sends from/to variables when params are provided', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({ data: { user: { contributionsCollection: { contributionCalendar: mockContributionCalendar } } } }, 200);

    await gh.user('octocat').contributionMap({
      from: '2024-01-01T00:00:00Z',
      to: '2024-12-31T23:59:59Z',
    });

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.variables.login).toBe('octocat');
    expect(body.variables.from).toBe('2024-01-01T00:00:00Z');
    expect(body.variables.to).toBe('2024-12-31T23:59:59Z');
  });

  it('omits from/to variables when no params are given', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({ data: { user: { contributionsCollection: { contributionCalendar: mockContributionCalendar } } } }, 200);

    await gh.user('octocat').contributionMap();

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.variables.login).toBe('octocat');
    expect(body.variables.from).toBeUndefined();
    expect(body.variables.to).toBeUndefined();
  });

  it('throws on GraphQL errors', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({ errors: [{ message: 'Could not resolve to a User' }] }, 200);

    await expect(gh.user('octocat').contributionMap()).rejects.toThrow('Could not resolve to a User');
  });

  it('throws GitHubApiError on HTTP error', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(401, 'Unauthorized');

    await expect(gh.user('octocat').contributionMap()).rejects.toThrow(GitHubApiError);
  });
});

describe('UserResource.commitContributionsByRepo()', () => {
  const mockContribs = [
    { repository: { nameWithOwner: 'octocat/Hello-World', url: 'https://github.com/octocat/Hello-World' }, contributions: { totalCount: 42 } },
  ];

  it('returns commit contributions by repository', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({ data: { user: { contributionsCollection: { commitContributionsByRepository: mockContribs } } } }, 200);

    const result = await gh.user('octocat').commitContributionsByRepo();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/graphql`,
      expect.objectContaining({ method: 'POST', body: expect.stringContaining('commitContributionsByRepository') }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].repository.nameWithOwner).toBe('octocat/Hello-World');
    expect(result[0].totalCount).toBe(42);
  });
});

describe('UserResource.pullRequestContributionsByRepo()', () => {
  const mockContribs = [
    { repository: { nameWithOwner: 'octocat/Hello-World', url: 'https://github.com/octocat/Hello-World' }, contributions: { totalCount: 5 } },
  ];

  it('returns pull request contributions by repository', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({ data: { user: { contributionsCollection: { pullRequestContributionsByRepository: mockContribs } } } }, 200);

    const result = await gh.user('octocat').pullRequestContributionsByRepo();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/graphql`,
      expect.objectContaining({ body: expect.stringContaining('pullRequestContributionsByRepository') }),
    );
    expect(result[0].totalCount).toBe(5);
  });
});

describe('UserResource.issueContributionsByRepo()', () => {
  const mockContribs = [
    { repository: { nameWithOwner: 'octocat/Hello-World', url: 'https://github.com/octocat/Hello-World' }, contributions: { totalCount: 3 } },
  ];

  it('returns issue contributions by repository', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({ data: { user: { contributionsCollection: { issueContributionsByRepository: mockContribs } } } }, 200);

    const result = await gh.user('octocat').issueContributionsByRepo();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/graphql`,
      expect.objectContaining({ body: expect.stringContaining('issueContributionsByRepository') }),
    );
    expect(result[0].totalCount).toBe(3);
  });
});

describe('UserResource.pinnedItems()', () => {
  it('returns pinned repositories and gists', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({
      data: {
        user: {
          pinnedItems: {
            nodes: [
              { nameWithOwner: 'octocat/Hello-World', description: 'My repo', url: 'https://github.com/octocat/Hello-World', stargazerCount: 100, primaryLanguage: { name: 'TypeScript' } },
              { name: 'abc123', description: 'My gist', url: 'https://gist.github.com/octocat/abc123' },
            ],
          },
        },
      },
    }, 200);

    const result = await gh.user('octocat').pinnedItems();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/graphql`,
      expect.objectContaining({ body: expect.stringContaining('pinnedItems') }),
    );
    expect(result).toHaveLength(2);
    const repo = result[0] as { nameWithOwner: string; stargazerCount: number };
    expect(repo.nameWithOwner).toBe('octocat/Hello-World');
    expect(repo.stargazerCount).toBe(100);
    const gist = result[1] as { name: string };
    expect(gist.name).toBe('abc123');
  });

  it('returns empty array when no items are pinned', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({ data: { user: { pinnedItems: { nodes: [] } } } }, 200);

    const result = await gh.user('octocat').pinnedItems();

    expect(result).toHaveLength(0);
  });
});

describe('GitHubClient.graphql()', () => {
  it('executes an arbitrary GraphQL query and returns data', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({ data: { viewer: { login: 'octocat' } } }, 200);

    const result = await gh.graphql<{ viewer: { login: string } }>('query { viewer { login } }');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/graphql`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.viewer.login).toBe('octocat');
  });

  it('throws when the response contains GraphQL errors', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({ errors: [{ message: 'Field does not exist' }] }, 200);

    await expect(gh.graphql('query { badField }')).rejects.toThrow('Field does not exist');
  });

  it('throws GitHubApiError on HTTP error', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(403, 'Forbidden');

    await expect(gh.graphql('query { viewer { login } }')).rejects.toThrow(GitHubApiError);
  });
});

// ─── Notifications ───────────────────────────────────────────────────────────

const mockNotification = {
  id: '1',
  unread: true,
  reason: 'mention' as const,
  subject: {
    title: 'Found a bug',
    url: `${API_URL}/repos/octocat/Hello-World/issues/1`,
    latest_comment_url: null,
    type: 'Issue' as const,
  },
  repository: {
    id: 1296269,
    name: 'Hello-World',
    full_name: 'octocat/Hello-World',
    html_url: 'https://github.com/octocat/Hello-World',
    private: false,
  },
  updated_at: '2024-01-01T00:00:00Z',
  last_read_at: null,
  url: `${API_URL}/notifications/threads/1`,
  subscription_url: `${API_URL}/notifications/threads/1/subscription`,
};

describe('GitHubClient.notifications()', () => {
  it('fetches unread notifications by default', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse([mockNotification]);

    const result = await gh.notifications();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/notifications`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }) }),
    );
    expect(result.values).toHaveLength(1);
    expect(result.values[0].id).toBe('1');
    expect(result.values[0].reason).toBe('mention');
  });

  it('passes params as query string', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse([mockNotification]);

    await gh.notifications({ all: true, per_page: 50 });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/notifications?all=true&per_page=50`,
      expect.anything(),
    );
  });

  it('parses pagination from Link header', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse([mockNotification], { link: makeLinkHeader(2) });

    const result = await gh.notifications();

    expect(result.hasNextPage).toBe(true);
    expect(result.nextPage).toBe(2);
  });

  it('throws GitHubApiError on 401', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(401, 'Unauthorized');

    await expect(gh.notifications()).rejects.toThrow(GitHubApiError);
  });
});

describe('GitHubClient.markNotificationRead()', () => {
  it('sends PATCH to the correct thread URL', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockDeleteResponse(205);

    await gh.markNotificationRead('123456');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/notifications/threads/123456`,
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('throws GitHubApiError on non-2xx response', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(403, 'Forbidden');

    await expect(gh.markNotificationRead('1')).rejects.toThrow(GitHubApiError);
  });
});

describe('GitHubClient.markAllNotificationsRead()', () => {
  it('sends PUT /notifications', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockDeleteResponse(205);

    await gh.markAllNotificationsRead();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/notifications`,
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('throws GitHubApiError on non-2xx response', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(422, 'Unprocessable Entity');

    await expect(gh.markAllNotificationsRead()).rejects.toThrow(GitHubApiError);
  });
});

// ─── Cross-repo issues ────────────────────────────────────────────────────────

describe('GitHubClient.issues()', () => {
  it('fetches cross-repo issues without params', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse([mockIssue]);

    const result = await gh.issues();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/issues`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }) }),
    );
    expect(result.values[0].number).toBe(1);
  });

  it('passes filter and state as query params', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse([mockIssue]);

    await gh.issues({ filter: 'all', state: 'open', per_page: 100 });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/issues?filter=all&state=open&per_page=100`,
      expect.anything(),
    );
  });

  it('parses Link header for pagination', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse([mockIssue], { link: makeLinkHeader(3) });

    const result = await gh.issues({ per_page: 1 });

    expect(result.hasNextPage).toBe(true);
    expect(result.nextPage).toBe(3);
  });

  it('throws GitHubApiError on 401', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(401, 'Unauthorized');

    await expect(gh.issues()).rejects.toThrow(GitHubApiError);
  });
});

// ─── Search issues ────────────────────────────────────────────────────────────

describe('GitHubClient.searchIssues()', () => {
  it('searches issues and returns totalCount', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse({ total_count: 1, incomplete_results: false, items: [mockIssue] });

    const result = await gh.searchIssues({ q: 'is:issue is:open author:octocat' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/search/issues?q=is%3Aissue+is%3Aopen+author%3Aoctocat`,
      expect.anything(),
    );
    expect(result.values[0].number).toBe(1);
    expect(result.totalCount).toBe(1);
    expect(result.hasNextPage).toBe(false);
  });

  it('searches PRs with is:pr qualifier', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse({ total_count: 5, incomplete_results: false, items: [mockIssue] });

    const result = await gh.searchIssues({ q: 'is:pr is:open author:octocat', sort: 'updated', per_page: 50 });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/search/issues'),
      expect.anything(),
    );
    expect(result.totalCount).toBe(5);
  });

  it('parses Link header on search results', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(
      { total_count: 100, incomplete_results: false, items: [mockIssue] },
      { link: makeLinkHeader(2) },
    );

    const result = await gh.searchIssues({ q: 'is:issue is:open', per_page: 1 });

    expect(result.hasNextPage).toBe(true);
    expect(result.nextPage).toBe(2);
    expect(result.totalCount).toBe(100);
  });

  it('throws GitHubApiError on 422 (invalid query)', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(422, 'Unprocessable Entity');

    await expect(gh.searchIssues({ q: '' })).rejects.toThrow(GitHubApiError);
  });
});

describe('GitHubClient.searchUsers()', () => {
  it('searches users and returns totalCount', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse({ total_count: 1, incomplete_results: false, items: [mockUser] });

    const result = await gh.searchUsers({ q: 'location:Berlin language:typescript' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/search/users?q=location%3ABerlin+language%3Atypescript`,
      expect.anything(),
    );
    expect(result.values[0].login).toBe('octocat');
    expect(result.totalCount).toBe(1);
    expect(result.hasNextPage).toBe(false);
  });

  it('passes sort and order params', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse({ total_count: 5, incomplete_results: false, items: [mockUser] });

    await gh.searchUsers({ q: 'type:user', sort: 'followers', order: 'desc' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/search/users'),
      expect.anything(),
    );
  });

  it('throws GitHubApiError on 422', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(422, 'Unprocessable Entity');

    await expect(gh.searchUsers({ q: '' })).rejects.toThrow(GitHubApiError);
  });
});

describe('GitHubClient.searchCode()', () => {
  const mockCodeResult = {
    name: 'index.ts',
    path: 'src/index.ts',
    sha: 'abc123',
    url: 'https://api.github.com/repos/octocat/Hello-World/git/blobs/abc123',
    html_url: 'https://github.com/octocat/Hello-World/blob/main/src/index.ts',
    repository: mockRepo,
  };

  it('searches code and returns totalCount', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse({ total_count: 1, incomplete_results: false, items: [mockCodeResult] });

    const result = await gh.searchCode({ q: 'addClass repo:jquery/jquery' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/search/code?q=addClass+repo%3Ajquery%2Fjquery`,
      expect.anything(),
    );
    expect(result.values[0].name).toBe('index.ts');
    expect(result.values[0].path).toBe('src/index.ts');
    expect(result.totalCount).toBe(1);
    expect(result.hasNextPage).toBe(false);
  });

  it('parses Link header for pagination', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(
      { total_count: 100, incomplete_results: false, items: [mockCodeResult] },
      { link: makeLinkHeader(2) },
    );

    const result = await gh.searchCode({ q: 'useState', per_page: 1 });

    expect(result.hasNextPage).toBe(true);
    expect(result.nextPage).toBe(2);
    expect(result.totalCount).toBe(100);
  });

  it('throws GitHubApiError on 422', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(422, 'Unprocessable Entity');

    await expect(gh.searchCode({ q: '' })).rejects.toThrow(GitHubApiError);
  });
});

// ─── Workflow runs ────────────────────────────────────────────────────────────

const mockWorkflowRun = {
  id: 1,
  name: 'CI',
  run_number: 42,
  status: 'completed' as const,
  conclusion: 'success' as const,
  head_branch: 'main',
  head_sha: 'abc123',
  event: 'push',
  html_url: 'https://github.com/octocat/Hello-World/actions/runs/1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:05:00Z',
  run_started_at: '2024-01-01T00:01:00Z',
};

describe('RepositoryResource.workflowRuns()', () => {
  it('fetches workflow runs for a repository', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse({ total_count: 1, workflow_runs: [mockWorkflowRun] });

    const result = await gh.repo('octocat', 'Hello-World').workflowRuns({ per_page: 10 });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/actions/runs?per_page=10`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }) }),
    );
    expect(result.total_count).toBe(1);
    expect(result.workflow_runs[0].conclusion).toBe('success');
  });

  it('filters by branch', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse({ total_count: 1, workflow_runs: [mockWorkflowRun] });

    await gh.repo('octocat', 'Hello-World').workflowRuns({ branch: 'main' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/actions/runs?branch=main`,
      expect.anything(),
    );
  });

  it('fetches workflow runs without params', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse({ total_count: 0, workflow_runs: [] });

    const result = await gh.repo('octocat', 'Hello-World').workflowRuns();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/actions/runs`,
      expect.anything(),
    );
    expect(result.workflow_runs).toHaveLength(0);
  });

  it('throws GitHubApiError on 404', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(404, 'Not Found');

    await expect(gh.repo('octocat', 'nonexistent').workflowRuns()).rejects.toThrow(GitHubApiError);
  });
});

describe('RepositoryResource.workflows()', () => {
  const mockWorkflow = {
    id: 1,
    name: 'CI',
    path: '.github/workflows/ci.yml',
    state: 'active' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    html_url: 'https://github.com/octocat/Hello-World/actions/workflows/ci.yml',
    badge_url: 'https://github.com/octocat/Hello-World/actions/workflows/ci.yml/badge.svg',
  };

  it('lists workflows', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse({ total_count: 1, workflows: [mockWorkflow] });

    const result = await gh.repo('octocat', 'Hello-World').workflows();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/actions/workflows`,
      expect.anything(),
    );
    expect(result.total_count).toBe(1);
    expect(result.workflows[0].name).toBe('CI');
  });
});

describe('RepositoryResource.workflowRun()', () => {
  it('fetches a single workflow run by id', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockWorkflowRun);

    const result = await gh.repo('octocat', 'Hello-World').workflowRun(1);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/actions/runs/1`,
      expect.anything(),
    );
    expect(result.id).toBe(1);
    expect(result.conclusion).toBe('success');
  });
});

describe('RepositoryResource.cancelWorkflowRun()', () => {
  it('cancels a workflow run', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockPostResponse({});

    await gh.repo('octocat', 'Hello-World').cancelWorkflowRun(1);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/actions/runs/1/cancel`,
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('RepositoryResource.triggerWorkflow()', () => {
  it('triggers a workflow dispatch by file name', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null } });

    await gh.repo('octocat', 'Hello-World').triggerWorkflow('ci.yml', { ref: 'main' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/actions/workflows/ci.yml/dispatches`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ ref: 'main' }),
      }),
    );
  });

  it('triggers a workflow dispatch with inputs', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null } });

    await gh.repo('octocat', 'Hello-World').triggerWorkflow(1, { ref: 'main', inputs: { environment: 'staging' } });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/repos/octocat/Hello-World/actions/workflows/1/dispatches`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ ref: 'main', inputs: { environment: 'staging' } }),
      }),
    );
  });
});

// ─── Social accounts ──────────────────────────────────────────────────────────

const mockSocialAccounts: SocialAccount[] = [
  { provider: 'linkedin', url: 'https://www.linkedin.com/in/pilmee' },
  { provider: 'npm', url: 'https://www.npmjs.com/~pilmee' },
];

describe('UserResource.socialAccounts()', () => {
  it('fetches social accounts for a user', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(mockSocialAccounts);

    const result = await gh.user('ElJijuna').socialAccounts();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/ElJijuna/social_accounts`,
      expect.anything(),
    );
    expect(result).toHaveLength(2);
    expect(result[0].provider).toBe('linkedin');
    expect(result[0].url).toBe('https://www.linkedin.com/in/pilmee');
    expect(result[1].provider).toBe('npm');
    expect(result[1].url).toBe('https://www.npmjs.com/~pilmee');
  });

  it('returns an empty array when the user has no social accounts', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse([]);

    const result = await gh.user('octocat').socialAccounts();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/octocat/social_accounts`,
      expect.anything(),
    );
    expect(result).toEqual([]);
  });

  it('throws GitHubApiError on 404 (user not found)', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(404, 'Not Found');

    await expect(gh.user('ghost-user').socialAccounts()).rejects.toThrow(GitHubApiError);
  });
});

describe('UserResource.organizations()', () => {
  it('fetches organizations for a user', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf(mockOrg));

    const result = await gh.user('octocat').organizations();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/octocat/orgs`,
      expect.anything(),
    );
    expect(result.values[0].login).toBe('github');
  });

  it('returns an empty list when the user has no public organizations', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockJsonResponse(pagedOf());

    const result = await gh.user('octocat').organizations();

    expect(result.values).toHaveLength(0);
  });

  it('throws GitHubApiError on 404 (user not found)', async () => {
    const gh = new GitHubClient({ token: TOKEN });
    mockErrorResponse(404, 'Not Found');

    await expect(gh.user('ghost-user').organizations()).rejects.toThrow(GitHubApiError);
  });
});
