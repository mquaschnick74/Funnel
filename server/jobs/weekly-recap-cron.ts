import cron from 'node-cron';
import { weeklyRecapService } from '../services/weekly-recap-service';

/**
 * Weekly Recap Cron Job
 * Runs every 6 hours to check for users needing therapeutic recaps
 */
export function startWeeklyRecapCron() {
  // Run every 6 hours: 0 */6 * * * (at minute 0, every 6 hours)
  const cronSchedule = '0 */6 * * *';

  console.log('⏰ Weekly Recap Cron Job initialized');
  console.log(`   Schedule: Every 6 hours (${cronSchedule})`);

  cron.schedule(cronSchedule, async () => {
    const timestamp = new Date().toISOString();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`⏰ CRON TRIGGER: ${timestamp}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      await weeklyRecapService.processWeeklyRecaps();
    } catch (error) {
      console.error('❌ Cron job failed:', error);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ CRON COMPLETE: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);
  });

  //Optional: Run immediately on startup for testing
  //Uncomment this if you want to test immediately when server starts
  setTimeout(() => {
     console.log('🧪 Running weekly recap check on startup...');
     weeklyRecapService.processWeeklyRecaps();
   }, 5000);
}
