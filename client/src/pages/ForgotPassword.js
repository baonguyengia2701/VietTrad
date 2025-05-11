import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.scss';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setError('');
    setIsLoading(true);
    
    // Mô phỏng gửi yêu cầu đặt lại mật khẩu
    setTimeout(() => {
      // Ở đây sẽ là API call để gửi email trong ứng dụng thực tế
      console.log('Đã gửi yêu cầu đặt lại mật khẩu đến:', email);
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="forgot-password-page">
      <div className="container">
        <div className="forgot-password-container">
          {!isSubmitted ? (
            <>
              <div className="forgot-password-header">
                <h1>Quên mật khẩu</h1>
                <p>Vui lòng nhập email của bạn để nhận mã xác nhận đặt lại mật khẩu</p>
              </div>

              <form className="forgot-password-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập địa chỉ email"
                    className={error ? 'error' : ''}
                  />
                  {error && <span className="error-message">{error}</span>}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Gửi mã xác nhận'}
                </button>
              </form>
            </>
          ) : (
            <div className="success-message">
              <div className="success-icon">
                <i className="icon-check"></i>
              </div>
              <h2>Đã gửi mã xác nhận!</h2>
              <p>
                Chúng tôi đã gửi mã xác nhận đến địa chỉ email <strong>{email}</strong>. 
                Vui lòng kiểm tra hộp thư đến của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
              </p>
              <p>
                Nếu bạn không nhận được email trong vòng vài phút, vui lòng kiểm tra thư mục spam 
                hoặc <button onClick={() => setIsSubmitted(false)} className="btn-text">thử lại</button>.
              </p>
            </div>
          )}

          <div className="forgot-password-footer">
            <p>
              <Link to="/login">Quay lại đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 