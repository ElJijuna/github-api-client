import type { PaginationParams } from './Pagination';
import type { GitHubUser } from './User';

/**
 * Represents a GitHub repository.
 *
 * @see {@link https://docs.github.com/en/rest/repos/repos#get-a-repository}
 */
export interface GitHubRepository {
  /** Unique numeric repository ID */
  id: number;
  /** Repository name (e.g., `'Hello-World'`) */
  name: string;
  /** Full name including owner (e.g., `'octocat/Hello-World'`) */
  full_name: string;
  /** Repository owner (user or organization) */
  owner: GitHubUser;
  /** Whether the repository is private */
  private: boolean;
  /** Repository description */
  description: string | null;
  /** Whether the repository is a fork */
  fork: boolean;
  /** URL to the repository on GitHub */
  html_url: string;
  /** HTTPS clone URL */
  clone_url: string;
  /** SSH clone URL */
  ssh_url: string;
  /** Default branch name (e.g., `'main'`) */
  default_branch: string;
  /** Primary language */
  language: string | null;
  /** Number of forks */
  forks_count: number;
  /** Number of stargazers */
  stargazers_count: number;
  /** Number of watchers */
  watchers_count: number;
  /** Number of open issues and pull requests */
  open_issues_count: number;
  /** Repository topics */
  topics: string[];
  /** Whether the repository is archived */
  archived: boolean;
  /** Whether the repository is disabled */
  disabled: boolean;
  /** Repository visibility */
  visibility: 'public' | 'private' | 'internal';
  /** ISO 8601 timestamp of the last push */
  pushed_at: string | null;
  /** ISO 8601 timestamp of repository creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** Repository size in kilobytes */
  size?: number;
  /** Whether the repository has issues enabled */
  has_issues?: boolean;
  /** Whether the repository has wiki enabled */
  has_wiki?: boolean;
  /** Whether the repository has projects enabled */
  has_projects?: boolean;
  /** Whether the repository has discussions enabled */
  has_discussions?: boolean;
  /** Parent repository, if this is a fork */
  parent?: GitHubRepository;
}

/**
 * Query parameters for listing user or organization repositories.
 *
 * @see {@link https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user}
 */
export interface ReposParams extends PaginationParams {
  /** Filter by repository type */
  type?: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member';
  /** Sort field */
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  /** Sort direction */
  direction?: 'asc' | 'desc';
}

/**
 * Query parameters for listing forks of a repository.
 *
 * @see {@link https://docs.github.com/en/rest/repos/forks#list-forks}
 */
export interface ForksParams extends PaginationParams {
  /** Sort field */
  sort?: 'newest' | 'oldest' | 'stargazers' | 'watchers';
}

/**
 * Request body for creating a fork of a repository.
 *
 * @see {@link https://docs.github.com/en/rest/repos/forks#create-a-fork}
 */
export interface CreateForkData {
  /** Organization login to fork into. Omit to fork into the authenticated user's account. */
  organization?: string;
  /** Custom name for the fork. Defaults to the original repository name. */
  name?: string;
  /** Whether to copy only the default branch. Defaults to `false`. */
  default_branch_only?: boolean;
}

/**
 * Query parameters accepted by `GET /search/repositories`.
 *
 * @see {@link https://docs.github.com/en/rest/search/search#search-repositories}
 */
export interface SearchReposParams extends PaginationParams {
  /** Search query (required). Supports qualifiers like `user:octocat`, `language:typescript` */
  q: string;
  /** Sort field */
  sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
  /** Sort direction */
  order?: 'asc' | 'desc';
}
