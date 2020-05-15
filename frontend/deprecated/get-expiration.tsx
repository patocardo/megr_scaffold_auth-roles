// import moment from 'moment;
/*
export default function getExpiration(expiresIn: null | string): Date | null {
  if (!expiresIn) return null;
  const parts = expiresIn.match(/(\d+)(\w+)?/);
  if(!parts) return null;
  const quantity:  = parseInt(parts[1]);
  let magnitude: unitOfTime.DurationConstructor = 'h';
  if((parts[2] && ['d', 'm', 'w', 'M'].includes(parts[2]))) {
    magnitude: unitOfTime.DurationConstructor = parts[2];
  }
  const magnitude: unitOfTime.DurationConstructor = (parts[2] && ['h', 'd', 'm'].includes(parts[2])) ? parts[2] : 'h';
  return moment().add(quantity, magnitude).toDate();
}
*/