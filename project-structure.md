# Cấu Trúc Thư Mục Dự Án Website Thương Mại Điện Tử - Sản Phẩm Thủ Công Truyền Thống Việt Nam

## Tổng Quan
Dự án website thương mại điện tử chuyên biệt kết hợp giữa TMĐT và trình bày câu chuyện văn hóa sản phẩm thủ công truyền thống Việt Nam. Sử dụng React.js cho phía frontend và Express.js cho phía backend.

## Cấu Trúc Thư Mục

```
viettrad/
├── client/                   # Frontend (React.js)
│   ├── public/               # Tài nguyên tĩnh
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── assets/           # Tài nguyên tĩnh như hình ảnh, fonts
│   │
│   ├── src/                  # Mã nguồn React
│   │   ├── assets/           # Tài nguyên
│   │   │   ├── images/       # Hình ảnh
│   │   │   ├── styles/       # CSS/SCSS
│   │   │   └── icons/        # Biểu tượng
│   │   │
│   │   ├── components/       # Các thành phần giao diện
│   │   │   ├── layout/       # Bố cục (Header, Footer, Sidebar)
│   │   │   ├── common/       # Components dùng chung (Button, Card, Modal)
│   │   │   ├── craft-village/# Components liên quan đến làng nghề
│   │   │   ├── product/      # Components liên quan đến sản phẩm
│   │   │   ├── auth/         # Components xác thực (Login, Register)
│   │   │   ├── checkout/     # Components thanh toán
│   │   │   └── admin/        # Components quản trị
│   │   │
│   │   ├── pages/            # Các trang
│   │   │   ├── home/         # Trang chủ
│   │   │   ├── product-detail/# Chi tiết sản phẩm với câu chuyện văn hóa
│   │   │   ├── craft-village/# Trang thông tin làng nghề 
│   │   │   ├── about/        # Về chúng tôi
│   │   │   ├── checkout/     # Thanh toán
│   │   │   ├── cart/         # Giỏ hàng
│   │   │   ├── auth/         # Đăng nhập/Đăng ký
│   │   │   ├── account/      # Quản lý tài khoản người dùng
│   │   │   └── admin/        # Giao diện quản trị
│   │   │       ├── dashboard/# Bảng điều khiển
│   │   │       ├── products/ # Quản lý sản phẩm
│   │   │       ├── villages/ # Quản lý làng nghề
│   │   │       ├── orders/   # Quản lý đơn hàng
│   │   │       └── users/    # Quản lý người dùng
│   │   │
│   │   ├── contexts/         # React Context API 
│   │   │   ├── AuthContext.js
│   │   │   ├── CartContext.js
│   │   │   └── ThemeContext.js
│   │   │
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   └── useFetch.js
│   │   │
│   │   ├── services/         # Giao tiếp API
│   │   │   ├── api.js        # Cấu hình API cơ bản
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── villageService.js
│   │   │   └── orderService.js
│   │   │
│   │   ├── utils/            # Tiện ích
│   │   │   ├── formatters.js # Định dạng dữ liệu
│   │   │   ├── validators.js # Kiểm tra dữ liệu
│   │   │   └── helpers.js    # Hàm hỗ trợ
│   │   │
│   │   ├── App.js            # Component gốc
│   │   ├── index.js          # Điểm vào
│   │   └── routes.js         # Cấu hình định tuyến
│   │
│   ├── package.json
│   └── README.md
│
├── server/                   # Backend (Express.js)
│   ├── config/               # Cấu hình
│   │   ├── db.js             # Cấu hình cơ sở dữ liệu
│   │   ├── passport.js       # Cấu hình xác thực
│   │   └── constants.js      # Các hằng số
│   │
│   ├── controllers/          # Bộ điều khiển
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── villageController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   │
│   ├── middleware/           # Middleware
│   │   ├── auth.js           # Kiểm tra xác thực
│   │   ├── error.js          # Xử lý lỗi
│   │   ├── upload.js         # Xử lý tải lên
│   │   └── validators.js     # Kiểm tra đầu vào
│   │
│   ├── models/               # Mô hình dữ liệu
│   │   ├── User.js           # Người dùng
│   │   ├── Product.js        # Sản phẩm
│   │   ├── CraftVillage.js   # Làng nghề
│   │   ├── Order.js          # Đơn hàng
│   │   ├── CulturalStory.js  # Câu chuyện văn hóa
│   │   └── Category.js       # Danh mục
│   │
│   ├── routes/               # Định tuyến API
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── villages.js
│   │   ├── orders.js
│   │   └── users.js
│   │
│   ├── services/             # Dịch vụ
│   │   ├── emailService.js   # Gửi email
│   │   ├── paymentService.js # Thanh toán
│   │   └── storageService.js # Lưu trữ file
│   │
│   ├── utils/                # Tiện ích
│   │   ├── logger.js         # Ghi log
│   │   ├── helpers.js        # Hàm hỗ trợ
│   │   └── validators.js     # Kiểm tra dữ liệu
│   │
│   ├── uploads/              # Thư mục lưu trữ file tải lên
│   │   ├── products/
│   │   └── villages/
│   │
│   ├── app.js                # Ứng dụng Express
│   ├── server.js             # Điểm vào
│   ├── package.json
│   └── README.md
│
├── .gitignore                # Cấu hình Git ignore
├── README.md                 # Tài liệu chung
└── package.json              # Quản lý gói cấp cao
```

## Giải Thích Cấu Trúc

### Frontend (Client)

1. **components/**: Chứa các thành phần giao diện tái sử dụng, được phân chia theo chức năng:
   - **layout/**: Header, Footer, Sidebar, NavBar
   - **common/**: Button, Card, Modal, Loading,...
   - **craft-village/**: VillageCard, VillageMap, VillageStory,...
   - **product/**: ProductCard, ProductGallery, StorySection,...
   - **auth/**: LoginForm, RegisterForm, ForgotPassword,...
   - **checkout/**: CheckoutForm, PaymentOptions, OrderSummary,...
   - **admin/**: AdminMenu, Dashboard, DataTable,...

2. **pages/**: Chứa các trang hoàn chỉnh:
   - **home/**: Trang chủ giới thiệu các sản phẩm, làng nghề nổi bật
   - **product-detail/**: Hiển thị chi tiết sản phẩm kèm câu chuyện văn hóa
   - **craft-village/**: Thông tin về các làng nghề
   - **about/**: Thông tin về dự án, sứ mệnh
   - **checkout/**: Quy trình thanh toán
   - **cart/**: Giỏ hàng
   - **auth/**: Đăng nhập/Đăng ký
   - **account/**: Quản lý thông tin cá nhân, đơn hàng
   - **admin/**: Giao diện quản trị

3. **contexts/**: Quản lý trạng thái toàn cục qua Context API
4. **hooks/**: Custom hooks để tái sử dụng logic
5. **services/**: Quản lý giao tiếp với API backend
6. **utils/**: Các hàm tiện ích

### Backend (Server)

1. **controllers/**: Xử lý logic nghiệp vụ
2. **models/**: Định nghĩa cấu trúc dữ liệu
3. **routes/**: Định nghĩa các endpoint API
4. **middleware/**: Các hàm trung gian xử lý request
5. **services/**: Các dịch vụ bên ngoài (email, thanh toán)
6. **uploads/**: Lưu trữ file tải lên

## Đặc Điểm Nổi Bật

1. **Tích hợp câu chuyện văn hóa**: Mô hình CulturalStory liên kết với sản phẩm và làng nghề
2. **Giao diện admin toàn diện**: Quản lý sản phẩm, làng nghề, đơn hàng và người dùng
3. **Trải nghiệm người dùng**: Thiết kế hướng đến việc khám phá câu chuyện văn hóa song song với mua sắm
4. **Hệ thống thanh toán an toàn**: Tích hợp các phương thức thanh toán phổ biến tại Việt Nam 