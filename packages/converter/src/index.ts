import { createConverter } from './engine.js';
import { rules } from './rules.js';

export { categories } from './rules.js';
export type { CategoryId } from './rules.js';
export type { ConversionOptions, ConversionResult, Edit } from './engine.js';

export const convertThai = createConverter(rules);
