import './blocks.js';
import { registerAllBlocks } from './blocks.js';

registerAllBlocks();

export { JavaGenerator, BLOCK_MESSAGES, BLOCK_COLORS } from './blocks.js';
export * as Blockly from 'blockly';