# Blog API Services Documentation

## Overview
Hệ thống API services để quản lý và fetch dữ liệu blog từ backend.

## File Structure
```
src/
├── services/
│   ├── blogService.js      # Các API functions chính
├── hooks/
│   ├── useBlog.js         # Custom hooks cho blog
├── config/
│   ├── api.js             # Configuration và constants
└── pages/
    ├── BlogDetail.js      # Component gốc (đã cập nhật)
    ├── BlogDetailOptimized.js # Component tối ưu với hooks
    ├── CraftVillageBlogs.js   # Trang làng nghề (đã cập nhật)
    └── CraftVillageBlogsOptimized.js # Trang làng nghề tối ưu
```

## Environment Variables
Tạo file `.env` trong thư mục `client/` với nội dung:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000
```

## Cách sử dụng

### 1. Sử dụng blogService trực tiếp

```javascript
import { blogService } from '../services/blogService';

// Lấy blog theo slug
const blog = await blogService.getBlogBySlug('lang-gom-bat-trang');

// Lấy danh sách blog với pagination và category filter
const blogs = await blogService.getAllBlogs(1, 10, 'lang-nghe');

// Lấy blog liên quan
const relatedBlogs = await blogService.getRelatedBlogs(blogId, 6);

// Lấy blog mới nhất
const latestBlogs = await blogService.getLatestBlogs(4);

// Lấy danh mục
const categories = await blogService.getCategories();
```

### 2. Sử dụng Custom Hooks (Khuyến nghị)

```javascript
import { useBlogDetail, useRelatedBlogs, useLatestBlogs, useCategories, useBlogs } from '../hooks/useBlog';

// Cho trang chi tiết blog
function BlogDetailComponent() {
  const { blog, loading, error } = useBlogDetail(slug);
  const { relatedBlogs } = useRelatedBlogs(blog?.id, 6);
  const { latestBlogs } = useLatestBlogs(4);
  const { categories } = useCategories();

  if (loading) return <Spinner />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h1>{blog.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
  );
}

// Cho trang danh sách blog với pagination
function BlogListComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('lang-nghe');
  
  const { 
    blogs, 
    totalPages, 
    totalBlogs, 
    loading, 
    error,
    refetch 
  } = useBlogs(currentPage, 6, selectedCategory);

  return (
    <div>
      {blogs.map(blog => (
        <div key={blog.id}>{blog.title}</div>
      ))}
    </div>
  );
}
```

## API Endpoints Expected

Backend cần implement các endpoints sau:

### Blog Endpoints
- `GET /api/blogs/{slug}` - Lấy blog theo slug
- `GET /api/blogs?page=1&limit=10&category=lang-nghe` - Danh sách blog với filter
- `GET /api/blogs/{id}/related?limit=6` - Blog liên quan
- `GET /api/blogs/latest?limit=4` - Blog mới nhất
- `GET /api/blogs/categories` - Danh mục blog
- `GET /api/blogs/search?q=query&page=1&limit=10` - Tìm kiếm blog

### Response Format

#### Blog Detail Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Làng nghề Bát Tràng",
    "excerpt": "Mô tả ngắn...",
    "content": "<p>Nội dung HTML...</p>",
    "featuredImage": "https://...",
    "author": "Trại Cá",
    "publishedAt": "2024-12-19",
    "commentCount": 0,
    "category": "Làng nghề",
    "slug": "lang-nghe-bat-trang",
    "tags": ["làng nghề", "gốm sứ", "Bát Tràng"]
  }
}
```

#### Blog List Response
```json
{
  "success": true,
  "data": {
    "blogs": [...],
    "totalPages": 10,
    "total": 100,
    "currentPage": 1
  }
}
```

#### Categories Response
```json
{
  "success": true,
  "data": [
    {
      "id": "lang-nghe",
      "name": "Làng nghề",
      "count": 25
    }
  ]
}
```

## Error Handling

API service tự động xử lý các lỗi phổ biến:
- Network errors
- HTTP status errors (400, 401, 403, 404, 500)
- Timeout errors
- Retry logic với exponential backoff

## Components

### BlogDetail.js & BlogDetailOptimized.js
Components cho trang chi tiết blog đã được cập nhật để sử dụng API thực.

### CraftVillageBlogs.js & CraftVillageBlogsOptimized.js
Components cho trang danh sách làng nghề:

**CraftVillageBlogs.js:**
- Version cơ bản được cập nhật từ mock data
- Sử dụng custom hooks
- Pagination cơ bản
- Sidebar với latest blogs và categories

**CraftVillageBlogsOptimized.js:**
- Version tối ưu với nhiều tính năng UX
- Category filtering
- Smart pagination với ellipsis
- Loading skeletons
- Error handling với retry
- Lazy loading images
- Tags display
- Icons và badges

### Tính năng của CraftVillageBlogsOptimized:

```javascript
// Category filtering
const [selectedCategory, setSelectedCategory] = useState('lang-nghe');

// Smart pagination với ellipsis
{/* First page */}
{currentPage > 2 && (
  <button onClick={() => handlePageChange(1)}>1</button>
)}
{currentPage > 3 && <span>...</span>}

// Loading skeleton
const BlogSkeleton = () => (
  <div className="blog-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-title"></div>
    <div className="skeleton-excerpt"></div>
  </div>
);

// Error handling với retry
if (blogsError) {
  return (
    <Alert variant="danger">
      <button onClick={handleRetry}>Thử lại</button>
    </Alert>
  );
}
```

## Testing

Để test API connections:

1. Khởi động backend server
2. Cập nhật `REACT_APP_API_URL` trong `.env`
3. Test với các components:
   - `BlogDetailOptimized` cho trang chi tiết
   - `CraftVillageBlogsOptimized` cho trang danh sách

## Migration từ Mock Data

### Cho BlogDetail:
```javascript
// Cũ
import BlogDetail from './pages/BlogDetail';

// Mới
import BlogDetail from './pages/BlogDetailOptimized';
```

### Cho CraftVillageBlogs:
```javascript
// Cũ (mock data)
import CraftVillageBlogs from './pages/CraftVillageBlogs';

// Mới (API + basic features)
import CraftVillageBlogs from './pages/CraftVillageBlogs';

// Tối ưu nhất (API + advanced UX)
import CraftVillageBlogs from './pages/CraftVillageBlogsOptimized';
```

## Performance Tips

1. Sử dụng custom hooks thay vì gọi API trực tiếp
2. Implement caching nếu cần (React Query khuyến nghị)
3. Lazy load images (`loading="lazy"`)
4. Implement infinite scroll cho danh sách blog
5. Add skeleton loading states
6. Use pagination thông minh với ellipsis
7. Category filtering ở client-side khi có cache
8. Error boundaries cho error handling tốt hơn

## Advanced Features

### 1. Search & Filter Integration
```javascript
// Combine search với category filter
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategory, setSelectedCategory] = useState('lang-nghe');

const { blogs, loading } = useBlogs(
  currentPage, 
  pageSize, 
  selectedCategory,
  searchQuery
);
```

### 2. Infinite Scroll
```javascript
// Replace pagination với infinite scroll
const { blogs, loading, hasMore, loadMore } = useInfiniteBlogs('lang-nghe');
```

### 3. Real-time Updates
```javascript
// WebSocket hoặc polling cho real-time updates
const { blogs, refetch } = useBlogs(currentPage, pageSize, category);

useEffect(() => {
  const interval = setInterval(refetch, 30000); // Refresh every 30s
  return () => clearInterval(interval);
}, [refetch]);
``` 