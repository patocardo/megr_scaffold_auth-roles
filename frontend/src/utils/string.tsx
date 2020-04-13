import shuffle from './array';

export default function keyGenerate(text: string, length: number): string {
  let key = text.replace(/\s/g, '');
  key = key.length > length ? key : key.padEnd(length, 'abcdefghijklmnopqrstuvwxyz');
  return shuffle(key.split('')).slice(0, length).join('');
}