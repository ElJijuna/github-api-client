import type { PaginationParams } from './Pagination';

/**
 * Represents a file changed in a pull request.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/pulls#list-pull-requests-files}
 */
export interface GitHubPullRequestFile {
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
  /** The unified diff patch for this file */
  patch?: string;
  /** Previous file path (for renamed or copied files) */
  previous_filename?: string;
}

/**
 * Query parameters for listing pull request files.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/pulls#list-pull-requests-files}
 */
export interface PullRequestFilesParams extends PaginationParams {}
