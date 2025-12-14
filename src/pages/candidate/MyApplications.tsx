import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import './MyApplications.scss';

interface Application {
  id: number;
  job_id: number;
  cv_file: string;
  cover_letter?: string;
  expected_salary?: number;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected' | 'withdrawn';
  created_at: string;
  reviewed_at?: string;
  interview_date?: string;
  interview_location?: string;
  job: {
    id: number;
    title: string;
    location: string;
    job_type: string;
    salary_min?: number;
    salary_max?: number;
    company: {
      id: number;
      company_name: string;
      logo?: string;
    };
  };
}

const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterAndSortApplications();
  }, [applications, statusFilter, searchQuery, sortBy]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationService.getMyApplications();
      const data = response.data || response;
      setApplications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.message || 'Lỗi tải danh sách ứng tuyển');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortApplications = () => {
    let filtered = [...applications];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        app =>
          app.job.title.toLowerCase().includes(query) ||
          app.job.company.company_name.toLowerCase().includes(query) ||
          app.job.location.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return a.status.localeCompare(b.status);
      }
    });

    setFilteredApplications(filtered);
  };

  const handleWithdraw = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn rút đơn ứng tuyển này?')) {
      return;
    }

    try {
      await applicationService.withdrawApplication(id);
      alert('Rút đơn thành công');
      fetchApplications();
    } catch (err: any) {
      console.error('Error withdrawing application:', err);
      alert(err.response?.data?.message || 'Lỗi rút đơn ứng tuyển');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; className: string; icon: string } } = {
      pending: { label: 'Chờ duyệt', className: 'status--pending', icon: 'clock' },
      reviewing: { label: 'Đang xem xét', className: 'status--reviewing', icon: 'eye' },
      shortlisted: { label: 'Đạt vòng sơ tuyển', className: 'status--shortlisted', icon: 'check-circle' },
      interviewed: { label: 'Đã phỏng vấn', className: 'status--interviewed', icon: 'user-check' },
      offered: { label: 'Đã nhận offer', className: 'status--offered', icon: 'trophy' },
      rejected: { label: 'Không đạt', className: 'status--rejected', icon: 'times-circle' },
      withdrawn: { label: 'Đã rút đơn', className: 'status--withdrawn', icon: 'ban' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`application__status ${config.className}`}>
        <i className={`fas fa-${config.icon}`}></i>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatSalary = (min?: number, max?: number): string => {
    if (!min && !max) return 'Thỏa thuận';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} VNĐ`;
    if (min) return `Từ ${min.toLocaleString()} VNĐ`;
    return `Lên đến ${max?.toLocaleString()} VNĐ`;
  };

  const getJobTypeLabel = (type: string): string => {
    const types: { [key: string]: string } = {
      'full-time': 'Toàn thời gian',
      'part-time': 'Bán thời gian',
      'contract': 'Hợp đồng',
      'internship': 'Thực tập',
      'freelance': 'Freelance',
    };
    return types[type] || type;
  };

  const canWithdraw = (status: string): boolean => {
    return ['pending', 'reviewing', 'shortlisted'].includes(status);
  };

  const getStatusCount = (status: string): number => {
    return applications?.filter(app => app.status === status).length ?? 0;
  };

  if (loading) {
    return (
      <div className="my-applications__loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách ứng tuyển...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-applications__error">
        <i className="fas fa-exclamation-circle"></i>
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button className="btn btn--primary" onClick={fetchApplications}>
          <i className="fas fa-redo"></i>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="my-applications">
      <div className="my-applications__container">
        {/* Header */}
        <div className="my-applications__header">
          <div className="my-applications__header-content">
            <h1 className="my-applications__title">
              <i className="fas fa-file-alt"></i>
              Đơn ứng tuyển của tôi
            </h1>
            <p className="my-applications__subtitle">
              Quản lý và theo dõi tất cả các đơn ứng tuyển của bạn
            </p>
          </div>
          <div className="my-applications__stats">
            <div className="stat-card">
              <i className="fas fa-paper-plane"></i>
              <div className="stat-card__content">
                <div className="stat-card__value">{applications.length}</div>
                <div className="stat-card__label">Tổng đơn</div>
              </div>
            </div>
            <div className="stat-card stat-card--warning">
              <i className="fas fa-clock"></i>
              <div className="stat-card__content">
                <div className="stat-card__value">{getStatusCount('pending') + getStatusCount('reviewing')}</div>
                <div className="stat-card__label">Chờ duyệt</div>
              </div>
            </div>
            <div className="stat-card stat-card--success">
              <i className="fas fa-check-circle"></i>
              <div className="stat-card__content">
                <div className="stat-card__value">{getStatusCount('offered')}</div>
                <div className="stat-card__label">Đã nhận offer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="my-applications__filters">
          <div className="my-applications__search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm theo công việc, công ty, địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className="my-applications__filter-group">
            <div className="filter-select">
              <i className="fas fa-filter"></i>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt ({getStatusCount('pending')})</option>
                <option value="reviewing">Đang xem xét ({getStatusCount('reviewing')})</option>
                <option value="shortlisted">Đạt vòng sơ tuyển ({getStatusCount('shortlisted')})</option>
                <option value="interviewed">Đã phỏng vấn ({getStatusCount('interviewed')})</option>
                <option value="offered">Đã nhận offer ({getStatusCount('offered')})</option>
                <option value="rejected">Không đạt ({getStatusCount('rejected')})</option>
                <option value="withdrawn">Đã rút đơn ({getStatusCount('withdrawn')})</option>
              </select>
            </div>

            <div className="filter-select">
              <i className="fas fa-sort"></i>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'status')}>
                <option value="date">Ngày ứng tuyển mới nhất</option>
                <option value="status">Trạng thái</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="my-applications__list">
            {filteredApplications.map((application) => (
              <div key={application.id} className="application-card">
                <div className="application-card__header">
                  <div className="application-card__company">
                    {application.job.company.logo ? (
                      <img
                        src={application.job.company.logo}
                        alt={application.job.company.company_name}
                        className="application-card__logo"
                      />
                    ) : (
                      <div className="application-card__logo application-card__logo--placeholder">
                        <i className="fas fa-building"></i>
                      </div>
                    )}
                    <div className="application-card__company-info">
                      <h3
                        className="application-card__job-title"
                        onClick={() => navigate(`/jobs/${application.job.id}`)}
                      >
                        {application.job.title}
                      </h3>
                      <p
                        className="application-card__company-name"
                        onClick={() => navigate(`/companies/${application.job.company.id}`)}
                      >
                        {application.job.company.company_name}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(application.status)}
                </div>

                <div className="application-card__details">
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{application.job.location}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-briefcase"></i>
                    <span>{getJobTypeLabel(application.job.job_type)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-money-bill-wave"></i>
                    <span>{formatSalary(application.job.salary_min, application.job.salary_max)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar"></i>
                    <span>Ứng tuyển: {formatDate(application.created_at)}</span>
                  </div>
                </div>

                {application.expected_salary && (
                  <div className="application-card__expected-salary">
                    <i className="fas fa-hand-holding-usd"></i>
                    <span>Mức lương mong muốn: {application.expected_salary.toLocaleString()} VNĐ</span>
                  </div>
                )}

                {application.interview_date && (
                  <div className="application-card__interview">
                    <i className="fas fa-calendar-check"></i>
                    <strong>Lịch phỏng vấn:</strong>
                    <span>{new Date(application.interview_date).toLocaleString('vi-VN')}</span>
                    {application.interview_location && <span>- {application.interview_location}</span>}
                  </div>
                )}

                {application.reviewed_at && (
                  <div className="application-card__reviewed">
                    <i className="fas fa-check"></i>
                    <span>Đã xem xét: {formatDate(application.reviewed_at)}</span>
                  </div>
                )}

                <div className="application-card__actions">
                  <button
                    className="btn btn--secondary"
                    onClick={() => navigate(`/jobs/${application.job.id}`)}
                  >
                    <i className="fas fa-eye"></i>
                    Xem công việc
                  </button>
                  {application.cv_file && (
                    <a
                      href={application.cv_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--outline"
                    >
                      <i className="fas fa-file-pdf"></i>
                      Xem CV đã nộp
                    </a>
                  )}
                  {canWithdraw(application.status) && (
                    <button
                      className="btn btn--danger"
                      onClick={() => handleWithdraw(application.id)}
                    >
                      <i className="fas fa-ban"></i>
                      Rút đơn
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="my-applications__empty">
            <i className="fas fa-inbox"></i>
            <h3>Không có đơn ứng tuyển nào</h3>
            <p>
              {searchQuery || statusFilter !== 'all'
                ? 'Không tìm thấy đơn ứng tuyển phù hợp với bộ lọc'
                : 'Bạn chưa ứng tuyển công việc nào'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button className="btn btn--primary" onClick={() => navigate('/jobs')}>
                <i className="fas fa-search"></i>
                Tìm việc làm ngay
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
