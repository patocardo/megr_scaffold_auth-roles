import { useState, useEffect, useRef } from 'react';

type CurryType = (fn: Function) => boolean;

export default function useCummulativeDelay(ms: number): CurryType {
  const start = useRef(0);
  const timer = useRef(0);

  function setCurry(delayFn: Function): boolean {
    const now = (new Date()).getTime();
    const elapsed = now - start.current;
    if(elapsed > ms) {
      delayFn();
      start.current = now;
    } else {
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        delayFn();
        start.current = now;
      }, elapsed);
    }
    return true;
  }

  return setCurry;
}