# Hướng dẫn sử dụng hệ thống Quản lý Kho

## Tổng quan

Hệ thống quản lý kho VietTrad cho phép bạn:
- Theo dõi tồn kho của tất cả sản phẩm
- Nhập kho, xuất kho và điều chỉnh số lượng
- Xem lịch sử giao dịch kho chi tiết
- Thống kê tình trạng kho hàng

## Các tính năng chính

### 1. Dashboard Thống kê

Trang chính hiển thị:
- **Tổng sản phẩm**: Số lượng sản phẩm đang quản lý
- **Tổng tồn kho**: Tổng số lượng hàng hóa trong kho
- **Sắp hết hàng**: Số sản phẩm có tồn kho ≤ 5
- **Hết hàng**: Số sản phẩm có tồn kho = 0

### 2. Quản lý Sản phẩm

#### Danh sách sản phẩm
- Hiển thị tất cả sản phẩm với thông tin:
  - Hình ảnh và tên sản phẩm
  - Danh mục và thương hiệu
  - Giá bán
  - Số lượng tồn kho (với màu sắc phân biệt trạng thái)
  - Trạng thái kho (Còn hàng/Sắp hết/Hết hàng)

#### Thao tác nhanh
Mỗi sản phẩm có các nút:
- **Nhập**: Nhập thêm hàng vào kho
- **Xuất**: Xuất hàng khỏi kho
- **Điều chỉnh**: Điều chỉnh số lượng tồn kho
- **Lịch sử**: Xem lịch sử giao dịch của sản phẩm

### 3. Các loại giao dịch kho

#### Nhập kho (Stock In)
- **Mục đích**: Tăng số lượng tồn kho
- **Lý do thường gặp**:
  - Nhập hàng mới
  - Trả lại từ khách hàng
  - Chuyển kho
- **Thông tin cần nhập**:
  - Sản phẩm
  - Số lượng nhập
  - Lý do nhập
  - Ghi chú (tùy chọn)

#### Xuất kho (Stock Out)
- **Mục đích**: Giảm số lượng tồn kho
- **Lý do thường gặp**:
  - Bán hàng
  - Hư hỏng
  - Chuyển kho
  - Khuyến mãi
- **Thông tin cần nhập**:
  - Sản phẩm
  - Số lượng xuất
  - Lý do xuất
  - Ghi chú (tùy chọn)

#### Điều chỉnh kho (Stock Adjustment)
- **Mục đích**: Điều chỉnh số lượng tồn kho về một giá trị cụ thể
- **Lý do thường gặp**:
  - Kiểm kê
  - Điều chỉnh lỗi
  - Thất thoát
- **Thông tin cần nhập**:
  - Sản phẩm
  - Số lượng mới
  - Lý do điều chỉnh
  - Ghi chú (tùy chọn)

### 4. Lịch sử giao dịch

#### Xem tất cả giao dịch
- Hiển thị danh sách tất cả giao dịch kho
- Thông tin bao gồm:
  - Thời gian giao dịch
  - Sản phẩm
  - Loại giao dịch (Nhập/Xuất/Điều chỉnh)
  - Số lượng
  - Tồn kho trước và sau giao dịch
  - Lý do và ghi chú
  - Người thực hiện

#### Bộ lọc
- **Loại giao dịch**: Lọc theo nhập/xuất/điều chỉnh
- **Khoảng thời gian**: Lọc theo ngày bắt đầu và kết thúc
- **Sản phẩm**: Lọc theo sản phẩm cụ thể

#### Lịch sử theo sản phẩm
- Xem lịch sử giao dịch của một sản phẩm cụ thể
- Giúp theo dõi chi tiết biến động kho của từng sản phẩm

## Tích hợp với hệ thống

### 1. Quản lý sản phẩm
- Khi tạo sản phẩm mới, tồn kho mặc định = 0
- Không thể chỉnh sửa tồn kho trực tiếp trong form sản phẩm
- Phải sử dụng trang Quản lý Kho để thay đổi tồn kho

### 2. Đơn hàng
- **Khi tạo đơn hàng**: Tự động trừ kho và ghi lại giao dịch "Bán hàng"
- **Khi hủy đơn hàng**: Tự động hoàn trả kho và ghi lại giao dịch "Hủy đơn hàng"
- **Khi khôi phục đơn hàng**: Tự động trừ lại kho và ghi lại giao dịch "Khôi phục đơn hàng"

### 3. Kiểm tra tồn kho
- Hệ thống tự động kiểm tra tồn kho khi:
  - Khách hàng thêm sản phẩm vào giỏ hàng
  - Tạo đơn hàng mới
  - Thực hiện giao dịch xuất kho

## Quy trình làm việc khuyến nghị

### 1. Nhập hàng mới
1. Vào trang **Quản lý Kho**
2. Chọn **Nhập kho** hoặc click **Nhập** ở sản phẩm cụ thể
3. Chọn sản phẩm và nhập số lượng
4. Chọn lý do "Nhập hàng mới"
5. Thêm ghi chú nếu cần (VD: số lô, nhà cung cấp)
6. Xác nhận nhập kho

### 2. Kiểm kê định kỳ
1. Kiểm đếm thực tế số lượng hàng hóa
2. So sánh với số liệu trong hệ thống
3. Sử dụng **Điều chỉnh kho** để cập nhật số lượng chính xác
4. Chọn lý do "Kiểm kê"
5. Ghi chú chi tiết về sự chênh lệch

### 3. Xử lý hàng hư hỏng
1. Chọn **Xuất kho** cho sản phẩm bị hư hỏng
2. Nhập số lượng hư hỏng
3. Chọn lý do "Hư hỏng"
4. Ghi chú mô tả tình trạng hư hỏng

### 4. Theo dõi sản phẩm sắp hết hàng
1. Kiểm tra dashboard thường xuyên
2. Chú ý các sản phẩm có badge màu vàng (sắp hết)
3. Lên kế hoạch nhập hàng kịp thời
4. Sử dụng lịch sử giao dịch để phân tích xu hướng bán hàng

## Lưu ý quan trọng

### 1. Quyền truy cập
- Chỉ Admin mới có quyền truy cập trang Quản lý Kho
- Tất cả giao dịch đều được ghi lại người thực hiện

### 2. Tính chính xác
- Luôn kiểm tra kỹ thông tin trước khi xác nhận giao dịch
- Không thể xóa hoặc sửa giao dịch đã thực hiện
- Nếu có sai sót, tạo giao dịch điều chỉnh mới

### 3. Backup dữ liệu
- Hệ thống tự động lưu trữ tất cả giao dịch
- Định kỳ xuất báo cáo để backup
- Lưu trữ các chứng từ nhập xuất kho bên ngoài hệ thống

### 4. Hiệu suất
- Với số lượng lớn sản phẩm, sử dụng bộ lọc để tìm kiếm nhanh
- Thường xuyên kiểm tra và dọn dẹp sản phẩm không còn kinh doanh

## Khắc phục sự cố

### 1. Số liệu không chính xác
- Kiểm tra lịch sử giao dịch để tìm nguyên nhân
- Sử dụng điều chỉnh kho để sửa số liệu
- Ghi chú rõ ràng lý do điều chỉnh

### 2. Không thể xuất kho
- Kiểm tra số lượng tồn kho hiện tại
- Đảm bảo số lượng xuất không vượt quá tồn kho
- Kiểm tra quyền truy cập

### 3. Giao dịch bị trùng lặp
- Tránh click nhiều lần vào nút xác nhận
- Kiểm tra lịch sử trước khi thực hiện giao dịch mới
- Nếu bị trùng, tạo giao dịch ngược lại để điều chỉnh

## Liên hệ hỗ trợ

Nếu gặp vấn đề kỹ thuật hoặc cần hỗ trợ sử dụng, vui lòng liên hệ:
- Email: support@viettrad.com
- Hotline: 1900-xxxx
- Tài liệu API: `/api-docs` (cho developer) 