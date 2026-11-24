# @thai-word-styler/converter

SafeStyler's TypeScript library converts selected Thai words to mixed Thai and Latin spellings. The web app uses this package from the local npm workspace. The package is not published to npm.

```ts
import { categories, convertThai } from '@thai-word-styler/converter';

const result = convertThai('เงินเดือนและเงิน เปิดประมูล', {
  categories: ['finance', 'commerce'],
});

console.log(result.text); // เงินเดือนและเงิu เปิดปsะมูa
console.log(result.edits.map(({ original }) => original)); // ['เงิน', 'ประมูล']
```

- Call `convertThai(text)` to enable all categories. Pass `{ categories: [] }` to apply none. The exported `categories` list contains IDs and display labels.
- `status` is `ok` or `unsupported-segmentation`. In the latter case `text` is the original input and `edits` is empty. A runtime needs `Intl.Segmenter` with Thai locale support. The package does not fall back to substring replacement.
- `edits` are ordered and do not overlap. Each `from` and `to` is a UTF-16 offset into the original input, with `to` exclusive. `text.slice(from, to)` equals `original`.
- Rules match exact text at Thai word boundaries. Explicit keep rules and recognized URL, email, hashtag and mention spans win. For overlapping replacements, the earliest start wins, then the longest replacement at that start. Category selection does not turn off keep rules.
- No DOM, network or storage dependencies. Results may depend on the runtime's Thai word segmentation. The library does not claim that its spellings affect platform moderation outcomes.

## Add a rule

1. Add a unique `id` and `exact` to [`src/rules.ts`](src/rules.ts). Set `categories`, `forms`, `sourceNote` and `status`. Use `action: 'replace'` and an explicit `output`, or `action: 'keep'` to block edits across a span. Draft rules are stored but never applied.
2. For a reviewed replacement, add the expected output and a similar string that must stay unchanged to [`test/fixtures.mjs`](test/fixtures.mjs). Add a sentence fixture if the change affects Thai segmentation, overlap or protected text.
3. Run `npm test` and `npm run test:e2e` from the workspace root. The web reads categories and converts through this package, so there is no second set of rules to update.
