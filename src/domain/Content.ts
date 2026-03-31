/**
 * Represents a file or directory entry in a GitHub repository.
 *
 * @see {@link https://docs.github.com/en/rest/repos/contents#get-repository-content}
 */
export interface GitHubContent {
  /** Entry type */
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  /** Content encoding (only for files — always `'base64'`) */
  encoding?: string;
  /** File size in bytes */
  size: number;
  /** Entry name (filename or directory name) */
  name: string;
  /** Path from repository root */
  path: string;
  /**
   * Base64-encoded file content.
   * Only present for files when type is `'file'`.
   * Decode with `Buffer.from(content, 'base64').toString()` or `atob(content)`.
   */
  content?: string;
  /** Blob SHA */
  sha: string;
  /** API URL to this content entry */
  url: string;
  /** URL to this file on GitHub */
  html_url: string;
  /** URL to the raw file content */
  download_url: string | null;
  /** HAL links */
  _links: Record<string, string>;
}

/**
 * Query parameters for fetching repository content.
 *
 * @see {@link https://docs.github.com/en/rest/repos/contents#get-repository-content}
 */
export interface ContentParams {
  /** Branch name, tag name, or commit SHA. Defaults to the repository's default branch. */
  ref?: string;
}
