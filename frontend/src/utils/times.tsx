const magnitudes = ['y', 'M', 'd', 'h', 'm', 's'];

export function getDateArray(dateObj?: Date): number[] {
  const datetime = dateObj || new Date();
  const isoRE = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;
  const matched = datetime.toISOString().match(isoRE);
  return matched ? matched.splice(1).map(part => parseInt(part)) : [];
}

export default function getExpiration(expiresIn: null | string): number | null {
  if (!expiresIn) return null;
  const matcher = new RegExp('(\\d+)(' + magnitudes.join('|') + ')', 'i');
  const parts = expiresIn.match(matcher);
  if(!parts) return null;
  const now = getDateArray();
  const position = magnitudes.indexOf(parts[1]);
  const future = [...now];
  future[position] += parseInt(parts[0]);
  return (new Date(Date.prototype.constructor.apply(null, future))).getTime();
}

export function getRemaining(expiration: number | null): number {
  if(!expiration) return 0;
  return expiration - (new Date()).getTime();
}
