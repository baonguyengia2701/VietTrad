# Hướng Dẫn Quản Lý Danh Mục - Admin VietTrad

## Tổng Quan
Hệ thống quản lý danh mục đã được hoàn thiện với đầy đủ các tính năng CRUD (Create, Read, Update, Delete) và tích hợp API thực tế. Hệ thống hỗ trợ cấu trúc danh mục phân cấp với danh mục cha và danh mục con.

## Tính Năng Chính

### 1. Danh Sách Danh Mục (`/admin/categories`)

#### Tính năng hiển thị:
- **Bảng danh mục**: Hiển thị thông tin chi tiết với các cột:
  - Tên danh mục (với hình ảnh và mô tả)
  - Slug (URL-friendly identifier)
  - Danh mục cha (nếu có)
  - Thứ tự hiển thị
  - Trạng thái (toggle switch)
  - Ngày tạo
  - Thao tác (Xem/Sửa/Xóa)

#### Tính năng lọc và tìm kiếm:
- **Tìm kiếm**: Theo tên danh mục và mô tả
- **Lọc trạng thái**: Đang hoạt động / Không hoạt động / Tất cả
- **Hiển thị số lượng**: Số danh mục hiện tại / tổng số

#### Thao tác nhanh:
- **Toggle trạng thái**: Switch button trực tiếp trong bảng
- **Làm mới dữ liệu**: Nút refresh để tải lại danh sách

### 2. Xem Chi Tiết Danh Mục

#### Thông tin hiển thị:
**Thông tin cơ bản:**
- Tên danh mục
- Slug (URL identifier)
- Mô tả
- Danh mục cha (nếu có)
- Thứ tự hiển thị
- Trạng thái hoạt động

**Hình ảnh:**
- Preview hình ảnh danh mục (nếu có)
- Hiển thị placeholder nếu không có hình

**Thông tin hệ thống:**
- Ngày tạo
- Ngày cập nhật lần cuối

#### Giao diện:
- Modal popup responsive
- Grid layout 2 cột trên desktop, 1 cột trên mobile
- Hiển thị thông tin rõ ràng với color coding

### 3. Tạo Danh Mục Mới

#### Form tạo mới:
- **Tên danh mục**: Bắt buộc, tự động tạo slug
- **Mô tả**: Tùy chọn, mô tả chi tiết về danh mục
- **Hình ảnh**: URL hình ảnh đại diện
- **Danh mục cha**: Dropdown chọn danh mục cha (chỉ danh mục gốc)
- **Thứ tự hiển thị**: Số thứ tự sắp xếp
- **Trạng thái**: Checkbox kích hoạt/vô hiệu hóa

#### Validation:
- Tên danh mục là bắt buộc và duy nhất
- Slug được tự động tạo từ tên
- Danh mục không thể là con của chính nó
- URL hình ảnh phải hợp lệ (nếu có)

### 4. Chỉnh Sửa Danh Mục

#### Form chỉnh sửa:
- Tương tự form tạo mới
- Pre-fill dữ liệu hiện tại
- Validation tương tự với kiểm tra conflict

#### Quy tắc cập nhật:
- Không thể đặt danh mục làm con của chính nó
- Tên và slug phải duy nhất (trừ chính nó)
- Cập nhật timestamp tự động

### 5. Xóa Danh Mục

#### Điều kiện xóa:
- Không có danh mục con
- Không có sản phẩm đang sử dụng
- Xác nhận từ admin

#### Modal xác nhận:
- Hiển thị cảnh báo rõ ràng
- Tên danh mục được highlight
- Nút xác nhận với loading state

## API Integration

### Frontend Service (`categoryService.js`)

#### Public Methods:
```javascript
// Lấy tất cả danh mục với filter
getAllCategories(filters)

// Lấy danh mục theo ID
getCategoryById(id)

// Lấy danh mục theo slug
getCategoryBySlug(slug)

// Lấy sản phẩm theo danh mục
getCategoryProducts(id, page, limit)
```

#### Admin Methods:
```javascript
// Tạo danh mục mới
createCategory(categoryData)

// Cập nhật danh mục
updateCategory(id, categoryData)

// Xóa danh mục
deleteCategory(id)

// Toggle trạng thái
toggleCategoryStatus(id)
```

### Backend APIs

#### Category Routes:
```
GET    /api/categories                - Lấy tất cả danh mục
GET    /api/categories/:id            - Lấy chi tiết danh mục
GET    /api/categories/slug/:slug     - Lấy danh mục theo slug
POST   /api/categories               - Tạo danh mục mới (admin)
PUT    /api/categories/:id           - Cập nhật danh mục (admin)
DELETE /api/categories/:id           - Xóa danh mục (admin)
PATCH  /api/categories/:id/toggle    - Toggle trạng thái (admin)
GET    /api/categories/:id/products  - Lấy sản phẩm theo danh mục
```

#### Filters Support:
- `active`: Lọc theo trạng thái hoạt động (true/false)

## Cải Tiến Giao Diện

### 1. Responsive Design
- **Desktop**: Layout 2 cột cho modal, bảng đầy đủ thông tin
- **Tablet**: Layout responsive, font size điều chỉnh
- **Mobile**: Layout 1 cột, bảng scroll ngang, modal full screen

### 2. User Experience
- **Loading states**: Spinner khi đang tải dữ liệu
- **Error handling**: Thông báo lỗi rõ ràng với icon
- **Success feedback**: Thông báo thành công tự động ẩn sau 3 giây
- **Form validation**: Real-time validation với thông báo lỗi
- **Toggle switches**: Modern switch design cho trạng thái

### 3. Visual Design
- **Color coding**: 
  - Xanh lá: Đang hoạt động
  - Xám: Không hoạt động
  - Xanh dương: Danh mục cha
  - Xám nhạt: Danh mục gốc
- **Icons**: FontAwesome icons cho tất cả actions
- **Hover effects**: Smooth transitions cho buttons và links
- **Image preview**: Hiển thị hình ảnh danh mục trong bảng và modal

## Cách Sử Dụng

### 1. Truy Cập Quản Lý Danh Mục
```
http://localhost:3000/admin/categories
```

### 2. Xem Chi Tiết Danh Mục
1. Click icon mắt (👁️) ở hàng danh mục muốn xem
2. Xem thông tin chi tiết trong modal
3. Click "Đóng" để thoát

### 3. Tạo Danh Mục Mới
1. Click nút "Thêm danh mục" ở góc phải
2. Điền thông tin trong form:
   - Tên danh mục (bắt buộc)
   - Mô tả (tùy chọn)
   - URL hình ảnh (tùy chọn)
   - Chọn danh mục cha (tùy chọn)
   - Thứ tự hiển thị
   - Trạng thái kích hoạt
3. Click "Tạo danh mục" để lưu

### 4. Chỉnh Sửa Danh Mục
1. Click icon bút chì (✏️) ở hàng danh mục muốn sửa
2. Cập nhật thông tin trong form
3. Click "Cập nhật" để lưu thay đổi

### 5. Xóa Danh Mục
1. Click icon thùng rác (🗑️) ở hàng danh mục muốn xóa
2. Xác nhận trong modal cảnh báo
3. Click "Xóa danh mục" để xác nhận

### 6. Toggle Trạng Thái
1. Click switch button ở cột "Trạng thái"
2. Trạng thái được cập nhật tự động
3. Thông báo xác nhận hiển thị

### 7. Tìm Kiếm và Lọc
1. Nhập từ khóa vào ô tìm kiếm
2. Chọn trạng thái từ dropdown filter
3. Kết quả được cập nhật real-time

## Data Structure

### Category Model
```javascript
{
  _id: ObjectId,                     // ID danh mục
  name: String,                      // Tên danh mục (bắt buộc, duy nhất)
  slug: String,                      // URL slug (bắt buộc, duy nhất)
  description: String,               // Mô tả danh mục
  image: String,                     // URL hình ảnh
  isActive: Boolean,                 // Trạng thái hoạt động
  parentCategory: ObjectId,          // ID danh mục cha (nullable)
  order: Number,                     // Thứ tự hiển thị
  createdAt: Date,                   // Ngày tạo
  updatedAt: Date                    // Ngày cập nhật
}
```

### Form Data Structure
```javascript
{
  name: String,                      // Tên danh mục
  description: String,               // Mô tả
  image: String,                     // URL hình ảnh
  parentCategory: String,            // ID danh mục cha
  order: Number,                     // Thứ tự
  isActive: Boolean                  // Trạng thái
}
```

## Bảo Mật

### 1. Authentication & Authorization
- Tất cả API admin yêu cầu token hợp lệ
- Middleware `protect` và `admin` kiểm tra quyền truy cập
- Frontend redirect về login nếu không có quyền

### 2. Data Validation
- Server-side validation cho tất cả input
- Client-side validation cho UX tốt hơn
- Sanitization dữ liệu đầu vào
- Kiểm tra unique constraints

### 3. Error Handling
- Try-catch blocks cho tất cả async operations
- Meaningful error messages cho user
- Logging errors cho debugging

## Business Logic

### 1. Slug Generation
- Tự động tạo từ tên danh mục
- Chuyển thành lowercase
- Loại bỏ ký tự đặc biệt
- Thay thế khoảng trắng bằng dấu gạch ngang

### 2. Hierarchy Rules
- Chỉ danh mục gốc có thể làm danh mục cha
- Danh mục không thể là con của chính nó
- Kiểm tra circular reference

### 3. Deletion Rules
- Không thể xóa nếu có danh mục con
- Không thể xóa nếu có sản phẩm đang sử dụng
- Soft delete có thể được implement sau

## Performance Optimization

### 1. Database Queries
- Index trên name và slug fields
- Populate chỉ các fields cần thiết
- Efficient filtering và sorting

### 2. Frontend Optimization
- Local filtering cho search real-time
- Debouncing cho search input
- Lazy loading cho images

### 3. Caching Strategies
- Browser caching cho static assets
- API response caching (future enhancement)
- Image optimization và CDN

## Trạng Thái Danh Mục

### 1. **Active (Đang hoạt động)**
- Danh mục hiển thị trên website
- Có thể được sử dụng cho sản phẩm
- Hiển thị trong dropdown filters

### 2. **Inactive (Không hoạt động)**
- Danh mục bị ẩn khỏi website
- Sản phẩm hiện tại vẫn giữ nguyên
- Không hiển thị trong dropdown filters

## Cấu Trúc Phân Cấp

### 1. **Root Categories (Danh mục gốc)**
- Không có danh mục cha
- Có thể có danh mục con
- Hiển thị ở cấp độ đầu tiên

### 2. **Sub Categories (Danh mục con)**
- Có danh mục cha
- Không thể có danh mục con (hiện tại)
- Hiển thị dưới danh mục cha

### 3. **Hierarchy Display**
- Breadcrumb navigation
- Tree view trong admin
- Nested menu trên website

## Troubleshooting

### 1. Lỗi "Tên danh mục đã tồn tại"
- **Nguyên nhân**: Tên hoặc slug bị trùng
- **Giải pháp**: Đổi tên khác hoặc kiểm tra danh mục đã có

### 2. Lỗi "Không thể xóa danh mục"
- **Nguyên nhân**: Có danh mục con hoặc sản phẩm đang sử dụng
- **Giải pháp**: Xóa/chuyển danh mục con và sản phẩm trước

### 3. Lỗi "Không thể tải danh sách danh mục"
- **Nguyên nhân**: Lỗi kết nối API hoặc server down
- **Giải pháp**: Kiểm tra kết nối mạng, restart server

### 4. Hình ảnh không hiển thị
- **Nguyên nhân**: URL không hợp lệ hoặc CORS issues
- **Giải pháp**: Kiểm tra URL, sử dụng placeholder

### 5. Modal không hiển thị đúng
- **Nguyên nhân**: Lỗi JavaScript hoặc CSS conflict
- **Giải pháp**: Refresh trang, kiểm tra console errors

## Tính Năng Sắp Tới

### 1. Advanced Hierarchy
- Hỗ trợ nhiều cấp danh mục (unlimited depth)
- Tree view với drag & drop
- Bulk operations cho hierarchy

### 2. Image Management
- Upload hình ảnh trực tiếp
- Image resizing và optimization
- Multiple images per category

### 3. SEO Features
- Meta description và keywords
- Custom URL patterns
- Sitemap generation

### 4. Analytics Integration
- Category performance metrics
- Product count per category
- Popular categories tracking

### 5. Import/Export
- Bulk import từ CSV/Excel
- Export danh sách danh mục
- Template download

### 6. Advanced Filtering
- Filter theo ngày tạo
- Filter theo số lượng sản phẩm
- Advanced search với multiple criteria

## API Documentation

### Create Category
```http
POST /api/categories
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Gốm sứ Bát Tràng",
  "description": "Sản phẩm gốm sứ truyền thống từ làng Bát Tràng",
  "image": "https://example.com/image.jpg",
  "parentCategory": null,
  "order": 1,
  "isActive": true
}
```

### Update Category
```http
PUT /api/categories/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Gốm sứ Bát Tràng Updated",
  "description": "Mô tả đã cập nhật",
  "isActive": false
}
```

### Delete Category
```http
DELETE /api/categories/:id
Authorization: Bearer <token>
```

### Toggle Status
```http
PATCH /api/categories/:id/toggle
Authorization: Bearer <token>
```

## Kết Luận

Hệ thống quản lý danh mục hiện đã hoàn thiện với đầy đủ tính năng CRUD, hỗ trợ cấu trúc phân cấp, tích hợp API thực tế, giao diện responsive và user-friendly. Hệ thống đảm bảo tính bảo mật, hiệu suất và khả năng mở rộng cho tương lai, hỗ trợ admin quản lý danh mục sản phẩm một cách hiệu quả và chuyên nghiệp.

### Điểm Nổi Bật:
- ✅ CRUD operations hoàn chỉnh
- ✅ Cấu trúc phân cấp danh mục
- ✅ Real-time search và filtering
- ✅ Toggle trạng thái nhanh chóng
- ✅ Responsive design
- ✅ Error handling comprehensive
- ✅ Form validation đầy đủ
- ✅ Modal system hiện đại
- ✅ API integration hoàn chỉnh
- ✅ Documentation chi tiết 