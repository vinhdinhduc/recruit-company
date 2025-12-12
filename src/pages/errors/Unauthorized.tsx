import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Unauthorized.scss';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-content">
        <div className="error-icon">🔒</div>
        <h1>Không có quyền truy cập</h1>
        <p>
          Bạn không có quyền truy cập vào trang này. 
          Vui lòng kiểm tra lại quyền hạn của bạn hoặc liên hệ quản trị viên.
        </p>
        <div className="actions">
          <button onClick={() => navigate(-1)} className="btn btn--secondary">
            <span className="btn-arrow">←</span>
            <span>Quay lại</span>
          </button>
          <Link to="/" className="btn btn--primary">
            <span>Về trang chủ</span>
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
