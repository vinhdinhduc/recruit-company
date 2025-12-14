import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import './JobDetail.scss';

// API Response Types (snake_case từ backend)
interface CompanyAPIResponse {
  id: number;
  company_name: string;
  logo: string | null;
  city: string | null;
  verified: boolean;
  industry?: string | null;
  company_size?: string | null;
  website?: string | null;
  description?: string | null;
}

interface JobAPIResponse {
  id: number;
  title: string;
  company: CompanyAPIResponse;
  location: string;
  city: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_type: 'hourly' | 'monthly' | 'yearly' | 'negotiable';
  job_type: string;
  experience_level: string;
  deadline: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  featured: boolean;
  remote: boolean;
  views: number;
  application_count: number;
  created_at: string;
  category?: {
    id: number;
    name: string;
  };
  skills?: Array<{
    id: number;
    name: string;
  }>;
}

// Frontend Types (camelCase)
interface Company {
  id: number;
  companyName: string;
  logo: string | null;
  city: string | null;
  verified: boolean;
  industry?: string | null;
  size?: string | null;
  website?: string | null;
  description?: string | null;
}

interface Job {
  id: number;
  title: string;
  company: Company;
  location: string;
  city: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryType: string;
  jobType: string;
  experienceLevel: string;
  deadline: string;
  description: string;
  requirements: string[];
  benefits: string[];
  featured: boolean;
  remote: boolean;
  views: number;
  applicants: number;
  postedDate: string;
  category?: string;
  skills: string[];
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'company'>('description');

  useEffect(() => {
    if (id) {
      fetchJobDetail();
    }
  }, [id]);

  // Transform API data to frontend format
  const transformJobData = (apiData: JobAPIResponse): Job => {
    // Parse requirements và benefits từ text/JSON
    let requirements: string[] = [];
    let benefits: string[] = [];

    try {
      if (apiData.requirements) {
        if (typeof apiData.requirements === 'string') {
          // Nếu là HTML hoặc text có line breaks
          requirements = apiData.requirements
            .split(/\n|<br>|<li>/)
            .map(item => item.replace(/<[^>]*>/g, '').trim())
            .filter(item => item.length > 0);
        } else {
          requirements = apiData.requirements as any;
        }
      }

      if (apiData.benefits) {
        if (typeof apiData.benefits === 'string') {
          benefits = apiData.benefits
            .split(/\n|<br>|<li>/)
            .map(item => item.replace(/<[^>]*>/g, '').trim())
            .filter(item => item.length > 0);
        } else {
          benefits = apiData.benefits as any;
        }
      }
    } catch (e) {
      console.error('Error parsing requirements/benefits:', e);
    }

    return {
      id: apiData.id,
      title: apiData.title,
      company: {
        id: apiData.company.id,
        companyName: apiData.company.company_name,
        logo: apiData.company.logo,
        city: apiData.company.city,
        verified: apiData.company.verified,
        industry: apiData.company.industry,
        size: apiData.company.company_size,
        website: apiData.company.website,
        description: apiData.company.description,
      },
      location: apiData.location,
      city: apiData.city,
      salaryMin: apiData.salary_min,
      salaryMax: apiData.salary_max,
      salaryType: apiData.salary_type,
      jobType: apiData.job_type,
      experienceLevel: apiData.experience_level,
      deadline: apiData.deadline,
      description: apiData.description,
      requirements,
      benefits,
      featured: apiData.featured,
      remote: apiData.remote,
      views: apiData.views,
      applicants: apiData.application_count,
      postedDate: apiData.created_at,
      category: apiData.category?.name,
      skills: apiData.skills?.map(skill => skill.name) || [],
    };
  };

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobService.getJob(Number(id));
      
      if (response.code === 0 && response.data) {
        const transformedJob = transformJobData(response.data);
        setJob(transformedJob);
      } else {
        setError(response.message || 'Không thể tải thông tin công việc');
      }
    } catch (err: any) {
      console.error('Error fetching job:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin công việc');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatSalary = (job: Job) => {
    if (!job.salaryMin && !job.salaryMax) {
      return 'Thỏa thuận';
    }

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('vi-VN').format(amount);
    };

    if (job.salaryMin && job.salaryMax) {
      return `${formatAmount(job.salaryMin)} - ${formatAmount(job.salaryMax)} USD`;
    }

    if (job.salaryMin) {
      return `Từ ${formatAmount(job.salaryMin)} USD`;
    }

    if (job.salaryMax) {
      return `Lên đến ${formatAmount(job.salaryMax)} USD`;
    }

    return 'Thỏa thuận';
  };

  const getJobTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'full-time': 'Toàn thời gian',
      'part-time': 'Bán thời gian',
      'contract': 'Hợp đồng',
      'internship': 'Thực tập',
      'freelance': 'Tự do',
    };
    return typeMap[type] || type;
  };

  const getExperienceLevelLabel = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'entry': 'Mới ra trường',
      'junior': 'Junior',
      'mid': 'Middle',
      'senior': 'Senior',
      'lead': 'Lead/Manager',
    };
    return levelMap[level] || level;
  };

  const handleApply = () => {
    // TODO: Navigate to apply page or show modal
    setShowApplyModal(true);
  };

  const handleSaveJob = async () => {
    try {
      if (isSaved) {
        // TODO: Call API to unsave job
        setIsSaved(false);
      } else {
        // TODO: Call API to save job
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Xem công việc: ${job?.title} tại ${job?.company.companyName}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép link!');
    }
  };

  if (loading) {
    return (
      <div className="job-detail__loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin công việc...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-detail__error">
        <i className="fas fa-exclamation-circle"></i>
        <h2>Không tìm thấy công việc</h2>
        <p>{error || 'Công việc này không tồn tại hoặc đã bị xóa'}</p>
        <button onClick={() => navigate('/jobs')} className="btn btn-primary">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="job-detail">
      {/* Header Section */}
      <div className="job-detail__header">
        <div className="job-detail__header-container">
          <button className="job-detail__back" onClick={() => navigate('/jobs')}>
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>

          <div className="job-detail__header-content">
            <div className="job-detail__header-main">
              <div className="job-detail__company-logo">
                {job.company.logo ? (
                  <img src={job.company.logo} alt={job.company.companyName} />
                ) : (
                  <>
                  <div className="logo-placeholder">
                    {job.company.verified && (
                    <i className="fas fa-check-circle job-detail__verified" title="Đã xác minh"></i>
                  )}
                </div>

                <div className="job-detail__meta">
                  <span className="job-detail__meta-item">
                    <i className="fas fa-map-marker-alt"></i>
                    {job.location}
                  </span>
                  <span className="job-detail__meta-item">
                    <i className="fas fa-dollar-sign"></i>
                    {formatSalary(job)}
                  </span>
                  <span className="job-detail__meta-item">
                    <i className="far fa-clock"></i>
                    {getJobTypeLabel(job.jobType)}
                  </span>
                  <span className="job-detail__meta-item">
                    <i className="fas fa-chart-line"></i>
                    {getExperienceLevelLabel(job.experienceLevel)}
                  </span>
                </div>

                <div className="job-detail__stats">
                  <span className="job-detail__stat">
                    <i className="far fa-eye"></i> {job.views} lượt xem
                  </span>
                  <span className="job-detail__stat">
                    <i className="fas fa-users"></i> {job.applicants} ứng viên
                  </span>
                  <span className="job-detail__stat">
                    <i className="far fa-calendar"></i> Hạn: {formatDate(job.deadline)}
                  </span>
                </div>
                </>)}
              </div>
            </div>

            <div className="job-detail__header-actions">
              <button 
                className={`btn btn-icon ${isSaved ? 'btn-saved' : 'btn-outline'}`}
                onClick={handleSaveJob}
                title={isSaved ? 'Đã lưu' : 'Lưu công việc'}
              >
                <i className={`${isSaved ? 'fas' : 'far'} fa-bookmark`}></i>
              </button>
              <button 
                className="btn btn-icon btn-outline"
                onClick={handleShare}
                title="Chia sẻ"
              >
                <i className="fas fa-share-alt"></i>
              </button>
              <button className="btn btn-primary btn-lg" onClick={handleApply}>
                <i className="fas fa-paper-plane"></i>
                Ứng tuyển ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="job-detail__container">
        <div className="job-detail__layout">
          {/* Main Content */}
          <main className="job-detail__main">
            {/* Tabs */}
            <div className="job-detail__tabs">
              <button
                className={`job-detail__tab ${activeTab === 'description' ? 'job-detail__tab--active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Thông tin công việc
              </button>
              <button
                className={`job-detail__tab ${activeTab === 'company' ? 'job-detail__tab--active' : ''}`}
                onClick={() => setActiveTab('company')}
              >
                Về công ty
              </button>
            </div>

            {activeTab === 'description' ? (
              <>
                {/* Job Description */}
                <section className="job-detail__section">
                  <h2 className="job-detail__section-title">
                    <i className="fas fa-file-alt"></i>
                    Mô tả công việc
                  </h2>
                  <div 
                    className="job-detail__content"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </section>

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <section className="job-detail__section">
                    <h2 className="job-detail__section-title">
                      <i className="fas fa-clipboard-check"></i>
                      Yêu cầu công việc
                    </h2>
                    <ul className="job-detail__list">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Benefits */}
                {job.benefits && job.benefits.length > 0 && (
                  <section className="job-detail__section">
                    <h2 className="job-detail__section-title">
                      <i className="fas fa-gift"></i>
                      Quyền lợi
                    </h2>
                    <ul className="job-detail__list job-detail__list--benefits">
                      {job.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <section className="job-detail__section">
                    <h2 className="job-detail__section-title">
                      <i className="fas fa-code"></i>
                      Kỹ năng yêu cầu
                    </h2>
                    <div className="job-detail__skills">
                      {job.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              /* Company Info */
              <section className="job-detail__section">
                <div className="company-info">
                  <div className="company-info__header">
                    <div className="company-info__logo">
                      {job.company.logo ? (
                        <img src={job.company.logo} alt={job.company.companyName} />
                      ) : (
                        <div className="logo-placeholder">
                          {job.company.companyName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="company-info__name">
                        {job.company.companyName}
                        {job.company.verified && (
                          <i className="fas fa-check-circle" title="Đã xác minh"></i>
                        )}
                      </h2>
                      {job.company.industry && (
                        <p className="company-info__industry">{job.company.industry}</p>
                      )}
                    </div>
                  </div>

                  <div className="company-info__details">
                    {job.company.size && (
                      <div className="company-info__detail">
                        <i className="fas fa-users"></i>
                        <div>
                          <strong>Quy mô</strong>
                          <p>{job.company.size}</p>
                        </div>
                      </div>
                    )}
                    {job.company.city && (
                      <div className="company-info__detail">
                        <i className="fas fa-map-marker-alt"></i>
                        <div>
                          <strong>Địa điểm</strong>
                          <p>{job.company.city}</p>
                        </div>
                      </div>
                    )}
                    {job.company.website && (
                      <div className="company-info__detail">
                        <i className="fas fa-globe"></i>
                        <div>
                          <strong>Website</strong>
                          <p>
                            <a href={job.company.website} target="_blank" rel="noopener noreferrer">
                              {job.company.website}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {job.company.description && (
                    <div className="company-info__description">
                      <h3>Giới thiệu công ty</h3>
                      <p>{job.company.description}</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="job-detail__sidebar">
            {/* Apply Card */}
            <div className="job-detail__apply-card">
              <div className="job-detail__salary">
                <i className="fas fa-money-bill-wave"></i>
                <div>
                  <span className="job-detail__salary-label">Mức lương</span>
                  <span className="job-detail__salary-value">{formatSalary(job)}</span>
                </div>
              </div>

              <button className="btn btn-primary btn-block btn-lg" onClick={handleApply}>
                <i className="fas fa-paper-plane"></i>
                Ứng tuyển ngay
              </button>

              <button 
                className={`btn btn-block ${isSaved ? 'btn-saved' : 'btn-outline'}`}
                onClick={handleSaveJob}
              >
                <i className={`${isSaved ? 'fas' : 'far'} fa-bookmark`}></i>
                {isSaved ? 'Đã lưu' : 'Lưu công việc'}
              </button>
            </div>

            {/* Job Info Card */}
            <div className="job-detail__info-card">
              <h3 className="job-detail__card-title">Thông tin chung</h3>
              <div className="job-detail__info-list">
                <div className="job-detail__info-item">
                  <i className="fas fa-briefcase"></i>
                  <div>
                    <span className="label">Cấp bậc</span>
                    <span className="value">{getExperienceLevelLabel(job.experienceLevel)}</span>
                  </div>
                </div>
                <div className="job-detail__info-item">
                  <i className="far fa-clock"></i>
                  <div>
                    <span className="label">Loại hình</span>
                    <span className="value">{getJobTypeLabel(job.jobType)}</span>
                  </div>
                </div>
                <div className="job-detail__info-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <span className="label">Địa điểm</span>
                    <span className="value">{job.location}</span>
                  </div>
                </div>
                <div className="job-detail__info-item">
                  <i className="far fa-calendar-alt"></i>
                  <div>
                    <span className="label">Hạn nộp hồ sơ</span>
                    <span className="value">{formatDate(job.deadline)}</span>
                  </div>
                </div>
                {job.category && (
                  <div className="job-detail__info-item">
                    <i className="fas fa-tag"></i>
                    <div>
                      <span className="label">Ngành nghề</span>
                      <span className="value">{job.category}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Share Card */}
            <div className="job-detail__share-card">
              <h3 className="job-detail__card-title">Chia sẻ công việc</h3>
              <div className="job-detail__share-buttons">
                <button className="share-btn share-btn--facebook" title="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button className="share-btn share-btn--twitter" title="Twitter">
                  <i className="fab fa-twitter"></i>
                </button>
                <button className="share-btn share-btn--linkedin" title="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </button>
                <button className="share-btn share-btn--link" onClick={handleShare} title="Copy link">
                  <i className="fas fa-link"></i>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;