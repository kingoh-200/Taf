import { useState, useEffect } from 'react';

/**
 * Debounced value hook — delays updating the value until the user stops typing.
 * @param value - the input value
 * @param delay - debounce delay in ms (default 300)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
