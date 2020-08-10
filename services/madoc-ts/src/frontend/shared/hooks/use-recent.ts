import { useLocalStorage } from './use-local-storage';

export function useRecent<T>(name: string, defaultValue: T[] = [], length = 5) {
  const [lastFewItems, setLastFewItems] = useLocalStorage<T[]>(name, defaultValue);

  const rememberItem = (newItem: T) => {
    if (lastFewItems.length < length) {
      return setLastFewItems(i => [...i, newItem]);
    }

    const items = lastFewItems.slice(-4);
    return setLastFewItems([...items, newItem]);
  };

  return [lastFewItems, rememberItem] as const;
}
