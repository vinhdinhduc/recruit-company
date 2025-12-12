import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBriefcase, 
  faCheck, 
  faExclamationTriangle, 
  faEnvelope, 
  faLock, 
  faEye, 
  faEyeSlash, 
  faArrowRight 
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './Login.scss';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password, rememberMe);
      toast.success('Đăng nhập thành công!');
      // Get user from localStorage to determine redirect path
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        switch (user.role) {
          case 'candidate':
            navigate('/candidate/dashboard');
            break;
          case 'employer':
            navigate('/employer/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Shapes */}
      <div className="login-page__bg-shapes">
        <div className="shape shape--1"></div>
        <div className="shape shape--2"></div>
        <div className="shape shape--3"></div>
      </div>

      <div className="login-page__container">
        {/* Left Side - Info */}
        <div className="login-page__info">
          <div className="login-page__info-content">
            <div className="login-page__logo">
              <div className="logo-icon">
                <FontAwesomeIcon icon={faBriefcase} />
              </div>
              <h1>JobPortal</h1>
            </div>
            <h2 className="login-page__info-title">
              Chào mừng trở lại!
            </h2>
            <p className="login-page__info-text">
              Khám phá hàng nghìn cơ hội việc làm hấp dẫn từ các công ty hàng đầu.
              Đăng nhập để tiếp tục hành trình phát triển sự nghiệp của bạn.
            </p>
            <ul className="login-page__features">
              <li>
                <span className="benefit-icon">
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                <span>Tìm kiếm việc làm phù hợp</span>
              </li>
              <li>
                <span className="benefit-icon">
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                <span>Theo dõi đơn ứng tuyển</span>
              </li>
              <li>
                <span className="benefit-icon">
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                <span>Kết nối với nhà tuyển dụng</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-page__form-wrapper">
          <div className="login-card">
            <div className="login-card__header">
              <h2>Đăng nhập</h2>
              <p className="subtitle">Nhập thông tin để tiếp tục</p>
            </div>

            {error && (
              <div className="alert alert--error">
                <span className="alert__icon">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </span>
                <span className="alert__message">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                    <span className="label-icon">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </span>
                  Email
                </label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                    <span className="label-icon">
                      <FontAwesomeIcon icon={faLock} />
                    </span>
                  Mật khẩu
                </label>
                <div className="input-wrapper input-wrapper--password">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-label">Ghi nhớ đăng nhập</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Quên mật khẩu?
                </Link>
              </div>

              <button 
                type="submit" 
                className="btn btn--primary btn--full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                  <span className="btn-arrow">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </span>
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <span>hoặc</span>
            </div>

            <div className="social-login">
              <button className="btn btn--social btn--google">
                <span className="social-icon">
                  <FontAwesomeIcon icon={faGoogle} />
                </span>
                <span>Đăng nhập với Google</span>
              </button>
              <button className="btn btn--social btn--linkedin">
                <span className="social-icon">
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </span>
                <span>Đăng nhập với LinkedIn</span>
              </button>
            </div>

            <p className="register-text">
              Chưa có tài khoản? 
              <Link to="/register" className="register-link">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
