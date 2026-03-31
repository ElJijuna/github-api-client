import type { PaginationParams } from './Pagination';

/**
 * Represents a GitHub branch.
 *
 * @see {@link https://docs.github.com/en/rest/branches/branches#get-a-branch}
 */
export interface GitHubBranch {
  /** Branch name (e.g., `'main'`, `'feature/my-feature'`) */
  name: string;
  /** Whether this branch is protected */
  protected: boolean;
  /** The latest commit on this branch */
  commit: {
    /** Commit SHA */
    sha: string;
    /** API URL to the commit */
    url: string;
  };
  /** Branch protection details (only present when using authenticated requests) */
  protection?: {
    /** Whether protection is enabled */
    enabled: boolean;
    /** Required status checks */
    required_status_checks: {
      /** Enforcement level */
      enforcement_level: string;
      /** Required context names */
      contexts: string[];
    } | null;
  };
}

/**
 * Query parameters for listing repository branches.
 *
 * @see {@link https://docs.github.com/en/rest/branches/branches#list-branches}
 */
export interface BranchesParams extends PaginationParams {
  /** When `true`, only protected branches are returned */
  protected?: boolean;
}
