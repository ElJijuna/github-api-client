/**
 * Represents a single entry in a git tree.
 *
 * @see {@link https://docs.github.com/en/rest/git/trees#get-a-tree}
 */
export interface GitHubTreeItem {
  /** File or directory path */
  path: string;
  /** Git file mode */
  mode: string;
  /** Entry type */
  type: 'blob' | 'tree' | 'commit';
  /** File size in bytes (only present for `type: 'blob'`) */
  size?: number;
  /** Object SHA */
  sha: string;
  /** API URL for this object */
  url: string;
}

/**
 * Represents a GitHub git tree response.
 *
 * @see {@link https://docs.github.com/en/rest/git/trees#get-a-tree}
 */
export interface GitHubTree {
  /** Tree SHA */
  sha: string;
  /** API URL for this tree */
  url: string;
  /** Whether the response was truncated due to size limits */
  truncated: boolean;
  /** Tree entries */
  tree: GitHubTreeItem[];
}

/**
 * Query parameters for fetching a git tree.
 */
export interface GitTreeParams {
  /** Pass `'1'` to retrieve the tree recursively (all nested entries) */
  recursive?: '1';
}
