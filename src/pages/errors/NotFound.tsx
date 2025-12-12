import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.scss';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Không tìm thấy trang</h1>
        <p>Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <Link to="/" className="btn btn--primary">
          <span>Về trang chủ</span>
          <span className="btn-arrow">→</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
