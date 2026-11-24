import { validateRules } from './rules.js';
import type { CategoryId, Rule } from './rules.js';

export type ConversionOptions = { readonly categories?: readonly CategoryId[] };

export type Edit = {
  /** Inclusive UTF-16 offset in the original input, suitable for String.slice. */
  readonly from: number;
  /** Exclusive UTF-16 offset in the original input. */
  readonly to: number;
  readonly original: string;
  readonly output: string;
  readonly ruleId: string;
};

export type ConversionResult = {
  readonly status: 'ok' | 'unsupported-segmentation';
  readonly text: string;
  readonly edits: readonly Edit[];
};

type Range = { from: number; to: number };
type Replacement = Extract<Rule, { action: 'replace' }>;

const url = /(?<![A-Za-z0-9])(?:(?:https?|ftp):\/\/|www\.)[^\s<>"'`]+/u;
const email = /(?<![\p{L}\p{M}\p{N}._%+!$&'-])[\p{L}\p{M}\p{N}._%+!$&'-]+@[\p{L}\p{M}\p{N}-]+(?:\.[\p{L}\p{M}\p{N}-]+)+/u;
const bareDomain = /(?<![\p{L}\p{M}\p{N}._-])(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,}(?![\p{L}\p{M}\p{N}-])(?:[/?#][^\s<>"'`]*)?/u;
const socialReference = /[@#][\p{L}\p{M}\p{N}_]+/u;
const protectedSpan = new RegExp([url, email, bareDomain, socialReference].map((pattern) => pattern.source).join('|'), 'giu');

function protectedRanges(text: string): Range[] {
  return Array.from(text.matchAll(protectedSpan), (match) => ({ from: match.index, to: match.index + match[0].length }));
}

function mergeRanges(ranges: Range[]): Range[] {
  const merged: Range[] = [];
  for (const range of ranges.sort((a, b) => a.from - b.from)) {
    const last = merged.at(-1);
    if (last && range.from <= last.to) last.to = Math.max(last.to, range.to);
    else merged.push(range);
  }
  return merged;
}

function rangeCursor(ranges: readonly Range[]): (from: number, to: number) => boolean {
  let i = 0;
  return (from, to) => {
    while (i < ranges.length && ranges[i].to <= from) i++;
    return i < ranges.length && ranges[i].from < to;
  };
}

function indexRules<T extends Rule>(entries: readonly T[]): ReadonlyMap<string, readonly T[]> {
  const index = new Map<string, T[]>();
  for (const rule of entries) {
    const first = rule.exact[0];
    const bucket = index.get(first);
    if (bucket) bucket.push(rule);
    else index.set(first, [rule]);
  }
  for (const bucket of index.values()) bucket.sort((a, b) => b.exact.length - a.exact.length);
  return index;
}

export function createConverter(entries: readonly Rule[]): (text: string, options?: ConversionOptions) => ConversionResult {
  validateRules(entries);
  const active = entries.filter(({ status }) => status === 'reviewed');
  const keep = indexRules(active.filter((rule) => rule.action === 'keep'));
  const replacements = indexRules(active.filter((rule): rule is Replacement => rule.action === 'replace'));
  const segmenter = typeof globalThis.Intl?.Segmenter === 'function' && Intl.Segmenter.supportedLocalesOf('th').length > 0
    ? new Intl.Segmenter('th', { granularity: 'word' })
    : undefined;

  return (text, options) => {
    if (!segmenter) return { status: 'unsupported-segmentation', text, edits: [] };
    if (!text || options?.categories?.length === 0) return { status: 'ok', text, edits: [] };
    const selected = options?.categories && new Set(options.categories);
    const starts: number[] = [];
    const ends = new Set<number>();
    for (const { index, segment, isWordLike } of segmenter.segment(text)) {
      if (isWordLike) {
        starts.push(index);
        ends.add(index + segment.length);
      }
    }

    const protectedSpans = protectedRanges(text);
    const overlapsLink = rangeCursor(protectedSpans);
    const keepSpans: Range[] = [];
    for (const start of starts) {
      for (const rule of keep.get(text[start]) ?? []) {
        const end = start + rule.exact.length;
        if (ends.has(end) && text.startsWith(rule.exact, start) && !overlapsLink(start, end)) {
          keepSpans.push({ from: start, to: end });
        }
      }
    }
    const isBlocked = rangeCursor(mergeRanges([...protectedSpans, ...keepSpans]));
    const edits: Edit[] = [];
    const chunks: string[] = [];
    let offset = 0;
    for (const start of starts) {
      if (start < offset) continue;
      for (const rule of replacements.get(text[start]) ?? []) {
        if (selected && !rule.categories.some((id) => selected.has(id))) continue;
        const end = start + rule.exact.length;
        if (!ends.has(end) || !text.startsWith(rule.exact, start) || isBlocked(start, end)) continue;

        chunks.push(text.slice(offset, start), rule.output);
        edits.push({ from: start, to: end, original: rule.exact, output: rule.output, ruleId: rule.id });
        offset = end;
        break;
      }
    }
    if (edits.length === 0) return { status: 'ok', text, edits };
    chunks.push(text.slice(offset));
    return { status: 'ok', text: chunks.join(''), edits };
  };
}
