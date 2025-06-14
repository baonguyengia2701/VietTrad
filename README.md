# 🏮 VietTrad - Nền tảng thương mại điện tử cho sản phẩm thủ công truyền thống Việt Nam

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**VietTrad** là nền tảng thương mại điện tử toàn diện, chuyên biệt phục vụ việc giới thiệu, phân phối và bảo tồn các sản phẩm thủ công truyền thống Việt Nam. Nền tảng kết hợp giữa thương mại hiện đại và việc kể câu chuyện văn hóa đằng sau mỗi sản phẩm, tạo ra trải nghiệm mua sắm độc đáo và ý nghĩa.

## 🚀 Khởi Chạy Nhanh

### Cách 1: Sử dụng Script Tự Động (Windows)
```bash
# Chạy file batch để khởi động toàn bộ hệ thống
start-demo.bat
```

### Cách 2: Khởi Chạy Thủ Công
```bash
# 1. Cài đặt tất cả dependencies
npm run install-all

# 2. Khởi chạy cả client và server
npm run dev

# Hoặc chạy riêng biệt:
npm run server  # Backend tại http://localhost:5000
npm run client  # Frontend tại http://localhost:3000
```

### Cách 3: Khởi Chạy Từng Phần

#### Backend Server:
```bash
cd server
npm install
npm run dev
```

#### Frontend Client:
```bash
cd client
npm install
npm start
```

## ✨ Tính Năng Chính

### 🛍️ Dành Cho Khách Hàng
- **🏠 Trang Chủ**: Hiển thị sản phẩm nổi bật, blog văn hóa và thông tin làng nghề
- **🔍 Tìm Kiếm & Lọc Sản Phẩm**: Tìm kiếm thông minh với AI Assistant, lọc theo danh mục, thương hiệu, giá
- **📱 Chi Tiết Sản Phẩm**: Hình ảnh đa phương tiện, mô tả chi tiết, đánh giá người dùng
- **🛒 Giỏ Hàng & Thanh Toán**: Quản lý giỏ hàng, nhiều phương thức thanh toán, theo dõi đơn hàng
- **👤 Quản Lý Tài Khoản**: Đăng ký/đăng nhập, hồ sơ cá nhân, lịch sử đơn hàng
- **⭐ Đánh Giá & Nhận Xét**: Viết đánh giá, xem feedback từ cộng đồng
- **📝 Blog Văn Hóa**: Đọc câu chuyện về làng nghề, sản phẩm truyền thống
- **💬 AI Assistant**: Trợ lý AI hỗ trợ tìm kiếm và tư vấn sản phẩm
- **📞 Liên Hệ**: Hỗ trợ khách hàng, gửi feedback

### 🔧 Dành Cho Quản Trị Viên
- **📊 Dashboard**: Thống kê tổng quan doanh thu, đơn hàng, sản phẩm
- **📦 Quản Lý Sản Phẩm**: CRUD sản phẩm, quản lý hình ảnh, variants, inventory
- **📑 Quản Lý Danh Mục**: Tổ chức danh mục sản phẩm, phân cấp danh mục
- **🏷️ Quản Lý Thương Hiệu**: Quản lý thông tin thương hiệu, logo
- **📋 Quản Lý Đơn Hàng**: Xem, cập nhật trạng thái đơn hàng, xử lý hoàn trả
- **👥 Quản Lý Người Dùng**: Quản lý tài khoản khách hàng, phân quyền
- **💬 Quản Lý Đánh Giá**: Duyệt, trả lời đánh giá khách hàng
- **📝 Quản Lý Blog**: Tạo, chỉnh sửa bài blog về văn hóa, làng nghề
- **📊 Quản Lý Kho**: Theo dõi tồn kho, nhập xuất hàng
- **🤖 Cấu Hình AI**: Quản lý AI Assistant, training data

### 🎯 Tính Năng Đặc Biệt
- **🧠 AI-Powered Search**: Tìm kiếm thông minh bằng ngôn ngữ tự nhiên
- **📱 Responsive Design**: Tối ưu cho mọi thiết bị (desktop, tablet, mobile)
- **🔒 Bảo Mật**: JWT authentication, mã hóa mật khẩu, bảo vệ API
- **📊 Analytics**: Theo dõi hành vi người dùng, báo cáo chi tiết
- **📧 Email Marketing**: Gửi email xác nhận, thông báo đơn hàng
- **🌐 SEO Optimized**: URL thân thiện, meta tags, structured data
- **⚡ Performance**: Tối ưu tốc độ tải, lazy loading, caching

## 🏗️ Cấu Trúc Dự Án

```
viettrad/
├── 📁 client/                 # Frontend React App
│   ├── 📁 src/
│   │   ├── 📁 components/     # UI Components tái sử dụng
│   │   ├── 📁 pages/          # Các trang ứng dụng
│   │   │   ├── 📁 admin/      # Trang quản trị
│   │   │   ├── Home.js        # Trang chủ
│   │   │   ├── Products.js    # Danh sách sản phẩm
│   │   │   ├── ProductDetail.js # Chi tiết sản phẩm
│   │   │   ├── Cart.js        # Giỏ hàng
│   │   │   ├── Checkout.js    # Thanh toán
│   │   │   └── ...
│   │   ├── 📁 services/       # API Services
│   │   ├── 📁 hooks/          # Custom React Hooks
│   │   ├── 📁 contexts/       # React Contexts
│   │   ├── 📁 utils/          # Utility functions
│   │   ├── 📁 assets/         # Tài nguyên tĩnh
│   │   └── 📁 styles/         # SCSS Styles
│   └── 📄 package.json
├── 📁 server/                 # Backend Express Server
│   ├── 📁 controllers/        # Business Logic Controllers
│   │   ├── productController.js
│   │   ├── userController.js
│   │   ├── orderController.js
│   │   └── ...
│   ├── 📁 models/             # MongoDB Schemas
│   │   ├── productModel.js
│   │   ├── userModel.js
│   │   ├── orderModel.js
│   │   └── ...
│   ├── 📁 routes/             # API Routes
│   │   ├── productRoutes.js
│   │   ├── userRoutes.js
│   │   ├── orderRoutes.js
│   │   └── ...
│   ├── 📁 middleware/         # Custom Middleware
│   ├── 📁 config/             # Server Configuration
│   ├── 📁 utils/              # Backend Utilities
│   ├── 📁 uploads/            # File Uploads Storage
│   └── 📄 package.json
├── 📄 package.json            # Root package.json
└── 📄 README.md
```

## 🛠️ Công Nghệ Sử Dụng

### 🎨 Frontend
| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|-----------|----------|
| **React** | 18.2.0 | Core framework |
| **React Router Dom** | 6.20.0 | Routing & Navigation |
| **Axios** | 1.6.2 | HTTP Client |
| **SCSS/Sass** | 1.69.5 | Styling |
| **React Bootstrap** | 2.10.10 | UI Components |
| **Formik** | 2.4.5 | Form Management |
| **Yup** | 1.3.2 | Form Validation |
| **Framer Motion** | 12.12.1 | Animations |
| **React Slick** | 0.29.0 | Carousel/Slider |
| **React Toastify** | 11.0.5 | Notifications |
| **React Icons** | 4.12.0 | Icon Library |

### ⚙️ Backend
| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|-----------|----------|
| **Node.js** | 16+ | Runtime Environment |
| **Express.js** | 4.18.2 | Web Framework |
| **MongoDB** | Latest | NoSQL Database |
| **Mongoose** | 7.5.0 | ODM for MongoDB |
| **JWT** | 9.0.1 | Authentication |
| **bcryptjs** | 2.4.3 | Password Hashing |
| **Multer** | 1.4.5 | File Upload |
| **Nodemailer** | 7.0.3 | Email Service |
| **OpenAI** | 5.3.0 | AI Integration |
| **Swagger** | 6.2.8 | API Documentation |
| **Morgan** | 1.10.0 | HTTP Logger |

## 📋 Mô Hình Dữ Liệu

### 👤 User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  isAdmin: Boolean,
  avatar: String,
  createdAt: Date
}
```

### 📦 Product Model
```javascript
{
  name: String,
  description: String,
  images: [String],
  category: ObjectId,
  brand: ObjectId,
  price: Number,
  originalPrice: Number,
  discount: Number,
  stock: Number,
  variants: {
    title: [String],
    size: [String]
  },
  specifications: Object,
  averageRating: Number,
  numOfReviews: Number,
  featured: Boolean,
  createdAt: Date
}
```

### 📝 Order Model
```javascript
{
  user: ObjectId,
  orderItems: [{
    product: ObjectId,
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    selectedVariant: Object
  }],
  shippingInfo: Object,
  paymentMethod: String,
  orderStatus: String,
  totalPrice: Number,
  createdAt: Date
}
```

### ⭐ Review Model
```javascript
{
  user: ObjectId,
  product: ObjectId,
  rating: Number,
  comment: String,
  createdAt: Date
}
```

## 🎯 Mục Tiêu Dự Án

- 🏛️ **Bảo tồn văn hóa**: Giữ gìn và phát huy giá trị sản phẩm thủ công truyền thống
- 🌉 **Kết nối**: Xây dựng cầu nối giữa nghệ nhân và người tiêu dùng hiện đại
- 💎 **Nâng tầm thương hiệu**: Đưa sản phẩm Việt Nam ra thị trường quốc tế
- 📚 **Giáo dục**: Truyền tải kiến thức văn hóa qua câu chuyện sản phẩm
- 🛒 **Trải nghiệm**: Mang đến trải nghiệm mua sắm độc đáo và ý nghĩa

## 🚀 Cài Đặt & Triển Khai

### 📋 Yêu Cầu Hệ Thống
- **Node.js**: v16.0.0 trở lên
- **npm**: v8.0.0 trở lên
- **MongoDB**: Latest version (Local hoặc Atlas)
- **Git**: Để clone repository

### ⚡ Triển Khai Nhanh

#### 1. Clone Repository
```bash
git clone https://github.com/your-username/viettrad.git
cd viettrad
```

#### 2. Cài Đặt Dependencies
```bash
# Cài đặt tất cả dependencies
npm run install-all

# Hoặc cài đặt từng phần
npm install              # Root dependencies
cd server && npm install # Server dependencies
cd ../client && npm install # Client dependencies
```

#### 3. Cấu Hình Environment Variables

**Server (.env):**
```bash
cd server
cp env.example .env
```

Chỉnh sửa file `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/viettrad
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key
```

#### 4. Khởi Chạy Ứng Dụng
```bash
# Chạy cả client và server
npm run dev

# Hoặc chạy riêng biệt
npm run server  # Backend: http://localhost:5000
npm run client  # Frontend: http://localhost:3000
```

### 🗄️ Thiết Lập Database

#### MongoDB Local
```bash
# Khởi động MongoDB service
mongod

# Import dữ liệu mẫu (nếu có)
cd server
npm run data:import
```

#### MongoDB Atlas
1. Tạo cluster tại [MongoDB Atlas](https://cloud.mongodb.com/)
2. Lấy connection string
3. Cập nhật `MONGODB_URI` trong file `.env`

### 🔧 Scripts Có Sẵn

```bash
# Root level scripts
npm run dev              # Chạy cả client và server
npm run server           # Chỉ chạy server
npm run client           # Chỉ chạy client
npm run install-all      # Cài đặt tất cả dependencies
npm run clean            # Dọn dẹp files debug và temp

# Server scripts
cd server
npm run dev              # Chạy server với nodemon
npm start                # Chạy server production
npm run data:import      # Import dữ liệu mẫu
npm run data:destroy     # Xóa dữ liệu

# Client scripts
cd client
npm start                # Chạy development server
npm run build            # Build cho production
npm test                 # Chạy tests
```

## 🌐 API Documentation

API documentation được tự động tạo bằng Swagger và có thể truy cập tại:
- **Development**: http://localhost:5000/api-docs
- **Production**: https://your-domain.com/api-docs

### 🔑 Chức Năng API Chính

#### 🛍️ Products API
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

#### 👤 Users API
- `POST /api/users/register` - Đăng ký tài khoản
- `POST /api/users/login` - Đăng nhập
- `GET /api/users/profile` - Lấy thông tin profile
- `PUT /api/users/profile` - Cập nhật profile

#### 📋 Orders API
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn hàng (Admin)

## 🎨 UI/UX Design

### 🎯 Design System
- **Màu chủ đạo**: Cam truyền thống (#c83901), Vàng đất (#d9bc8b)
- **Typography**: Modern và dễ đọc
- **Icons**: React Icons library
- **Responsive**: Mobile-first approach
- **Animations**: Smooth transitions với Framer Motion

### 📱 Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚢 Triển Khai Production

### 🌐 Platforms Hỗ Trợ
- **Railway**: Nền tảng cloud đơn giản
- **Render**: Static sites và backend services
- **Heroku**: PaaS phổ biến
- **Google Cloud Platform**: Enterprise solution
- **AWS**: Scalable cloud infrastructure

### 📦 Build for Production
```bash
# Build client
cd client
npm run build

# Start production server
cd ../server
npm start
```

### 🔐 Environment Variables Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/viettrad
JWT_SECRET=super-secure-jwt-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=production-email@domain.com
OPENAI_API_KEY=production-openai-key
```

## 📊 Performance & Monitoring

### 📈 Metrics
- **Tốc độ tải**: < 3 giây
- **SEO Score**: > 90
- **Accessibility**: WCAG 2.1 compliant
- **Mobile Performance**: > 85

### 🔍 Monitoring Tools
- **Morgan**: HTTP request logging
- **Custom Analytics**: User behavior tracking
- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Real-time metrics

## 🧪 Testing

### 🔬 Test Coverage
```bash
# Frontend tests
cd client
npm test

# Backend tests (when implemented)
cd server
npm test
```

### 🛡️ Security Features
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs encryption
- **Input Validation**: XSS and injection protection
- **CORS**: Cross-origin request security
- **Rate Limiting**: API abuse prevention

## 🤝 Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng! 

### 🚀 Cách Đóng Góp
1. **Fork** repository này
2. **Clone** fork về máy local
   ```bash
   git clone https://github.com/your-username/viettrad.git
   ```
3. **Tạo branch** cho tính năng mới
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Commit** thay đổi của bạn
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push** lên branch
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Tạo Pull Request** với mô tả chi tiết

### 💡 Hướng Dẫn Phát Triển
- Tuân thủ coding standards hiện tại
- Viết comments tiếng Việt cho dễ hiểu
- Test kỹ trước khi submit PR
- Cập nhật documentation nếu cần
- Tôn trọng design system hiện tại

### 🐛 Báo Lỗi
1. Kiểm tra xem lỗi đã được báo cáo chưa
2. Tạo issue mới với template
3. Cung cấp thông tin chi tiết:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (nếu có)
   - Environment details

## 📞 Liên Hệ & Hỗ Trợ

- **Email**: support@viettrad.com
- **GitHub Issues**: [Tạo issue mới](https://github.com/your-username/viettrad/issues)
- **Documentation**: [Chi tiết trong docs/](docs/)

## 📜 Giấy Phép

Dự án này được phân phối dưới **Giấy phép MIT**. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

```
MIT License

Copyright (c) 2024 VietTrad Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software")...
```

---

<div align="center">

**🏮 Được phát triển với ❤️ cho việc bảo tồn văn hóa Việt Nam 🏮**

[⭐ Star this repo](https://github.com/your-username/viettrad) | [🐛 Report Bug](https://github.com/your-username/viettrad/issues) | [💡 Request Feature](https://github.com/your-username/viettrad/issues)

</div> 