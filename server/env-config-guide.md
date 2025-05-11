# Hướng Dẫn Cấu Hình Môi Trường Cho VietTrad Server

Để cấu hình môi trường cho server của VietTrad, bạn cần tạo file `.env` trong thư mục `server` với các biến môi trường sau:

## Cấu hình file `.env`

```
# Cấu hình môi trường server
NODE_ENV=development
PORT=5000

# Cấu hình MongoDB
MONGO_URI=mongodb://localhost:27017/viettrad
# Nếu bạn sử dụng MongoDB Atlas, hãy thay thế bằng URI từ Atlas
# MONGO_URI=mongodb+srv://username:password@cluster0.example.mongodb.net/viettrad?retryWrites=true&w=majority

# Cấu hình JWT (JSON Web Token)
JWT_SECRET=viettrad_jwt_secret_key_change_this
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Cấu hình Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@viettrad.com
EMAIL_FROM_NAME=VietTrad

# Cấu hình upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5000000

# Các biến môi trường khác
APP_URL=http://localhost:3000
```

## Giải thích các biến môi trường

### Cấu hình Server
- `NODE_ENV`: Môi trường hoạt động (`development`, `production`, `test`)
- `PORT`: Cổng mà server sẽ chạy (mặc định: 5000)

### Cấu hình MongoDB
- `MONGO_URI`: URI kết nối đến cơ sở dữ liệu MongoDB. 
  - Với MongoDB cục bộ: `mongodb://localhost:27017/viettrad`
  - Với MongoDB Atlas: URL kết nối cung cấp bởi MongoDB Atlas

### Cấu hình JWT
- `JWT_SECRET`: Khóa bí mật để ký các token JWT (quan trọng: nên thay đổi giá trị này)
- `JWT_EXPIRE`: Thời gian hết hạn của token JWT (ví dụ: `7d` là 7 ngày)
- `JWT_COOKIE_EXPIRE`: Thời gian hết hạn của cookie lưu token JWT (đơn vị: ngày)

### Cấu hình Email
- `EMAIL_HOST`: SMTP server (ví dụ: `smtp.gmail.com` cho Gmail)
- `EMAIL_PORT`: Cổng SMTP (thường là 587 hoặc 465)
- `EMAIL_USERNAME`: Địa chỉ email dùng để gửi email
- `EMAIL_PASSWORD`: Mật khẩu hoặc "app password" của email
- `EMAIL_FROM`: Địa chỉ email người gửi
- `EMAIL_FROM_NAME`: Tên hiển thị của người gửi

### Cấu hình Upload
- `UPLOAD_PATH`: Đường dẫn thư mục lưu trữ file tải lên
- `MAX_FILE_SIZE`: Kích thước tối đa của file tải lên (đơn vị: byte)

### Cấu hình khác
- `APP_URL`: URL của ứng dụng frontend

## Lưu ý quan trọng về bảo mật

1. **KHÔNG** đưa file `.env` vào kho mã nguồn của bạn (đã đưa vào `.gitignore`)
2. Thay đổi các giá trị mặc định như `JWT_SECRET` khi triển khai thực tế
3. Với cấu hình email, sử dụng "App Passwords" thay vì mật khẩu chính cho tài khoản email
4. Khi triển khai lên môi trường sản xuất, cần cập nhật các URL và cấu hình kết nối phù hợp

## Cài đặt MongoDB

### MongoDB cục bộ
1. Tải và cài đặt MongoDB từ: https://www.mongodb.com/try/download/community
2. Tạo thư mục để lưu trữ dữ liệu: `C:\data\db` (Windows) hoặc `/data/db` (macOS/Linux)
3. Chạy MongoDB server với lệnh: `mongod`

### MongoDB Atlas (Cloud)
1. Tạo tài khoản tại: https://www.mongodb.com/cloud/atlas
2. Tạo cluster mới (có thể sử dụng tier miễn phí)
3. Cấu hình Network Access để cho phép kết nối từ IP của bạn
4. Tạo Database User
5. Lấy Connection String và cập nhật vào biến `MONGO_URI` trong file `.env` 