// src/hooks/useReduceMotion.js
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let sub;
    
    // Get initial value
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    
    // Subscribe to changes (version-agnostic)
    if (AccessibilityInfo.addEventListener) {
      sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
      return () => {
        if (sub && typeof sub.remove === 'function') sub.remove();
      };
    }
    
    return undefined;
  }, []);
  
  return reduce;
}