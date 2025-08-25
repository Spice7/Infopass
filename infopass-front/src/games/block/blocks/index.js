import { BASE_BLOCKS, generateBlocks as baseRegister } from "./baseBlocks.js";
import { RECURSE_BLOCKS, generateBlocks as recurRegister } from "./recursiveBlocks.js";

const BLOCK_DEFINITIONS = [
    ...BASE_BLOCKS,
    ...RECURSE_BLOCKS
];

const blockRegister = () => {
    baseRegister();
    recurRegister();
};

export { BLOCK_DEFINITIONS, blockRegister };