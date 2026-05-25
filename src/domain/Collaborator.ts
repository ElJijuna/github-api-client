import type { PaginationParams } from './Pagination';

/**
 * Query parameters for listing collaborators.
 *
 * @see {@link https://docs.github.com/en/rest/collaborators/collaborators#list-repository-collaborators}
 */
export interface CollaboratorsParams extends PaginationParams {
  /** Filter collaborators by their affiliation */
  affiliation?: 'outside' | 'direct' | 'all';
  /** Filter by permission level */
  permission?: 'pull' | 'triage' | 'push' | 'maintain' | 'admin';
}

/**
 * Request body for adding a collaborator.
 *
 * @see {@link https://docs.github.com/en/rest/collaborators/collaborators#add-a-repository-collaborator}
 */
export interface AddCollaboratorData {
  /** Permission level to grant. Defaults to `'push'` for org repos, `'push'` for personal repos. */
  permission?: 'pull' | 'triage' | 'push' | 'maintain' | 'admin';
}
