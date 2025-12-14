import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyService } from '../../services/companyService';
import { jobService } from '../../services/jobService';
import './CompanyDetail.scss';

interface Company {
  id: number;
  company_name: string;
  logo?: string;
  banner?: string;
  city: string;
  country?: string;
  industry?: string;
  company_size?: string;
  founded_year?: number;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  verified: boolean;
  social_links?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
}

interface Job {
  id: number;
  title: string;
  city: string;
  salary_min?: number;
  salary_max?: number;
  job_type: string;
  experience_level?: string;
  created_at: string;
  tags?: string[];
}

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'jobs'>('about');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCompanyData();
    }
  }, [id]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch company details
      const companyData = await companyService.getCompanyById(Number(id));
      console.log("company data",companyData);
      
      setCompany(companyData.data || companyData);

      // Fetch company jobs
      const jobsResponse = await jobService.getJobs({ company_id: Number(id) });
      setJobs(jobsResponse.data?.jobs || jobsResponse.jobs || []);
    } catch (err: any) {
      console.error('Error fetching company:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin công ty');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min?: number, max?: number): string => {
    if (!min && !max) return 'Thỏa thuận';
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} VND`;
    }
    if (min) return `Từ ${min.toLocaleString()} VND`;
    if (max) return `Lên đến ${max.toLocaleString()} VND`;
    return 'Thỏa thuận';
  };

  const getCompanySizeLabel = (size?: string) => {
    if (!size) return 'Chưa xác định';
    const sizeMap: { [key: string]: string } = {
      '1-10': '1-10 nhân viên',
      '11-50': '11-50 nhân viên',
      '51-200': '51-200 nhân viên',
      '201-500': '201-500 nhân viên',
      '501-1000': '501-1000 nhân viên',
      '1000+': 'Trên 1000 nhân viên',
    };
    return sizeMap[size] || size;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  if (loading) {
    return (
      <div className="company-detail__loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin công ty...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="company-detail__error">
        <i className="fas fa-exclamation-circle"></i>
        <h3>Không tìm thấy công ty</h3>
        <p>{error || 'Công ty không tồn tại hoặc đã bị xóa'}</p>
        <button onClick={() => navigate('/companies')} className="company-detail__error-button">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="company-detail">
      {/* Banner Section */}
      <div className="company-detail__banner">
        {company.banner ? (
          <img src={company.banner} alt={company.company_name} />
        ) : (
          <div className="company-detail__banner-placeholder">
            <i className="fas fa-building"></i>
          </div>
        )}
      </div>

      <div className="company-detail__container">
        {/* Company Header */}
        <div className="company-detail__header">
          <div className="company-detail__header-content">
            <div className="company-detail__logo">
              {company.logo ? (
                <img src={company.logo} alt={company.company_name} />
              ) : (
                <i className="fas fa-building"></i>
              )}
            </div>

            <div className="company-detail__header-info">
              <div className="company-detail__header-top">
                <h1 className="company-detail__title">
                  {company.company_name}
                  {company.verified && (
                    <i className="fas fa-check-circle company-detail__verified" title="Đã xác minh"></i>
                  )}
                </h1>
                <div className="company-detail__header-actions">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="company-detail__website-button"
                    >
                      <i className="fas fa-globe"></i>
                      Trang web
                    </a>
                  )}
                </div>
              </div>

              <div className="company-detail__meta">
                {company.industry && (
                  <div className="company-detail__meta-item">
                    <i className="fas fa-industry"></i>
                    <span>{company.industry}</span>
                  </div>
                )}
                {company.city && (
                  <div className="company-detail__meta-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{company.city}{company.country ? `, ${company.country}` : ''}</span>
                  </div>
                )}
                {company.company_size && (
                  <div className="company-detail__meta-item">
                    <i className="fas fa-users"></i>
                    <span>{getCompanySizeLabel(company.company_size)}</span>
                  </div>
                )}
                {company.founded_year && (
                  <div className="company-detail__meta-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Thành lập {company.founded_year}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {company.social_links && Object.keys(company.social_links).length > 0 && (
                <div className="company-detail__social">
                  {company.social_links.facebook && (
                    <a href={company.social_links.facebook} target="_blank" rel="noopener noreferrer" className="company-detail__social-link">
                      <i className="fab fa-facebook"></i>
                    </a>
                  )}
                  {company.social_links.linkedin && (
                    <a href={company.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="company-detail__social-link">
                      <i className="fab fa-linkedin"></i>
                    </a>
                  )}
                  {company.social_links.twitter && (
                    <a href={company.social_links.twitter} target="_blank" rel="noopener noreferrer" className="company-detail__social-link">
                      <i className="fab fa-twitter"></i>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="company-detail__tabs">
          <button
            className={`company-detail__tab ${activeTab === 'about' ? 'company-detail__tab--active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <i className="fas fa-info-circle"></i>
            Giới thiệu
          </button>
          <button
            className={`company-detail__tab ${activeTab === 'jobs' ? 'company-detail__tab--active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <i className="fas fa-briefcase"></i>
            Việc làm ({jobs.length})
          </button>
        </div>

        {/* Content */}
        <div className="company-detail__content">
          <div className="company-detail__main">
            {activeTab === 'about' && (
              <div className="company-detail__about">
                <section className="company-detail__section">
                  <h2 className="company-detail__section-title">
                    <i className="fas fa-building"></i>
                    Về công ty
                  </h2>
                  <div className="company-detail__description">
                    {company.description || 'Công ty chưa cập nhật thông tin giới thiệu.'}
                  </div>
                </section>

                {company.address && (
                  <section className="company-detail__section">
                    <h2 className="company-detail__section-title">
                      <i className="fas fa-map-marker-alt"></i>
                      Địa chỉ
                    </h2>
                    <p className="company-detail__address">{company.address}</p>
                  </section>
                )}
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="company-detail__jobs">
                {jobs.length > 0 ? (
                  <div className="company-detail__jobs-grid">
                    {jobs.map((job) => (
                      <article
                        key={job.id}
                        className="company-detail__job-card"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <div className="company-detail__job-header">
                          <h3 className="company-detail__job-title">{job.title}</h3>
                          <span className="company-detail__job-time">
                            <i className="fas fa-clock"></i>
                            {formatDate(job.created_at)}
                          </span>
                        </div>

                        <div className="company-detail__job-meta">
                          <div className="company-detail__job-meta-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{job.city}</span>
                          </div>
                          <div className="company-detail__job-meta-item">
                            <i className="fas fa-briefcase"></i>
                            <span>{job.job_type}</span>
                          </div>
                          {job.experience_level && (
                            <div className="company-detail__job-meta-item">
                              <i className="fas fa-chart-line"></i>
                              <span>{job.experience_level}</span>
                            </div>
                          )}
                        </div>

                        <div className="company-detail__job-footer">
                          <span className="company-detail__job-salary">
                            <i className="fas fa-dollar-sign"></i>
                            {formatSalary(job.salary_min, job.salary_max)}
                          </span>
                          <button className="company-detail__job-button">
                            Xem chi tiết
                          </button>
                        </div>

                        {job.tags && job.tags.length > 0 && (
                          <div className="company-detail__job-tags">
                            {job.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="company-detail__job-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="company-detail__no-jobs">
                    <i className="fas fa-briefcase"></i>
                    <h3>Chưa có việc làm</h3>
                    <p>Công ty hiện chưa đăng tuyển vị trí nào.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="company-detail__sidebar">
            <div className="company-detail__sidebar-card">
              <h3 className="company-detail__sidebar-title">Thông tin liên hệ</h3>
              <div className="company-detail__contact">
                {company.email && (
                  <div className="company-detail__contact-item">
                    <i className="fas fa-envelope"></i>
                    <a href={`mailto:${company.email}`}>{company.email}</a>
                  </div>
                )}
                {company.phone && (
                  <div className="company-detail__contact-item">
                    <i className="fas fa-phone"></i>
                    <a href={`tel:${company.phone}`}>{company.phone}</a>
                  </div>
                )}
                {company.website && (
                  <div className="company-detail__contact-item">
                    <i className="fas fa-globe"></i>
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="company-detail__sidebar-card">
              <h3 className="company-detail__sidebar-title">Thông tin công ty</h3>
              <div className="company-detail__info-list">
                {company.industry && (
                  <div className="company-detail__info-item">
                    <span className="company-detail__info-label">Ngành nghề:</span>
                    <span className="company-detail__info-value">{company.industry}</span>
                  </div>
                )}
                {company.company_size && (
                  <div className="company-detail__info-item">
                    <span className="company-detail__info-label">Quy mô:</span>
                    <span className="company-detail__info-value">{getCompanySizeLabel(company.company_size)}</span>
                  </div>
                )}
                {company.founded_year && (
                  <div className="company-detail__info-item">
                    <span className="company-detail__info-label">Năm thành lập:</span>
                    <span className="company-detail__info-value">{company.founded_year}</span>
                  </div>
                )}
                {company.city && (
                  <div className="company-detail__info-item">
                    <span className="company-detail__info-label">Địa điểm:</span>
                    <span className="company-detail__info-value">{company.city}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="company-detail__sidebar-card">
              <button
                className="company-detail__view-jobs-button"
                onClick={() => setActiveTab('jobs')}
              >
                <i className="fas fa-briefcase"></i>
                Xem {jobs.length} việc làm
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
