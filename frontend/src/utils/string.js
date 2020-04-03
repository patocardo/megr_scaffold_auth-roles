import shuffle from './array';

export default function keyGenerate(text, length) {
  let key = text.replace(/\s/g, '');
  key = key.length > length ? key : key.padEnd(length, 'abcdefghijklmnopqrstuvwxyz');
  return shuffle(key.split('')).slice(0, length);
}