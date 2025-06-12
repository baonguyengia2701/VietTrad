# Hướng dẫn cấu hình Environment cho Client

## 1. Tạo file .env

Trong thư mục `client/`, tạo file `.env` với nội dung sau:

```env
# ==============================================
# VIETTRAD CLIENT ENVIRONMENT CONFIGURATION
# ==============================================

# API Configuration
# URL của backend API server
REACT_APP_API_URL=http://localhost:5000/api

# Timeout cho API requests (milliseconds)
REACT_APP_API_TIMEOUT=10000

# Development Settings
# Sử dụng mock data thay vì gọi API thật (true/false)
REACT_APP_USE_MOCK_DATA=true

# App Information
REACT_APP_NAME=Viettrad
REACT_APP_VERSION=1.0.0

# Build Settings
# Production: production, development: development
REACT_APP_ENV=development

# Feature Flags
# Bật/tắt các tính năng đang phát triển
REACT_APP_ENABLE_DEBUG=true
REACT_APP_ENABLE_ANALYTICS=false

# External Services (để dành cho tương lai)
# REACT_APP_GOOGLE_ANALYTICS_ID=
# REACT_APP_FIREBASE_API_KEY=
# REACT_APP_STRIPE_PUBLIC_KEY=

# Social Media & Contact
# REACT_APP_FACEBOOK_URL=
# REACT_APP_INSTAGRAM_URL=
# REACT_APP_PHONE_NUMBER=
# REACT_APP_EMAIL=

# SEO & Meta Tags
REACT_APP_SITE_NAME=Viettrad - Nền tảng thương mại truyền thống Việt Nam
REACT_APP_SITE_DESCRIPTION=Khám phá và kết nối với các làng nghề truyền thống Việt Nam
REACT_APP_SITE_URL=http://localhost:3000
```

## 2. Các file environment khác

### .env.local (cho development local)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_USE_MOCK_DATA=true
REACT_APP_ENV=development
REACT_APP_ENABLE_DEBUG=true
```

### .env.production (cho production)
```env
REACT_APP_API_URL=https://your-production-api.com/api
REACT_APP_USE_MOCK_DATA=false
REACT_APP_ENV=production
REACT_APP_ENABLE_DEBUG=false
REACT_APP_ENABLE_ANALYTICS=true
```

## 3. Quy tắc sử dụng

1. **Thứ tự ưu tiên của các file env:**
   - `.env.local` (cao nhất)
   - `.env.development` / `.env.production`
   - `.env`

2. **Quy tắc đặt tên biến:**
   - Tất cả biến phải bắt đầu với `REACT_APP_`
   - Sử dụng UPPER_CASE và dấu gạch dưới
   - Ví dụ: `REACT_APP_API_URL`

3. **Sử dụng trong code:**
   ```javascript
   // Đúng
   const apiUrl = process.env.REACT_APP_API_URL;
   
   // Sai - không có tiền tố REACT_APP_
   const apiUrl = process.env.API_URL;
   ```

## 4. Bảo mật

- **KHÔNG bao giờ** commit file `.env` vào git
- Chỉ commit file `.env.example` làm template
- Không đặt thông tin nhạy cảm trong environment variables của React (chúng sẽ hiển thị trong build)
- Sử dụng backend để xử lý API keys và secrets

## 5. Các biến hiện tại được sử dụng

| Biến | Mô tả | File sử dụng |
|------|-------|--------------|
| `REACT_APP_API_URL` | URL của backend API | `config/api.js`, `services/blogService.js` |
| `REACT_APP_API_TIMEOUT` | Timeout cho API calls | `config/api.js` |
| `REACT_APP_USE_MOCK_DATA` | Sử dụng mock data | `services/blogService.js` |

## 6. Restart sau khi thay đổi

Sau khi thay đổi file `.env`, bạn cần restart development server:

```bash
# Dừng server (Ctrl+C)
# Sau đó chạy lại
npm start
```

## 7. Kiểm tra cấu hình

Để kiểm tra biến environment có hoạt động không:

```javascript
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('Use Mock Data:', process.env.REACT_APP_USE_MOCK_DATA);
``` 