import { useState, useEffect, useRef } from 'react';

type CurryType = (fn: Function) => boolean;

export default function useCummulativeDelay(ms: number): CurryType {
  const [start, setStart] = useState(0);
  const [delayFn, setDelayFn] = useState<Function | null>(null);

  const timer = useRef(0);

  function setCurry(newDelayFn: Function): boolean {
    setDelayFn(newDelayFn);
    return true;
  }

  useEffect(() => {

    if (start > 0 && delayFn) {
      const now = (new Date()).getTime();
      const elapsed = now - start;
      if(elapsed > ms) {
        delayFn();
        setStart(now);
      } else {
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
          delayFn();
          setStart(0)
        }, elapsed);
      }
    }

    return () => clearTimeout(timer.current);
  }, [start]);

  return setCurry;
}
