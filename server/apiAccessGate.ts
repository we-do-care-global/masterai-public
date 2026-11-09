/** Routes remain offline until real authentication and authorization exist. */
export const protectedApiRoots = new Set([
  'api', 'auth', 'profiles', 'projects', 'workers', 'research',
  'expansions', 'cron', 'sync', 'webhooks', 'roadmap',
  'notifications', 'settings', 'audit-logs',
]);

export function isDisabledApiPath(path: string): boolean {
  const root = path.split('/')[1];
  return protectedApiRoots.has(root);
}
