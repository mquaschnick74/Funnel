// X post generation service — full production system.
// Uses the modular content skill graph for system prompt assembly.
// 9-slot PCA rotation, 3 variations per generation, approval workflow.

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { loadSkillGraph, type SlotName } from './skill-graph-loader';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================
// SLOT DEFINITIONS
// ============================================================

interface SlotDefinition {
  name: SlotName;
  rotationIndex: number;
  characterTarget: string;
  patternDescription: string;
  entryInstruction: string;
}

const SLOTS: SlotDefinition[] = [
  {
    name: 'CVDC',
    rotationIndex: 0,
    characterTarget: '280 characters maximum',
    patternDescription: 'A person holding two incompatible perceptual positions simultaneously. Both are genuine. Neither will collapse. The person is functional and exhausted by the structure itself — not by any single event.',
    entryInstruction: 'Start at the moment the person reaches for one direction and feels the equal pull of the other. Not a decision point. Not a crisis. The ordinary moment when the structure makes itself felt.',
  },
  {
    name: 'IBM_TYPE_A',
    rotationIndex: 1,
    characterTarget: '280 characters maximum',
    patternDescription: 'A person who continues doing something they do not want to do and cannot stop. Not crisis. Functional. The thing happens in ordinary life and has happened before.',
    entryInstruction: 'Start with the moment the person notices they have done it again — not the decision, not the regret, the noticing. The thing they do not want to do has already happened. They are inside the aftermath.',
  },
  {
    name: 'IBM_TYPE_B',
    rotationIndex: 2,
    characterTarget: '280 characters maximum',
    patternDescription: 'A person who cannot begin doing what they genuinely want and cannot locate why. Not laziness. Not fear in any simple sense. The wanting is real. The starting does not happen.',
    entryInstruction: 'Start at the edge of beginning — the moment just before the person would start the thing, where the starting fails without drama. No collapse. No crisis. Just the thing not beginning again.',
  },
  {
    name: 'REGISTER_REAL',
    rotationIndex: 3,
    characterTarget: '280 characters maximum',
    patternDescription: 'A person whose body registers experience before their mind does. Sensation arrives first. The body already knows. The mind is still catching up or trying to override what the body already has.',
    entryInstruction: 'Start with the physical moment — the specific sensation that arrived before any thought did. The body speaking before being asked.',
  },
  {
    name: 'REGISTER_IMAGINARY',
    rotationIndex: 4,
    characterTarget: '280 characters maximum',
    patternDescription: 'A person whose experience is filtered through anticipated perception — what this means, what others think, what could go wrong. The actual event is secondary to its imagined interpretation.',
    entryInstruction: 'Start inside the filtering — the moment the person is already somewhere else in their mind, already managing how something will land, before it has landed.',
  },
  {
    name: 'REGISTER_SYMBOLIC',
    rotationIndex: 5,
    characterTarget: '400 to 500 characters',
    patternDescription: 'A person who cannot feel something until they have named it. Experience does not become real until structure arrives. The event waits. The feeling waits. The name has to come first.',
    entryInstruction: 'Start at the waiting — the specific suspension between something happening and the person being able to be inside it. The thing has occurred. The person is still outside it, waiting for the structure that will make it real.',
  },
  {
    name: 'THEND',
    rotationIndex: 6,
    characterTarget: '500 to 800 characters',
    patternDescription: 'A person in the active, disorienting process of holding two incompatible truths without collapsing into either. Not resolved. Not broken. Moving. The process itself is the experience.',
    entryInstruction: 'Start inside the disorientation of the process — not the beginning of it, not the end, but the middle where the person is holding something that has no name yet and no guarantee of where it goes.',
  },
  {
    name: 'CYVC',
    rotationIndex: 7,
    characterTarget: '500 to 800 characters',
    patternDescription: 'A person who has moved through something and arrived somewhere different. They know something changed. They do not have language for what they arrived at. The contradiction is still present but no longer organizing them.',
    entryInstruction: 'Start at the recognition of arrival — not the journey, not the change in process, but the quiet moment when the person notices that something that used to organize them no longer does. No drama. Just the noticing.',
  },
  {
    name: 'THERAPY_DESERT',
    rotationIndex: 8,
    characterTarget: '500 to 800 characters',
    patternDescription: 'A person who knows something is wrong, has no one trained to help them see it, and has been carrying it alone long enough that they have stopped expecting otherwise. Functional. Isolated in a specific way.',
    entryInstruction: 'Start with the specific texture of carrying something alone — not the absence of help in the abstract, but the ordinary moment that makes the absence concrete. The specific thing the person does instead of having someone to talk to.',
  },
];

// ============================================================
// ROTATION TRACKER
// ============================================================

async function getCurrentRotationIndex(): Promise<number> {
  const { data } = await supabase
    .from('x_post_drafts')
    .select('rotation_index')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!data) return 0;
  return (data.rotation_index + 1) % SLOTS.length;
}

// ============================================================
// GENERATION
// ============================================================

function buildDynamicMessage(slot: SlotDefinition): string {
  return `Write three variations of a single X post. Each variation must be at ${slot.characterTarget}. Do not number them or label them in any way. Separate each variation with a single blank line and nothing else. No preamble. No explanation. Output only the three posts.

Pattern: ${slot.patternDescription}

Entry point: ${slot.entryInstruction}

Format: Single post. No thread. No hashtags. No question at the end. Do not name any clinical or PCA framework concept. Apply the test: would the person living this experience use this word to describe it to someone they trust? If not, find the word they would use.`;
}

function parseThreeVariations(raw: string): [string, string, string] {
  const variations = raw
    .split(/\n\n+/)
    .map(v => v.trim())
    .filter(v => v.length > 0);

  if (variations.length < 3) {
    throw new Error(`Expected 3 variations, got ${variations.length}`);
  }

  return [variations[0], variations[1], variations[2]];
}

export async function generateDailyDraft(): Promise<void> {
  const rotationIndex = await getCurrentRotationIndex();
  const slot = SLOTS[rotationIndex];

  console.log(`[XPostService] Generating drafts for slot: ${slot.name} (rotation ${rotationIndex})`);

  // Assemble system prompt from the modular skill graph
  const systemPrompt = loadSkillGraph({ platform: 'x', slotName: slot.name });

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: buildDynamicMessage(slot),
      },
    ],
  });

  const rawContent = message.content
    .filter(block => block.type === 'text')
    .map(block => (block as { type: 'text'; text: string }).text)
    .join('');

  const [variationA, variationB, variationC] = parseThreeVariations(rawContent);

  const { error } = await supabase.from('x_post_drafts').insert({
    slot_name: slot.name,
    variation_a: variationA,
    variation_b: variationB,
    variation_c: variationC,
    rotation_index: rotationIndex,
    status: 'draft',
  });

  if (error) {
    throw new Error(`Failed to store drafts: ${error.message}`);
  }

  console.log(`[XPostService] Drafts generated and stored for slot: ${slot.name}`);
}

// ============================================================
// CRUD OPERATIONS
// ============================================================

export async function getDrafts() {
  const { data, error } = await supabase
    .from('x_post_drafts')
    .select('id, slot_name, variation_a, variation_b, variation_c, status, created_at')
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch drafts: ${error.message}`);
  return data;
}

export async function getHistory() {
  const { data, error } = await supabase
    .from('x_post_drafts')
    .select('id, slot_name, selected_variation, edited_content, status, rejected_reason, posted_at, created_at')
    .in('status', ['approved', 'rejected', 'posted'])
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(`Failed to fetch history: ${error.message}`);
  return data;
}

export async function approveDraft(
  id: string,
  selectedVariation: string,
  editedContent?: string
): Promise<void> {
  const { error } = await supabase
    .from('x_post_drafts')
    .update({
      status: 'approved',
      selected_variation: selectedVariation,
      edited_content: editedContent || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(`Failed to approve draft: ${error.message}`);
}

export async function rejectDraft(id: string, reason?: string): Promise<void> {
  const { error } = await supabase
    .from('x_post_drafts')
    .update({
      status: 'rejected',
      rejected_reason: reason || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(`Failed to reject draft: ${error.message}`);
}

export async function markPosted(id: string): Promise<void> {
  const { error } = await supabase
    .from('x_post_drafts')
    .update({
      status: 'posted',
      posted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(`Failed to mark as posted: ${error.message}`);
}

export const xpostService = {
  generateDailyDraft,
  getDrafts,
  getHistory,
  approveDraft,
  rejectDraft,
  markPosted,
};
