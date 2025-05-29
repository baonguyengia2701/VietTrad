# Hướng Dẫn Sử Dụng Trang Admin VietTrad

## Tổng Quan

Trang admin VietTrad là hệ thống quản trị toàn diện cho nền tảng thương mại điện tử sản phẩm thủ công truyền thống Việt Nam. Hệ thống cung cấp các công cụ quản lý hiện đại và dễ sử dụng.

## Truy Cập Trang Admin

### URL Truy Cập
```
http://localhost:3000/admin
```

### Đăng Nhập
- Sử dụng tài khoản admin để truy cập
- Hệ thống sẽ kiểm tra quyền truy cập trước khi cho phép vào trang admin

## Cấu Trúc Trang Admin

### 1. Bảng Điều Khiển (Dashboard)
**Đường dẫn:** `/admin`

**Tính năng:**
- Thống kê tổng quan hệ thống
- Biểu đồ doanh thu và đơn hàng
- Danh sách đơn hàng gần đây
- Sản phẩm bán chạy nhất
- Thao tác nhanh

**Thông tin hiển thị:**
- Tổng số sản phẩm
- Tổng số đơn hàng
- Tổng số người dùng
- Tổng doanh thu

### 2. Quản Lý Sản Phẩm
**Đường dẫn:** `/admin/products`

**Tính năng:**
- Xem danh sách tất cả sản phẩm
- Tìm kiếm sản phẩm theo tên, thương hiệu
- Lọc theo danh mục
- Cập nhật trạng thái sản phẩm
- Xem chi tiết sản phẩm
- Chỉnh sửa thông tin sản phẩm
- Xóa sản phẩm

**Các trạng thái sản phẩm:**
- `active`: Hoạt động
- `inactive`: Không hoạt động
- `out_of_stock`: Hết hàng

**Thao tác:**
- **Xem chi tiết:** Nhấn vào icon mắt
- **Chỉnh sửa:** Nhấn vào icon bút chì
- **Xóa:** Nhấn vào icon thùng rác (có xác nhận)
- **Thêm mới:** Nhấn nút "Thêm Sản Phẩm"

### 3. Quản Lý Đơn Hàng
**Đường dẫn:** `/admin/orders`

**Tính năng:**
- Xem danh sách tất cả đơn hàng
- Tìm kiếm theo mã đơn hàng, tên khách hàng, email
- Lọc theo trạng thái đơn hàng
- Cập nhật trạng thái đơn hàng
- Xem chi tiết đơn hàng
- In đơn hàng

**Các trạng thái đơn hàng:**
- `pending`: Chờ xử lý
- `processing`: Đang xử lý
- `shipped`: Đã gửi hàng
- `delivered`: Đã giao hàng
- `cancelled`: Đã hủy

**Các trạng thái thanh toán:**
- `pending`: Chờ thanh toán
- `paid`: Đã thanh toán
- `refunded`: Đã hoàn tiền

### 4. Quản Lý Người Dùng
**Đường dẫn:** `/admin/users`

**Tính năng:**
- Xem danh sách tất cả người dùng
- Tìm kiếm theo tên, email, số điện thoại
- Lọc theo vai trò
- Cập nhật trạng thái người dùng
- Thay đổi vai trò người dùng
- Khóa/mở khóa tài khoản

**Các vai trò:**
- `admin`: Quản trị viên
- `customer`: Khách hàng

**Các trạng thái:**
- `active`: Hoạt động
- `inactive`: Không hoạt động
- `blocked`: Bị khóa

## Tính Năng Chung

### 1. Sidebar Navigation
- Thu gọn/mở rộng sidebar
- Điều hướng nhanh giữa các trang
- Hiển thị trang hiện tại
- Responsive trên mobile

### 2. Header
- Thông tin admin đang đăng nhập
- Thông báo hệ thống
- Nút về trang chủ

### 3. Tìm Kiếm và Lọc
- Tìm kiếm real-time
- Bộ lọc theo nhiều tiêu chí
- Hiển thị số lượng kết quả

### 4. Phân Trang
- Hiển thị 10 items mỗi trang
- Điều hướng trang dễ dàng
- Responsive trên mobile

### 5. Responsive Design
- Tối ưu cho desktop, tablet, mobile
- Sidebar thu gọn tự động trên mobile
- Bảng cuộn ngang trên màn hình nhỏ

## Hướng Dẫn Sử Dụng Chi Tiết

### Quản Lý Sản Phẩm

#### Thêm Sản Phẩm Mới
1. Vào trang "Quản Lý Sản Phẩm"
2. Nhấn nút "Thêm Sản Phẩm"
3. Điền thông tin sản phẩm
4. Upload hình ảnh
5. Lưu sản phẩm

#### Cập Nhật Trạng Thái Sản Phẩm
1. Tìm sản phẩm cần cập nhật
2. Chọn trạng thái mới từ dropdown
3. Hệ thống tự động lưu thay đổi

#### Xóa Sản Phẩm
1. Nhấn vào icon thùng rác
2. Xác nhận xóa trong popup
3. Sản phẩm sẽ bị xóa khỏi hệ thống

### Quản Lý Đơn Hàng

#### Cập Nhật Trạng Thái Đơn Hàng
1. Tìm đơn hàng cần cập nhật
2. Chọn trạng thái mới từ dropdown
3. Hệ thống tự động cập nhật và gửi thông báo

#### Xem Chi Tiết Đơn Hàng
1. Nhấn vào icon mắt
2. Xem thông tin chi tiết:
   - Thông tin khách hàng
   - Danh sách sản phẩm
   - Địa chỉ giao hàng
   - Lịch sử trạng thái

#### In Đơn Hàng
1. Nhấn vào icon máy in
2. Chọn máy in và in đơn hàng

### Quản Lý Người Dùng

#### Thay Đổi Vai Trò
1. Tìm người dùng cần thay đổi
2. Chọn vai trò mới từ dropdown
3. Xác nhận thay đổi

#### Khóa Tài Khoản
1. Nhấn vào icon khóa
2. Xác nhận khóa tài khoản
3. Người dùng sẽ không thể đăng nhập

## Bảo Mật

### Phân Quyền
- Chỉ admin mới có thể truy cập trang admin
- Kiểm tra quyền truy cập ở mỗi trang
- Session timeout tự động

### Xác Thực
- Đăng nhập bắt buộc
- Token JWT cho bảo mật
- Logout tự động khi hết phiên

## Tối Ưu Hóa

### Performance
- Lazy loading cho hình ảnh
- Pagination để giảm tải dữ liệu
- Caching dữ liệu thường dùng

### UX/UI
- Loading states cho các thao tác
- Feedback ngay lập tức
- Responsive design
- Dark/Light mode (tùy chọn)

## Troubleshooting

### Lỗi Thường Gặp

#### Không thể truy cập trang admin
- Kiểm tra quyền đăng nhập
- Xóa cache trình duyệt
- Kiểm tra kết nối mạng

#### Dữ liệu không cập nhật
- Refresh trang
- Kiểm tra kết nối API
- Xem console log để debug

#### Lỗi upload hình ảnh
- Kiểm tra định dạng file (JPG, PNG)
- Kiểm tra kích thước file (< 5MB)
- Kiểm tra quyền ghi file

### Liên Hệ Hỗ Trợ
- Email: admin@viettrad.com
- Phone: 1900-xxxx
- Documentation: /docs/admin

## Cập Nhật và Bảo Trì

### Backup Dữ Liệu
- Backup tự động hàng ngày
- Export dữ liệu thủ công
- Restore từ backup

### Cập Nhật Hệ Thống
- Thông báo cập nhật tự động
- Maintenance mode
- Rollback nếu cần thiết

## API Endpoints (Cho Developer)

### Products
- `GET /api/admin/products` - Lấy danh sách sản phẩm
- `POST /api/admin/products` - Tạo sản phẩm mới
- `PUT /api/admin/products/:id` - Cập nhật sản phẩm
- `DELETE /api/admin/products/:id` - Xóa sản phẩm

### Orders
- `GET /api/admin/orders` - Lấy danh sách đơn hàng
- `PUT /api/admin/orders/:id/status` - Cập nhật trạng thái

### Users
- `GET /api/admin/users` - Lấy danh sách người dùng
- `PUT /api/admin/users/:id/status` - Cập nhật trạng thái
- `PUT /api/admin/users/:id/role` - Thay đổi vai trò

---

**Phiên bản:** 1.0.0  
**Cập nhật lần cuối:** 15/01/2024  
**Tác giả:** VietTrad Development Team 