const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware bảo vệ route - yêu cầu xác thực
exports.protect = async (req, res, next) => {
  let token;

  // Lấy token từ header Authorization (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Hoặc từ cookie (nếu có)
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Kiểm tra token có tồn tại không
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Không có quyền truy cập, vui lòng đăng nhập'
    });
  }

  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm người dùng từ ID trong token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Không tìm thấy người dùng với ID trong token'
      });
    }

    // Kiểm tra xem người dùng đã thay đổi mật khẩu sau khi token được tạo
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        error: 'Người dùng đã thay đổi mật khẩu, vui lòng đăng nhập lại'
      });
    }

    // Thêm thông tin người dùng vào request
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Token không hợp lệ'
    });
  }
};

// Middleware kiểm tra vai trò người dùng
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Kiểm tra vai trò người dùng có trong danh sách cho phép
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Vai trò "${req.user.role}" không có quyền thực hiện hành động này`
      });
    }
    next();
  };
};

// Middleware kiểm tra quyền Admin
exports.admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Chỉ Admin mới có quyền thực hiện hành động này'
    });
  }
  next();
};

// Middleware kiểm tra người dùng có quyền với tài nguyên
exports.checkOwnership = (model) => async (req, res, next) => {
  try {
    const resource = await model.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tài nguyên'
      });
    }
    
    // Admin có quyền truy cập mọi tài nguyên
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Kiểm tra người dùng có phải là chủ sở hữu của tài nguyên
    if (resource.user && resource.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Bạn không có quyền với tài nguyên này'
      });
    }
    
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
}; 