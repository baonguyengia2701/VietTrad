import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PasswordInput from '../components/PasswordInput';
import './Register.scss';

const Register = () => {
  const navigate = useNavigate();
  const { register, currentUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Kiểm tra nếu đã đăng nhập rồi thì chuyển hướng về trang chủ
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Xóa lỗi khi user bắt đầu nhập lại
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    // Xóa lỗi API khi user thay đổi form
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.fullName) {
      tempErrors.fullName = 'Vui lòng nhập họ tên';
    }
    if (!formData.email) {
      tempErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) {
      tempErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        setApiError('');
        // Gọi API đăng ký
        await register(formData.fullName, formData.email, formData.password);
        // No need to navigate here - useEffect will handle it
      } catch (error) {
        setApiError(error.toString());
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="register-container">
          <div className="register-header">
            <h1>Đăng ký</h1>
            <p>Tạo tài khoản để trải nghiệm dịch vụ của VietTrad</p>
          </div>

          {apiError && (
            <div className="alert alert-danger" role="alert">
              {apiError}
            </div>
          )}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                className={errors.fullName ? 'error' : ''}
                disabled={loading}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập địa chỉ email"
                className={errors.email ? 'error' : ''}
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                className={errors.password ? 'error' : ''}
                disabled={loading}
                label="Mật khẩu"
                error={errors.password}
              />
            </div>

            <div className="form-group">
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                className={errors.confirmPassword ? 'error' : ''}
                disabled={loading}
                label="Xác nhận mật khẩu"
                error={errors.confirmPassword}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-register"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <div className="register-footer">
            <p>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 