const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên'],
      trim: true,
      maxlength: [50, 'Tên không được vượt quá 50 ký tự']
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng nhập email hợp lệ'
      ]
    },
    phone: {
      type: String,
      maxlength: [20, 'Số điện thoại không được vượt quá 20 ký tự']
    },
    role: {
      type: String,
      enum: ['user', 'seller', 'admin'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false
    },
    address: {
      street: String,
      ward: String,
      district: String,
      province: String,
      country: {
        type: String,
        default: 'Việt Nam'
      }
    },
    avatar: {
      type: String,
      default: 'default-avatar.jpg'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerified: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastLogin: Date,
    passwordChangedAt: Date
  }
);

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre('save', async function(next) {
  // Chỉ hash mật khẩu nếu nó bị sửa đổi
  if (!this.isModified('password')) {
    return next();
  }

  // Hash mật khẩu với độ phức tạp 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // Nếu đang cập nhật mật khẩu, ghi nhận thời gian
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Trừ 1 giây để đảm bảo JWT được tạo sau khi mật khẩu thay đổi
  }

  next();
});

// Phương thức so sánh mật khẩu đã nhập với mật khẩu đã hash
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Tạo JWT token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, name: this.name, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Kiểm tra xem mật khẩu có thay đổi sau thời điểm JWT được phát hành
UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Tạo token đặt lại mật khẩu
UserSchema.methods.getResetPasswordToken = function() {
  // Tạo token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash và lưu vào cơ sở dữ liệu
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Đặt thời gian hết hạn - 10 phút
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Tạo token xác thực email
UserSchema.methods.getEmailVerificationToken = function() {
  // Tạo token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Hash và lưu vào cơ sở dữ liệu
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  return verificationToken;
};

module.exports = mongoose.model('User', UserSchema); 