/** Bounded input masks. Literal separators are inserted during edits; hints remain presentation-only. */
export type MaskSlot = '#' | '@' | '*';
export type MaskToken = { kind: 'slot'; slot: MaskSlot; hint: string } | { kind: 'literal'; text: string };
export interface InputMask {
  tokens: MaskToken[];
  template: string;
  example: string;
}
export interface MaskResult {
  value: string;
  caret: number;
  accepted: boolean;
}

export function acceptsSlot(slot: MaskSlot, char: string): boolean {
  return slot === '#' ? /^[0-9]$/.test(char) : slot === '@' ? /^\p{L}$/u.test(char) : /^[\p{L}0-9]$/u.test(char);
}

export function compileMask(pattern: string, custom = false): InputMask | string {
  if (!pattern || pattern.length > 48) return 'Use a pattern of 1 to 48 characters.';
  const tokens: MaskToken[] = [];
  let escaped = false;
  for (const char of pattern) {
    if (escaped) {
      tokens.push({ kind: 'literal', text: char });
      escaped = false;
    } else if (custom && char === '\\') {
      escaped = true;
    } else if (custom ? '#@*'.includes(char) : 'DMYHms'.includes(char)) {
      tokens.push({ kind: 'slot', slot: custom ? (char as MaskSlot) : '#', hint: char });
    } else {
      tokens.push({ kind: 'literal', text: char });
    }
  }
  if (escaped) return 'Finish the escape: put a character after the final backslash.';
  const slots = tokens.filter(token => token.kind === 'slot');
  if (!slots.length || slots.length > 32) return 'Use between 1 and 32 input slots.';
  let digits = 0;
  let letters = 0;
  return {
    tokens,
    template: tokens.map(token => (token.kind === 'slot' ? token.hint : token.text)).join(''),
    example: tokens
      .map(token =>
        token.kind === 'literal'
          ? token.text
          : token.slot === '@'
            ? String.fromCharCode(65 + (letters++ % 26))
            : String(++digits % 10)
      )
      .join(''),
  };
}

/** Reads formatted or unseparated input atomically. Never drops unexpected or overflow characters. */
export function readMask(mask: InputMask, text: string, offset = 0): string[] | undefined {
  const data: string[] = [];
  const chars = Array.from(text);
  const slots = mask.tokens
    .slice(offset)
    .filter((token): token is Extract<MaskToken, { kind: 'slot' }> => token.kind === 'slot');
  // Prefer slot data when literals and data overlap (e.g. typing M into MS-@@).
  // Never consume a user's first letter/digit merely because it also matches a fixed prefix.
  if (chars.length <= slots.length && chars.every((char, i) => acceptsSlot(slots[i].slot, char))) return chars;
  let cursor = 0;
  let tokenIndex = offset;
  while (cursor < chars.length && tokenIndex < mask.tokens.length) {
    const token = mask.tokens[tokenIndex++];
    if (token.kind === 'literal') {
      if (chars[cursor] === token.text) cursor++;
    } else {
      if (!acceptsSlot(token.slot, chars[cursor])) return undefined;
      data.push(chars[cursor++]);
    }
  }
  return cursor === chars.length ? data : undefined;
}

export function renderMask(mask: InputMask, data: string[]): string {
  if (!data.length) return '';
  let result = '';
  let index = 0;
  for (const token of mask.tokens) {
    if (token.kind === 'slot') {
      if (index === data.length) break;
      const char = data[index++];
      if (!acceptsSlot(token.slot, char)) return '';
      result += char;
    } else {
      result += token.text;
    }
  }
  // Separators appear as soon as their preceding group is complete.
  return result;
}

export function maskFits(mask: InputMask, value: string): boolean {
  const data = readMask(mask, value);
  if (!data) return false;
  const rendered = renderMask(mask, data);
  // A group may end immediately before its automatically inserted separator.
  const length = Array.from(value).length;
  return (
    rendered === value ||
    (rendered.startsWith(value) &&
      mask.tokens.slice(length, Array.from(rendered).length).every(token => token.kind === 'literal'))
  );
}

export function maskComplete(mask: InputMask, value: string): boolean {
  const data = readMask(mask, value);
  return (
    !!data &&
    data.length === mask.tokens.filter(token => token.kind === 'slot').length &&
    renderMask(mask, data) === value
  );
}

export function remainingMask(mask: InputMask, value: string): string {
  return Array.from(mask.template).slice(Array.from(value).length).join('');
}

function slotCount(mask: InputMask, position: number, value: string): number {
  return mask.tokens.slice(0, Array.from(value.slice(0, position)).length).filter(token => token.kind === 'slot')
    .length;
}
function positionAfterSlots(mask: InputMask, count: number): number {
  let index = 0;
  let slots = 0;
  while (index < mask.tokens.length) {
    if (mask.tokens[index].kind === 'slot' && slots === count) break;
    if (mask.tokens[index].kind === 'slot') slots++;
    index++;
  }
  return index;
}

/** Edits slot data rather than literal characters, so Backspace/Delete cannot get stuck on a separator. */
export function editMask(
  mask: InputMask,
  value: string,
  start: number,
  end: number,
  inserted: string,
  deletion?: 'backward' | 'forward'
): MaskResult {
  const original = readMask(mask, value);
  const reject = { value, caret: start, accepted: false };
  if (!original) return reject;
  let from = slotCount(mask, start, value);
  let to = slotCount(mask, end, value);
  if (deletion && from === to) {
    if (deletion === 'backward') from = Math.max(0, from - 1);
    else to = Math.min(original.length, to + 1);
  }
  // Retain literals preceding the insertion point to permit formatted partial pastes.
  const offset = start === 0 ? 0 : positionAfterSlots(mask, from);
  const addition = readMask(mask, inserted, offset);
  if (!addition || (inserted && !addition.length)) return reject;
  const data = [...original.slice(0, from), ...addition, ...original.slice(to)];
  if (data.length > mask.tokens.filter(token => token.kind === 'slot').length) return reject;
  let slot = 0;
  if (mask.tokens.some(token => token.kind === 'slot' && slot < data.length && !acceptsSlot(token.slot, data[slot++])))
    return reject;
  const next = renderMask(mask, data);
  return {
    value: next,
    caret: Array.from(next)
      .slice(0, positionAfterSlots(mask, from + addition.length))
      .join('').length,
    accepted: true,
  };
}

/** Native change fallback (autofill, cut, drag/drop, composition and keyboard input). */
export function changedRange(previous: string, next: string): { start: number; end: number; text: string } {
  const previousChars = Array.from(previous);
  const nextChars = Array.from(next);
  let prefix = 0;
  let start = 0;
  while (prefix < previousChars.length && prefix < nextChars.length && previousChars[prefix] === nextChars[prefix]) {
    start += previousChars[prefix].length;
    prefix++;
  }
  let previousEnd = previousChars.length;
  let nextEnd = nextChars.length;
  let suffixLength = 0;
  while (previousEnd > prefix && nextEnd > prefix && previousChars[previousEnd - 1] === nextChars[nextEnd - 1]) {
    suffixLength += previousChars[--previousEnd].length;
    nextEnd--;
  }
  // Compare code points above, then return browser selection offsets without splitting either string.
  return { start, end: previous.length - suffixLength, text: next.slice(start, next.length - suffixLength) };
}

/** Maps fallback edits to whole Unicode characters, optionally skipping fixed mask separators. */
export function textEditRange(
  value: string,
  start: number,
  end: number,
  deletion?: 'backward' | 'forward',
  mask?: InputMask
): { start: number; end: number } {
  const offsets = [0];
  for (const char of value) offsets.push(offsets[offsets.length - 1] + char.length);
  let from = 0;
  while (from + 1 < offsets.length && offsets[from + 1] <= start) from++;
  let to = from;
  while (to + 1 < offsets.length && offsets[to] < end) to++;
  if (deletion && from === to) {
    if (deletion === 'backward') {
      while (from > 0 && mask?.tokens[from - 1]?.kind === 'literal') from--;
      to = from;
      from = Math.max(0, from - 1);
    } else {
      while (from + 1 < offsets.length && mask?.tokens[from]?.kind === 'literal') from++;
      to = Math.min(offsets.length - 1, from + 1);
    }
  }
  return { start: offsets[from], end: offsets[to] };
}
