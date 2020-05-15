import {useRef, useEffect, EffectCallback} from 'react';
import { isEqual } from 'lodash';

function useDeepCompare(value: any[]) {
  const prev = useRef<any[]>([]);
  if(!isEqual(value, prev.current)) {
    prev.current = value;
  }
  return prev.current;
}

export default function useEffectDeep(callback: EffectCallback, dependencies: any[]) {
  useEffect(callback, useDeepCompare(dependencies))
}