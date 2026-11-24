import { expect, test } from '@playwright/test';
import { sentenceExamples } from '../../packages/converter/test/fixtures.mjs';

test('the web demo uses the converter and copies the exact displayed output', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  const source = page.getByLabel('ข้อความต้นฉบับ');
  await source.fill('เปิดประมูล เงินเดือนและเงิน 😊');
  await page.getByRole('button', { name: 'แปลงข้อความ' }).click();
  const output = page.getByLabel('ข้อความที่แปลงแล้ว');
  const expected = 'Iปิดปsะมูa เงินเดือนและเงิu 😊';
  await expect(output).toHaveValue(expected);
  await expect(page.getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('status')).toHaveText('เปลี่ยน 3 ตำแหน่ง');
  await page.getByRole('button', { name: 'คัดลอกผลลัพธ์' }).click();
  await expect(page.getByRole('status')).toHaveText('คัดลอกข้อความแล้ว');
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(expected);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(requests).toEqual([]);
});

test('when clipboard access fails the full output is selected for manual copying', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: undefined }));
  await page.goto('/');
  await page.getByLabel('ข้อความต้นฉบับ').fill('ฉันมีเงินแล้ว');
  await page.getByRole('button', { name: 'แปลงข้อความ' }).click();
  await page.getByRole('button', { name: 'คัดลอกผลลัพธ์' }).click();
  const output = page.getByLabel('ข้อความที่แปลงแล้ว');
  await expect(output).toBeFocused();
  await expect(page.getByRole('status')).toContainText('คัดลอกอัตโนมัติไม่ได้');
  expect(await output.evaluate((element: HTMLTextAreaElement) =>
    element.value.slice(element.selectionStart, element.selectionEnd))).toBe('ฉันมีเงิuแล้ว');
});

test('changing a category or the source invalidates the previous output', async ({ page }) => {
  await page.goto('/');
  const output = page.getByLabel('ข้อความที่แปลงแล้ว');
  const convert = page.getByRole('button', { name: 'แปลงข้อความ' });
  const copy = page.getByRole('button', { name: 'คัดลอกผลลัพธ์' });
  await page.getByRole('button', { name: 'ใส่ตัวอย่าง' }).click();
  await convert.click();
  await expect(output).toHaveValue('ฉันมีเงิuแล้ว ขอให้เฮvๆ และแคa้วคaาด 😊');
  await page.getByRole('checkbox', { name: 'การเงินและทรัพย์สิน' }).uncheck();
  await expect(output).toHaveValue('');
  await expect(copy).toBeDisabled();
  await convert.click();
  await expect(output).toHaveValue('ฉันมีเงินแล้ว ขอให้เฮvๆ และแคa้วคaาด 😊');
  await page.getByLabel('ข้อความต้นฉบับ').fill(' ');
  await convert.click();
  await expect(page.getByRole('status')).toHaveText('ใส่ข้อความต้นฉบับก่อนแปลง');
  await expect(copy).toBeDisabled();
});

test('browser word boundaries produce the expected sentences', async ({ page }) => {
  await page.goto('/');
  const source = page.getByLabel('ข้อความต้นฉบับ');
  const output = page.getByLabel('ข้อความที่แปลงแล้ว');
  const convert = page.getByRole('button', { name: 'แปลงข้อความ' });
  for (const [input, expected] of sentenceExamples) {
    if (input === '' || input.includes('\r')) continue;
    await source.fill(input);
    await convert.click();
    await expect(output, JSON.stringify(input)).toHaveValue(expected);
  }
});

test('a missing Thai segmenter leaves the input unchanged and reports it', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(Intl, 'Segmenter', { value: undefined, configurable: true }));
  await page.goto('/');
  await page.getByLabel('ข้อความต้นฉบับ').fill('ฉันมีเงินแล้ว');
  await page.getByRole('button', { name: 'แปลงข้อความ' }).click();
  await expect(page.getByLabel('ข้อความที่แปลงแล้ว')).toHaveValue('ฉันมีเงินแล้ว');
  await expect(page.getByRole('status')).toContainText('ไม่รองรับการตัดคำไทย');
});
