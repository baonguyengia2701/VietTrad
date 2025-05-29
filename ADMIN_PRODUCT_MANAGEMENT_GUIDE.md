# Hướng Dẫn Quản Lý Sản Phẩm - Admin VietTrad

## Tổng Quan
Hệ thống quản lý sản phẩm đã được hoàn thiện với đầy đủ các tính năng CRUD (Create, Read, Update, Delete) và tích hợp API thực tế.

## Tính Năng Chính

### 1. Danh Sách Sản Phẩm (`/admin/products`)

#### Tính năng hiển thị:
- **Bảng sản phẩm**: Hiển thị thông tin chi tiết với các cột:
  - Hình ảnh và tên sản phẩm
  - Danh mục và thương hiệu
  - Giá bán (định dạng VND)
  - Số lượng tồn kho
  - Trạng thái (Hoạt động/Không hoạt động/Hết hàng)
  - Ngày tạo
  - Thao tác (Xem/Sửa/Xóa)

#### Tính năng lọc và tìm kiếm:
- **Tìm kiếm**: Theo tên sản phẩm và thương hiệu
- **Lọc danh mục**: Dropdown với tất cả danh mục có sẵn
- **Lọc thương hiệu**: Dropdown với tất cả thương hiệu có sẵn
- **Phân trang**: 10 sản phẩm mỗi trang

#### Thao tác nhanh:
- **Cập nhật trạng thái**: Dropdown trực tiếp trong bảng
- **Làm mới dữ liệu**: Nút refresh để tải lại danh sách

### 2. Xem Chi Tiết Sản Phẩm

#### Thông tin hiển thị:
- Tên sản phẩm và ID
- Danh mục và thương hiệu
- Giá gốc và phần trăm giảm giá
- Số lượng tồn kho
- Trạng thái hoạt động
- Ngày tạo
- Mô tả chi tiết
- Tất cả hình ảnh sản phẩm

#### Giao diện:
- Modal popup responsive
- Grid layout 2 cột trên desktop, 1 cột trên mobile
- Hiển thị hình ảnh dạng gallery

### 3. Tạo Sản Phẩm Mới (`/admin/products/new`)

#### Form sections:
1. **Thông tin cơ bản**:
   - Tên sản phẩm (bắt buộc)
   - Danh mục (dropdown, bắt buộc)
   - Thương hiệu (dropdown, bắt buộc)
   - Mô tả chi tiết

2. **Giá & Kho hàng**:
   - Giá bán (bắt buộc)
   - Phần trăm giảm giá (0-100%)
   - Số lượng tồn kho (bắt buộc)

3. **Hình ảnh sản phẩm**:
   - Thêm/xóa nhiều URL hình ảnh
   - Ít nhất 1 hình ảnh bắt buộc

4. **Biến thể sản phẩm**:
   - Tiêu đề biến thể (ví dụ: Màu sắc, Kích thước)
   - Giá trị biến thể (ví dụ: Đỏ, Xanh, S, M, L)

5. **Cài đặt**:
   - Sản phẩm hoạt động (checkbox)
   - Sản phẩm nổi bật (checkbox)

#### Validation:
- Kiểm tra các trường bắt buộc
- Validation số lượng và giá
- Kiểm tra ít nhất 1 hình ảnh

### 4. Chỉnh Sửa Sản Phẩm (`/admin/products/:id/edit`)

#### Tính năng:
- Form tương tự tạo mới nhưng đã điền sẵn dữ liệu
- Tự động load thông tin sản phẩm hiện tại
- Cập nhật real-time vào database
- Redirect về danh sách sau khi cập nhật thành công

### 5. Xóa Sản Phẩm

#### Quy trình:
- Modal xác nhận với cảnh báo rõ ràng
- Soft delete (đặt `isActive = false`)
- Sản phẩm vẫn tồn tại trong database nhưng ẩn khỏi cửa hàng
- Thông báo thành công sau khi xóa

## API Integration

### Frontend Services (`productService.js`)

#### Admin Methods:
```javascript
// Lấy tất cả sản phẩm (bao gồm inactive)
getAllProducts(filters)

// Tạo sản phẩm mới
createProduct(productData)

// Cập nhật sản phẩm
updateProduct(id, productData)

// Xóa sản phẩm (soft delete)
deleteProduct(id)

// Cập nhật trạng thái
updateProductStatus(id, isActive)
```

#### Support Services:
```javascript
// Lấy danh sách danh mục
categoryService.getCategories()

// Lấy danh sách thương hiệu
brandService.getBrands()
```

### Backend APIs

#### Product Routes:
```
GET    /api/products?includeInactive=true  - Lấy tất cả sản phẩm (admin)
GET    /api/products/:id                   - Lấy chi tiết sản phẩm
POST   /api/products                       - Tạo sản phẩm mới (admin)
PUT    /api/products/:id                   - Cập nhật sản phẩm (admin)
DELETE /api/products/:id                   - Xóa sản phẩm (admin)
```

#### Support Routes:
```
GET    /api/products/categories            - Lấy danh sách danh mục
GET    /api/products/brands                - Lấy danh sách thương hiệu
```

## Cải Tiến Giao Diện

### 1. Responsive Design
- **Desktop**: Layout 2 cột, bảng đầy đủ thông tin
- **Tablet**: Layout responsive, font size điều chỉnh
- **Mobile**: Layout 1 cột, bảng scroll ngang, modal full screen

### 2. User Experience
- **Loading states**: Spinner khi đang tải dữ liệu
- **Error handling**: Thông báo lỗi rõ ràng với icon
- **Success feedback**: Thông báo thành công tự động ẩn sau 3 giây
- **Form validation**: Real-time validation với thông báo lỗi

### 3. Visual Design
- **Color coding**: 
  - Xanh: Sản phẩm hoạt động
  - Vàng: Hết hàng
  - Đỏ: Không hoạt động
- **Icons**: FontAwesome icons cho tất cả actions
- **Hover effects**: Smooth transitions cho buttons và links

## Cách Sử Dụng

### 1. Truy Cập Quản Lý Sản Phẩm
```
http://localhost:3000/admin/products
```

### 2. Tạo Sản Phẩm Mới
1. Click nút "Thêm Sản Phẩm" ở góc phải
2. Điền đầy đủ thông tin trong form
3. Thêm ít nhất 1 hình ảnh
4. Click "Tạo sản phẩm"

### 3. Chỉnh Sửa Sản Phẩm
1. Click icon bút chì (✏️) ở hàng sản phẩm muốn sửa
2. Cập nhật thông tin cần thiết
3. Click "Cập nhật sản phẩm"

### 4. Xem Chi Tiết
1. Click icon mắt (👁️) ở hàng sản phẩm
2. Xem thông tin chi tiết trong modal
3. Click "Đóng" để thoát

### 5. Xóa Sản Phẩm
1. Click icon thùng rác (🗑️) ở hàng sản phẩm
2. Xác nhận trong modal cảnh báo
3. Click "Xóa sản phẩm" để hoàn tất

### 6. Cập Nhật Trạng Thái Nhanh
1. Click dropdown "Trạng thái" ở hàng sản phẩm
2. Chọn trạng thái mới
3. Thay đổi được lưu tự động

## Data Structure

### Product Model
```javascript
{
  name: String,                    // Tên sản phẩm
  description: String,             // Mô tả
  price: Number,                   // Giá bán
  discount: Number,                // Phần trăm giảm giá
  countInStock: Number,            // Số lượng tồn kho
  category: ObjectId,              // ID danh mục
  categoryName: String,            // Tên danh mục (auto-populated)
  brand: ObjectId,                 // ID thương hiệu
  brandName: String,               // Tên thương hiệu (auto-populated)
  images: [String],                // Mảng URL hình ảnh
  isActive: Boolean,               // Trạng thái hoạt động
  isFeatured: Boolean,             // Sản phẩm nổi bật
  variants: {
    title: [String],               // Tiêu đề biến thể
    size: [String]                 // Giá trị biến thể
  },
  sold: Number,                    // Số lượng đã bán
  averageRating: Number,           // Đánh giá trung bình
  numOfReviews: Number,            // Số lượng đánh giá
  createdAt: Date,                 // Ngày tạo
  updatedAt: Date                  // Ngày cập nhật
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

### 3. Error Handling
- Try-catch blocks cho tất cả async operations
- Meaningful error messages cho user
- Logging errors cho debugging

## Performance Optimization

### 1. Pagination
- Server-side pagination với limit/offset
- Client-side pagination controls
- Efficient database queries

### 2. Image Handling
- Lazy loading cho hình ảnh
- Error fallback cho broken images
- Placeholder images

### 3. API Optimization
- Populate only necessary fields
- Efficient filtering and sorting
- Caching strategies (future enhancement)

## Troubleshooting

### 1. Lỗi "Không thể tải danh sách sản phẩm"
- **Nguyên nhân**: Lỗi kết nối API hoặc server down
- **Giải pháp**: Kiểm tra kết nối mạng, restart server

### 2. Lỗi "Không có quyền truy cập"
- **Nguyên nhân**: Token hết hạn hoặc không có quyền admin
- **Giải pháp**: Đăng nhập lại với tài khoản admin

### 3. Form validation errors
- **Nguyên nhân**: Thiếu thông tin bắt buộc hoặc format sai
- **Giải pháp**: Kiểm tra các trường đánh dấu * và format dữ liệu

### 4. Hình ảnh không hiển thị
- **Nguyên nhân**: URL hình ảnh không hợp lệ hoặc broken link
- **Giải pháp**: Kiểm tra URL, sử dụng placeholder image

## Tính Năng Sắp Tới

### 1. Bulk Operations
- Chọn nhiều sản phẩm cùng lúc
- Cập nhật trạng thái hàng loạt
- Xóa nhiều sản phẩm cùng lúc

### 2. Advanced Filtering
- Lọc theo khoảng giá
- Lọc theo ngày tạo
- Lọc theo số lượng tồn kho

### 3. Image Upload
- Upload hình ảnh trực tiếp thay vì URL
- Image compression và optimization
- Multiple image upload với drag & drop

### 4. Rich Text Editor
- WYSIWYG editor cho mô tả sản phẩm
- HTML formatting support
- Image embedding trong mô tả

### 5. Inventory Management
- Cảnh báo khi sắp hết hàng
- Lịch sử nhập/xuất kho
- Báo cáo tồn kho

### 6. SEO Optimization
- Meta title và description
- URL slug tự động
- Schema markup

## Kết Luận

Hệ thống quản lý sản phẩm hiện đã hoàn thiện với đầy đủ tính năng CRUD, tích hợp API thực tế, giao diện responsive và user-friendly. Hệ thống đảm bảo tính bảo mật, hiệu suất và khả năng mở rộng cho tương lai. 