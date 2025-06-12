import React, { useState } from 'react';
import './PasswordInput.scss';

const PasswordInput = ({ 
  id, 
  name, 
  value, 
  onChange, 
  placeholder, 
  className, 
  disabled, 
  label,
  error 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="password-input-wrapper">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="password-input-container">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`password-input ${className || ''}`}
          disabled={disabled}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
        >
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="m10.73 5.08 1.27.27 1.27-.27a9 9 0 0 1 7.68 6.73c-.43 1.08-1.13 2.08-2.05 2.92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12a13.657 13.657 0 0 0 10 8 13.526 13.526 0 0 0 5.39-1.39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          )}
        </button>
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default PasswordInput; 