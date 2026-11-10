/** Routes remain offline until real authentication and authorization exist. */
export const protectedApiRoots = new Set([
  'api', 'auth', 'profiles', 'projects', 'workers', 'research',
  'expansions', 'cron', 'sync', 'webhooks', 'roadmap',
  'notifications', 'settings', 'audit-logs',
]);

export function isDisabledApiPath(path: string): boolean {
  // Express route matching is case-insensitive by default. Normalize the
  // security gate the same way so alternate casing cannot reach legacy routes.
  // Decode once to prevent percent-encoded protected route roots bypassing it.
  let normalized = path;
  try {
    normalized = decodeURIComponent(path);
  } catch {
    // Malformed encoded paths should not be treated as trusted static assets.
    return true;
  }
  const root = normalized.split('/')[1]?.toLowerCase();
  return protectedApiRoots.has(root);
}
