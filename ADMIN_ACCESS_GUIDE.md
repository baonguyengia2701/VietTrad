# Hướng Dẫn Truy Cập Trang Admin VietTrad

## Tổng Quan
Hệ thống admin VietTrad đã được bảo vệ bằng hệ thống xác thực và phân quyền. Chỉ những người dùng có quyền admin mới có thể truy cập vào trang quản trị.

## Tài Khoản Admin

### Sử Dụng Tài Khoản Admin Có Sẵn
- Sử dụng tài khoản admin đã được tạo trong database
- Đăng nhập bằng email và mật khẩu admin thực tế
- Hệ thống sẽ kiểm tra quyền `isAdmin: true` từ database

### Yêu Cầu Hệ Thống
- Backend server phải đang chạy trên `http://localhost:5000`
- Database phải có ít nhất một user với `isAdmin: true`
- API endpoints `/users/login` và `/users/refresh-token` phải hoạt động

## Cách Truy Cập

### 1. Truy Cập Trực Tiếp
1. Đảm bảo backend server đang chạy
2. Mở trình duyệt và truy cập: `http://localhost:3000/admin`
3. Hệ thống sẽ tự động chuyển hướng đến trang đăng nhập
4. Đăng nhập bằng tài khoản admin thực tế
5. Sau khi đăng nhập thành công, bạn sẽ được chuyển đến trang admin

### 2. Đăng Nhập Trước
1. Truy cập: `http://localhost:3000/login`
2. Đăng nhập bằng tài khoản admin
3. Sau đó truy cập: `http://localhost:3000/admin`

## Tính Năng Bảo Mật

### 1. Xác Thực (Authentication)
- Sử dụng JWT tokens (access token + refresh token)
- Access token được gửi trong header `Authorization: Bearer <token>`
- Tự động refresh token khi access token hết hạn
- Logout tự động nếu refresh token thất bại

### 2. Phân Quyền (Authorization)
- Kiểm tra `isAdmin: true` từ database
- Middleware backend kiểm tra quyền admin cho các API admin
- Frontend kiểm tra quyền trước khi render trang admin

### 3. Bảo Vệ Route
- Tất cả route admin được bảo vệ bởi `ProtectedRoute` component
- Kiểm tra quyền truy cập ở mọi trang admin
- Tự động redirect nếu không có quyền

## API Endpoints

### Authentication
- `POST /api/users/login` - Đăng nhập
- `POST /api/users/refresh-token` - Refresh access token
- `GET /api/users/profile` - Lấy thông tin profile

### Admin APIs (yêu cầu quyền admin)
- `GET /api/admin/users` - Lấy danh sách users
- `GET /api/admin/products` - Lấy danh sách products
- `GET /api/admin/orders` - Lấy danh sách orders
- Các API khác theo middleware `protect` và `admin`

## Thử Nghiệm

### Test Case 1: Đăng nhập Admin thành công
1. Đảm bảo backend đang chạy
2. Truy cập `/admin`
3. Đăng nhập với tài khoản admin thực tế
4. **Kết quả mong đợi:** Truy cập thành công vào trang admin

### Test Case 2: User thường cố truy cập admin
1. Truy cập `/admin`
2. Đăng nhập với tài khoản user thường (không có quyền admin)
3. **Kết quả mong đợi:** Hiển thị trang "Truy Cập Bị Từ Chối"

### Test Case 3: Truy cập admin khi chưa đăng nhập
1. Truy cập `/admin` khi chưa đăng nhập
2. **Kết quả mong đợi:** Chuyển hướng đến trang login

### Test Case 4: Token hết hạn
1. Đăng nhập admin và vào trang admin
2. Đợi access token hết hạn hoặc xóa token trong localStorage
3. Thực hiện một hành động (như load trang)
4. **Kết quả mong đợi:** Tự động refresh token hoặc logout nếu refresh thất bại

## Tính Năng Admin

### 1. Dashboard
- Thống kê tổng quan từ database thực tế
- Biểu đồ và số liệu cập nhật real-time

### 2. Quản Lý Sản Phẩm
- CRUD operations với database
- Upload hình ảnh thực tế
- Quản lý inventory

### 3. Quản Lý Đơn Hàng
- Theo dõi đơn hàng từ database
- Cập nhật trạng thái real-time
- Gửi email thông báo

### 4. Quản Lý Người Dùng
- Xem danh sách từ database
- Thay đổi quyền và trạng thái
- Khóa/mở khóa tài khoản

### 5. Profile Dropdown
- Hiển thị thông tin admin từ database
- Chức năng đăng xuất an toàn
- Cập nhật profile

## Ghi Chú Kỹ Thuật

### Real API Integration
- Sử dụng axios với interceptors
- Tự động thêm Authorization header
- Xử lý refresh token tự động
- Error handling cho các trường hợp lỗi API

### Token Management
- Access token: thời hạn ngắn (15-30 phút)
- Refresh token: thời hạn dài (7-30 ngày)
- Tự động refresh khi cần thiết
- Logout khi refresh token hết hạn

### Security Features
- CORS configuration
- Rate limiting
- Input validation
- SQL injection protection
- XSS protection

## Troubleshooting

### Lỗi: Không thể kết nối API
- **Nguyên nhân:** Backend server không chạy
- **Giải pháp:** Khởi động backend server trên port 5000

### Lỗi: 401 Unauthorized
- **Nguyên nhân:** Token hết hạn hoặc không hợp lệ
- **Giải pháp:** Đăng nhập lại hoặc kiểm tra token

### Lỗi: 403 Forbidden
- **Nguyên nhân:** Tài khoản không có quyền admin
- **Giải pháp:** Sử dụng tài khoản có `isAdmin: true`

### Lỗi: Network Error
- **Nguyên nhân:** CORS hoặc network issues
- **Giải pháp:** Kiểm tra CORS config và network connection

### Lỗi: Database Connection
- **Nguyên nhân:** Database không kết nối được
- **Giải pháp:** Kiểm tra MongoDB connection string

## Kiểm Tra Hệ Thống

### 1. Backend Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Database Connection
```bash
# Kiểm tra MongoDB connection
mongosh "your-connection-string"
```

### 3. Admin User Check
```javascript
// Trong MongoDB shell
db.users.findOne({isAdmin: true})
```

## Liên Hệ
- **Email:** admin@viettrad.com
- **Documentation:** Xem file `ADMIN_GUIDE.md` để biết thêm chi tiết về sử dụng trang admin 