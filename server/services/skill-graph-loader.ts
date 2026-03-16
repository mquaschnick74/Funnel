// Assembles context for the X post generation agent by reading the content skill graph.
// Loads core brand/content nodes always. Loads platform and pattern nodes conditionally.

import * as fs from 'fs';
import * as path from 'path';

export type PostPlatform = 'x' | 'linkedin';

export type SlotName =
  | 'CVDC'
  | 'IBM_TYPE_A'
  | 'IBM_TYPE_B'
  | 'REGISTER_REAL'
  | 'REGISTER_IMAGINARY'
  | 'REGISTER_SYMBOLIC'
  | 'THEND'
  | 'CYVC'
  | 'THERAPY_DESERT';

export interface SkillGraphOptions {
  platform: PostPlatform;
  slotName: SlotName;
}

/** Maps each slot to its pattern markdown file. */
const SLOT_TO_PATTERN_NODE: Record<SlotName, string> = {
  CVDC: 'patterns/cvdc.md',
  IBM_TYPE_A: 'patterns/ibm-type-a.md',
  IBM_TYPE_B: 'patterns/ibm-type-b.md',
  REGISTER_REAL: 'patterns/register-real.md',
  REGISTER_IMAGINARY: 'patterns/register-imaginary.md',
  REGISTER_SYMBOLIC: 'patterns/register-symbolic.md',
  THEND: 'patterns/thend.md',
  CYVC: 'patterns/cyvc.md',
  THERAPY_DESERT: 'audience/therapy-desert.md',
};

/**
 * Reads a single markdown node from the content-skill-graph folder.
 * Returns empty string if the file does not exist.
 */
function readNode(relativeNodePath: string): string {
  const fullPath = path.join(process.cwd(), 'content-skill-graph', relativeNodePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`[SkillGraphLoader] Node not found: ${relativeNodePath}`);
    return '';
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  return `\n\n===== NODE: ${relativeNodePath} =====\n\n${content}`;
}

/**
 * Assembles the full system prompt from the skill graph.
 * Core brand + content nodes are always loaded.
 * Platform and pattern nodes are loaded based on options.
 */
export function loadSkillGraph(options: SkillGraphOptions): string {
  const { platform, slotName } = options;

  // Core nodes — always loaded
  const coreNodes: string[] = [
    'index.md',
    'brand/founder-identity.md',
    'brand/voice.md',
    'brand/writing-voice.md',
    'brand/forbidden.md',
    'brand/apple-principle.md',
    'content/post-architecture.md',
    'content/hooks.md',
    'content/pca-insight.md',
  ];

  // Platform node
  const platformNode = `platforms/${platform}.md`;

  // Pattern node for the assigned slot
  const patternNode = SLOT_TO_PATTERN_NODE[slotName];

  // Build the ordered list
  const nodesToLoad: string[] = [
    ...coreNodes,
    platformNode,
    patternNode,
  ];

  // Assemble
  const assembled = nodesToLoad
    .map(node => readNode(node))
    .filter(content => content.trim().length > 0)
    .join('');

  console.log(`[SkillGraphLoader] Loaded ${nodesToLoad.length} nodes for platform="${platform}", slot="${slotName}"`);
  return assembled;
}
