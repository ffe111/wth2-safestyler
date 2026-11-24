import { categories, convertThai } from '@thai-word-styler/converter';
import type { CategoryId, Edit } from '@thai-word-styler/converter';
import './style.css';

const form = document.querySelector<HTMLFormElement>('#converter-form')!;
const source = document.querySelector<HTMLTextAreaElement>('#source')!;
const output = document.querySelector<HTMLTextAreaElement>('#output')!;
const example = document.querySelector<HTMLButtonElement>('#example')!;
const convert = document.querySelector<HTMLButtonElement>('#convert')!;
const copy = document.querySelector<HTMLButtonElement>('#copy')!;
const categoryGroup = document.querySelector('#categories')!;
const status = document.querySelector('#status')!;
const changes = document.querySelector<HTMLElement>('#changes')!;
const editList = document.querySelector('#edits')!;

const checks = categories.map(({ id, label }) => {
  const wrapper = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = true;
  wrapper.append(box, document.createTextNode(label));
  categoryGroup.append(wrapper);
  return { id, box };
});

let resultVersion = 0;

function renderEdits(edits: readonly Edit[]): void {
  const list = document.createDocumentFragment();
  for (const { original, output: replacement } of edits) {
    const item = document.createElement('li');
    const before = document.createElement('span');
    const after = document.createElement('strong');
    before.textContent = original;
    after.textContent = replacement;
    item.append(before, document.createTextNode(' → '), after);
    list.append(item);
  }
  editList.replaceChildren(list);
  changes.hidden = edits.length === 0;
}

function invalidate(): void {
  resultVersion++;
  output.value = '';
  copy.disabled = true;
  renderEdits([]);
  status.textContent = 'กดแปลงข้อความเพื่อดูผลล่าสุด';
}

source.addEventListener('input', invalidate);
categoryGroup.addEventListener('change', invalidate);
example.addEventListener('click', () => {
  source.value = 'ฉันมีเงินแล้ว ขอให้เฮงๆ และแคล้วคลาด 😊';
  invalidate();
  source.focus();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (source.value.trim() === '') {
    invalidate();
    status.textContent = 'ใส่ข้อความต้นฉบับก่อนแปลง';
    source.focus();
    return;
  }
  resultVersion++;
  const selected: CategoryId[] = checks.filter(({ box }) => box.checked).map(({ id }) => id);
  const result = convertThai(source.value, { categories: selected });
  output.value = result.text;
  copy.disabled = false;
  renderEdits(result.edits);
  if (result.status === 'unsupported-segmentation') {
    status.textContent = 'เบราว์เซอร์นี้ไม่รองรับการตัดคำไทย ข้อความจึงยังเหมือนเดิม';
  } else if (selected.length === 0) {
    status.textContent = 'ยังไม่ได้เลือกหมวด ข้อความจึงยังเหมือนเดิม';
  } else {
    status.textContent = result.edits.length === 0 ? 'ไม่พบคำที่ตรงกับชุดกฎ' : `เปลี่ยน ${result.edits.length} ตำแหน่ง`;
  }
});

copy.addEventListener('click', async () => {
  const version = resultVersion;
  copy.disabled = true;
  try {
    await navigator.clipboard.writeText(output.value);
    if (version === resultVersion) status.textContent = 'คัดลอกข้อความแล้ว';
  } catch {
    if (version !== resultVersion) return;
    output.focus();
    output.select();
    status.textContent = 'คัดลอกอัตโนมัติไม่ได้ เลือกคัดลอกจากช่องผลลัพธ์ได้เลย';
  } finally {
    if (version === resultVersion) copy.disabled = false;
  }
});

example.disabled = false;
convert.disabled = false;
