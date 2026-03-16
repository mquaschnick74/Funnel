import cron from 'node-cron';
import { generateDailyDraft } from '../services/xpost-service';

export function startXPostCron() {
  // Runs every day at 7:00 AM server time
  cron.schedule('0 7 * * *', async () => {
    console.log(`[XPostCron] Triggered: ${new Date().toISOString()}`);
    try {
      await generateDailyDraft();
    } catch (error) {
      console.error('[XPostCron] Failed:', error);
    }
  });

  console.log('[XPostCron] Initialized — runs daily at 7:00 AM');
}
