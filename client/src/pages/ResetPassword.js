import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PasswordInput from '../components/PasswordInput';
import './ResetPassword.scss';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ');
    }
  }, [token]);

  const validatePassword = (pwd) => {
    return pwd.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.put(
        `/api/users/reset-password/${token}`,
        { password, confirmPassword },
        config
      );

      console.log('Đặt lại mật khẩu thành công:', data.message);
      
      // Lưu thông tin user và token vào localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      setIsSuccess(true);
      
      // Chuyển hướng đến trang chủ sau 3 giây
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      const message =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="reset-password-page">
        <div className="container">
          <div className="reset-password-container">
            <div className="success-message">
              <div className="success-icon">
                <i className="icon-check"></i>
              </div>
              <h2>Đặt lại mật khẩu thành công!</h2>
              <p>
                Mật khẩu của bạn đã được đặt lại thành công. 
                Bạn sẽ được chuyển hướng đến trang chủ trong giây lát...
              </p>
              <div className="actions">
                <Link to="/" className="btn btn-primary">
                  Về trang chủ ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="container">
        <div className="reset-password-container">
          <div className="reset-password-header">
            <h1>Đặt lại mật khẩu</h1>
            <p>Vui lòng nhập mật khẩu mới cho tài khoản của bạn</p>
          </div>

          <form className="reset-password-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                className={error ? 'error' : ''}
                label="Mật khẩu mới"
              />
            </div>

            <div className="form-group">
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className={error ? 'error' : ''}
                label="Xác nhận mật khẩu"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary btn-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>

          <div className="reset-password-footer">
            <p>
              <Link to="/login">Quay lại đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 