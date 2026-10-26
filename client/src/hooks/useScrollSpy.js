import { useState, useEffect } from 'react';

/**
 * useScrollSpy
 * Observes section IDs and tracks which section is currently active in the viewport.
 * 
 * @param {string[]} sectionIds - List of DOM element IDs without '#'
 * @param {number} offset - Pixel offset from top of viewport (e.g. for fixed navbar)
 * @returns {string} activeId - ID of current active section
 */
export function useScrollSpy(sectionIds = [], offset = 120) {
  const [activeId, setActiveId] = useState(sectionIds[0] || '');

  useEffect(() => {
    if (!sectionIds.length) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset;

      // Find the current section
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const element = document.getElementById(id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            setActiveId(id);
            return;
          }
        }
      }

      // Default to first section if scrolled to top
      if (sectionIds.length > 0 && window.scrollY < 200) {
        setActiveId(sectionIds[0]);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds, offset]);

  return activeId;
}

export default useScrollSpy;
