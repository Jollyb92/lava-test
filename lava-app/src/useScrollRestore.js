import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollRestore() {
  const { key } = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const saved = sessionStorage.getItem(`scroll:${key}`);
    if (saved) el.scrollTop = parseInt(saved, 10);

    function save() {
      sessionStorage.setItem(`scroll:${key}`, el.scrollTop);
    }
    el.addEventListener('scroll', save, { passive: true });
    return () => el.removeEventListener('scroll', save);
  }, [key]);

  return ref;
}
