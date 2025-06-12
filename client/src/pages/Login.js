import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PasswordInput from '../components/PasswordInput';
import './Login.scss';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, currentUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Lấy đường dẫn mà user muốn truy cập trước khi bị redirect
  const from = location.state?.from?.pathname || '/';

  // Kiểm tra nếu đã đăng nhập rồi thì chuyển hướng
  useEffect(() => {
    if (currentUser) {
      // Nếu user là admin và đang cố truy cập admin, cho phép
      // Nếu không phải admin nhưng cố truy cập admin, chuyển về trang chủ
      if (from.startsWith('/admin') && !currentUser.isAdmin) {
        navigate('/');
      } else {
        navigate(from);
      }
    }
  }, [currentUser, navigate, from]);

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
    if (!formData.email) {
      tempErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) {
      tempErrors.password = 'Vui lòng nhập mật khẩu';
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
        const user = await login(formData.email, formData.password);
        
        // Kiểm tra quyền truy cập sau khi đăng nhập thành công
        if (from.startsWith('/admin') && !user.isAdmin) {
          setApiError('Bạn không có quyền truy cập trang admin. Chỉ quản trị viên mới có thể truy cập.');
          return;
        }
        
        // useEffect sẽ xử lý redirect
      } catch (error) {
        setApiError(error.toString());
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container">
          <div className="login-header">
            <h1>Đăng nhập</h1>
            <p>
              {from.startsWith('/admin') 
                ? 'Vui lòng đăng nhập với tài khoản quản trị viên để truy cập trang admin'
                : 'Đăng nhập để truy cập tài khoản của bạn'
              }
            </p>
          </div>

          {apiError && (
            <div className="alert alert-danger" role="alert">
              {apiError}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
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

            <div className="forgot-password">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-login"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="login-footer">
            <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 