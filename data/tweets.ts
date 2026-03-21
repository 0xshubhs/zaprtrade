/** Tweet URLs for TweetGrid. Empty = section renders with no cards. */
export const tweets: string[] = [];

/** Extract tweet ID from URL for embed key. */
export function getTweetId(tweetUrl: string): string {
  const match = tweetUrl.match(/(?:status|statuses)\/(\d+)/);
  return match ? match[1] : tweetUrl;
}
