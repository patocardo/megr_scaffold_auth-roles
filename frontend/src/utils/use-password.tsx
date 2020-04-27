import { useState } from 'react';

type usePassReturnType = [
  string[],
  (value: string) => boolean
]

export default function usePassword(): usePassReturnType {
    const [ missing, setMissing] = useState<string[]>([]);

    function isValidPass(value: string): boolean {
      const nongood = [];
      if (value.length < 5) nongood.push('Password should be longer than 4 characters');
      if (!/\d/.test(value)) nongood.push('Password must have at least one digit');
      if (!/[a-z]/.test(value)) nongood.push('Password must have at least one lowercase character');
      if (!/[A-Z]/.test(value)) nongood.push('Password must have at least one uppercase character');
      setMissing(nongood);
      return nongood.length === 0;
    }

    return [ missing, isValidPass ];
}