// X post generation service using Claude API with the content skill graph.
// Generates posts for Phase 1: Problem Awareness — therapy desert content.

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { loadSkillGraph, type PostPlatform, type PostTopic } from './skill-graph-loader';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GeneratedPost {
  content: string;
  platform: PostPlatform;
  topic: PostTopic;
  generatedAt: string;
}

/**
 * Generates an X post using Claude with the assembled skill graph as system prompt.
 */
export async function generateXPost(
  topic: PostTopic = 'therapy-desert'
): Promise<GeneratedPost> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemPrompt = loadSkillGraph({ platform: 'x', topic });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: 'Generate one X post. Follow every rule in the system. Output only the post text — no preamble, no explanation, no quotation marks.',
      },
    ],
  });

  const textBlock = message.content.find(block => block.type === 'text');
  const postContent = textBlock?.text?.trim() ?? '';

  return {
    content: postContent,
    platform: 'x',
    topic,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generates a post and saves it to Supabase for review.
 */
export async function generateAndSaveXPost(
  topic: PostTopic = 'therapy-desert'
): Promise<GeneratedPost> {
  const post = await generateXPost(topic);

  const { error } = await supabase
    .from('x_posts')
    .insert({
      content: post.content,
      platform: post.platform,
      topic: post.topic,
      generated_at: post.generatedAt,
      status: 'pending_review',
    });

  if (error) {
    console.error('[XPostService] Failed to save post to Supabase:', error.message);
  } else {
    console.log('[XPostService] Post saved for review');
  }

  return post;
}

export const xpostService = {
  generateXPost,
  generateAndSaveXPost,
};
