import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

interface UserNeedingRecap {
  user_id: string;
  email: string;
  first_name: string;
  last_session_date: string | null;
  days_since_last_session: number;
  preferred_meditation_voice: string;
  meditation_rotation_state: {
    used: string[];
    available: string[];
  };
}

export class WeeklyRecapService {

  /**
   * Find all users who need a weekly recap email
   */
  async findUsersNeedingRecaps(): Promise<UserNeedingRecap[]> {
    try {
      console.log('🔍 Finding users needing recaps...');

      // First get email preferences
      const { data: prefsData, error: prefsError } = await supabase
        .from('user_email_preferences')
        .select('*')
        .eq('weekly_recap_enabled', true);

      if (prefsError) {
        console.error('Error fetching preferences:', prefsError);
        return [];
      }

      if (!prefsData || prefsData.length === 0) {
        console.log('No users with weekly_recap_enabled found');
        return [];
      }

      // Get user profiles separately
      const userIds = prefsData.map(p => p.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        return [];
      }

      // Create a map of user profiles
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const usersNeedingRecap: UserNeedingRecap[] = [];

      for (const pref of prefsData) {
        // Get user profile from map
        const profile = profileMap.get(pref.user_id);
        if (!profile) {
          console.log(`⏭️  Skipping user ${pref.user_id}: No profile found`);
          continue;
        }
        // Check if we sent a recap in the last 3 days
        if (pref.last_recap_sent_at) {
          const daysSinceLastRecap = Math.floor(
            (Date.now() - new Date(pref.last_recap_sent_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastRecap < 3) {
            console.log(`⏭️  Skipping user ${pref.user_id}: Recap sent ${daysSinceLastRecap} days ago`);
            continue;
          }
        }

        // Get user's last session
        const { data: lastSession } = await supabase
          .from('therapeutic_sessions')
          .select('start_time')
          .eq('user_id', pref.user_id)
          .order('start_time', { ascending: false })
          .limit(1)
          .single();

        let daysSinceLastSession = 999; // Default to high number

        if (lastSession) {
          daysSinceLastSession = Math.floor(
            (Date.now() - new Date(lastSession.start_time).getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        // Determine if user needs recap
        // Case 1: 3 days after last session
        // Case 2: 7+ days with no sessions (inactive)
        const needsRecap =
          (lastSession && daysSinceLastSession >= 3 && daysSinceLastSession <= 4) ||
          (!lastSession && daysSinceLastSession >= 7);

        if (needsRecap) {
          usersNeedingRecap.push({
            user_id: pref.user_id,
            email: profile.email,
            first_name: profile.full_name?.split(' ')[0] || profile.email.split('@')[0] || 'there',
            last_session_date: lastSession?.start_time || null,
            days_since_last_session: daysSinceLastSession,
            preferred_meditation_voice: pref.preferred_meditation_voice || 'sarah',
            meditation_rotation_state: pref.meditation_rotation_state || {
              used: [],
              available: ['campfire', 'ocean', 'singing_bowl']
            }
          });
        }
      }

      console.log(`✅ Found ${usersNeedingRecap.length} users needing recaps`);
      return usersNeedingRecap;

    } catch (error) {
      console.error('❌ Error finding users needing recaps:', error);
      return [];
    }
  }

  /**
   * Select next meditation file based on rotation
   */
  selectMeditationFile(user: UserNeedingRecap): { type: string; path: string } {
    const { used, available } = user.meditation_rotation_state;

    // If all have been used, reset rotation
    if (available.length === 0) {
      available.push('campfire', 'ocean', 'singing_bowl');
      used.length = 0;
    }

    // Pick random from available
    const randomIndex = Math.floor(Math.random() * available.length);
    const selectedType = available[randomIndex];

    // Move to used
    available.splice(randomIndex, 1);
    used.push(selectedType);

    // Build file path
    const voice = user.preferred_meditation_voice;
    const filePath = path.join(
      process.cwd(),
      'public',
      'meditations',
      voice,
      `${selectedType}_meditation.mp3`
    );

    console.log(`🎵 Selected ${selectedType} meditation for ${user.email}`);

    return { type: selectedType, path: filePath };
  }

  /**
   * Send recap email with meditation attachment
   */
  async sendRecapEmail(user: UserNeedingRecap): Promise<boolean> {
    try {
      console.log(`📧 Sending recap email to ${user.email}...`);

      // Select meditation
      const meditation = this.selectMeditationFile(user);

      // Check if file exists
      if (!fs.existsSync(meditation.path)) {
        console.error(`❌ Meditation file not found: ${meditation.path}`);
        return false;
      }

      // Send email with Resend
      const { data, error } = await resend.emails.send({
        from: 'iVASA Therapeutic Insights <insights@ivasa.ai>',
        to: user.email,
        subject: 'Your Weekly Therapeutic Insights from iVASA',
        html: this.generateEmailHTML(
          user.first_name,
          user.days_since_last_session
        )
      });

      if (error) {
        console.error('❌ Resend error:', error);
        return false;
      }

      console.log(`✅ Email sent successfully to ${user.email}. Email ID: ${data?.id}`);

      // Update rotation state and last sent timestamp
      await supabase
        .from('user_email_preferences')
        .update({
          meditation_rotation_state: user.meditation_rotation_state,
          last_recap_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user_id);

      return true;

    } catch (error) {
      console.error('❌ Error sending recap email:', error);
      return false;
    }
  }

  /**
   * Generate HTML email template
   */
  private generateEmailHTML(firstName: string, daysSinceLastSession: number): string {
    // Determine message based on timing - NO session details
    const isRecentUser = daysSinceLastSession <= 4;
    const isInactiveUser = daysSinceLastSession >= 7;

    let mainMessage = '';
    if (isRecentUser) {
      mainMessage = `
        <p>I hope you're doing well. It's been a few days since we last connected, and I wanted to check in with you.</p>
        <p>Therapeutic growth happens not just in our sessions together, but in the quiet moments of reflection between them. Keep showing up for yourself—that's where the real transformation occurs.</p>
      `;
    } else if (isInactiveUser) {
      mainMessage = `
        <p>I've been thinking about you and wanted to reach out. It's been a little while since we last connected.</p>
        <p>Life gets busy, and that's completely normal. Whenever you're ready to continue your therapeutic journey, I'll be here. There's no pressure—just know that this space is always available for you.</p>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1F2937;
            margin: 0;
            padding: 0;
            background-color: #F3F4F6;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            color: white;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #10B981;
            margin-bottom: 20px;
            font-weight: 500;
          }
          .message {
            margin-bottom: 30px;
            line-height: 1.8;
            color: #374151;
          }
          .meditation-player {
            background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
            border: 1px solid #D1FAE5;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
          }
          .meditation-title {
            font-size: 18px;
            font-weight: 600;
            color: #065F46;
            margin: 0 0 8px 0;
          }
          .meditation-subtitle {
            font-size: 14px;
            color: #059669;
            margin: 0 0 24px 0;
          }
          .play-button {
            display: inline-block;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 16px 48px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }
          .play-button:hover {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
            transform: translateY(-2px);
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #E5E7EB, transparent);
            margin: 30px 0;
          }
          .cta {
            text-align: center;
            margin: 30px 0;
          }
          .cta a {
            display: inline-block;
            background: white;
            color: #10B981;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            border: 2px solid #10B981;
            transition: all 0.3s ease;
          }
          .cta a:hover {
            background: #F0FDF4;
          }
          .footer {
            background: #F9FAFB;
            padding: 30px;
            text-align: center;
            color: #6B7280;
            font-size: 14px;
            border-top: 1px solid #E5E7EB;
          }
          .footer a {
            color: #10B981;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
          .footer-meta {
            margin-top: 15px;
            color: #9CA3AF;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://www.start.ivasa.ai/ivasa-logo.png"
                 alt="iVASA"
                 style="width: 120px; height: auto; margin-bottom: 16px;">
            <h1>Your Weekly Therapeutic Check-In</h1>
          </div>

          <div class="content">
            <div class="greeting">
              Hello ${firstName},
            </div>

            <div class="message">
              ${mainMessage}
            </div>

            <div class="meditation-player">
              <h2 class="meditation-title">Resources for Your Journey</h2>
              <p class="meditation-subtitle">Guided meditations, educational videos, and therapeutic insights</p>
              <a href="https://beta.ivasa.ai/learn-more" class="play-button" target="_blank">
                Explore Resources
              </a>
            </div>

            <div class="divider"></div>

            <div class="cta">
              <a href="https://beta.ivasa.ai/dashboard">View Your Sessions</a>
            </div>
          </div>

          <div class="footer">
            <p>
              You're receiving this because you're part of the iVASA community.
            </p>
            <p>
              <a href="https://beta.ivasa.ai/dashboard">Manage email preferences</a>
            </p>
            <p class="footer-meta">
              © 2025 iVASA. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Main function to process all recaps
   */
  async processWeeklyRecaps(): Promise<void> {
    try {
      console.log('\n🚀 Starting weekly recap processing...\n');

      const users = await this.findUsersNeedingRecaps();

      if (users.length === 0) {
        console.log('✅ No users need recaps at this time.\n');
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      for (const user of users) {
        console.log(`\n--- Processing ${user.email} ---`);

        // Send email (no summary needed - just encouragement + meditation)
        const success = await this.sendRecapEmail(user);

        if (success) {
          successCount++;
        } else {
          failureCount++;
        }

        // Small delay between emails
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(`\n📊 Recap processing complete:`);
      console.log(`   ✅ Success: ${successCount}`);
      console.log(`   ❌ Failed: ${failureCount}\n`);

    } catch (error) {
      console.error('❌ Error in processWeeklyRecaps:', error);
    }
  }
}

export const weeklyRecapService = new WeeklyRecapService();
