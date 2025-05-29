# Hướng Dẫn Quản Lý Thương Hiệu - Admin VietTrad

## Tổng Quan
Hệ thống quản lý thương hiệu đã được hoàn thiện với đầy đủ các tính năng CRUD (Create, Read, Update, Delete) và tích hợp API thực tế. Hệ thống hỗ trợ quản lý thông tin thương hiệu bao gồm logo, website, mô tả và thứ tự hiển thị.

## Tính Năng Chính

### 1. Danh Sách Thương Hiệu (`/admin/brands`)

#### Tính năng hiển thị:
- **Bảng thương hiệu**: Hiển thị thông tin chi tiết với các cột:
  - Tên thương hiệu (với logo và mô tả)
  - Slug (URL-friendly identifier)
  - Website (link có thể click)
  - Thứ tự hiển thị
  - Trạng thái (toggle switch)
  - Ngày tạo
  - Thao tác (Xem/Sửa/Xóa)

#### Tính năng lọc và tìm kiếm:
- **Tìm kiếm**: Theo tên thương hiệu, mô tả và website
- **Lọc trạng thái**: Đang hoạt động / Không hoạt động / Tất cả
- **Hiển thị số lượng**: Số thương hiệu hiện tại / tổng số

#### Thao tác nhanh:
- **Toggle trạng thái**: Switch button trực tiếp trong bảng
- **Làm mới dữ liệu**: Nút refresh để tải lại danh sách

### 2. Xem Chi Tiết Thương Hiệu

#### Thông tin hiển thị:
**Thông tin cơ bản:**
- Tên thương hiệu
- Slug (URL identifier)
- Mô tả
- Website (link có thể click)
- Thứ tự hiển thị
- Trạng thái hoạt động

**Logo:**
- Preview logo thương hiệu (nếu có)
- Hiển thị placeholder nếu không có logo

**Thông tin hệ thống:**
- Ngày tạo
- Ngày cập nhật lần cuối

#### Giao diện:
- Modal popup responsive
- Grid layout 2 cột trên desktop, 1 cột trên mobile
- Hiển thị thông tin rõ ràng với color coding

### 3. Tạo Thương Hiệu Mới

#### Form tạo mới:
- **Tên thương hiệu**: Bắt buộc, tự động tạo slug
- **Mô tả**: Tùy chọn, mô tả chi tiết về thương hiệu
- **Logo**: URL logo thương hiệu
- **Website**: URL website chính thức
- **Thứ tự hiển thị**: Số thứ tự sắp xếp
- **Trạng thái**: Checkbox kích hoạt/vô hiệu hóa

#### Validation:
- Tên thương hiệu là bắt buộc và duy nhất
- Slug được tự động tạo từ tên
- URL logo và website phải hợp lệ (nếu có)

### 4. Chỉnh Sửa Thương Hiệu

#### Form chỉnh sửa:
- Tương tự form tạo mới
- Pre-fill dữ liệu hiện tại
- Validation tương tự với kiểm tra conflict

#### Quy tắc cập nhật:
- Tên và slug phải duy nhất (trừ chính nó)
- Cập nhật timestamp tự động

### 5. Xóa Thương Hiệu

#### Điều kiện xóa:
- Không có sản phẩm đang sử dụng thương hiệu
- Xác nhận từ admin

#### Modal xác nhận:
- Hiển thị cảnh báo rõ ràng
- Tên thương hiệu được highlight
- Nút xác nhận với loading state

## API Integration

### Frontend Service (`brandService.js`)

#### Public Methods:
```javascript
// Lấy tất cả thương hiệu với filter
getAllBrands(filters)

// Lấy thương hiệu theo ID
getBrandById(id)

// Lấy thương hiệu theo slug
getBrandBySlug(slug)

// Lấy sản phẩm theo thương hiệu
getBrandProducts(id, page, limit)
```

#### Admin Methods:
```javascript
// Tạo thương hiệu mới
createBrand(brandData)

// Cập nhật thương hiệu
updateBrand(id, brandData)

// Xóa thương hiệu
deleteBrand(id)

// Toggle trạng thái
toggleBrandStatus(id)
```

### Backend APIs

#### Brand Routes:
```
GET    /api/brands                - Lấy tất cả thương hiệu
GET    /api/brands/:id            - Lấy chi tiết thương hiệu
GET    /api/brands/slug/:slug     - Lấy thương hiệu theo slug
POST   /api/brands               - Tạo thương hiệu mới (admin)
PUT    /api/brands/:id           - Cập nhật thương hiệu (admin)
DELETE /api/brands/:id           - Xóa thương hiệu (admin)
PATCH  /api/brands/:id/toggle    - Toggle trạng thái (admin)
GET    /api/brands/:id/products  - Lấy sản phẩm theo thương hiệu
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
  - Xanh dương: Website links
- **Icons**: FontAwesome icons cho tất cả actions
- **Hover effects**: Smooth transitions cho buttons và links
- **Logo preview**: Hiển thị logo thương hiệu trong bảng và modal

## Cách Sử Dụng

### 1. Truy Cập Quản Lý Thương Hiệu
```
http://localhost:3000/admin/brands
```

### 2. Xem Chi Tiết Thương Hiệu
1. Click icon mắt (👁️) ở hàng thương hiệu muốn xem
2. Xem thông tin chi tiết trong modal
3. Click "Đóng" để thoát

### 3. Tạo Thương Hiệu Mới
1. Click nút "Thêm thương hiệu" ở góc phải
2. Điền thông tin trong form:
   - Tên thương hiệu (bắt buộc)
   - Mô tả (tùy chọn)
   - URL logo (tùy chọn)
   - Website (tùy chọn)
   - Thứ tự hiển thị
   - Trạng thái kích hoạt
3. Click "Tạo thương hiệu" để lưu

### 4. Chỉnh Sửa Thương Hiệu
1. Click icon bút chì (✏️) ở hàng thương hiệu muốn sửa
2. Cập nhật thông tin trong form
3. Click "Cập nhật" để lưu thay đổi

### 5. Xóa Thương Hiệu
1. Click icon thùng rác (🗑️) ở hàng thương hiệu muốn xóa
2. Xác nhận trong modal cảnh báo
3. Click "Xóa thương hiệu" để xác nhận

### 6. Toggle Trạng Thái
1. Click switch button ở cột "Trạng thái"
2. Trạng thái được cập nhật tự động
3. Thông báo xác nhận hiển thị

### 7. Tìm Kiếm và Lọc
1. Nhập từ khóa vào ô tìm kiếm
2. Chọn trạng thái từ dropdown filter
3. Kết quả được cập nhật real-time

## Data Structure

### Brand Model
```javascript
{
  _id: ObjectId,                     // ID thương hiệu
  name: String,                      // Tên thương hiệu (bắt buộc, duy nhất)
  slug: String,                      // URL slug (bắt buộc, duy nhất)
  description: String,               // Mô tả thương hiệu
  logo: String,                      // URL logo
  website: String,                   // Website chính thức
  isActive: Boolean,                 // Trạng thái hoạt động
  order: Number,                     // Thứ tự hiển thị
  createdAt: Date,                   // Ngày tạo
  updatedAt: Date                    // Ngày cập nhật
}
```

### Form Data Structure
```javascript
{
  name: String,                      // Tên thương hiệu
  description: String,               // Mô tả
  logo: String,                      // URL logo
  website: String,                   // Website
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
- Tự động tạo từ tên thương hiệu
- Chuyển thành lowercase
- Loại bỏ ký tự đặc biệt
- Thay thế khoảng trắng bằng dấu gạch ngang

### 2. Deletion Rules
- Không thể xóa nếu có sản phẩm đang sử dụng
- Kiểm tra ràng buộc dữ liệu trước khi xóa

### 3. Status Management
- Toggle trạng thái không ảnh hưởng đến sản phẩm hiện có
- Thương hiệu inactive sẽ không hiển thị trong dropdown

## Performance Optimization

### 1. Database Queries
- Index trên name và slug fields
- Efficient filtering và sorting
- Pagination cho danh sách lớn

### 2. Frontend Optimization
- Local filtering cho search real-time
- Debouncing cho search input
- Lazy loading cho logos

### 3. Caching Strategies
- Browser caching cho static assets
- API response caching (future enhancement)
- Logo optimization và CDN

## Trạng Thái Thương Hiệu

### 1. **Active (Đang hoạt động)**
- Thương hiệu hiển thị trên website
- Có thể được sử dụng cho sản phẩm mới
- Hiển thị trong dropdown filters

### 2. **Inactive (Không hoạt động)**
- Thương hiệu bị ẩn khỏi website
- Sản phẩm hiện tại vẫn giữ nguyên
- Không hiển thị trong dropdown filters

## Tích Hợp Với Sản Phẩm

### 1. **Product Association**
- Mỗi sản phẩm có thể thuộc về một thương hiệu
- Thương hiệu được lưu trữ cả ID và tên (denormalized)
- Cập nhật tên thương hiệu sẽ cập nhật tất cả sản phẩm

### 2. **Brand Products Page**
- API endpoint để lấy sản phẩm theo thương hiệu
- Hỗ trợ pagination và filtering
- Hiển thị thông tin thương hiệu cùng sản phẩm

## Troubleshooting

### 1. Lỗi "Tên thương hiệu đã tồn tại"
- **Nguyên nhân**: Tên hoặc slug bị trùng
- **Giải pháp**: Đổi tên khác hoặc kiểm tra thương hiệu đã có

### 2. Lỗi "Không thể xóa thương hiệu"
- **Nguyên nhân**: Có sản phẩm đang sử dụng thương hiệu
- **Giải pháp**: Xóa/chuyển sản phẩm sang thương hiệu khác trước

### 3. Lỗi "Không thể tải danh sách thương hiệu"
- **Nguyên nhân**: Lỗi kết nối API hoặc server down
- **Giải pháp**: Kiểm tra kết nối mạng, restart server

### 4. Logo không hiển thị
- **Nguyên nhân**: URL không hợp lệ hoặc CORS issues
- **Giải pháp**: Kiểm tra URL, sử dụng placeholder

### 5. Website link không hoạt động
- **Nguyên nhân**: URL không đúng format hoặc thiếu protocol
- **Giải pháp**: Đảm bảo URL có http:// hoặc https://

## Tính Năng Sắp Tới

### 1. Advanced Brand Management
- Upload logo trực tiếp
- Logo resizing và optimization
- Multiple logos per brand (light/dark theme)

### 2. Brand Analytics
- Số lượng sản phẩm theo thương hiệu
- Doanh số theo thương hiệu
- Popular brands tracking

### 3. SEO Features
- Meta description cho brand pages
- Custom URL patterns
- Brand sitemap generation

### 4. Social Integration
- Social media links
- Brand verification badges
- Social sharing optimization

### 5. Import/Export
- Bulk import từ CSV/Excel
- Export danh sách thương hiệu
- Template download

### 6. Advanced Filtering
- Filter theo ngày tạo
- Filter theo số lượng sản phẩm
- Advanced search với multiple criteria

## API Documentation

### Create Brand
```http
POST /api/brands
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Làng nghề Bát Tràng",
  "description": "Thương hiệu gốm sứ truyền thống từ làng Bát Tràng",
  "logo": "https://example.com/logo.jpg",
  "website": "https://battrang.com",
  "order": 1,
  "isActive": true
}
```

### Update Brand
```http
PUT /api/brands/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Làng nghề Bát Tràng Updated",
  "description": "Mô tả đã cập nhật",
  "isActive": false
}
```

### Delete Brand
```http
DELETE /api/brands/:id
Authorization: Bearer <token>
```

### Toggle Status
```http
PATCH /api/brands/:id/toggle
Authorization: Bearer <token>
```

### Get Brand Products
```http
GET /api/brands/:id/products?page=1&limit=8
```

## Kết Luận

Hệ thống quản lý thương hiệu hiện đã hoàn thiện với đầy đủ tính năng CRUD, tích hợp API thực tế, giao diện responsive và user-friendly. Hệ thống đảm bảo tính bảo mật, hiệu suất và khả năng mở rộng cho tương lai, hỗ trợ admin quản lý thương hiệu sản phẩm một cách hiệu quả và chuyên nghiệp.

### Điểm Nổi Bật:
- ✅ CRUD operations hoàn chỉnh
- ✅ Logo và website management
- ✅ Real-time search và filtering
- ✅ Toggle trạng thái nhanh chóng
- ✅ Responsive design
- ✅ Error handling comprehensive
- ✅ Form validation đầy đủ
- ✅ Modal system hiện đại
- ✅ API integration hoàn chỉnh
- ✅ Product association
- ✅ Documentation chi tiết

### So Sánh Với Category Management:
- **Tương đồng**: Cấu trúc CRUD, UI/UX patterns, validation
- **Khác biệt**: Không có hierarchy, có thêm logo và website fields
- **Tích hợp**: Cùng sử dụng trong product management
- **Performance**: Tương đương về hiệu suất và optimization 