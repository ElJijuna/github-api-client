import { GitHubClient } from '../src/GitHubClient';
import { GitHubApiError } from '../src/errors/GitHubApiError';
import type { GitHubUser } from '../src/domain/User';
import type { GitHubOrganization } from '../src/domain/Organization';
import type { GitHubRepository } from '../src/domain/Repository';
import type { GitHubPullRequest } from '../src/domain/PullRequest';
import type { GitHubCommit } from '../src/domain/Commit';
import type { GitHubBranch } from '../src/domain/Branch';
import type { GitHubTag } from '../src/domain/Tag';
import type { GitHubRelease } from '../src/domain/Release';
import type { GitHubWebhook } from '../src/domain/Webhook';
import type { GitHubReview, GitHubReviewComment } from '../src/domain/Review';
import type { GitHubPullRequestFile } from '../src/domain/PullRequestFile';
import type { GitHubCommitStatus, GitHubCombinedStatus } from '../src/domain/CommitStatus';

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

    await gh.currentUser().catch(() => {});

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
    const result = gh.on('request', () => {});
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
