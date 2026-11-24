export const categories = Object.freeze(([
  { id: 'finance', label: 'การเงินและทรัพย์สิน' },
  { id: 'commerce', label: 'การค้าและกิจกรรม' },
  { id: 'luck', label: 'โชคลาภและคำอวยพร' },
  { id: 'status', label: 'บุคคลและสถานะ' },
  { id: 'safety', label: 'ชีวิตและการคุ้มครอง' },
  { id: 'belief', label: 'ความเชื่อและสำนวน' },
  { id: 'animals', label: 'สัตว์' },
  { id: 'general', label: 'คำทั่วไป' },
] as const).map((category) => Object.freeze(category)));

export type CategoryId = (typeof categories)[number]['id'];
const formIds = ['word', 'compound', 'repetition', 'idiom', 'phrase'] as const;
type FormId = (typeof formIds)[number];

export type Rule = {
  readonly id: string;
  readonly exact: string;
  readonly categories: readonly CategoryId[];
  readonly forms: readonly FormId[];
  readonly sourceNote: string;
  readonly status: 'draft' | 'reviewed';
} & ({ readonly action: 'replace'; readonly output: string } | { readonly action: 'keep' });

const examples = 'ตัวอย่างจากผู้ใช้ในแผนชุดกฎ';

export const rules: readonly Rule[] = [
  { id: 'money', exact: 'เงิน', output: 'เงิu', categories: ['finance'], forms: ['word'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'cash', exact: 'เงินสด', output: 'เงิuสด', categories: ['finance'], forms: ['compound'], action: 'replace', sourceNote: 'ตัวอย่างรับเงินสดจากผู้ใช้', status: 'reviewed' },
  { id: 'gold', exact: 'ทองคำ', output: 'ทoงคำ', categories: ['finance'], forms: ['compound'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'fortune', exact: 'โชคลาภ', output: 'โชคaาภ', categories: ['luck'], forms: ['compound'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'wealth', exact: 'ทรัพย์', output: 'ทsัwย์', categories: ['finance'], forms: ['word'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'wealthy-person', exact: 'เศรษฐี', output: 'เศsษฐี', categories: ['status'], forms: ['word'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'lucky-repeated', exact: 'เฮงๆ', output: 'เฮvๆ', categories: ['luck'], forms: ['repetition'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'rich-repeated', exact: 'รวยๆ', output: 'sวยๆ', categories: ['luck'], forms: ['repetition'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'die', exact: 'ตาย', output: 'ตาE', categories: ['safety'], forms: ['word'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'escape-harm', exact: 'แคล้วคลาด', output: 'แคa้วคaาด', categories: ['safety', 'luck'], forms: ['idiom'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'protect', exact: 'ปกป้อง', output: 'ปกป้oง', categories: ['safety'], forms: ['word'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'open', exact: 'เปิด', output: 'Iปิด', categories: ['general'], forms: ['word'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'auction', exact: 'ประมูล', output: 'ปsะมูa', categories: ['commerce'], forms: ['word'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'ghost', exact: 'ผี', output: 'wี', categories: ['belief'], forms: ['word'], action: 'replace', sourceNote: 'อ่านต้นฉบับ wี เป็น ผี ตามค่าเริ่มต้นในแผน MVP', status: 'reviewed' },
  { id: 'counteract', exact: 'แก้กัน', output: 'IIก้กัu', categories: ['belief'], forms: ['compound'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'ward-off-harm', exact: 'กันภัย', output: 'กัuภัE', categories: ['safety'], forms: ['compound'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'black-magic', exact: 'คุณไสย มนต์ดำ', output: 'คุณไสE มuต์ดำ', categories: ['belief'], forms: ['phrase'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'evil-wind', exact: 'ลมเพลมพัด', output: 'aมเพaมพัด', categories: ['belief'], forms: ['idiom'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'tiger', exact: 'เสือ', output: 'เสืo', categories: ['animals'], forms: ['word'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'lion', exact: 'สิงห์', output: 'สิvห์', categories: ['animals'], forms: ['word'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'venomous-snake', exact: 'งูพิษ', output: 'vูwิษ', categories: ['animals'], forms: ['compound'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'venomous-reptile', exact: 'สัตว์เลื้อยคลานมีพิษ', output: 'สัตว์เลื้oยคลาuมีwิษ', categories: ['animals'], forms: ['phrase'], action: 'replace', sourceNote: examples, status: 'reviewed' },
  { id: 'salary', exact: 'เงินเดือน', categories: ['finance'], forms: ['compound'], action: 'keep', sourceNote: 'คงคำประสมตามแผน MVP', status: 'reviewed' },
  { id: 'assets', exact: 'ทรัพย์สิน', categories: ['finance'], forms: ['compound'], action: 'keep', sourceNote: 'คงคำประสมตามแผน MVP', status: 'reviewed' },
  { id: 'fixed', exact: 'ตายตัว', categories: ['safety'], forms: ['compound'], action: 'keep', sourceNote: 'คงคำประสมตามแผน MVP', status: 'reviewed' },
  { id: 'butterfly', exact: 'ผีเสื้อ', categories: ['animals'], forms: ['compound'], action: 'keep', sourceNote: 'คงคำประสมแม้ runtime จะตัดเป็นหลายส่วน', status: 'reviewed' },
];

export function validateRules(entries: readonly Rule[]): void {
  const ids = new Set<string>();
  const exacts = new Set<string>();
  const categoryIds = new Set(categories.map(({ id }) => id));
  const thaiText = /^[\p{Script=Thai} ]+$/u;
  const mixedText = /^[\p{Script=Thai}A-Za-z ]+$/u;

  for (const rule of entries) {
    const invalid = !/^[a-z][a-z0-9-]*$/.test(rule.id) || ids.has(rule.id) || exacts.has(rule.exact)
      || !thaiText.test(rule.exact) || rule.exact !== rule.exact.trim() || rule.exact.includes('  ')
      || !rule.sourceNote.trim()
      || rule.categories.length === 0 || rule.categories.some((id) => !categoryIds.has(id))
      || rule.forms.length === 0 || rule.forms.some((form) => !formIds.includes(form));
    if (invalid) throw new Error(`Invalid or duplicate rule: ${rule.id} (${rule.exact})`);

    if (rule.action === 'replace' && (rule.output === rule.exact || !mixedText.test(rule.output)
      || rule.output !== rule.output.trim() || !/[A-Za-z]/.test(rule.output)
      || rule.output.split(' ').some((piece) => !piece)
      || rule.output.split(' ').length !== rule.exact.split(' ').length)) {
      throw new Error(`Invalid replacement: ${rule.id}`);
    }

    ids.add(rule.id);
    exacts.add(rule.exact);
  }
}
