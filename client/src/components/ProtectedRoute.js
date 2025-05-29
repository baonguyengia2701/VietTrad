import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ProtectedRoute.scss';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Hiển thị loading khi đang kiểm tra authentication
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, chuyển hướng đến trang login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu yêu cầu quyền admin nhưng user không phải admin
  if (requireAdmin && !currentUser.isAdmin) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <i className="fas fa-ban"></i>
          <h2>Truy Cập Bị Từ Chối</h2>
          <p>Bạn không có quyền truy cập vào trang này.</p>
          <p>Chỉ có quản trị viên mới có thể truy cập trang admin.</p>
          <div className="access-denied-actions">
            <button onClick={() => window.history.back()} className="btn btn-secondary">
              <i className="fas fa-arrow-left"></i>
              Quay Lại
            </button>
            <Navigate to="/" replace />
          </div>
        </div>
      </div>
    );
  }

  // Nếu tất cả điều kiện đều thỏa mãn, render children
  return children;
};

export default ProtectedRoute; 