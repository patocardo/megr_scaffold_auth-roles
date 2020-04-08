// simple array operations

export default function shuffle(arr: Array<any>) {
  let currentIndex = arr.length;
  const rtrnArr = [...arr];
  let temporaryValue;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = rtrnArr[currentIndex];
    rtrnArr[currentIndex] = rtrnArr[randomIndex];
    rtrnArr[randomIndex] = temporaryValue;
  }

  return rtrnArr;
}
