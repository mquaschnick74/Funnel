import cron from 'node-cron';
import { generateDailyDraft } from '../services/x-post-service';

export function startXPostCron() {
  // Runs every day at 7:00 AM server time
  cron.schedule('0 7 * * *', async () => {
    console.log(`⏰ X post cron triggered: ${new Date().toISOString()}`);
    try {
      await generateDailyDraft();
    } catch (error) {
      console.error('❌ X post cron failed:', error);
    }
  });

  console.log('⏰ X Post Cron initialized — runs daily at 7:00 AM');
}
