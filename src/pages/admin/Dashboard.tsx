import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import './Dashboard.scss';

interface Statistics {
  totalUsers: number;
  totalCandidates: number;
  totalEmployers: number;
  totalCompanies: number;
  totalJobs: number;
  activeJobs: number;
  pendingJobs: number;
  totalApplications: number;
  recentApplications: number;
  newUsersThisMonth: number;
  newJobsThisMonth: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStatistics();
      setStatistics(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      setError(err.response?.data?.message || 'Lỗi tải thống kê');
      // Set mock data for development
      setStatistics({
        totalUsers: 1250,
        totalCandidates: 890,
        totalEmployers: 360,
        totalCompanies: 125,
        totalJobs: 450,
        activeJobs: 320,
        pendingJobs: 45,
        totalApplications: 3200,
        recentApplications: 89,
        newUsersThisMonth: 120,
        newJobsThisMonth: 67,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard__loading">
        <div className="spinner"></div>
        <p>Đang tải thống kê...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__container">
        {/* Header */}
        <div className="admin-dashboard__header">
          <div>
            <h1 className="admin-dashboard__title">
              <i className="fas fa-chart-line"></i>
              Dashboard Admin
            </h1>
            <p className="admin-dashboard__subtitle">Tổng quan hệ thống tuyển dụng</p>
          </div>
          <button className="btn btn--primary" onClick={fetchStatistics}>
            <i className="fas fa-sync-alt"></i>
            Làm mới
          </button>
        </div>

        {error && (
          <div className="alert alert--warning">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error} - Hiển thị dữ liệu mẫu</span>
          </div>
        )}

        {/* Main Statistics */}
        <div className="stats-grid stats-grid--primary">
          <div className="stat-card stat-card--primary">
            <div className="stat-card__icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{statistics?.totalUsers || 0}</div>
              <div className="stat-card__label">Tổng người dùng</div>
              <div className="stat-card__trend stat-card__trend--up">
                <i className="fas fa-arrow-up"></i>
                +{statistics?.newUsersThisMonth || 0} tháng này
              </div>
            </div>
          </div>

          <div className="stat-card stat-card--success">
            <div className="stat-card__icon">
              <i className="fas fa-user-tie"></i>
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{statistics?.totalCandidates || 0}</div>
              <div className="stat-card__label">Ứng viên</div>
              <div className="stat-card__meta">
                {statistics?.totalEmployers || 0} nhà tuyển dụng
              </div>
            </div>
          </div>

          <div className="stat-card stat-card--info">
            <div className="stat-card__icon">
              <i className="fas fa-building"></i>
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{statistics?.totalCompanies || 0}</div>
              <div className="stat-card__label">Công ty</div>
              <div className="stat-card__meta">Đang hoạt động</div>
            </div>
          </div>

          <div className="stat-card stat-card--warning">
            <div className="stat-card__icon">
              <i className="fas fa-briefcase"></i>
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{statistics?.totalJobs || 0}</div>
              <div className="stat-card__label">Tin tuyển dụng</div>
              <div className="stat-card__trend stat-card__trend--up">
                <i className="fas fa-arrow-up"></i>
                +{statistics?.newJobsThisMonth || 0} tháng này
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Statistics */}
        <div className="stats-grid stats-grid--secondary">
          <div className="stat-card">
            <div className="stat-card__header">
              <i className="fas fa-check-circle"></i>
              <span>Tin đang tuyển</span>
            </div>
            <div className="stat-card__value">{statistics?.activeJobs || 0}</div>
          </div>

          <div className="stat-card stat-card--highlight">
            <div className="stat-card__header">
              <i className="fas fa-clock"></i>
              <span>Tin chờ duyệt</span>
            </div>
            <div className="stat-card__value">{statistics?.pendingJobs || 0}</div>
            {(statistics?.pendingJobs || 0) > 0 && (
              <button 
                className="stat-card__action"
                onClick={() => navigate('/admin/jobs?status=pending')}
              >
                Xem ngay <i className="fas fa-arrow-right"></i>
              </button>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-card__header">
              <i className="fas fa-file-alt"></i>
              <span>Tổng hồ sơ</span>
            </div>
            <div className="stat-card__value">{statistics?.totalApplications || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-card__header">
              <i className="fas fa-paper-plane"></i>
              <span>Hồ sơ gần đây</span>
            </div>
            <div className="stat-card__value">{statistics?.recentApplications || 0}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="quick-actions__title">
            <i className="fas fa-bolt"></i>
            Thao tác nhanh
          </h2>
          <div className="quick-actions__grid">
            <button 
              className="action-card"
              onClick={() => navigate('/admin/users')}
            >
              <i className="fas fa-users-cog"></i>
              <span>Quản lý người dùng</span>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/admin/companies')}
            >
              <i className="fas fa-building"></i>
              <span>Quản lý công ty</span>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/admin/jobs')}
            >
              <i className="fas fa-briefcase"></i>
              <span>Quản lý tin tuyển dụng</span>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/admin/applications')}
            >
              <i className="fas fa-file-alt"></i>
              <span>Quản lý hồ sơ</span>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/admin/categories')}
            >
              <i className="fas fa-tags"></i>
              <span>Danh mục ngành nghề</span>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/admin/jobs?status=pending')}
            >
              <i className="fas fa-clock"></i>
              <span>Duyệt tin tuyển dụng</span>
              {(statistics?.pendingJobs || 0) > 0 && (
                <span className="action-card__badge">{statistics?.pendingJobs}</span>
              )}
            </button>
          </div>
        </div>

        {/* Activity Chart Placeholder */}
        <div className="activity-section">
          <h2 className="activity-section__title">
            <i className="fas fa-chart-bar"></i>
            Hoạt động gần đây
          </h2>
          <div className="chart-placeholder">
            <i className="fas fa-chart-area"></i>
            <p>Biểu đồ thống kê theo thời gian</p>
            <small>(Sẽ được triển khai sau với Chart.js hoặc Recharts)</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
