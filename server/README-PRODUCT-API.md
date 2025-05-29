# VietTrad Product API Documentation

## Tổng quan

Hệ thống API sản phẩm được thiết kế để hỗ trợ đầy đủ các tính năng của trang sản phẩm, chi tiết sản phẩm và giỏ hàng cho ứng dụng VietTrad.

## Models

### 1. Product Model
```javascript
{
  name: String,                    // Tên sản phẩm
  slug: String,                    // Slug cho SEO
  description: String,             // Mô tả chi tiết
  images: [String],                // Mảng URL hình ảnh
  price: Number,                   // Giá gốc
  discount: Number,                // % giảm giá (0-100)
  category: ObjectId,              // ID danh mục
  categoryName: String,            // Tên danh mục (denormalized)
  brand: ObjectId,                 // ID thương hiệu
  brandName: String,               // Tên thương hiệu (denormalized)
  countInStock: Number,            // Số lượng tồn kho
  sold: Number,                    // Số lượng đã bán
  averageRating: Number,           // Đánh giá trung bình (0-5)
  numOfReviews: Number,            // Số lượng đánh giá
  variants: [VariantSchema],       // Các biến thể sản phẩm
  tags: [String],                  // Tags
  isActive: Boolean,               // Trạng thái hoạt động
  isFeatured: Boolean,             // Sản phẩm nổi bật
  // Virtual fields
  discountedPrice: Number,         // Giá sau giảm
  savedAmount: Number,             // Số tiền tiết kiệm
  stockStatus: String              // Trạng thái kho
}
```

### 2. Category Model
```javascript
{
  name: String,                    // Tên danh mục
  slug: String,                    // Slug cho SEO
  description: String,             // Mô tả
  image: String,                   // Hình ảnh đại diện
  isActive: Boolean,               // Trạng thái hoạt động
  parentCategory: ObjectId,        // Danh mục cha
  order: Number                    // Thứ tự hiển thị
}
```

### 3. Brand Model
```javascript
{
  name: String,                    // Tên thương hiệu
  slug: String,                    // Slug cho SEO
  description: String,             // Mô tả
  logo: String,                    // Logo URL
  website: String,                 // Website
  isActive: Boolean,               // Trạng thái hoạt động
  order: Number                    // Thứ tự hiển thị
}
```

### 4. Review Model
```javascript
{
  user: ObjectId,                  // ID người dùng
  product: ObjectId,               // ID sản phẩm
  rating: Number,                  // Đánh giá (1-5)
  comment: String,                 // Nhận xét
  isApproved: Boolean,             // Đã duyệt
  images: [String],                // Hình ảnh đính kèm
  helpfulVotes: Number,            // Số lượt hữu ích
  order: ObjectId                  // Liên kết với đơn hàng
}
```

## API Endpoints

### Products API

#### GET /api/products
Lấy danh sách sản phẩm với filter và phân trang

**Query Parameters:**
- `page` (number): Trang hiện tại (default: 1)
- `limit` (number): Số sản phẩm mỗi trang (default: 8)
- `category` (string): Lọc theo tên danh mục
- `brand` (string): Lọc theo tên thương hiệu
- `minPrice` (number): Giá tối thiểu
- `maxPrice` (number): Giá tối đa
- `sort` (string): Sắp xếp theo
  - `newest`: Mới nhất (default)
  - `price_asc`: Giá tăng dần
  - `price_desc`: Giá giảm dần
  - `bestseller`: Bán chạy nhất
  - `rating`: Đánh giá cao nhất
- `search` (string): Từ khóa tìm kiếm

**Response:**
```javascript
{
  products: [Product],
  pagination: {
    page: 1,
    pages: 10,
    total: 100,
    limit: 8
  }
}
```

**Ví dụ:**
```bash
GET /api/products?category=Gốm sứ&sort=bestseller&page=1&limit=8
```

#### GET /api/products/:id
Lấy chi tiết sản phẩm theo ID

**Response:** Product object với đầy đủ thông tin

#### GET /api/products/:id/related
Lấy sản phẩm liên quan

**Query Parameters:**
- `limit` (number): Số sản phẩm trả về (default: 4)

#### GET /api/products/:id/reviews
Lấy đánh giá sản phẩm với phân trang

**Query Parameters:**
- `page` (number): Trang hiện tại
- `limit` (number): Số đánh giá mỗi trang

#### POST /api/products/:id/reviews
Thêm đánh giá cho sản phẩm (cần đăng nhập)

**Request Body:**
```javascript
{
  rating: 5,                       // 1-5
  comment: "Sản phẩm tuyệt vời!"
}
```

#### GET /api/products/categories
Lấy danh sách tất cả danh mục đang hoạt động

#### GET /api/products/brands
Lấy danh sách tất cả thương hiệu đang hoạt động

#### GET /api/products/featured
Lấy sản phẩm nổi bật

#### GET /api/products/bestsellers
Lấy sản phẩm bán chạy

### Categories API

#### GET /api/categories
Lấy tất cả danh mục

**Query Parameters:**
- `active` (boolean): Lọc theo trạng thái hoạt động

#### GET /api/categories/:id
Lấy danh mục theo ID

#### GET /api/categories/slug/:slug
Lấy danh mục theo slug

### Admin API (Cần authentication và admin role)

#### POST /api/products
Tạo sản phẩm mới

#### PUT /api/products/:id
Cập nhật sản phẩm

#### DELETE /api/products/:id
Xóa sản phẩm (soft delete)

#### POST /api/categories
Tạo danh mục mới

#### PUT /api/categories/:id
Cập nhật danh mục

#### DELETE /api/categories/:id
Xóa danh mục

## Cách sử dụng cho Frontend

### 1. Trang danh sách sản phẩm (Products.js)

```javascript
// Lấy sản phẩm với filter
const fetchProducts = async (filters) => {
  const queryParams = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 8,
    category: filters.category || 'all',
    brand: filters.brand || 'all',
    maxPrice: filters.priceRange,
    sort: filters.sortOption || 'newest'
  });
  
  const response = await fetch(`/api/products?${queryParams}`);
  return response.json();
};

// Lấy categories cho filter
const fetchCategories = async () => {
  const response = await fetch('/api/products/categories');
  return response.json();
};

// Lấy brands cho filter  
const fetchBrands = async () => {
  const response = await fetch('/api/products/brands');
  return response.json();
};
```

### 2. Trang chi tiết sản phẩm (ProductDetail.js)

```javascript
// Lấy chi tiết sản phẩm
const fetchProduct = async (productId) => {
  const response = await fetch(`/api/products/${productId}`);
  return response.json();
};

// Lấy sản phẩm liên quan
const fetchRelatedProducts = async (productId) => {
  const response = await fetch(`/api/products/${productId}/related?limit=4`);
  return response.json();
};

// Lấy reviews
const fetchReviews = async (productId, page = 1) => {
  const response = await fetch(`/api/products/${productId}/reviews?page=${page}`);
  return response.json();
};

// Thêm review
const addReview = async (productId, reviewData, token) => {
  const response = await fetch(`/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });
  return response.json();
};
```

### 3. Giỏ hàng (Cart.js)

Giỏ hàng sử dụng dữ liệu từ Product API để:
- Hiển thị thông tin sản phẩm (tên, hình ảnh, giá, thương hiệu)
- Tính toán giá sau giảm giá
- Kiểm tra tồn kho
- Hiển thị variants được chọn

## Migration từ Mock Data

Để chuyển từ mock data sang API thật:

1. **Thay thế import mock_data:**
```javascript
// Thay vì
import products from '../mock_data';

// Sử dụng
import { fetchProducts, fetchCategories, fetchBrands } from '../services/productService';
```

2. **Cập nhật useEffect để gọi API:**
```javascript
useEffect(() => {
  const loadProducts = async () => {
    try {
      const data = await fetchProducts(filters);
      setFilteredProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };
  
  loadProducts();
}, [filters]);
```

3. **Cập nhật cấu trúc dữ liệu:**
- `selled` → `sold`
- `image` → `images`
- `countInStock` → `countInStock`
- Thêm xử lý `discountedPrice` virtual field

## Chạy seed data

```bash
# Import tất cả dữ liệu
npm run seed

# Chỉ import products
node seeder.js -p

# Xóa tất cả dữ liệu
node seeder.js -d

# Hiển thị help
node seeder.js -h
```

## Testing API

Swagger UI có sẵn tại: `http://localhost:5000/api-docs`

Hoặc sử dụng curl/Postman:

```bash
# Lấy tất cả sản phẩm
curl "http://localhost:5000/api/products"

# Lấy sản phẩm theo danh mục
curl "http://localhost:5000/api/products?category=Gốm sứ"

# Lấy chi tiết sản phẩm
curl "http://localhost:5000/api/products/[product_id]"
```

## Tối ưu hiệu năng

1. **Database Indexing:** Đã tạo index cho các trường tìm kiếm chính
2. **Denormalization:** Lưu `categoryName` và `brandName` để giảm join
3. **Pagination:** Hỗ trợ phân trang để tránh load quá nhiều dữ liệu
4. **Virtual Fields:** Tính toán runtime cho `discountedPrice`, `savedAmount`
5. **Population:** Chỉ populate field cần thiết

## Lưu ý quan trọng

1. **Tương thích với frontend hiện tại:** API được thiết kế để tương thích tối đa với cấu trúc mock_data hiện tại
2. **Extensible:** Dễ dàng mở rộng thêm tính năng mới
3. **SEO-friendly:** Hỗ trợ slug cho URL thân thiện
4. **Admin features:** Đầy đủ CRUD operations cho admin
5. **Security:** Phân quyền rõ ràng cho admin/user

Hệ thống này sẽ hỗ trợ đầy đủ các yêu cầu từ frontend và có thể mở rộng dễ dàng trong tương lai! 