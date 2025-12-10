import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Initialize clients
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Email content block types
export interface TextBlock {
  type: 'text';
  id: string;
  content: string;
  style?: 'normal' | 'heading' | 'subheading';
}

export interface ImageBlock {
  type: 'image';
  id: string;
  url: string;
  alt?: string;
}

export interface ButtonBlock {
  type: 'button';
  id: string;
  text: string;
  url: string;
  color?: string;
}

export interface FeatureBlock {
  type: 'feature';
  id: string;
  icon: string; // URL or emoji
  title: string;
  description: string;
  iconColor?: string;
}

export interface DividerBlock {
  type: 'divider';
  id: string;
}

export type EmailBlock = TextBlock | ImageBlock | ButtonBlock | FeatureBlock | DividerBlock;

export interface EmailContent {
  subject: string;
  headerImageUrl?: string;
  content: EmailBlock[];
}

// Curated icon library organized by category
const ICON_LIBRARY: Record<string, { emoji: string; keywords: string[] }[]> = {
  wellness: [
    { emoji: '🧘', keywords: ['meditation', 'calm', 'peace', 'mindfulness', 'yoga'] },
    { emoji: '💆', keywords: ['relax', 'stress', 'massage', 'care', 'self-care'] },
    { emoji: '🌿', keywords: ['nature', 'growth', 'healing', 'natural', 'organic'] },
    { emoji: '🌸', keywords: ['bloom', 'flower', 'beauty', 'spring', 'fresh'] },
    { emoji: '✨', keywords: ['sparkle', 'magic', 'special', 'shine', 'glow'] },
    { emoji: '🌅', keywords: ['sunrise', 'morning', 'new', 'beginning', 'hope'] },
    { emoji: '🌊', keywords: ['wave', 'ocean', 'calm', 'flow', 'water'] },
    { emoji: '🦋', keywords: ['transform', 'change', 'butterfly', 'freedom', 'metamorphosis'] },
  ],
  health: [
    { emoji: '💪', keywords: ['strength', 'strong', 'power', 'fitness', 'muscle'] },
    { emoji: '❤️', keywords: ['heart', 'love', 'care', 'health', 'emotion'] },
    { emoji: '🧠', keywords: ['brain', 'mind', 'think', 'mental', 'cognitive'] },
    { emoji: '🏃', keywords: ['run', 'exercise', 'active', 'movement', 'fitness'] },
    { emoji: '😴', keywords: ['sleep', 'rest', 'relax', 'dream', 'night'] },
    { emoji: '🥗', keywords: ['food', 'nutrition', 'healthy', 'diet', 'vegetable'] },
    { emoji: '💊', keywords: ['medicine', 'pill', 'treatment', 'supplement', 'vitamin'] },
    { emoji: '🩺', keywords: ['doctor', 'medical', 'checkup', 'health', 'diagnosis'] },
  ],
  progress: [
    { emoji: '🎯', keywords: ['goal', 'target', 'aim', 'focus', 'achievement'] },
    { emoji: '📈', keywords: ['growth', 'progress', 'increase', 'chart', 'improve'] },
    { emoji: '🏆', keywords: ['trophy', 'win', 'success', 'champion', 'achievement'] },
    { emoji: '⭐', keywords: ['star', 'favorite', 'excellent', 'best', 'shine'] },
    { emoji: '🚀', keywords: ['rocket', 'launch', 'fast', 'boost', 'accelerate'] },
    { emoji: '📊', keywords: ['data', 'analytics', 'stats', 'metrics', 'measure'] },
    { emoji: '✅', keywords: ['check', 'done', 'complete', 'success', 'verified'] },
    { emoji: '🔑', keywords: ['key', 'unlock', 'access', 'important', 'solution'] },
  ],
  communication: [
    { emoji: '💬', keywords: ['chat', 'message', 'talk', 'conversation', 'discuss'] },
    { emoji: '📧', keywords: ['email', 'mail', 'letter', 'inbox', 'message'] },
    { emoji: '🤝', keywords: ['handshake', 'partner', 'deal', 'agreement', 'connect'] },
    { emoji: '👥', keywords: ['people', 'team', 'group', 'community', 'users'] },
    { emoji: '📞', keywords: ['phone', 'call', 'contact', 'support', 'reach'] },
    { emoji: '🔔', keywords: ['bell', 'notification', 'alert', 'reminder', 'update'] },
    { emoji: '📢', keywords: ['announcement', 'loud', 'broadcast', 'news', 'important'] },
    { emoji: '💡', keywords: ['idea', 'lightbulb', 'tip', 'suggestion', 'insight'] },
  ],
  time: [
    { emoji: '📅', keywords: ['calendar', 'date', 'schedule', 'event', 'plan'] },
    { emoji: '⏰', keywords: ['clock', 'time', 'alarm', 'reminder', 'deadline'] },
    { emoji: '🕐', keywords: ['hour', 'time', 'clock', 'schedule', 'appointment'] },
    { emoji: '⌛', keywords: ['hourglass', 'wait', 'timer', 'countdown', 'patience'] },
    { emoji: '📆', keywords: ['month', 'calendar', 'date', 'schedule', 'plan'] },
  ],
  emotions: [
    { emoji: '😊', keywords: ['happy', 'smile', 'joy', 'positive', 'cheerful'] },
    { emoji: '🙏', keywords: ['pray', 'thank', 'grateful', 'hope', 'wish'] },
    { emoji: '🤗', keywords: ['hug', 'warm', 'welcome', 'embrace', 'friendly'] },
    { emoji: '😌', keywords: ['relieved', 'peaceful', 'content', 'satisfied', 'calm'] },
    { emoji: '💖', keywords: ['love', 'heart', 'affection', 'care', 'kind'] },
    { emoji: '🌈', keywords: ['rainbow', 'hope', 'diversity', 'colorful', 'positive'] },
  ],
  therapy: [
    { emoji: '🛋️', keywords: ['couch', 'therapy', 'session', 'counseling', 'talk'] },
    { emoji: '📝', keywords: ['note', 'write', 'journal', 'record', 'document'] },
    { emoji: '🎧', keywords: ['headphones', 'listen', 'audio', 'music', 'podcast'] },
    { emoji: '🌱', keywords: ['grow', 'seed', 'plant', 'develop', 'nurture'] },
    { emoji: '🔄', keywords: ['cycle', 'repeat', 'refresh', 'renew', 'loop'] },
    { emoji: '🌟', keywords: ['shine', 'special', 'bright', 'outstanding', 'star'] },
  ],
};

export class CustomEmailService {
  /**
   * Generate HTML for a custom email
   */
  generateEmailHTML(emailContent: EmailContent): string {
    const { subject, headerImageUrl, content } = emailContent;

    const blocksHtml = this.renderBlocks(content);

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
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #5B21B6; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(107, 70, 193, 0.12);">

                <!-- Logo Header -->
                <tr>
                  <td align="center" style="padding: 32px 40px 24px 40px; background-color: #5B21B6;">
                    <img src="https://start.ivasa.ai/ivasa-logo.png" alt="iVASA" width="200" style="display: block; width: 200px; max-width: 100%; height: auto;">
                  </td>
                </tr>

                ${headerImageUrl ? `
                <!-- Header Image -->
                <tr>
                  <td style="padding: 0 24px;">
                    <img src="${headerImageUrl}" alt="Email Header" width="552" style="display: block; width: 100%; height: auto; border-radius: 12px;">
                  </td>
                </tr>
                ` : ''}

                <!-- Content Blocks -->
                <tr>
                  <td style="padding: 32px 40px;">
                    ${blocksHtml}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #F5F3FF; padding: 32px 40px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="margin: 0 0 16px 0; color: #5B21B6; font-size: 16px; font-weight: 600;">
                            Need help?
                          </p>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 0 12px;">
                                <a href="https://beta.ivasa.ai/terms" style="color: #6D28D9; font-size: 14px; text-decoration: none;">Terms</a>
                              </td>
                              <td style="color: #6D28D9;">|</td>
                              <td style="padding: 0 12px;">
                                <a href="https://beta.ivasa.ai/learn-more" style="color: #6D28D9; font-size: 14px; text-decoration: none;">Help Center</a>
                              </td>
                              <td style="color: #6D28D9;">|</td>
                              <td style="padding: 0 12px;">
                                <a href="mailto:support@ivasa.ai" style="color: #6D28D9; font-size: 14px; text-decoration: none;">Contact Us</a>
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
                  <td style="padding: 24px 40px; background-color: #5B21B6;">
                    <p style="margin: 0 0 8px 0; color: #E9D5FF; font-size: 12px; line-height: 1.5; text-align: center;">
                      You're receiving this because you're part of the iVASA therapeutic community.
                    </p>
                    <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-align: center;">
                      &copy; 2025 iVASA. All rights reserved.
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
   * Render email blocks to HTML
   */
  private renderBlocks(blocks: EmailBlock[]): string {
    return blocks.map(block => this.renderBlock(block)).join('\n');
  }

  private renderBlock(block: EmailBlock): string {
    switch (block.type) {
      case 'text':
        return this.renderTextBlock(block);
      case 'image':
        return this.renderImageBlock(block);
      case 'button':
        return this.renderButtonBlock(block);
      case 'feature':
        return this.renderFeatureBlock(block);
      case 'divider':
        return this.renderDividerBlock();
      default:
        return '';
    }
  }

  private renderTextBlock(block: TextBlock): string {
    const styles: Record<string, string> = {
      heading: 'margin: 0 0 16px 0; color: #F5F3FF; font-size: 28px; font-weight: 700; line-height: 1.3;',
      subheading: 'margin: 0 0 12px 0; color: #F5F3FF; font-size: 20px; font-weight: 600; line-height: 1.4;',
      normal: 'margin: 0 0 16px 0; color: #FFFFFF; font-size: 16px; line-height: 1.7;',
    };

    const style = styles[block.style || 'normal'];
    const tag = block.style === 'heading' ? 'h1' : block.style === 'subheading' ? 'h2' : 'p';

    return `<${tag} style="${style}">${block.content}</${tag}>`;
  }

  private renderImageBlock(block: ImageBlock): string {
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
        <tr>
          <td>
            <img src="${block.url}" alt="${block.alt || 'Image'}" width="520" style="display: block; width: 100%; height: auto; border-radius: 12px;">
          </td>
        </tr>
      </table>
    `;
  }

  private renderButtonBlock(block: ButtonBlock): string {
    const buttonColor = block.color || '#8B5CF6';
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="border-radius: 50px; background: linear-gradient(135deg, ${buttonColor} 0%, ${this.darkenColor(buttonColor)} 100%);">
                  <a href="${block.url}" target="_blank" style="display: inline-block; padding: 16px 48px; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 50px;">
                    ${block.text}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }

  private renderFeatureBlock(block: FeatureBlock): string {
    const iconBgColor = block.iconColor || '#8B5CF6';
    const isEmoji = !block.icon.startsWith('http');

    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
        <tr>
          <td width="56" valign="top">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="width: 48px; height: 48px; border-radius: 24px; background-color: ${iconBgColor}; text-align: center; vertical-align: middle;">
                  ${isEmoji
                    ? `<span style="font-size: 24px;">${block.icon}</span>`
                    : `<img src="${block.icon}" alt="" width="24" height="24" style="display: inline-block; width: 24px; height: 24px;">`
                  }
                </td>
              </tr>
            </table>
          </td>
          <td valign="top" style="padding-left: 16px;">
            <p style="margin: 0 0 4px 0; color: #F5F3FF; font-size: 16px; font-weight: 600;">
              ${block.title}
            </p>
            <p style="margin: 0; color: #E9D5FF; font-size: 14px; line-height: 1.5;">
              ${block.description}
            </p>
          </td>
        </tr>
      </table>
    `;
  }

  private renderDividerBlock(): string {
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
        <tr>
          <td style="border-top: 1px solid rgba(255, 255, 255, 0.2);"></td>
        </tr>
      </table>
    `;
  }

  private darkenColor(hex: string): string {
    // Simple color darkening for gradient effect
    const color = hex.replace('#', '');
    const r = Math.max(0, parseInt(color.substring(0, 2), 16) - 30);
    const g = Math.max(0, parseInt(color.substring(2, 4), 16) - 30);
    const b = Math.max(0, parseInt(color.substring(4, 6), 16) - 30);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Send custom email to recipients
   */
  async sendCustomEmail(params: {
    recipients: string[];
    subject: string;
    headerImageUrl?: string;
    content: EmailBlock[];
  }): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    const { recipients, subject, headerImageUrl, content } = params;

    const html = this.generateEmailHTML({ subject, headerImageUrl, content });

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      try {
        const { error } = await resend.emails.send({
          from: 'iVASA <insights@ivasa.ai>',
          to: recipient,
          subject,
          html,
        });

        if (error) {
          failed++;
          errors.push(`${recipient}: ${error.message}`);
        } else {
          sent++;
        }

        // Small delay between emails
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        failed++;
        errors.push(`${recipient}: ${String(err)}`);
      }
    }

    console.log(`📧 Email sending complete: ${sent} sent, ${failed} failed`);
    return { success: failed === 0, sent, failed, errors };
  }

  /**
   * Generate an icon based on text content
   * Uses keyword matching to find the best emoji from our curated library
   */
  async generateIcon(text: string, style?: string): Promise<string> {
    const lowerText = text.toLowerCase();

    // Search through all categories
    let bestMatch: { emoji: string; score: number } = { emoji: '✨', score: 0 };

    for (const [category, icons] of Object.entries(ICON_LIBRARY)) {
      for (const icon of icons) {
        let score = 0;

        // Check if any keywords match the text
        for (const keyword of icon.keywords) {
          if (lowerText.includes(keyword)) {
            score += 2;
          }
          // Partial match
          if (keyword.includes(lowerText.substring(0, 4)) || lowerText.includes(keyword.substring(0, 4))) {
            score += 1;
          }
        }

        // Boost score if style matches category
        if (style && category.includes(style.toLowerCase())) {
          score += 3;
        }

        if (score > bestMatch.score) {
          bestMatch = { emoji: icon.emoji, score };
        }
      }
    }

    return bestMatch.emoji;
  }

  /**
   * Get all available icons from the library
   */
  getIconLibrary(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const [category, icons] of Object.entries(ICON_LIBRARY)) {
      result[category] = icons.map(i => i.emoji);
    }
    return result;
  }

  /**
   * Upload image and return URL
   * For now, saves to public folder. In production, should use cloud storage.
   */
  async uploadImage(imageData: string, filename?: string): Promise<string> {
    try {
      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate unique filename
      const ext = filename?.split('.').pop() || 'png';
      const uniqueFilename = `email-header-${randomUUID()}.${ext}`;

      // Save to public/uploads folder
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, uniqueFilename);
      fs.writeFileSync(filePath, buffer);

      // Return public URL
      // In production, this would be your domain
      const publicUrl = `/uploads/${uniqueFilename}`;

      console.log(`📸 Image uploaded: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }
}

export const customEmailService = new CustomEmailService();
