import type { GitHubUser } from './User';
import type { GitHubRepository } from './Repository';

/**
 * Represents a GitHub public event as returned by the Activity API.
 *
 * @see {@link https://docs.github.com/en/rest/activity/events}
 */
export interface GitHubEvent {
  /** Unique event ID */
  id: string;
  /** The type of event (e.g., `'PushEvent'`, `'PullRequestEvent'`) */
  type: string;
  /** The actor who triggered the event */
  actor: GitHubActor;
  /** The repository where the event occurred */
  repo: Pick<GitHubRepository, 'id' | 'name'> & { url: string };
  /** Event-specific payload — shape varies by event type */
  payload: Record<string, unknown>;
  /** Whether the event is public */
  public: boolean;
  /** ISO 8601 timestamp of when the event occurred */
  created_at: string;
  /** Organization context, present only for org events */
  org?: GitHubActor;
}

/**
 * Minimal actor object embedded in GitHub events.
 */
export interface GitHubActor {
  /** Unique numeric ID */
  id: number;
  /** Login name */
  login: string;
  /** Display name */
  display_login?: string;
  /** URL to the actor's avatar */
  avatar_url: string;
  /** API URL for the actor */
  url: string;
  /** Gravatar ID */
  gravatar_id: string;
}

/**
 * Query parameters for event listing endpoints.
 */
export interface EventsParams {
  /** Results per page (max 100) */
  per_page?: number;
  /** Page number */
  page?: number;
}
