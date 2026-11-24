# SafeStyler · ไทยผสมอักษร

[ภาษาไทย](README.th.md) · [Converter API](packages/converter/README.md)

SafeStyler is a Thai text converter that replaces selected words with mixed Thai and Latin spellings. Use the browser app to preview each change before you copy the result. Use the TypeScript library when you need the same rules in your own code.

| Input | Output |
| --- | --- |
| `รับเงินสดล้วน ๆ` | `รับเงิuสดล้วน ๆ` |
| `เงินเดือนและเงิน` | `เงินเดือนและเงิu` |
| `#เงินสด เงินสด` | `#เงินสด เงิuสด` |

SafeStyler matches words and phrases rather than replacing every matching letter. The app processes your text in the browser and does not send it to a server. The rules are not a platform's banned-word list, and the output does not guarantee any platform moderation outcome.

## Run the web app

Use Node.js 20.19 or later in the 20.x series, or Node.js 22.12 or later.

```sh
npm ci
npm run dev
```

Open the URL that Vite prints. Enter Thai text or select **ใส่ตัวอย่าง** to load a sample. Choose the categories you want, then select **แปลงข้อความ** to convert the text. Review **คำที่เปลี่ยน** to see what changed, then select **คัดลอกผลลัพธ์** to copy the result.

## Call the converter from TypeScript

The web app imports `@thai-word-styler/converter` from this repository's npm workspace. The package is not published to npm. From the repository root, run `npm run build` before importing the workspace package locally.

```ts
import { convertThai } from '@thai-word-styler/converter';

const result = convertThai('เงินเดือนและเงิน', { categories: ['finance'] });

console.log(result.text); // เงินเดือนและเงิu
console.log(result.edits.map(({ original }) => original)); // ['เงิน']
```

The [converter API](packages/converter/README.md) describes the result, supported runtimes, and how to add a rule.

## Build and test the project

```sh
npm test
npx playwright install chromium
npm run test:e2e
```

The browser tests run against the production build in Chromium with desktop and emulated mobile profiles. To build without running the browser tests, run `npm run build`. The static site is in `apps/web/dist/` and needs no backend.

## Suggest a spelling or report a missed match

[Open an issue](https://github.com/ffe111/wth2-safestyler/issues/new) with a short, non-private Thai example. Include the current result, the result you expected, and any lookalike word that should stay unchanged. For a pull request, update the [shared rule list](packages/converter/src/rules.ts) and add a [test example](packages/converter/test/fixtures.mjs).

Write development documentation in English first. Mirror user-facing README changes in [README.th.md](README.th.md).

## License

SafeStyler uses the [MIT License](LICENSE).
