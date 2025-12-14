import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  faTachometerAlt,
  faHome,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import './Header.scss';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  // Close mobile menu when screen is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.full_name) return 'U';
    const names = user.full_name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    const roleMap: { [key: string]: string } = {
      candidate: 'Ứng viên',
      employer: 'Nhà tuyển dụng',
      admin: 'Quản trị viên',
    };
    return roleMap[role] || role;
  };

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="header">
        <div className="header__container">
          <div className="header__content">
            {/* Logo */}
            <Link to="/" className="header__logo" onClick={closeMobileMenu}>
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
              <ul className="nav-links">
                <li>
                  <Link 
                    to="/" 
                    className={`nav-link ${isActive('/') ? 'nav-link--active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faHome} />
                    <span>Trang chủ</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/jobs" 
                    className={`nav-link ${isActive('/jobs') ? 'nav-link--active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faBriefcase} />
                    <span>Việc làm</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/companies" 
                    className={`nav-link ${isActive('/companies') ? 'nav-link--active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faBuilding} />
                    <span>Công ty</span>
                  </Link>
                </li>

                {user && user.role === 'candidate' && (
                  <>
                    <li>
                      <Link 
                        to="/candidate/applications" 
                        className={`nav-link ${isActive('/candidate/applications') ? 'nav-link--active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faFileAlt} />
                        <span>Đơn ứng tuyển</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/candidate/saved-jobs" 
                        className={`nav-link ${isActive('/candidate/saved-jobs') ? 'nav-link--active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faBookmark} />
                        <span>Việc đã lưu</span>
                      </Link>
                    </li>
                  </>
                )}

                {user && user.role === 'employer' && (
                  <>
                    <li>
                      <Link 
                        to="/employer/jobs" 
                        className={`nav-link ${isActive('/employer/jobs') ? 'nav-link--active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faBriefcase} />
                        <span>Tin tuyển dụng</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/employer/applications" 
                        className={`nav-link ${isActive('/employer/applications') ? 'nav-link--active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faFileAlt} />
                        <span>Quản lý ứng viên</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/employer/company" 
                        className={`nav-link ${isActive('/employer/company') ? 'nav-link--active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faBuilding} />
                        <span>Công ty</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>

              {/* Auth Section */}
              <div className="header__auth">
                {user ? (
                  <div className="user-menu" ref={dropdownRef}>
                    <button className="user-menu__trigger" onClick={toggleDropdown}>
                      <div className="user-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.full_name} />
                        ) : (
                          getUserInitials()
                        )}
                      </div>
                      <div className="user-info">
                        <span className="user-info__name">{user.full_name}</span>
                        <span className="user-info__email">{getRoleLabel(user.role)}</span>
                      </div>
                      <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
                    </button>

                    <div className={`user-menu__dropdown ${dropdownOpen ? 'open' : ''}`}>
                      <Link
                        to={`/${user.role}/dashboard`}
                        className="dropdown-item"
                        onClick={() => {
                          setDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        <FontAwesomeIcon icon={faTachometerAlt} />
                        <span>Bảng điều khiển</span>
                      </Link>
                      <Link
                        to={`/${user.role}/profile`}
                        className="dropdown-item"
                        onClick={() => {
                          setDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        <FontAwesomeIcon icon={faUser} />
                        <span>Hồ sơ cá nhân</span>
                      </Link>
                      <Link
                        to={`/${user.role}/settings`}
                        className="dropdown-item"
                        onClick={() => {
                          setDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        <FontAwesomeIcon icon={faCog} />
                        <span>Cài đặt</span>
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="auth-buttons">
                    <Link to="/login" className="btn btn--outline" onClick={closeMobileMenu}>
                      Đăng nhập
                    </Link>
                    <Link to="/register" className="btn btn--primary" onClick={closeMobileMenu}>
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && <div className="header__backdrop" onClick={closeMobileMenu}></div>}
    </>
  );
};

export default Header;