// Assembles context for the X post generation agent by reading the content skill graph.
// Always loads core nodes. Loads platform and topic nodes based on parameters.

import * as fs from 'fs';
import * as path from 'path';

export type PostPlatform = 'x' | 'linkedin';
export type PostTopic = 'therapy-desert' | 'pca' | 'general';

export interface SkillGraphOptions {
  platform: PostPlatform;
  topic?: PostTopic;
}

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
 * Core nodes are always loaded.
 * Platform and topic nodes are loaded conditionally.
 */
export function loadSkillGraph(options: SkillGraphOptions): string {
  const { platform, topic = 'therapy-desert' } = options;

  // Core nodes — always loaded regardless of platform or topic
  const coreNodes: string[] = [
    'index.md',
    'brand/voice.md',
    'brand/forbidden.md',
    'brand/apple-principle.md',
    'content/hooks.md',
  ];

  // Platform node — loaded based on destination platform
  const platformNode = `platforms/${platform}.md`;

  // Topic nodes — loaded based on what the post is about
  const topicNodeMap: Record<PostTopic, string> = {
    'therapy-desert': 'audience/therapy-desert.md',
    'pca': 'content/pca-insight.md',
    'general': '',
  };
  const topicNode = topicNodeMap[topic];

  // Build the ordered list of nodes to load
  const nodesToLoad: string[] = [
    ...coreNodes,
    platformNode,
    ...(topicNode ? [topicNode] : []),
  ];

  // Assemble and return the full context string
  const assembled = nodesToLoad
    .map(node => readNode(node))
    .filter(content => content.trim().length > 0)
    .join('');

  console.log(`[SkillGraphLoader] Loaded ${nodesToLoad.length} nodes for platform="${platform}", topic="${topic}"`);
  return assembled;
}
