import type { PaginationParams } from './Pagination';
import type { GitHubUser } from './User';

/**
 * Represents a file changed in a commit.
 */
export interface GitHubCommitFile {
  /** File SHA */
  sha: string;
  /** File path */
  filename: string;
  /** Change status */
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  /** Number of line additions */
  additions: number;
  /** Number of line deletions */
  deletions: number;
  /** Total number of changes */
  changes: number;
  /** URL to the blob on GitHub */
  blob_url: string;
  /** URL to the raw file */
  raw_url: string;
  /** API URL to file contents */
  contents_url: string;
  /** The unified diff patch */
  patch?: string;
}

/**
 * Represents a GitHub commit.
 *
 * @see {@link https://docs.github.com/en/rest/commits/commits#get-a-commit}
 */
export interface GitHubCommit {
  /** Full commit SHA */
  sha: string;
  /** Git commit data */
  commit: {
    /** Commit message */
    message: string;
    /** Git author */
    author: {
      /** Author name */
      name: string;
      /** Author email */
      email: string;
      /** ISO 8601 timestamp of authoring */
      date: string;
    };
    /** Git committer */
    committer: {
      /** Committer name */
      name: string;
      /** Committer email */
      email: string;
      /** ISO 8601 timestamp of committing */
      date: string;
    };
  };
  /** GitHub user associated with the author (null if no matching account) */
  author: GitHubUser | null;
  /** GitHub user associated with the committer (null if no matching account) */
  committer: GitHubUser | null;
  /** Parent commits */
  parents: { sha: string; url: string }[];
  /** URL to the commit on GitHub */
  html_url: string;
  /** Commit stats (only present on single commit GET) */
  stats?: {
    /** Number of line additions */
    additions: number;
    /** Number of line deletions */
    deletions: number;
    /** Total number of changes */
    total: number;
  };
  /** Changed files (only present on single commit GET) */
  files?: GitHubCommitFile[];
}

/**
 * Query parameters for listing repository commits.
 *
 * @see {@link https://docs.github.com/en/rest/commits/commits#list-commits}
 */
export interface CommitsParams extends PaginationParams {
  /** SHA or branch to start listing commits from */
  sha?: string;
  /** Only commits containing this file path */
  path?: string;
  /** Filter by author login or email */
  author?: string;
  /** Filter by committer login or email */
  committer?: string;
  /** Only commits after this ISO 8601 date */
  since?: string;
  /** Only commits before this ISO 8601 date */
  until?: string;
}
