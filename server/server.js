const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const productRoutes = require('./routes/products');
const villageRoutes = require('./routes/villages');
const storyRoutes = require('./routes/stories');
// const authRoutes = require('./routes/auth');
// const orderRoutes = require('./routes/orders');
// const userRoutes = require('./routes/users');

// Import DB config
// const connectDB = require('./config/db');

// Khởi tạo ứng dụng Express
const app = express();

// Connect Database
// Bỏ comment dòng dưới đây sau khi đã cấu hình .env và cài đặt MongoDB
// connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Thư mục tĩnh cho file tải lên
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Đảm bảo thư mục uploads đã được tạo
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.mkdirSync(path.join(uploadDir, 'products'), { recursive: true });
  fs.mkdirSync(path.join(uploadDir, 'villages'), { recursive: true });
  fs.mkdirSync(path.join(uploadDir, 'stories'), { recursive: true });
}

// Routes cơ bản
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to VietTrad API - Traditional Vietnamese Crafts E-commerce Platform',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Mock data cho demo
const mockData = {
  products: [
    {
      id: '1',
      name: 'Bình gốm Bát Tràng',
      slug: 'binh-gom-bat-trang',
      description: 'Bình gốm truyền thống từ làng Bát Tràng, làm thủ công 100%',
      price: 750000,
      images: [{ url: '/uploads/products/binh-gom.jpg', alt: 'Bình gốm Bát Tràng' }],
      craftVillage: { _id: '1', name: 'Làng gốm Bát Tràng', slug: 'lang-gom-bat-trang' },
      featured: true
    },
    {
      id: '2',
      name: 'Tranh đồng mạ vàng Đồng Xâm',
      slug: 'tranh-dong-ma-vang',
      description: 'Tranh đồng mạ vàng thủ công từ làng nghề Đồng Xâm, Nam Định',
      price: 2500000,
      images: [{ url: '/uploads/products/tranh-dong.jpg', alt: 'Tranh đồng mạ vàng' }],
      craftVillage: { _id: '2', name: 'Làng nghề Đồng Xâm', slug: 'lang-nghe-dong-xam' },
      featured: true
    },
    {
      id: '3',
      name: 'Nón lá Huế thêu hoa sen',
      slug: 'non-la-hue',
      description: 'Nón lá truyền thống Huế được thêu hoa sen tinh xảo bằng tay',
      price: 350000,
      images: [{ url: '/uploads/products/non-la.jpg', alt: 'Nón lá Huế' }],
      craftVillage: { _id: '3', name: 'Làng nón Huế', slug: 'lang-non-hue' },
      featured: true
    }
  ],
  villages: [
    {
      id: '1',
      name: 'Làng gốm Bát Tràng',
      slug: 'lang-gom-bat-trang',
      description: 'Làng nghề gốm sứ nổi tiếng với lịch sử hàng trăm năm tại Hà Nội',
      images: [{ url: '/uploads/villages/bat-trang.jpg', alt: 'Làng gốm Bát Tràng' }]
    },
    {
      id: '2',
      name: 'Làng lụa Vạn Phúc',
      slug: 'lang-lua-van-phuc',
      description: 'Làng nghề dệt lụa truyền thống với các sản phẩm lụa cao cấp',
      images: [{ url: '/uploads/villages/van-phuc.jpg', alt: 'Làng lụa Vạn Phúc' }]
    }
  ],
  stories: [
    {
      id: '1',
      title: 'Nghề làm gốm Bát Tràng - Hồn Việt trong từng sản phẩm',
      slug: 'nghe-lam-gom-bat-trang',
      content: 'Khám phá câu chuyện lịch sử hàng trăm năm của làng gốm Bát Tràng và những giá trị văn hóa đặc sắc',
      images: [{ url: '/uploads/stories/bat-trang-story.jpg', alt: 'Nghề làm gốm Bát Tràng' }]
    }
  ]
};

// Routes API với mock data
app.get('/api/products', (req, res) => {
  const { featured } = req.query;
  let products = [...mockData.products];
  
  if (featured === 'true') {
    products = products.filter(p => p.featured);
  }
  
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockData.products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Không tìm thấy sản phẩm'
    });
  }
  
  res.status(200).json({
    success: true,
    data: product
  });
});

app.get('/api/villages', (req, res) => {
  res.status(200).json({
    success: true,
    count: mockData.villages.length,
    data: mockData.villages
  });
});

app.get('/api/stories', (req, res) => {
  res.status(200).json({
    success: true,
    count: mockData.stories.length,
    data: mockData.stories
  });
});

// Định nghĩa API routes - chúng ta sẽ không sử dụng trong demo
// app.use('/api/products', productRoutes);
// app.use('/api/villages', villageRoutes);
// app.use('/api/stories', storyRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/users', userRoutes);

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
  });
}

// Cổng máy chủ
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}); 