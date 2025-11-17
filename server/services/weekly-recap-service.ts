import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

      // Query users with email preferences enabled
      const { data: prefsData, error: prefsError } = await supabase
        .from('user_email_preferences')
        .select(`
          user_id,
          preferred_meditation_voice,
          meditation_rotation_state,
          last_recap_sent_at,
          user_profiles!inner (
            email,
            first_name
          )
        `)
        .eq('weekly_recap_enabled', true);

      if (prefsError) {
        console.error('Error fetching preferences:', prefsError);
        return [];
      }

      const usersNeedingRecap: UserNeedingRecap[] = [];

      for (const pref of prefsData || []) {
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
          // Handle user_profiles which may be an object or array depending on Supabase response
          const userProfile = Array.isArray(pref.user_profiles)
            ? pref.user_profiles[0]
            : pref.user_profiles;

          usersNeedingRecap.push({
            user_id: pref.user_id,
            email: userProfile.email,
            first_name: userProfile.first_name || 'there',
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
   * Generate a human-friendly therapeutic summary using OpenAI
   */
  async generateRecapSummary(userId: string, firstName: string): Promise<string> {
    try {
      console.log(`📝 Generating summary for user ${userId}...`);

      // Fetch last 3 sessions
      const { data: sessions } = await supabase
        .from('therapeutic_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(3);

      // Fetch recent CSS patterns
      const { data: patterns } = await supabase
        .from('css_patterns')
        .select('*')
        .in('call_id', sessions?.map(s => s.call_id) || [])
        .order('detected_at', { ascending: false })
        .limit(10);

      // Fetch therapeutic context
      const { data: contexts } = await supabase
        .from('therapeutic_context')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Build context for OpenAI
      const contextData = {
        sessionCount: sessions?.length || 0,
        recentPatterns: patterns?.map(p => ({
          stage: p.stage,
          register: p.register,
          confidence: p.confidence
        })) || [],
        insights: contexts?.map(c => c.content) || []
      };

      // Generate summary with OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a warm, insightful therapist writing a weekly check-in email to a client.

Your goal is to:
- Acknowledge their recent therapeutic work
- Highlight patterns or themes you've noticed
- Offer gentle, actionable insights
- Encourage continued growth
- Use warm, human language (NOT technical jargon)

Write in 2nd person ("you"). Be concise (200-300 words). Format with 2-3 short paragraphs.`
          },
          {
            role: 'user',
            content: `Write a weekly therapeutic recap for ${firstName} based on this data:

Sessions this week: ${contextData.sessionCount}
Recent patterns: ${JSON.stringify(contextData.recentPatterns, null, 2)}
Key insights: ${contextData.insights.join('; ')}

Create a warm, personalized message.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const summary = completion.choices[0].message.content ||
        `Hi ${firstName},\n\nI wanted to check in with you this week. Your recent sessions show meaningful engagement with your therapeutic journey. Keep showing up for yourself—that's where the real growth happens.\n\nLooking forward to our continued work together.`;

      console.log(`✅ Generated summary for ${firstName}`);
      return summary;

    } catch (error) {
      console.error('❌ Error generating summary:', error);
      // Return fallback summary
      return `Hi ${firstName},\n\nI hope this message finds you well. I wanted to check in and acknowledge the therapeutic work you've been doing. Remember that growth happens gradually, and every session is a step forward.\n\nTake care of yourself this week.`;
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
  async sendRecapEmail(user: UserNeedingRecap, summary: string): Promise<boolean> {
    try {
      console.log(`📧 Sending recap email to ${user.email}...`);

      // Select meditation
      const meditation = this.selectMeditationFile(user);

      // Check if file exists
      if (!fs.existsSync(meditation.path)) {
        console.error(`❌ Meditation file not found: ${meditation.path}`);
        return false;
      }

      // Read meditation file
      const meditationBuffer = fs.readFileSync(meditation.path);
      const meditationBase64 = meditationBuffer.toString('base64');

      // Send email with Resend
      const { data, error } = await resend.emails.send({
        from: 'iVASA Therapeutic Insights <insights@ivasa.ai>',
        to: user.email,
        subject: 'Your Weekly Therapeutic Insights from iVASA',
        html: this.generateEmailHTML(user.first_name, summary, meditation.type),
        attachments: [
          {
            filename: `meditation_${meditation.type}.mp3`,
            content: meditationBase64
          }
        ]
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
  private generateEmailHTML(firstName: string, summary: string, meditationType: string): string {
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
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #10B981;
            margin-bottom: 20px;
          }
          .summary {
            margin-bottom: 30px;
            white-space: pre-wrap;
          }
          .meditation-section {
            background: #F0FDF4;
            border-left: 4px solid #10B981;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
          }
          .meditation-section h3 {
            margin: 0 0 10px 0;
            color: #10B981;
            font-size: 16px;
          }
          .meditation-section p {
            margin: 0;
            color: #6B7280;
            font-size: 14px;
          }
          .cta {
            text-align: center;
            margin: 30px 0;
          }
          .cta a {
            display: inline-block;
            background: #10B981;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: background 0.3s;
          }
          .cta a:hover {
            background: #059669;
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Your Weekly Insights</h1>
          </div>

          <div class="content">
            <div class="greeting">
              Hello ${firstName},
            </div>

            <div class="summary">
              ${summary}
            </div>

            <div class="meditation-section">
              <h3>🧘 Guided Meditation Included</h3>
              <p>
                I've attached a ${meditationType} meditation for you this week.
                Find a quiet moment, press play, and allow yourself to simply be present.
              </p>
            </div>

            <div class="cta">
              <a href="https://beta.ivasa.ai">Continue Your Journey</a>
            </div>
          </div>

          <div class="footer">
            <p>
              You're receiving this because you're part of the iVASA community.
            </p>
            <p>
              <a href="https://beta.ivasa.ai/dashboard">Manage your email preferences</a>
            </p>
            <p style="margin-top: 15px; color: #9CA3AF; font-size: 12px;">
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

        // Generate summary
        const summary = await this.generateRecapSummary(user.user_id, user.first_name);

        // Send email
        const success = await this.sendRecapEmail(user, summary);

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
