# VietTrad - Nền tảng thương mại điện tử cho sản phẩm thủ công truyền thống Việt Nam

VietTrad là một nền tảng thương mại điện tử chuyên biệt, tập trung vào việc giới thiệu và phân phối các sản phẩm thủ công truyền thống của Việt Nam, kết hợp với việc kể câu chuyện văn hóa đằng sau mỗi sản phẩm.

## Chạy Demo

### Cách Nhanh (Windows)

1. Chạy file `start-demo.bat` trong thư mục gốc dự án
2. Các cửa sổ dòng lệnh sẽ tự động mở để chạy server và client
3. Truy cập ứng dụng tại http://localhost:3000

### Cách Thủ Công

#### Cài đặt dependencies:

```bash
# Cài đặt dependencies cho toàn bộ dự án
npm install

# Cài đặt dependencies cho server
cd server
npm install

# Cài đặt dependencies cho client
cd ../client
npm install
```

#### Chạy server:

```bash
# Từ thư mục gốc
cd server
npm run dev
```

#### Chạy client:

```bash
# Từ thư mục gốc, trong một terminal khác
cd client
npm start
```

## Tính Năng Demo

- **Trang chủ**: Hiển thị sản phẩm nổi bật, làng nghề, và câu chuyện văn hóa
- **API**: Server cung cấp các endpoints để lấy dữ liệu sản phẩm, làng nghề và câu chuyện văn hóa

Demo hiện tại sử dụng dữ liệu mẫu, không yêu cầu kết nối đến cơ sở dữ liệu MongoDB. Đây là phiên bản đơn giản để trình diễn giao diện và luồng dữ liệu cơ bản.

## Cấu trúc dự án

### Client (ReactJS)

Thư mục `client` chứa mã nguồn frontend:

- `/src/components`: Các components UI tái sử dụng
- `/src/pages`: Các trang của ứng dụng
- `/src/assets`: Tài nguyên tĩnh (hình ảnh, font, etc.)
- `/src/utils`: Các hàm tiện ích
- `/src/services`: Các service để gọi API
- `/src/hooks`: Custom React hooks
- `/src/contexts`: React contexts cho quản lý state toàn cục

### Server (ExpressJS)

Thư mục `server` chứa mã nguồn backend:

- `/models`: Schema dữ liệu (MongoDB/Mongoose)
- `/controllers`: Xử lý logic nghiệp vụ
- `/routes`: Định nghĩa các endpoints API
- `/middleware`: Middleware cho xác thực, xử lý lỗi, uploads, etc.
- `/config`: Cấu hình server
- `/uploads`: Thư mục lưu trữ file tải lên

## Triển Khai Đầy Đủ (Chưa Có Trong Demo)

Để triển khai phiên bản đầy đủ, cần thực hiện các bước sau:

1. Cấu hình MongoDB (xem hướng dẫn trong `server/env-config-guide.md`)
2. Bỏ comment phần kết nối cơ sở dữ liệu trong `server/server.js`
3. Bỏ comment các routes API trong `server/server.js`
4. Phát triển thêm các trang frontend còn thiếu

## Công Nghệ Sử Dụng

- **Frontend**: ReactJS, React Router, SCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Thư viện hỗ trợ**: JWT, Multer, Bcrypt

## Mục Tiêu

- Xây dựng cầu nối giữa nghệ nhân/làng nghề truyền thống và người tiêu dùng
- Nâng cao giá trị thương hiệu cho sản phẩm thủ công Việt Nam
- Bảo tồn và quảng bá giá trị văn hóa truyền thống 
- Cung cấp trải nghiệm mua sắm kết hợp học hỏi về văn hóa

## Công Nghệ Sử Dụng

### Frontend
- React.js
- Redux (hoặc Context API) cho quản lý trạng thái
- React Router cho điều hướng
- CSS/SCSS hoặc Styled-Components cho styling
- Material UI / Ant Design (tùy chọn)

### Backend
- Node.js với Express.js
- MongoDB (cơ sở dữ liệu)
- JWT cho xác thực
- Multer cho tải lên file

## Cài Đặt & Phát Triển

### Yêu Cầu Hệ Thống
- Node.js (v16.x trở lên)
- npm hoặc yarn
- MongoDB (cục bộ hoặc Atlas)

### Cài Đặt Frontend
```bash
# Di chuyển đến thư mục client
cd viettrad/client

# Cài đặt dependencies
npm install

# Khởi chạy môi trường phát triển
npm start
```

### Cài Đặt Backend
```bash
# Di chuyển đến thư mục server
cd viettrad/server

# Cài đặt dependencies
npm install

# Khởi chạy môi trường phát triển
npm run dev
```

## Cấu Trúc Dự Án

Chi tiết cấu trúc thư mục dự án được mô tả trong [project-structure.md](project-structure.md).

## Tính Năng Chính

### Dành Cho Khách Hàng
- Khám phá sản phẩm theo làng nghề, danh mục
- Xem chi tiết sản phẩm kèm câu chuyện văn hóa
- Tìm hiểu về làng nghề truyền thống
- Mua sắm và thanh toán trực tuyến
- Quản lý đơn hàng và tài khoản cá nhân

### Dành Cho Quản Trị Viên
- Quản lý sản phẩm và câu chuyện văn hóa
- Quản lý làng nghề
- Quản lý đơn hàng
- Quản lý người dùng

## Mô Hình Dữ Liệu Cơ Bản

- **User**: Thông tin người dùng (khách hàng, quản trị viên)
- **Product**: Thông tin sản phẩm và liên kết với câu chuyện văn hóa
- **CraftVillage**: Thông tin về làng nghề truyền thống
- **CulturalStory**: Câu chuyện văn hóa liên quan đến sản phẩm và làng nghề
- **Order**: Thông tin đơn hàng
- **Category**: Danh mục sản phẩm

## Đóng Góp

Dự án mở cửa cho đóng góp từ cộng đồng. Nếu bạn muốn tham gia phát triển, hãy:

1. Fork repository
2. Tạo branch tính năng (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi (`git commit -m 'Add some amazing feature'`)
4. Push lên branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## Giấy Phép

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết. 