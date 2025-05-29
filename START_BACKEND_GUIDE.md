# Hướng Dẫn Khởi Động Backend Server

## Yêu Cầu Hệ Thống

### 1. Node.js và npm
- Node.js version 14.x hoặc cao hơn
- npm version 6.x hoặc cao hơn

### 2. MongoDB
- MongoDB Community Server
- MongoDB Compass (tùy chọn, để quản lý database)

## Khởi Động Backend Server

### 1. Mở Terminal/Command Prompt
```bash
# Di chuyển đến thư mục server
cd server
```

### 2. Cài Đặt Dependencies (lần đầu tiên)
```bash
npm install
```

### 3. Cấu Hình Environment Variables
Tạo file `.env` trong thư mục `server` với nội dung:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/viettrad
JWT_SECRET=your-jwt-secret-key-here
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-here
JWT_EXPIRE=30m
JWT_REFRESH_EXPIRE=7d
```

### 4. Khởi Động MongoDB
```bash
# Windows (nếu cài đặt như service)
net start MongoDB

# macOS (nếu cài đặt bằng Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 5. Khởi Động Server
```bash
# Development mode với nodemon
npm run dev

# Hoặc production mode
npm start
```

### 6. Kiểm Tra Server
Server sẽ chạy trên `http://localhost:5000`

Kiểm tra health check:
```bash
curl http://localhost:5000/api/health
```

## Tạo Tài Khoản Admin

### Cách 1: Sử dụng API
```bash
# Tạo user admin qua API
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin VietTrad",
    "email": "admin@viettrad.com",
    "password": "admin123",
    "isAdmin": true
  }'
```

### Cách 2: Trực tiếp trong Database
```javascript
// Kết nối MongoDB shell
mongosh mongodb://localhost:27017/viettrad

// Tạo user admin
db.users.insertOne({
  name: "Admin VietTrad",
  email: "admin@viettrad.com",
  password: "$2a$10$...", // Hash của password
  isAdmin: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Cách 3: Sử dụng Seeder Script
```bash
# Nếu có seeder script
npm run seed:admin
```

## Kiểm Tra Kết Nối

### 1. Test API Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@viettrad.com",
    "password": "admin123"
  }'
```

### 2. Kiểm Tra Database
```bash
# Kết nối MongoDB
mongosh mongodb://localhost:27017/viettrad

# Kiểm tra collections
show collections

# Kiểm tra users
db.users.find()

# Kiểm tra admin user
db.users.findOne({isAdmin: true})
```

## Troubleshooting

### Lỗi: Port 5000 đã được sử dụng
```bash
# Tìm process đang sử dụng port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Lỗi: Không kết nối được MongoDB
```bash
# Kiểm tra MongoDB service
# Windows
sc query MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod
```

### Lỗi: Module not found
```bash
# Xóa node_modules và cài đặt lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: JWT Secret không được định nghĩa
- Kiểm tra file `.env` có tồn tại
- Đảm bảo `JWT_SECRET` được định nghĩa
- Restart server sau khi thay đổi `.env`

## Logs và Debugging

### 1. Xem Logs
```bash
# Nếu sử dụng PM2
pm2 logs

# Nếu chạy trực tiếp
# Logs sẽ hiển thị trong terminal
```

### 2. Debug Mode
```bash
# Chạy với debug
DEBUG=* npm run dev

# Hoặc chỉ debug app
DEBUG=app:* npm run dev
```

## API Documentation

Sau khi server chạy, truy cập:
- Swagger UI: `http://localhost:5000/api-docs`
- API Health: `http://localhost:5000/api/health`

## Cấu Trúc Thư Mục Server

```
server/
├── config/          # Cấu hình database, JWT, etc.
├── controllers/     # Controllers xử lý logic
├── middleware/      # Middleware authentication, validation
├── models/          # MongoDB models
├── routes/          # API routes
├── utils/           # Utility functions
├── .env            # Environment variables
├── server.js       # Entry point
└── package.json    # Dependencies
```

## Lưu Ý Quan Trọng

1. **Bảo Mật**: Thay đổi JWT secrets trong production
2. **Database**: Backup database thường xuyên
3. **Logs**: Monitor logs để phát hiện lỗi
4. **Performance**: Sử dụng PM2 cho production
5. **CORS**: Cấu hình CORS cho frontend domain

## Liên Hệ Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs server
2. Kiểm tra kết nối database
3. Xem documentation API
4. Liên hệ team development 