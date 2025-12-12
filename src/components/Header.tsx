import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faBuilding,
  faFileAlt,
  faBookmark,
  faUser,
  faSignOutAlt,
  faCog,
  faChevronDown,
  faBars,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import './Header.scss';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.full_name) return 'U';
    const names = user.full_name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0];
    }
    return names[0][0];
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__content">
          {/* Logo */}
          <Link to="/" className="header__logo">
            <div className="logo-icon">
              <FontAwesomeIcon icon={faBriefcase} />
            </div>
            <span className="logo-text">JobPortal</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button className="header__mobile-toggle" onClick={toggleMobileMenu}>
            <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
          </button>

          {/* Navigation */}
          <nav className={`header__nav ${mobileMenuOpen ? 'header__nav--open' : ''}`}>
            <div className="nav-links">
              <Link to="/jobs" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                <FontAwesomeIcon icon={faBriefcase} />
                <span>Việc làm</span>
              </Link>
              <Link to="/companies" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                <FontAwesomeIcon icon={faBuilding} />
                <span>Công ty</span>
              </Link>

              {user && user.role === 'candidate' && (
                <>
                  <Link to="/candidate/applications" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <FontAwesomeIcon icon={faFileAlt} />
                    <span>Đơn ứng tuyển</span>
                  </Link>
                  <Link to="/candidate/saved-jobs" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <FontAwesomeIcon icon={faBookmark} />
                    <span>Việc đã lưu</span>
                  </Link>
                </>
              )}

              {user && user.role === 'employer' && (
                <>
                  <Link to="/employer/jobs" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <FontAwesomeIcon icon={faBriefcase} />
                    <span>Tin tuyển dụng</span>
                  </Link>
                  <Link to="/employer/applications" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <FontAwesomeIcon icon={faFileAlt} />
                    <span>Quản lý ứng viên</span>
                  </Link>
                  <Link to="/employer/company" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <FontAwesomeIcon icon={faBuilding} />
                    <span>Công ty</span>
                  </Link>
                </>
              )}
            </div>

            {/* Auth Section */}
            <div className="header__auth">
              {user ? (
                <div className="user-menu" ref={dropdownRef}>
                  <button className="user-menu__trigger" onClick={toggleDropdown}>
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.full_name} />
                      ) : (
                        <span className="avatar-initials">{getUserInitials()}</span>
                      )}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.full_name}</span>
                      <span className="user-role">
                        {user.role === 'candidate' && 'Ứng viên'}
                        {user.role === 'employer' && 'Nhà tuyển dụng'}
                        {user.role === 'admin' && 'Quản trị viên'}
                      </span>
                    </div>
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      className={`dropdown-icon ${dropdownOpen ? 'dropdown-icon--open' : ''}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="user-menu__dropdown">
                      <Link 
                        to={`/${user.role}/profile`} 
                        className="dropdown-item"
                        onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}
                      >
                        <FontAwesomeIcon icon={faUser} />
                        <span>Hồ sơ cá nhân</span>
                      </Link>
                      <Link 
                        to={`/${user.role}/dashboard`} 
                        className="dropdown-item"
                        onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}
                      >
                        <FontAwesomeIcon icon={faCog} />
                        <span>Bảng điều khiển</span>
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item dropdown-item--logout" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link 
                    to="/login" 
                    className="btn btn-outline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
