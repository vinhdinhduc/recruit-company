import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { 
  faBriefcase, 
  faChartLine, 
  faUser, 
  faFileAlt, 
  faBookmark, 
  faBuilding, 
  faPlus, 
  faTasks, 
  faUsers, 
  faFolder, 
  faChevronLeft, 
  faChevronRight, 
  faHome, 
  faSignOutAlt, 
  faBars, 
  faBell 
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.scss';

interface DashboardLayoutProps {
  userType: 'candidate' | 'employer' | 'admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ userType }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const candidateMenuItems = [
    { path: '/candidate/dashboard', icon: faChartLine, label: 'Tổng quan' },
    { path: '/candidate/profile', icon: faUser, label: 'Hồ sơ cá nhân' },
    { path: '/candidate/applications', icon: faFileAlt, label: 'Đơn ứng tuyển' },
    { path: '/candidate/saved-jobs', icon: faBookmark, label: 'Việc làm đã lưu' },
    { path: '/candidate/resume', icon: faFileAlt, label: 'CV của tôi' },
  ];

  const employerMenuItems = [
    { path: '/employer/dashboard', icon: faChartLine, label: 'Tổng quan' },
    { path: '/employer/profile', icon: faUser, label: 'Hồ sơ cá nhân' },
    { path: '/employer/company', icon: faBuilding, label: 'Thông tin công ty' },
    { path: '/employer/post-job', icon: faPlus, label: 'Đăng tin tuyển dụng' },
    { path: '/employer/jobs', icon: faBriefcase, label: 'Quản lý tin tuyển dụng' },
    { path: '/employer/applications', icon: faTasks, label: 'Quản lý ứng viên' },
  ];

  const adminMenuItems = [
    { path: '/admin/dashboard', icon: faChartLine, label: 'Tổng quan' },
    { path: '/admin/users', icon: faUsers, label: 'Quản lý người dùng' },
    { path: '/admin/companies', icon: faBuilding, label: 'Quản lý công ty' },
    { path: '/admin/categories', icon: faFolder, label: 'Quản lý danh mục' },
  ];

  const menuItems =
    userType === 'candidate'
      ? candidateMenuItems
      : userType === 'employer'
      ? employerMenuItems
      : adminMenuItems;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-layout__sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-icon">
              <FontAwesomeIcon icon={faBriefcase} />
            </span>
            {sidebarOpen && <span className="logo-text">JobPortal</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FontAwesomeIcon icon={sidebarOpen ? faChevronLeft : faChevronRight} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/" className="nav-item">
            <span className="nav-icon">
              <FontAwesomeIcon icon={faHome} />
            </span>
            {sidebarOpen && <span className="nav-label">Trang chủ</span>}
          </NavLink>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </span>
            {sidebarOpen && <span className="nav-label">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-layout__main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-header__left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <h1 className="page-title">
              {userType === 'candidate' && 'Ứng viên'}
              {userType === 'employer' && 'Nhà tuyển dụng'}
              {userType === 'admin' && 'Quản trị viên'}
            </h1>
          </div>
          <div className="dashboard-header__right">
            <button className="notification-btn">
              <FontAwesomeIcon icon={faBell} />
              <span className="badge">3</span>
            </button>
            <div className="user-menu">
              <div className="user-avatar">
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.full_name}</div>
                <div className="user-role">
                  {userType === 'candidate' && 'Ứng viên'}
                  {userType === 'employer' && 'Nhà tuyển dụng'}
                  {userType === 'admin' && 'Quản trị'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
