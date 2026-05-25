import { useEffect, useState, type RefObject } from 'react';

/** Track an element's height via ResizeObserver (for syncing panel heights). */
export function useElementHeight(
  ref: RefObject<HTMLElement | null>,
  deps: unknown[] = [],
): number | undefined {
  const [height, setHeight] = useState<number | undefined>();

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const update = () => {
      setHeight(el.getBoundingClientRect().height);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return height;
}
