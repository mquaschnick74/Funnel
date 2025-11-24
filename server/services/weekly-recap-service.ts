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

      console.log('📊 Query result:', { prefsData, prefsError });

      if (prefsError) {
        console.error('Error fetching preferences:', prefsError);
        return [];
      }

      if (!prefsData || prefsData.length === 0) {
        console.log('No users with weekly_recap_enabled found');
        // Debug: Let's see ALL preferences
        const { data: allPrefs } = await supabase.from('user_email_preferences').select('*');
        console.log('📋 ALL email preferences in DB:', allPrefs);
        return [];
      }

      // Get user profiles separately
      const userIds = prefsData.map(p => p.user_id);
      console.log('🔎 Looking up profiles for user IDs:', userIds);

      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      console.log('👤 Profiles found:', profiles);

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
        // Case 1: Has session and it's been 3+ days since last session
        // Case 2: No sessions at all (new user who hasn't engaged)
        const needsRecap =
          (lastSession && daysSinceLastSession >= 3) ||
          (!lastSession);

        console.log(`🧮 User ${pref.user_id} evaluation:`, {
          hasSession: !!lastSession,
          daysSinceLastSession,
          needsRecap,
          case1: lastSession && daysSinceLastSession >= 3,
          case2: !lastSession
        });

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
   * Generate HTML email template - Fabulous-style design
   */
  private generateEmailHTML(firstName: string, daysSinceLastSession: number): string {
    // Determine message based on timing
    const isRecentUser = daysSinceLastSession <= 4;
    const isInactiveUser = daysSinceLastSession >= 7;

    let mainMessage = '';
    if (isRecentUser) {
      mainMessage = `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.7;">
          I hope you're doing well. It's been a few days since we last connected, and I wanted to check in with you.
        </p>
        <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.7;">
          Therapeutic growth happens not just in our sessions together, but in the quiet moments of reflection between them. Keep showing up for yourself—that's where the real transformation occurs.
        </p>
      `;
    } else if (isInactiveUser) {
      mainMessage = `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.7;">
          I've been thinking about you and wanted to reach out. It's been a little while since we last connected.
        </p>
        <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.7;">
          Life gets busy, and that's completely normal. Whenever you're ready to continue your therapeutic journey, I'll be here. There's no pressure—just know that this space is always available for you.
        </p>
      `;
    } else {
      mainMessage = `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.7;">
          I wanted to check in and see how you're doing on your therapeutic journey.
        </p>
        <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.7;">
          Remember, growth isn't always linear. Every step forward, no matter how small, is progress worth celebrating.
        </p>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
      </head>
      <body style="margin: 0; padding: 0; background-color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

        <!-- Main Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FFFFFF;">
          <tr>
            <td align="center" style="padding: 40px 20px;">

              <!-- Email Card -->
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #F5F3FF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(107, 70, 193, 0.12);">

                <!-- Logo Header -->
                <tr>
                  <td align="center" style="padding: 32px 40px 24px 40px; background-color: #F5F3FF;">
                    <img src="https://start.ivasa.ai/ivasa-logo.png" alt="iVASA" width="120" style="display: block; width: 120px; height: auto;">
                  </td>
                </tr>

                <!-- Hero Image -->
                <tr>
                  <td style="padding: 0 24px;">
                    <img src="https://start.ivasa.ai/email_photo.jpg" alt="Your Therapeutic Journey" width="552" style="display: block; width: 100%; height: auto; border-radius: 12px;">
                  </td>
                </tr>

                <!-- Headline -->
                <tr>
                  <td align="center" style="padding: 32px 40px 8px 40px;">
                    <p style="margin: 0; color: #7C3AED; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Your Weekly Check-In
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0 40px 24px 40px;">
                    <h1 style="margin: 0; color: #5B21B6; font-size: 28px; font-weight: 700; line-height: 1.3;">
                      Continue Your<br>Therapeutic Journey
                    </h1>
                  </td>
                </tr>

                <!-- Personal Message -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <p style="margin: 0 0 16px 0; color: #5B21B6; font-size: 18px; font-weight: 600;">
                      Hello ${firstName},
                    </p>
                    ${mainMessage}
                  </td>
                </tr>

                <!-- Primary CTA Button -->
                <tr>
                  <td align="center" style="padding: 8px 40px 32px 40px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="border-radius: 50px; background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);">
                          <a href="https://beta.ivasa.ai/dashboard" target="_blank" style="display: inline-block; padding: 16px 48px; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 50px;">
                            Start a Session
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Features Section -->
                <tr>
                  <td style="padding: 0 40px 32px 40px;">

                    <!-- Feature 1: Session Memory -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td width="56" valign="top">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="width: 48px; height: 48px; border-radius: 24px; background-color: #F59E0B; text-align: center; vertical-align: middle;">
                                <span style="font-size: 24px;">🧠</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td valign="top" style="padding-left: 16px;">
                          <p style="margin: 0 0 4px 0; color: #5B21B6; font-size: 16px; font-weight: 600;">
                            Session Memory
                          </p>
                          <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
                            Your AI remembers your journey across sessions, providing continuity and deeper understanding over time.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Feature 2: Progress Tracking -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td width="56" valign="top">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="width: 48px; height: 48px; border-radius: 24px; background-color: #10B981; text-align: center; vertical-align: middle;">
                                <span style="font-size: 24px;">🎯</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td valign="top" style="padding-left: 16px;">
                          <p style="margin: 0 0 4px 0; color: #5B21B6; font-size: 16px; font-weight: 600;">
                            Progress Tracking
                          </p>
                          <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
                            See how far you've come. Track your therapeutic milestones and celebrate your growth.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Feature 3: Guided Meditations -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td width="56" valign="top">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="width: 48px; height: 48px; border-radius: 24px; background-color: #8B5CF6; text-align: center; vertical-align: middle;">
                                <span style="font-size: 24px;">🧘</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td valign="top" style="padding-left: 16px;">
                          <p style="margin: 0 0 4px 0; color: #5B21B6; font-size: 16px; font-weight: 600;">
                            Guided Meditations
                          </p>
                          <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
                            Calm your mind with therapeutic audio designed to support your emotional wellbeing.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Feature 4: Therapist Connection -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="56" valign="top">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="width: 48px; height: 48px; border-radius: 24px; background-color: #EC4899; text-align: center; vertical-align: middle;">
                                <span style="font-size: 24px;">🤝</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td valign="top" style="padding-left: 16px;">
                          <p style="margin: 0 0 4px 0; color: #5B21B6; font-size: 16px; font-weight: 600;">
                            Therapist Connection
                          </p>
                          <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
                            Work alongside your human therapist with AI support between sessions.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Secondary CTA Button -->
                <tr>
                  <td align="center" style="padding: 0 40px 40px 40px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="border-radius: 50px; background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);">
                          <a href="https://beta.ivasa.ai/learn-more" target="_blank" style="display: inline-block; padding: 16px 48px; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 50px;">
                            Explore Resources
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #5B21B6; padding: 32px 40px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 16px; font-weight: 600;">
                            Need help with your journey?
                          </p>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 0 12px;">
                                <a href="https://beta.ivasa.ai/terms" style="color: #E9D5FF; font-size: 14px; text-decoration: none;">Terms</a>
                              </td>
                              <td style="color: #E9D5FF;">|</td>
                              <td style="padding: 0 12px;">
                                <a href="https://beta.ivasa.ai/learn-more" style="color: #E9D5FF; font-size: 14px; text-decoration: none;">Help Center</a>
                              </td>
                              <td style="color: #E9D5FF;">|</td>
                              <td style="padding: 0 12px;">
                                <a href="mailto:support@ivasa.ai" style="color: #E9D5FF; font-size: 14px; text-decoration: none;">Contact Us</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Bottom Footer -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #F5F3FF;">
                    <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 12px; line-height: 1.5; text-align: center;">
                      You're receiving this because you're part of the iVASA therapeutic community.
                      To update your email preferences, visit your <a href="https://beta.ivasa.ai/settings" style="color: #7C3AED; text-decoration: none;">Settings</a>.
                    </p>
                    <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-align: center;">
                      © 2025 iVASA. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

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
