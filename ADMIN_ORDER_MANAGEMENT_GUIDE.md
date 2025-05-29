# Hướng Dẫn Quản Lý Đơn Hàng - Admin VietTrad

## Tổng Quan
Hệ thống quản lý đơn hàng đã được hoàn thiện với đầy đủ các tính năng CRUD (Create, Read, Update, Delete) và tích hợp API thực tế.

## Tính Năng Chính

### 1. Danh Sách Đơn Hàng (`/admin/orders`)

#### Tính năng hiển thị:
- **Bảng đơn hàng**: Hiển thị thông tin chi tiết với các cột:
  - Mã đơn hàng (orderNumber)
  - Thông tin khách hàng (tên, email, số điện thoại)
  - Danh sách sản phẩm (tối đa 2 sản phẩm, hiển thị "+X sản phẩm khác" nếu có nhiều hơn)
  - Tổng tiền (định dạng VND)
  - Trạng thái đơn hàng (pending, confirmed, processing, shipped, delivered, cancelled)
  - Trạng thái thanh toán (đã thanh toán/chưa thanh toán) và phương thức thanh toán
  - Ngày đặt hàng
  - Thao tác (Xem/Sửa/In)

#### Tính năng lọc và tìm kiếm:
- **Tìm kiếm**: Theo mã đơn hàng, tên khách hàng, email
- **Lọc trạng thái**: Dropdown với tất cả trạng thái đơn hàng
- **Lọc phương thức thanh toán**: COD, Banking, MoMo
- **Phân trang**: 10 đơn hàng mỗi trang

#### Thao tác nhanh:
- **Cập nhật trạng thái**: Dropdown trực tiếp trong bảng
- **Làm mới dữ liệu**: Nút refresh để tải lại danh sách

### 2. Xem Chi Tiết Đơn Hàng

#### Thông tin hiển thị:
**Thông tin đơn hàng:**
- Mã đơn hàng
- Trạng thái hiện tại
- Phương thức thanh toán
- Trạng thái thanh toán
- Mã vận đơn (nếu có)

**Thông tin khách hàng:**
- Họ tên
- Email
- Số điện thoại
- Địa chỉ giao hàng đầy đủ
- Ghi chú giao hàng (nếu có)

**Sản phẩm đặt hàng:**
- Hình ảnh sản phẩm
- Tên sản phẩm
- Biến thể sản phẩm (nếu có)
- Số lượng, đơn giá, thành tiền

**Tổng kết đơn hàng:**
- Tổng tiền hàng
- Phí vận chuyển
- Giảm giá sản phẩm (nếu có)
- Giảm giá voucher (nếu có)
- Tổng thanh toán

#### Giao diện:
- Modal popup responsive
- Grid layout 2 cột trên desktop, 1 cột trên mobile
- Hiển thị sản phẩm dạng card với hình ảnh

### 3. Cập Nhật Đơn Hàng

#### Form cập nhật:
- **Trạng thái đơn hàng**: Dropdown với tất cả trạng thái có thể
- **Mã vận đơn**: Input text cho tracking number
- **Ghi chú**: Textarea cho admin notes

#### Validation:
- Trạng thái đơn hàng là bắt buộc
- Mã vận đơn tự động tạo khi chuyển sang trạng thái "shipped"

#### Quy trình trạng thái:
```
pending → confirmed → processing → shipped → delivered
    ↓
cancelled (chỉ từ pending/confirmed)
```

### 4. In Đơn Hàng

#### Tính năng:
- Nút in trực tiếp từ danh sách
- Sử dụng `window.print()` để in trang hiện tại
- Có thể mở rộng để in template đơn hàng riêng

## API Integration

### Frontend Services (`orderService.js`)

#### Admin Methods:
```javascript
// Lấy tất cả đơn hàng với phân trang và lọc
getAllOrders(page, limit, filters)

// Lấy chi tiết đơn hàng
getOrderById(orderId)

// Cập nhật trạng thái đơn hàng
updateOrderStatus(orderId, status, notes, trackingNumber)

// Cập nhật trạng thái thanh toán
updateOrderToPaid(orderId, paymentResult)

// Cập nhật trạng thái giao hàng
updateOrderToDelivered(orderId)

// Hủy đơn hàng
cancelOrder(orderId, reason)

// Lấy thống kê đơn hàng
getOrderStats()
```

### Backend APIs

#### Order Routes:
```
GET    /api/orders                    - Lấy tất cả đơn hàng (admin)
GET    /api/orders/:id                - Lấy chi tiết đơn hàng
PUT    /api/orders/:id/status         - Cập nhật trạng thái (admin)
PUT    /api/orders/:id/pay            - Cập nhật thanh toán
PUT    /api/orders/:id/deliver        - Cập nhật giao hàng (admin)
PUT    /api/orders/:id/cancel         - Hủy đơn hàng
GET    /api/orders/stats              - Thống kê đơn hàng (admin)
```

#### Filters Support:
- `status`: Lọc theo trạng thái đơn hàng
- `paymentMethod`: Lọc theo phương thức thanh toán
- `isPaid`: Lọc theo trạng thái thanh toán
- `isDelivered`: Lọc theo trạng thái giao hàng
- `search`: Tìm kiếm trong mã đơn, tên khách hàng, email

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

### 3. Visual Design
- **Color coding**: 
  - Vàng: Chờ xử lý/Chưa thanh toán
  - Xanh dương: Đã xác nhận
  - Tím: Đang xử lý
  - Cam: Đã gửi hàng
  - Xanh lá: Đã giao hàng/Đã thanh toán
  - Đỏ: Đã hủy
- **Icons**: FontAwesome icons cho tất cả actions
- **Hover effects**: Smooth transitions cho buttons và links

## Cách Sử Dụng

### 1. Truy Cập Quản Lý Đơn Hàng
```
http://localhost:3000/admin/orders
```

### 2. Xem Chi Tiết Đơn Hàng
1. Click icon mắt (👁️) ở hàng đơn hàng muốn xem
2. Xem thông tin chi tiết trong modal
3. Click "Đóng" để thoát

### 3. Cập Nhật Đơn Hàng
1. Click icon bút chì (✏️) ở hàng đơn hàng muốn sửa
2. Cập nhật trạng thái, mã vận đơn, ghi chú
3. Click "Cập nhật" để lưu thay đổi

### 4. Cập Nhật Trạng Thái Nhanh
1. Click dropdown "Trạng thái" ở hàng đơn hàng
2. Chọn trạng thái mới
3. Thay đổi được lưu tự động

### 5. In Đơn Hàng
1. Click icon máy in (🖨️) ở hàng đơn hàng
2. Sử dụng chức năng in của trình duyệt

### 6. Tìm Kiếm và Lọc
1. Nhập từ khóa vào ô tìm kiếm
2. Chọn trạng thái hoặc phương thức thanh toán từ dropdown
3. Kết quả được cập nhật real-time

## Data Structure

### Order Model
```javascript
{
  orderNumber: String,             // Mã đơn hàng duy nhất
  user: ObjectId,                  // ID khách hàng
  orderItems: [{
    product: ObjectId,             // ID sản phẩm
    name: String,                  // Tên sản phẩm
    image: String,                 // Hình ảnh sản phẩm
    price: Number,                 // Giá sản phẩm
    quantity: Number,              // Số lượng
    selectedVariant: {
      title: String,               // Tiêu đề biến thể
      size: String                 // Giá trị biến thể
    }
  }],
  shippingInfo: {
    fullName: String,              // Họ tên người nhận
    email: String,                 // Email
    phone: String,                 // Số điện thoại
    address: String,               // Địa chỉ
    city: String,                  // Thành phố
    district: String,              // Quận/huyện
    ward: String,                  // Phường/xã
    note: String                   // Ghi chú giao hàng
  },
  paymentMethod: String,           // Phương thức thanh toán (cod, banking, momo)
  shippingMethod: String,          // Phương thức vận chuyển (standard, express)
  itemsPrice: Number,              // Tổng tiền hàng
  shippingPrice: Number,           // Phí vận chuyển
  discountPrice: Number,           // Giảm giá sản phẩm
  voucherCode: String,             // Mã voucher
  voucherDiscount: Number,         // Giảm giá voucher
  totalPrice: Number,              // Tổng thanh toán
  isPaid: Boolean,                 // Trạng thái thanh toán
  paidAt: Date,                    // Ngày thanh toán
  isDelivered: Boolean,            // Trạng thái giao hàng
  deliveredAt: Date,               // Ngày giao hàng
  status: String,                  // Trạng thái đơn hàng
  trackingNumber: String,          // Mã vận đơn
  notes: String,                   // Ghi chú admin
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

### 2. Filtering
- Server-side filtering để giảm tải dữ liệu
- Client-side filtering cho search real-time
- Debouncing cho search input

### 3. API Optimization
- Populate only necessary fields
- Efficient filtering and sorting
- Caching strategies (future enhancement)

## Trạng Thái Đơn Hàng

### 1. **Pending (Chờ xử lý)**
- Đơn hàng mới được tạo
- Chưa được admin xác nhận
- Có thể hủy bởi khách hàng hoặc admin

### 2. **Confirmed (Đã xác nhận)**
- Admin đã xác nhận đơn hàng
- Bắt đầu quá trình xử lý
- Có thể hủy với lý do chính đáng

### 3. **Processing (Đang xử lý)**
- Đang chuẩn bị hàng hóa
- Đóng gói sản phẩm
- Không thể hủy dễ dàng

### 4. **Shipped (Đã gửi hàng)**
- Hàng đã được gửi đi
- Có mã vận đơn tracking
- Không thể hủy

### 5. **Delivered (Đã giao hàng)**
- Khách hàng đã nhận hàng
- Hoàn tất đơn hàng
- Có thể đánh giá sản phẩm

### 6. **Cancelled (Đã hủy)**
- Đơn hàng bị hủy
- Hoàn tiền nếu đã thanh toán
- Khôi phục số lượng tồn kho

## Phương Thức Thanh Toán

### 1. **COD (Cash on Delivery)**
- Thanh toán khi nhận hàng
- Phổ biến nhất tại Việt Nam
- Không cần xử lý payment online

### 2. **Banking Transfer**
- Chuyển khoản ngân hàng
- Cần xác minh thanh toán
- Thường dùng cho đơn hàng lớn

### 3. **MoMo Wallet**
- Ví điện tử MoMo
- Thanh toán nhanh chóng
- Tích hợp API MoMo

## Troubleshooting

### 1. Lỗi "Không thể tải danh sách đơn hàng"
- **Nguyên nhân**: Lỗi kết nối API hoặc server down
- **Giải pháp**: Kiểm tra kết nối mạng, restart server

### 2. Lỗi "Không có quyền truy cập"
- **Nguyên nhân**: Token hết hạn hoặc không có quyền admin
- **Giải pháp**: Đăng nhập lại với tài khoản admin

### 3. Lỗi cập nhật trạng thái
- **Nguyên nhân**: Trạng thái không hợp lệ hoặc lỗi server
- **Giải pháp**: Kiểm tra trạng thái hiện tại, thử lại

### 4. Modal không hiển thị đúng
- **Nguyên nhân**: Lỗi JavaScript hoặc CSS conflict
- **Giải pháp**: Refresh trang, kiểm tra console errors

## Tính Năng Sắp Tới

### 1. Bulk Operations
- Chọn nhiều đơn hàng cùng lúc
- Cập nhật trạng thái hàng loạt
- Export danh sách đơn hàng

### 2. Advanced Filtering
- Lọc theo khoảng thời gian
- Lọc theo khoảng giá trị
- Lọc theo khu vực giao hàng

### 3. Order Timeline
- Lịch sử thay đổi trạng thái
- Timeline với timestamps
- Ghi chú cho mỗi thay đổi

### 4. Notification System
- Thông báo real-time cho đơn hàng mới
- Email notifications cho khách hàng
- SMS notifications cho trạng thái quan trọng

### 5. Reporting & Analytics
- Báo cáo doanh thu theo thời gian
- Thống kê đơn hàng theo trạng thái
- Phân tích xu hướng bán hàng

### 6. Integration Features
- Tích hợp với hệ thống vận chuyển
- Tích hợp với kế toán
- API webhooks cho third-party

## Kết Luận

Hệ thống quản lý đơn hàng hiện đã hoàn thiện với đầy đủ tính năng CRUD, tích hợp API thực tế, giao diện responsive và user-friendly. Hệ thống đảm bảo tính bảo mật, hiệu suất và khả năng mở rộng cho tương lai, hỗ trợ admin quản lý đơn hàng một cách hiệu quả và chuyên nghiệp. 