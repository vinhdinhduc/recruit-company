import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import './CompanyProfile.scss';

interface Company {
  id: number;
  company_name: string;
  email: string;
  phone: string;
  description: string;
  industry: string;
  founded_year: number;
  company_size: string;
  website: string;
  social_links?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  logo: string;
  banner: string;
  address: string;
  city: string;
  country: string;
  tax_code: string;
  verified: boolean;
  status: string;
}

const CompanyProfile: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const data = await companyService.getMyCompany();
      setCompany(data);
      setFormData(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông tin công ty');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo không được vượt quá 2MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Banner không được vượt quá 5MB');
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      const data = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (key === 'social_links') {
          data.append(key, JSON.stringify(formData[key]));
        } else if (formData[key as keyof Company] !== undefined && formData[key as keyof Company] !== null) {
          data.append(key, String(formData[key as keyof Company]));
        }
      });

      // Append files
      if (logoFile) {
        data.append('logo', logoFile);
      }
      if (bannerFile) {
        data.append('banner', bannerFile);
      }

      await companyService.updateCompany(data);
      await fetchCompanyData();
      setIsEditing(false);
      setLogoFile(null);
      setBannerFile(null);
      setLogoPreview('');
      setBannerPreview('');
      alert('Cập nhật thông tin công ty thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(company || {});
    setLogoFile(null);
    setBannerFile(null);
    setLogoPreview('');
    setBannerPreview('');
  };

  if (loading) {
    return (
      <div className="company-profile__loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin công ty...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-profile__error">
        <i className="fas fa-exclamation-circle"></i>
        <h3>Lỗi tải dữ liệu</h3>
        <p>{error}</p>
        <button onClick={fetchCompanyData} className="btn btn--primary">
          <i className="fas fa-redo"></i> Thử lại
        </button>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="company-profile__empty">
        <i className="fas fa-building"></i>
        <h3>Chưa có thông tin công ty</h3>
        <p>Vui lòng tạo hồ sơ công ty để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="company-profile">
      <div className="company-profile__container">
        {/* Banner Section */}
        <div className="company-profile__banner-section">
          <div 
            className="company-profile__banner"
            style={{ 
              backgroundImage: `url(${bannerPreview || (company.banner ? `http://localhost:3000${company.banner}` : '/default-banner.jpg')})` 
            }}
          >
            {isEditing && (
              <label className="company-profile__banner-upload">
                <i className="fas fa-camera"></i>
                <span>Đổi ảnh bìa</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleBannerChange}
                  hidden 
                />
              </label>
            )}
          </div>
          
          <div className="company-profile__header">
            <div className="company-profile__logo-wrapper">
              <img 
                src={logoPreview || (company.logo ? `http://localhost:3000${company.logo}` : '/default-logo.png')}
                alt={company.company_name}
                className="company-profile__logo"
              />
              {isEditing && (
                <label className="company-profile__logo-upload">
                  <i className="fas fa-camera"></i>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                    hidden 
                  />
                </label>
              )}
            </div>

            <div className="company-profile__header-info">
              <div className="company-profile__title-row">
                <h1 className="company-profile__name">{company.company_name}</h1>
                {company.verified && (
                  <span className="company-profile__verified">
                    <i className="fas fa-check-circle"></i> Đã xác minh
                  </span>
                )}
              </div>
              <p className="company-profile__industry">
                <i className="fas fa-industry"></i> {company.industry || 'Chưa cập nhật'}
              </p>
            </div>

            <div className="company-profile__actions">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="btn btn--primary">
                  <i className="fas fa-edit"></i> Chỉnh sửa
                </button>
              ) : (
                <>
                  <button onClick={handleCancel} className="btn btn--outline" disabled={isSaving}>
                    <i className="fas fa-times"></i> Hủy
                  </button>
                  <button onClick={handleSubmit} className="btn btn--primary" disabled={isSaving}>
                    <i className="fas fa-save"></i> {isSaving ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="company-profile__content">
          {/* Left Column - Main Info */}
          <div className="company-profile__main">
            {/* About Section */}
            <div className="profile-card">
              <h2 className="profile-card__title">
                <i className="fas fa-info-circle"></i> Giới thiệu
              </h2>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows={8}
                  placeholder="Mô tả về công ty..."
                />
              ) : (
                <p className="profile-card__text">
                  {company.description || 'Chưa có mô tả'}
                </p>
              )}
            </div>

            {/* Company Details */}
            <div className="profile-card">
              <h2 className="profile-card__title">
                <i className="fas fa-building"></i> Thông tin công ty
              </h2>
              <div className="profile-card__grid">
                <div className="info-item">
                  <label className="info-item__label">
                    <i className="fas fa-briefcase"></i> Ngành nghề
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="VD: Công nghệ thông tin"
                    />
                  ) : (
                    <span className="info-item__value">{company.industry || 'Chưa cập nhật'}</span>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-item__label">
                    <i className="fas fa-users"></i> Quy mô
                  </label>
                  {isEditing ? (
                    <select
                      name="company_size"
                      value={formData.company_size || ''}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Chọn quy mô</option>
                      <option value="1-10">1-10 nhân viên</option>
                      <option value="11-50">11-50 nhân viên</option>
                      <option value="51-200">51-200 nhân viên</option>
                      <option value="201-500">201-500 nhân viên</option>
                      <option value="501-1000">501-1000 nhân viên</option>
                      <option value="1000+">1000+ nhân viên</option>
                    </select>
                  ) : (
                    <span className="info-item__value">{company.company_size || 'Chưa cập nhật'}</span>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-item__label">
                    <i className="fas fa-calendar"></i> Năm thành lập
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="founded_year"
                      value={formData.founded_year || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="VD: 2020"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  ) : (
                    <span className="info-item__value">{company.founded_year || 'Chưa cập nhật'}</span>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-item__label">
                    <i className="fas fa-globe"></i> Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://example.com"
                    />
                  ) : (
                    company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="info-item__link">
                        {company.website}
                      </a>
                    ) : (
                      <span className="info-item__value">Chưa cập nhật</span>
                    )
                  )}
                </div>

                <div className="info-item">
                  <label className="info-item__label">
                    <i className="fas fa-file-invoice"></i> Mã số thuế
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="tax_code"
                      value={formData.tax_code || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="VD: 0123456789"
                    />
                  ) : (
                    <span className="info-item__value">{company.tax_code || 'Chưa cập nhật'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Social */}
          <div className="company-profile__sidebar">
            {/* Contact Info */}
            <div className="profile-card">
              <h2 className="profile-card__title">
                <i className="fas fa-address-book"></i> Thông tin liên hệ
              </h2>
              <div className="contact-list">
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="email@example.com"
                    />
                  ) : (
                    <a href={`mailto:${company.email}`}>{company.email}</a>
                  )}
                </div>

                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="0123456789"
                    />
                  ) : (
                    <a href={`tel:${company.phone}`}>{company.phone || 'Chưa cập nhật'}</a>
                  )}
                </div>

                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Địa chỉ chi tiết"
                    />
                  ) : (
                    <span>{company.address || 'Chưa cập nhật'}</span>
                  )}
                </div>

                <div className="contact-item">
                  <i className="fas fa-city"></i>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Thành phố"
                    />
                  ) : (
                    <span>{company.city || 'Chưa cập nhật'}</span>
                  )}
                </div>

                <div className="contact-item">
                  <i className="fas fa-flag"></i>
                  {isEditing ? (
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Quốc gia"
                    />
                  ) : (
                    <span>{company.country || 'Vietnam'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="profile-card">
              <h2 className="profile-card__title">
                <i className="fas fa-share-alt"></i> Mạng xã hội
              </h2>
              <div className="social-links">
                <div className="social-item">
                  <i className="fab fa-facebook"></i>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.social_links?.facebook || ''}
                      onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                      className="form-input"
                      placeholder="https://facebook.com/..."
                    />
                  ) : (
                    company.social_links?.facebook ? (
                      <a href={company.social_links.facebook} target="_blank" rel="noopener noreferrer">
                        Facebook
                      </a>
                    ) : (
                      <span>Chưa cập nhật</span>
                    )
                  )}
                </div>

                <div className="social-item">
                  <i className="fab fa-linkedin"></i>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.social_links?.linkedin || ''}
                      onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                      className="form-input"
                      placeholder="https://linkedin.com/..."
                    />
                  ) : (
                    company.social_links?.linkedin ? (
                      <a href={company.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                        LinkedIn
                      </a>
                    ) : (
                      <span>Chưa cập nhật</span>
                    )
                  )}
                </div>

                <div className="social-item">
                  <i className="fab fa-twitter"></i>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.social_links?.twitter || ''}
                      onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                      className="form-input"
                      placeholder="https://twitter.com/..."
                    />
                  ) : (
                    company.social_links?.twitter ? (
                      <a href={company.social_links.twitter} target="_blank" rel="noopener noreferrer">
                        Twitter
                      </a>
                    ) : (
                      <span>Chưa cập nhật</span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="profile-card">
              <h2 className="profile-card__title">
                <i className="fas fa-clipboard-check"></i> Trạng thái
              </h2>
              <div className="status-badges">
                <span className={`status-badge status-badge--${company.status}`}>
                  {company.status === 'active' && '✓ Đang hoạt động'}
                  {company.status === 'inactive' && '✗ Tạm ngưng'}
                  {company.status === 'pending' && '⏳ Đang chờ duyệt'}
                </span>
                {company.verified && (
                  <span className="status-badge status-badge--verified">
                    <i className="fas fa-shield-alt"></i> Đã xác minh
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
