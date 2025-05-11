const User = require('../models/User');
const crypto = require('crypto');

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email đã được sử dụng'
      });
    }

    // Tạo người dùng mới
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Tạo token xác thực email
    // const verificationToken = user.getEmailVerificationToken();
    // await user.save({ validateBeforeSave: false });

    // Gửi email xác thực - sẽ triển khai sau
    // await sendVerificationEmail(user.email, verificationToken);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error(error);
    
    // Xử lý lỗi validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email và password được nhập không
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập email và mật khẩu'
      });
    }

    // Kiểm tra user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Thông tin đăng nhập không hợp lệ'
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Thông tin đăng nhập không hợp lệ'
      });
    }

    // Kiểm tra xem tài khoản có bị vô hiệu hóa không
    if (!user.active) {
      return res.status(401).json({
        success: false,
        error: 'Tài khoản của bạn đã bị vô hiệu hóa'
      });
    }

    // Cập nhật thời gian đăng nhập gần nhất
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Đăng xuất / xóa cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    // Kiểm tra nếu người dùng thay đổi email, đảm bảo email mới không bị trùng
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email đã được sử dụng bởi tài khoản khác'
        });
      }
    }

    // Tạo đối tượng fieldsToUpdate chỉ chứa các trường cần cập nhật
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    if (phone) fieldsToUpdate.phone = phone;
    if (address) fieldsToUpdate.address = address;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    
    // Xử lý lỗi validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Cập nhật mật khẩu
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới'
      });
    }

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    // Lấy user với mật khẩu
    const user = await User.findById(req.user.id).select('+password');

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Cập nhật mật khẩu
    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// @desc    Quên mật khẩu
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy người dùng với email này'
      });
    }

    // Lấy token đặt lại mật khẩu
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Tạo URL đặt lại
    const resetUrl = `${process.env.APP_URL}/reset-password/${resetToken}`;

    // Gửi email đặt lại mật khẩu - sẽ triển khai sau
    // await sendResetPasswordEmail(user.email, resetUrl);

    // Thông báo tạm thời - sẽ xóa sau khi triển khai gửi email
    res.status(200).json({
      success: true,
      data: {
        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
        resetUrl, // CHỈ để test, sẽ xóa trong môi trường sản xuất
        resetToken // CHỈ để test, sẽ xóa trong môi trường sản xuất
      }
    });
  } catch (error) {
    console.error(error);

    // Nếu có lỗi, reset các trường reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      success: false,
      error: 'Không thể gửi email đặt lại mật khẩu'
    });
  }
};

// @desc    Đặt lại mật khẩu
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Lấy token từ URL
    const { resettoken } = req.params;
    const { password } = req.body;

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resettoken)
      .digest('hex');

    // Tìm người dùng với token hợp lệ và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'
      });
    }

    // Kiểm tra độ dài mật khẩu mới
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    // Đặt lại mật khẩu mới
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ'
    });
  }
};

// Helper function - gửi token trong response
const sendTokenResponse = (user, statusCode, res) => {
  // Tạo token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  // Set secure flag trong production
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
}; 