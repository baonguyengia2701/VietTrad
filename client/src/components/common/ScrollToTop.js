import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = ({ 
  behavior = 'smooth', // 'smooth' hoặc 'instant'
  delay = 0, // Độ trễ trước khi scroll (ms)
  excludePaths = [] // Mảng các path không cần scroll to top
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Kiểm tra xem path hiện tại có nằm trong danh sách loại trừ không
    const shouldExclude = excludePaths.some(path => 
      pathname.startsWith(path)
    );

    if (shouldExclude) {
      return;
    }

    // Hàm scroll to top
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: behavior === 'instant' ? 'auto' : 'smooth'
      });
    };

    // Nếu có delay, sử dụng setTimeout
    if (delay > 0) {
      const timeoutId = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timeoutId);
    } else {
      scrollToTop();
    }
  }, [pathname, behavior, delay, excludePaths]);

  return null; // Component này không render gì cả
};

export default ScrollToTop; 