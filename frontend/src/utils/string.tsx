import shuffle from './array';

export default function keyGenerate(text: string, length: number): string {
  let key = text.replace(/\s/g, '');
  key = key.length > length ? key : key.padEnd(length, 'abcdefghijklmnopqrstuvwxyz');
  return shuffle(key.split('')).slice(0, length).join('');
}

export function safeParseJSON(text: string, alter?: any): any {
  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch (e) {
    return (typeof alter === 'undefined') ? null : alter;
  }
}