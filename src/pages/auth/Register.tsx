import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBriefcase, 
  faCheck, 
  faBullseye, 
  faChartBar, 
  faHandshake,
  faExclamationTriangle,
  faUser,
  faEnvelope,
  faPhone,
  faArrowRight,
  faLock,
  faEye,
  faEyeSlash,
  faKey,
  faSearch,
  faBuilding,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faLinkedinIn, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './Register.scss';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    role: 'candidate' as 'candidate' | 'employer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateStep1 = () => {
    if (!formData.full_name.trim()) {
      setError('Vui lòng nhập họ và tên');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email không hợp lệ');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setError('');
    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Background Shapes */}
      <div className="register-page__bg-shapes">
        <div className="shape shape--1"></div>
        <div className="shape shape--2"></div>
        <div className="shape shape--3"></div>
      </div>

      <div className="register-page__container">
        {/* Left Side - Info */}
        <div className="register-page__info">
          <div className="register-page__info-content">
            <div className="register-page__logo">
              <div className="logo-icon">
                <FontAwesomeIcon icon={faBriefcase} />
              </div>
              <h1>JobPortal</h1>
            </div>
            <h2 className="register-page__info-title">
              Bắt đầu hành trình của bạn
            </h2>
            <p className="register-page__info-text">
              Tạo tài khoản để truy cập vào hàng nghìn cơ hội việc làm hấp dẫn 
              hoặc tìm kiếm ứng viên tài năng cho doanh nghiệp của bạn.
            </p>

            <div className="register-page__steps">
              <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="step-number">
                  {step > 1 ? <FontAwesomeIcon icon={faCheck} /> : '1'}
                </div>
                <div className="step-info">
                  <h4>Thông tin cá nhân</h4>
                  <p>Họ tên, email, số điện thoại</p>
                </div>
              </div>
              <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-info">
                  <h4>Bảo mật & Vai trò</h4>
                  <p>Mật khẩu và loại tài khoản</p>
                </div>
              </div>
            </div>

            <ul className="register-page__benefits">
              <li>
                <span className="benefit-icon">
                  <FontAwesomeIcon icon={faBullseye} />
                </span>
                <div>
                  <strong>Tìm việc phù hợp</strong>
                  <span>AI gợi ý công việc theo kỹ năng</span>
                </div>
              </li>
              <li>
                <span className="benefit-icon">
                  <FontAwesomeIcon icon={faChartBar} />
                </span>
                <div>
                  <strong>Quản lý hồ sơ</strong>
                  <span>Theo dõi tiến độ ứng tuyển</span>
                </div>
              </li>
              <li>
                <span className="benefit-icon">
                  <FontAwesomeIcon icon={faHandshake} />
                </span>
                <div>
                  <strong>Kết nối trực tiếp</strong>
                  <span>Chat với nhà tuyển dụng</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="register-page__form-wrapper">
          <div className="register-card">
            <div className="register-card__header">
              <h2>Đăng ký tài khoản</h2>
              <p className="subtitle">
                Bước {step} / 2
              </p>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar">
              <div 
                className="progress-bar__fill" 
                style={{ width: `${(step / 2) * 100}%` }}
              ></div>
            </div>

            {error && (
              <div className="alert alert--error">
                <span className="alert__icon">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </span>
                <span className="alert__message">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="form-step">
                  <div className="form-group">
                    <label htmlFor="full_name" className="form-label">
                      <span className="label-icon">
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                      Họ và tên
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        className="form-input"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                  </div>

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
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      <span className="label-icon">
                        <FontAwesomeIcon icon={faPhone} />
                      </span>
                      Số điện thoại
                      <span className="optional-label">Bắt buộc</span>
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-input"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0912 345 678"
                      />
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="btn btn--primary btn--full"
                    onClick={handleNextStep}
                  >
                    <span>Tiếp theo</span>
                    <span className="btn-arrow">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </span>
                  </button>
                </div>
              )}

              {/* Step 2: Password & Role */}
              {step === 2 && (
                <div className="form-step">
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
                        placeholder="Ít nhất 6 ký tự"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                    <div className="password-strength">
                      <div className={`strength-bar ${
                        formData.password.length === 0 ? '' :
                        formData.password.length < 6 ? 'weak' :
                        formData.password.length < 10 ? 'medium' : 'strong'
                      }`}></div>
                      <span className="strength-text">
                        {formData.password.length === 0 ? '' :
                         formData.password.length < 6 ? 'Yếu' :
                         formData.password.length < 10 ? 'Trung bình' : 'Mạnh'}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      <span className="label-icon">
                        <FontAwesomeIcon icon={faKey} />
                      </span>
                      Xác nhận mật khẩu
                    </label>
                    <div className="input-wrapper input-wrapper--password">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        className="form-input"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="role" className="form-label">
                      <span className="label-icon">
                        <FontAwesomeIcon icon={faBriefcase} />
                      </span>
                      Bạn là
                    </label>
                    <div className="role-select">
                      <label className={`role-option ${formData.role === 'candidate' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="role"
                          value="candidate"
                          checked={formData.role === 'candidate'}
                          onChange={handleChange}
                        />
                        <div className="role-content">
                          <span className="role-icon">
                            <FontAwesomeIcon icon={faSearch} />
                          </span>
                          <div>
                            <strong>Người tìm việc</strong>
                            <span>Tìm cơ hội nghề nghiệp</span>
                          </div>
                        </div>
                      </label>
                      <label className={`role-option ${formData.role === 'employer' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="role"
                          value="employer"
                          checked={formData.role === 'employer'}
                          onChange={handleChange}
                        />
                        <div className="role-content">
                          <span className="role-icon">
                            <FontAwesomeIcon icon={faBuilding} />
                          </span>
                          <div>
                            <strong>Nhà tuyển dụng</strong>
                            <span>Tìm ứng viên tài năng</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn btn--secondary"
                      onClick={handlePrevStep}
                    >
                      <span className="btn-arrow">
                        <FontAwesomeIcon icon={faArrowLeft} />
                      </span>
                      <span>Quay lại</span>
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn--primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="btn-spinner"></span>
                          <span>Đang đăng ký...</span>
                        </>
                      ) : (
                        <>
                          <span>Đăng ký</span>
                          <span className="btn-icon">
                            <FontAwesomeIcon icon={faCheck} />
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="divider">
              <span>hoặc đăng ký với</span>
            </div>

            <div className="social-register">
              <button className="btn btn--social btn--google">
                <span className="social-icon">
                  <FontAwesomeIcon icon={faGoogle} />
                </span>
              </button>
              <button className="btn btn--social btn--linkedin">
                <span className="social-icon">
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </span>
              </button>
              <button className="btn btn--social btn--facebook">
                <span className="social-icon">
                  <FontAwesomeIcon icon={faFacebook} />
                </span>
              </button>
            </div>

            <p className="login-text">
              Đã có tài khoản? 
              <Link to="/login" className="login-link">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
