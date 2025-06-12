import { useCallback } from 'react';

const useScrollToTop = () => {
  const scrollToTop = useCallback((options = {}) => {
    const {
      behavior = 'smooth',
      delay = 0,
      top = 0,
      left = 0
    } = options;

    const scroll = () => {
      window.scrollTo({
        top,
        left,
        behavior: behavior === 'instant' ? 'auto' : 'smooth'
      });
    };

    if (delay > 0) {
      setTimeout(scroll, delay);
    } else {
      scroll();
    }
  }, []);

  const scrollToElement = useCallback((elementId, options = {}) => {
    const {
      behavior = 'smooth',
      delay = 0,
      block = 'start',
      inline = 'nearest'
    } = options;

    const scrollToEl = () => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({
          behavior: behavior === 'instant' ? 'auto' : 'smooth',
          block,
          inline
        });
      }
    };

    if (delay > 0) {
      setTimeout(scrollToEl, delay);
    } else {
      scrollToEl();
    }
  }, []);

  return { scrollToTop, scrollToElement };
};

export default useScrollToTop; 