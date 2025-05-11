const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục upload nếu chưa tồn tại
const createUploadDirs = () => {
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  const productPath = path.join(uploadPath, 'products');
  const villagePath = path.join(uploadPath, 'villages');
  const storyPath = path.join(uploadPath, 'stories');

  // Tạo các thư mục nếu chưa tồn tại
  if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
  if (!fs.existsSync(productPath)) fs.mkdirSync(productPath);
  if (!fs.existsSync(villagePath)) fs.mkdirSync(villagePath);
  if (!fs.existsSync(storyPath)) fs.mkdirSync(storyPath);
};

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    createUploadDirs();
    
    // Xác định thư mục lưu trữ dựa trên loại tài nguyên
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    let destinationPath;
    
    if (req.originalUrl.includes('/products')) {
      destinationPath = path.join(uploadPath, 'products');
    } else if (req.originalUrl.includes('/villages')) {
      destinationPath = path.join(uploadPath, 'villages');
    } else if (req.originalUrl.includes('/stories')) {
      destinationPath = path.join(uploadPath, 'stories');
    } else {
      destinationPath = uploadPath;
    }
    
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    
    // Loại bỏ ký tự đặc biệt và dấu tiếng Việt từ tên file gốc
    let fileName = path.basename(file.originalname, fileExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    
    cb(null, fileName + '-' + uniqueSuffix + fileExt);
  }
});

// Hàm kiểm tra loại file
const fileFilter = (req, file, cb) => {
  // Cho phép các loại hình ảnh phổ biến
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file hình ảnh (jpeg, png, gif, webp)'), false);
  }
};

// Giới hạn kích thước file
const limits = {
  fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024 // 5MB mặc định
};

// Khởi tạo multer
const upload = multer({ 
  storage, 
  fileFilter,
  limits
});

// Middleware upload một file
const uploadSingleImage = (fieldName) => upload.single(fieldName);

// Middleware upload nhiều file
const uploadMultipleImages = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File quá lớn. Kích thước tối đa cho phép là ${limits.fileSize / 1024 / 1024}MB`
      });
    }
    
    return res.status(400).json({
      success: false,
      error: `Lỗi upload file: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  next();
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  handleUploadError
}; 