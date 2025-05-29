# Hướng Dẫn Quản Lý Người Dùng - Admin VietTrad

## Tổng Quan
Trang quản lý người dùng đã được nâng cấp với đầy đủ các tính năng CRUD (Create, Read, Update, Delete) và quản lý vai trò người dùng.

## Tính Năng Mới

### 1. Xem Chi Tiết Người Dùng
- **Nút**: Biểu tượng mắt (👁️) trong cột "Thao tác"
- **Chức năng**: Hiển thị modal với thông tin chi tiết người dùng
- **Thông tin hiển thị**:
  - Họ và tên
  - Email
  - Số điện thoại
  - Vai trò (Admin/Khách hàng)
  - Trạng thái (Hoạt động/Không hoạt động/Bị khóa)
  - Ngày tham gia
  - Lần đăng nhập cuối
  - Địa chỉ đầy đủ

### 2. Chỉnh Sửa Thông Tin Người Dùng
- **Nút**: Biểu tượng bút chì (✏️) trong cột "Thao tác"
- **Chức năng**: Mở modal form chỉnh sửa
- **Các trường có thể chỉnh sửa**:
  - Họ và tên (bắt buộc)
  - Email (bắt buộc)
  - Số điện thoại
  - Quyền quản trị viên (checkbox)
  - Địa chỉ (đường, thành phố, mã bưu điện, quốc gia)

### 3. Xóa Người Dùng
- **Nút**: Biểu tượng thùng rác (🗑️) trong cột "Thao tác"
- **Chức năng**: Hiển thị modal xác nhận xóa
- **Bảo mật**: Yêu cầu xác nhận trước khi xóa
- **Cảnh báo**: Thông báo rằng hành động không thể hoàn tác

### 4. Cập Nhật Vai Trò
- **Vị trí**: Dropdown trong cột "Vai trò"
- **Tùy chọn**: 
  - Quản trị viên
  - Khách hàng
- **Cập nhật**: Tự động lưu khi thay đổi

### 5. Cập Nhật Trạng Thái
- **Vị trí**: Dropdown trong cột "Trạng thái"
- **Tùy chọn**:
  - Hoạt động (màu xanh)
  - Không hoạt động (màu xám)
  - Bị khóa (màu đỏ)
- **Cập nhật**: Tự động lưu khi thay đổi

## API Endpoints Mới

### Backend APIs
```
GET    /api/users/:id          - Lấy thông tin user theo ID
PUT    /api/users/:id          - Cập nhật thông tin user
DELETE /api/users/:id          - Xóa user
PUT    /api/users/:id/status   - Cập nhật trạng thái user
```

### Frontend Services
```javascript
// userService.js
getUserById(userId)           - Lấy thông tin user
updateUser(userId, userData)  - Cập nhật user
deleteUser(userId)           - Xóa user
updateUserStatus(userId, status) - Cập nhật trạng thái
updateUserRole(userId, isAdmin)  - Cập nhật vai trò
```

## Cải Tiến Giao Diện

### 1. Thông Báo Thông Minh
- **Thành công**: Thông báo màu xanh với biểu tượng ✅
- **Lỗi**: Thông báo màu đỏ với biểu tượng ⚠️
- **Tự động ẩn**: Sau 3 giây

### 2. Modal Responsive
- **Desktop**: Modal trung tâm với kích thước phù hợp
- **Mobile**: Modal toàn màn hình
- **Form**: Grid layout 2 cột trên desktop, 1 cột trên mobile

### 3. Loading States
- **Form submit**: Nút hiển thị spinner và text "Đang cập nhật..."
- **Disabled state**: Vô hiệu hóa nút khi đang xử lý

### 4. Validation
- **Required fields**: Họ tên và email bắt buộc
- **Email format**: Kiểm tra định dạng email hợp lệ
- **Real-time**: Hiển thị lỗi ngay khi nhập

## Cách Sử Dụng

### 1. Truy Cập Trang Admin
```
http://localhost:3000/admin/users
```

### 2. Xem Chi Tiết User
1. Click vào biểu tượng mắt (👁️) ở hàng user muốn xem
2. Modal sẽ hiển thị thông tin chi tiết
3. Click "Đóng" để thoát

### 3. Chỉnh Sửa User
1. Click vào biểu tượng bút chì (✏️) ở hàng user muốn sửa
2. Modal form sẽ mở với thông tin hiện tại
3. Chỉnh sửa các trường cần thiết
4. Click "Cập nhật" để lưu hoặc "Hủy" để thoát

### 4. Xóa User
1. Click vào biểu tượng thùng rác (🗑️) ở hàng user muốn xóa
2. Modal xác nhận sẽ hiển thị
3. Click "Xóa người dùng" để xác nhận hoặc "Hủy" để thoát

### 5. Thay Đổi Vai Trò
1. Click vào dropdown "Vai trò" ở hàng user
2. Chọn "Quản trị viên" hoặc "Khách hàng"
3. Thay đổi sẽ được lưu tự động

### 6. Thay Đổi Trạng Thái
1. Click vào dropdown "Trạng thái" ở hàng user
2. Chọn trạng thái mong muốn
3. Thay đổi sẽ được lưu tự động

## Bảo Mật

### 1. Phân Quyền
- Chỉ admin mới có thể truy cập trang này
- Tất cả API đều yêu cầu token admin hợp lệ

### 2. Validation
- Server-side validation cho tất cả dữ liệu
- Client-side validation cho UX tốt hơn

### 3. Xác Nhận Hành Động
- Xóa user yêu cầu xác nhận
- Thông báo rõ ràng về hậu quả

## Responsive Design

### Desktop (>768px)
- Layout 2 cột cho form
- Modal kích thước trung bình
- Hiển thị đầy đủ thông tin trong bảng

### Tablet (768px - 1200px)
- Layout 2 cột cho form
- Modal responsive
- Font size nhỏ hơn cho bảng

### Mobile (<768px)
- Layout 1 cột cho form
- Modal toàn màn hình
- Bảng có scroll ngang
- Nút full-width trong modal

## Troubleshooting

### 1. Lỗi "Không thể tải thông tin người dùng"
- **Nguyên nhân**: Lỗi kết nối API hoặc user không tồn tại
- **Giải pháp**: Kiểm tra kết nối mạng và refresh trang

### 2. Lỗi "Không có quyền truy cập"
- **Nguyên nhân**: Token hết hạn hoặc không có quyền admin
- **Giải pháp**: Đăng nhập lại với tài khoản admin

### 3. Modal không hiển thị
- **Nguyên nhân**: Lỗi JavaScript hoặc CSS
- **Giải pháp**: Kiểm tra console và refresh trang

### 4. Form không submit được
- **Nguyên nhân**: Validation lỗi hoặc lỗi API
- **Giải pháp**: Kiểm tra các trường bắt buộc và thông báo lỗi

## Tính Năng Sắp Tới

### 1. Bulk Actions
- Chọn nhiều user cùng lúc
- Thay đổi trạng thái hàng loạt
- Xóa nhiều user cùng lúc

### 2. Advanced Filters
- Lọc theo ngày tham gia
- Lọc theo trạng thái
- Lọc theo tổng chi tiêu

### 3. Export Data
- Xuất danh sách user ra Excel
- Xuất báo cáo thống kê

### 4. User Activity Log
- Theo dõi hoạt động của user
- Lịch sử đăng nhập
- Lịch sử thay đổi thông tin

## Kết Luận

Trang quản lý người dùng hiện đã có đầy đủ các tính năng cần thiết cho việc quản lý user trong hệ thống e-commerce. Giao diện thân thiện, responsive và có đầy đủ các biện pháp bảo mật cần thiết. 