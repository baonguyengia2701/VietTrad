# ScrollToTop Component & useScrollToTop Hook

## Mô tả
Tự động cuộn về đầu trang khi người dùng chuyển sang một trang khác trong ứng dụng React.

## ScrollToTop Component

### Cách sử dụng cơ bản
```jsx
import ScrollToTop from './components/common/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Các route của bạn */}
      </Routes>
    </Router>
  );
}
```

### Cách sử dụng nâng cao
```jsx
<ScrollToTop 
  behavior="smooth"      // 'smooth' hoặc 'instant'
  delay={100}           // Độ trễ 100ms
  excludePaths={['/admin', '/checkout']} // Không scroll cho admin và checkout
/>
```

### Props
- `behavior` (string): 'smooth' (mặc định) hoặc 'instant'
- `delay` (number): Thời gian trễ trước khi scroll (ms), mặc định 0
- `excludePaths` (array): Mảng các đường dẫn không cần scroll to top

## useScrollToTop Hook

### Cách sử dụng
```jsx
import useScrollToTop from '../hooks/useScrollToTop';

function MyComponent() {
  const { scrollToTop, scrollToElement } = useScrollToTop();

  const handleBackToTop = () => {
    scrollToTop({ behavior: 'smooth' });
  };

  const handleScrollToSection = () => {
    scrollToElement('section-id', { behavior: 'smooth' });
  };

  return (
    <div>
      <button onClick={handleBackToTop}>Về đầu trang</button>
      <button onClick={handleScrollToSection}>Đến section</button>
    </div>
  );
}
```

### API

#### scrollToTop(options)
- `behavior`: 'smooth' | 'instant'
- `delay`: number (ms)
- `top`: number (vị trí Y, mặc định 0)
- `left`: number (vị trí X, mặc định 0)

#### scrollToElement(elementId, options)
- `elementId`: string (ID của element)
- `behavior`: 'smooth' | 'instant'
- `delay`: number (ms)
- `block`: 'start' | 'center' | 'end' | 'nearest'
- `inline`: 'start' | 'center' | 'end' | 'nearest'

## Ví dụ thực tế

### 1. Nút "Về đầu trang"
```jsx
function BackToTopButton() {
  const { scrollToTop } = useScrollToTop();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    isVisible && (
      <button 
        className="back-to-top"
        onClick={() => scrollToTop({ behavior: 'smooth' })}
      >
        ↑ Về đầu trang
      </button>
    )
  );
}
```

### 2. Navigation đến các section
```jsx
function Navigation() {
  const { scrollToElement } = useScrollToTop();

  return (
    <nav>
      <button onClick={() => scrollToElement('hero')}>Trang chủ</button>
      <button onClick={() => scrollToElement('products')}>Sản phẩm</button>
      <button onClick={() => scrollToElement('about')}>Giới thiệu</button>
    </nav>
  );
}
```

## Lưu ý
- Component ScrollToTop phải được đặt bên trong Router
- Sử dụng excludePaths để tránh scroll không mong muốn trên các trang cụ thể
- Delay nhỏ (100-200ms) giúp trang render hoàn thành trước khi scroll 