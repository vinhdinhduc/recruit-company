import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faBookmark, faEye, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.scss';

const CandidateDashboard: React.FC = () => {
  return (
    <div className="candidate-dashboard">
      <div className="dashboard-header-section">
        <h1>Chào mừng trở lại!</h1>
        <p>Quản lý hồ sơ và theo dõi tiến trình ứng tuyển của bạn</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faFileAlt} />
          </div>
          <div className="stat-info">
            <div className="stat-value">12</div>
            <div className="stat-label">Đơn ứng tuyển</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faBookmark} />
          </div>
          <div className="stat-info">
            <div className="stat-value">8</div>
            <div className="stat-label">Việc làm đã lưu</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faEye} />
          </div>
          <div className="stat-info">
            <div className="stat-value">45</div>
            <div className="stat-label">Lượt xem CV</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faEnvelope} />
          </div>
          <div className="stat-info">
            <div className="stat-value">3</div>
            <div className="stat-label">Tin nhắn mới</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="content-card">
          <h2>Đơn ứng tuyển gần đây</h2>
          <p className="placeholder-text">Danh sách đơn ứng tuyển sẽ hiển thị ở đây</p>
        </div>
        <div className="content-card">
          <h2>Việc làm phù hợp</h2>
          <p className="placeholder-text">Gợi ý việc làm dành cho bạn</p>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
