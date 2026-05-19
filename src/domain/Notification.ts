import type { PaginationParams } from './Pagination';

/**
 * The reason a notification was received.
 *
 * @see {@link https://docs.github.com/en/rest/activity/notifications#about-notification-reasons}
 */
export type NotificationReason =
  | 'assign'
  | 'author'
  | 'comment'
  | 'ci_activity'
  | 'invitation'
  | 'manual'
  | 'mention'
  | 'review_requested'
  | 'security_advisory_credit'
  | 'security_alert'
  | 'state_change'
  | 'subscribed'
  | 'team_mention';

/**
 * The type of subject a notification refers to.
 */
export type NotificationSubjectType = 'Issue' | 'PullRequest' | 'Release' | 'CheckSuite' | 'Discussion';

/**
 * The subject of a GitHub notification (the Issue, PR, Release, etc. that triggered it).
 */
export interface NotificationSubject {
  /** Title of the subject */
  title: string;
  /** API URL of the subject */
  url: string;
  /** URL of the latest comment on the subject */
  latest_comment_url: string | null;
  /** Type of the subject */
  type: NotificationSubjectType;
}

/**
 * Minimal repository info embedded in a notification.
 */
export interface NotificationRepository {
  /** Unique numeric repository ID */
  id: number;
  /** Repository name (without owner) */
  name: string;
  /** Full name in `owner/repo` format */
  full_name: string;
  /** URL to the repository on GitHub */
  html_url: string;
  /** Whether the repository is private */
  private: boolean;
}

/**
 * Represents a single GitHub notification thread.
 *
 * @see {@link https://docs.github.com/en/rest/activity/notifications#list-notifications-for-the-authenticated-user}
 */
export interface GitHubNotification {
  /** Unique thread ID (string) */
  id: string;
  /** Whether this notification is unread */
  unread: boolean;
  /** The reason this notification was triggered */
  reason: NotificationReason;
  /** The subject (Issue, PR, Release, etc.) that triggered the notification */
  subject: NotificationSubject;
  /** The repository the notification belongs to */
  repository: NotificationRepository;
  /** ISO 8601 timestamp of the last activity on this thread */
  updated_at: string;
  /** ISO 8601 timestamp of when the thread was last read */
  last_read_at: string | null;
  /** API URL for this notification thread */
  url: string;
  /** API URL for subscriptions on this thread */
  subscription_url: string;
}

/**
 * Query parameters for listing notifications.
 *
 * @see {@link https://docs.github.com/en/rest/activity/notifications#list-notifications-for-the-authenticated-user}
 */
export interface NotificationsParams extends PaginationParams {
  /** If `true`, returns all notifications including already-read ones */
  all?: boolean;
  /** If `true`, only returns notifications the user is directly participating in or mentioned in */
  participating?: boolean;
  /** Only show notifications updated after this ISO 8601 date */
  since?: string;
  /** Only show notifications updated before this ISO 8601 date */
  before?: string;
}
