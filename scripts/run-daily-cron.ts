/**
 * Standalone Daily Cron Runner Script
 * Used by GitHub Actions workflow .github/workflows/daily-research.yml and local CLI
 */

import dotenv from 'dotenv';
import { cronManager } from '../server/cronManager';

dotenv.config();

async function main() {
  const requestedType = process.env.RUN_TYPE;
  let runType: '08:00' | '20:00';
  if (requestedType === 'auto') {
    const tz = process.env.DAILY_RESEARCH_TZ || 'Europe/Sarajevo';
    const localTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date());
    if (localTime !== '08:00' && localTime !== '20:00') {
      console.log(`Skipping scheduled candidate: local time in ${tz} is ${localTime}`);
      return;
    }
    runType = localTime;
  } else if (requestedType === '08:00' || requestedType === '20:00') {
    runType = requestedType;
  } else {
    throw new Error(`Invalid RUN_TYPE: ${requestedType || '(unset)'}`);
  }
  const force = process.env.FORCE_RUN === 'true';

  console.log(`Starting We Do Care Global Automated Expansion runner: ${runType} (force: ${force})...`);
  const result = await cronManager.triggerScheduledRun(runType, force);
  console.log('Result:', JSON.stringify(result, null, 2));

  if (!result.success && result.expansionsAdded.length === 0 && !result.message.includes('idempotent')) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal cron runner error:', err);
  process.exit(1);
});
