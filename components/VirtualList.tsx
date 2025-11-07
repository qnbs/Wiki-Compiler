import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, style: React.CSSProperties) => React.ReactNode;
  getKey: (item: T) => React.Key;
  overscan?: number;
}

export const VirtualList = <T,>({ items, itemHeight, renderItem, getKey, overscan = 5 }: VirtualListProps<T>) => {
  const containerRef = useRef<HTMLUListElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const updateViewportHeight = useCallback(() => {
    if (containerRef.current) {
      setViewportHeight(containerRef.current.clientHeight);
    }
  }, []);

  useEffect(() => {
    updateViewportHeight();
    const container = containerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver(updateViewportHeight);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [updateViewportHeight]);

  const handleScroll = (event: React.UIEvent<HTMLUListElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  const virtualItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(items.length, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan);
    
    const rendered = [];
    for (let i = startIndex; i < endIndex; i++) {
      const item = items[i];
      if (item) {
        const element = renderItem(item, {
            position: 'absolute',
            top: `${i * itemHeight}px`,
            height: `${itemHeight}px`,
            width: '100%',
        }) as React.ReactElement;

        rendered.push(React.cloneElement(element, { key: getKey(item) }));
      }
    }
    return rendered;
  }, [scrollTop, viewportHeight, items, itemHeight, overscan, renderItem, getKey]);

  return (
    <ul ref={containerRef} onScroll={handleScroll} className="relative h-full overflow-y-auto">
      <div style={{ height: `${items.length * itemHeight}px`, position: 'relative' }}>
        {virtualItems}
      </div>
    </ul>
  );
};
