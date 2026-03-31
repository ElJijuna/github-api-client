import type { PaginationParams } from './Pagination';

/**
 * Represents a GitHub lightweight tag (list endpoint).
 *
 * @see {@link https://docs.github.com/en/rest/repos/repos#list-repository-tags}
 */
export interface GitHubTag {
  /** Tag name (e.g., `'v1.0.0'`) */
  name: string;
  /** Commit this tag points to */
  commit: {
    /** Commit SHA */
    sha: string;
    /** API URL to the commit */
    url: string;
  };
  /** URL to download the repository at this tag as a zip archive */
  zipball_url: string;
  /** URL to download the repository at this tag as a tar.gz archive */
  tarball_url: string;
  /** Node ID */
  node_id: string;
}

/**
 * Query parameters for listing repository tags.
 *
 * @see {@link https://docs.github.com/en/rest/repos/repos#list-repository-tags}
 */
export interface TagsParams extends PaginationParams {}
