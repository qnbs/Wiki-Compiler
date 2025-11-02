import { useEffect, useRef, RefObject } from 'react';

/**
 * Custom hook to trap focus within a component (e.g., a modal).
 * @param isOpen - Boolean to indicate if the trap is active.
 * @returns A ref to attach to the trapping element.
 */
// FIX: Made the hook generic and added proper types to support different element types and prevent type errors.
export const useFocusTrap = <T extends HTMLElement>(isOpen: boolean): RefObject<T> => {
  const ref = useRef<T>(null);
  const previouslyFocusedElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen || !ref.current) {
      return;
    }

    previouslyFocusedElement.current = document.activeElement;

    const focusableElements = ref.current.querySelectorAll<HTMLElement>(
      'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        return;
      }

      if (e.shiftKey) { // Shift+Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocusedElement.current && typeof (previouslyFocusedElement.current as HTMLElement).focus === 'function') {
        (previouslyFocusedElement.current as HTMLElement).focus();
      }
    };
  }, [isOpen]);

  return ref;
};