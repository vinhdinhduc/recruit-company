import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './SavedJobs.scss';

interface SavedJob {
  id: number;
  job_id: number;
  created_at: string;
  job: {
    id: number;
    title: string;
    location: string;
    job_type: string;
    experience_level: string;
    salary_min?: number;
    salary_max?: number;
    description: string;
    deadline: string;
    status: string;
    company: {
      id: number;
      company_name: string;
      logo?: string;
      city?: string;
    };
  };
}

const SavedJobs: React.FC = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'deadline'>('date');

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    filterAndSortJobs();
  }, [savedJobs, searchQuery, filterType, sortBy]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/saved-jobs');
      const data = response.data?.data || response.data || [];
      setSavedJobs(data);
    } catch (err: any) {
      console.error('Error fetching saved jobs:', err);
      setError(err.response?.data?.message || 'Lỗi tải danh sách việc làm đã lưu');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortJobs = () => {
    let filtered = [...savedJobs];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.job.title.toLowerCase().includes(query) ||
          item.job.company.company_name.toLowerCase().includes(query) ||
          item.job.location.toLowerCase().includes(query)
      );
    }

    // Filter by job type
    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.job.job_type === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.job.deadline).getTime() - new Date(b.job.deadline).getTime();
      }
    });

    setFilteredJobs(filtered);
  };

  const handleRemove = async (id: number, jobTitle: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${jobTitle}" khỏi danh sách đã lưu?`)) {
      return;
    }

    try {
      await api.delete(`/saved-jobs/${id}`);
      setSavedJobs((prev) => prev.filter((item) => item.id !== id));
      alert('Đã xóa khỏi danh sách lưu');
    } catch (err: any) {
      console.error('Error removing saved job:', err);
      alert(err.response?.data?.message || 'Lỗi xóa việc làm đã lưu');
    }
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

  const getExperienceLabel = (level: string): string => {
    const levels: { [key: string]: string } = {
      'internship': 'Thực tập sinh',
      'fresher': 'Mới tốt nghiệp',
      'junior': 'Junior (1-2 năm)',
      'middle': 'Middle (2-5 năm)',
      'senior': 'Senior (5+ năm)',
      'leader': 'Team Leader',
      'manager': 'Manager',
    };
    return levels[level] || level;
  };

  const getDaysUntilDeadline = (deadline: string): number => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDeadlineStatus = (deadline: string) => {
    const days = getDaysUntilDeadline(deadline);
    if (days < 0) return { label: 'Đã hết hạn', className: 'expired' };
    if (days === 0) return { label: 'Hết hạn hôm nay', className: 'urgent' };
    if (days <= 3) return { label: `Còn ${days} ngày`, className: 'urgent' };
    if (days <= 7) return { label: `Còn ${days} ngày`, className: 'soon' };
    return { label: `Còn ${days} ngày`, className: 'normal' };
  };

  if (loading) {
    return (
      <div className="saved-jobs__loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách việc làm đã lưu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-jobs__error">
        <i className="fas fa-exclamation-circle"></i>
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button className="btn btn--primary" onClick={fetchSavedJobs}>
          <i className="fas fa-redo"></i>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="saved-jobs">
      <div className="saved-jobs__container">
        {/* Header */}
        <div className="saved-jobs__header">
          <div className="saved-jobs__header-content">
            <h1 className="saved-jobs__title">
              <i className="fas fa-bookmark"></i>
              Việc làm đã lưu
            </h1>
            <p className="saved-jobs__subtitle">
              Quản lý các công việc bạn quan tâm và ứng tuyển khi sẵn sàng
            </p>
          </div>
          <div className="saved-jobs__stats">
            <div className="stat-badge">
              <i className="fas fa-briefcase"></i>
              <span>{savedJobs.length} việc làm</span>
            </div>
          </div>
        </div>

        {savedJobs.length > 0 && (
          <div className="saved-jobs__filters">
            <div className="saved-jobs__search">
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

            <div className="saved-jobs__filter-group">
              <div className="filter-select">
                <i className="fas fa-filter"></i>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">Tất cả loại hình</option>
                  <option value="full-time">Toàn thời gian</option>
                  <option value="part-time">Bán thời gian</option>
                  <option value="contract">Hợp đồng</option>
                  <option value="internship">Thực tập</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div className="filter-select">
                <i className="fas fa-sort"></i>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'deadline')}>
                  <option value="date">Ngày lưu mới nhất</option>
                  <option value="deadline">Hạn nộp gần nhất</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Jobs List */}
        {filteredJobs.length > 0 ? (
          <div className="saved-jobs__list">
            {filteredJobs.map((savedJob) => {
              const deadlineStatus = getDeadlineStatus(savedJob.job.deadline);
              return (
                <div key={savedJob.id} className="job-card">
                  <div className="job-card__header">
                    <div className="job-card__company">
                      {savedJob.job.company.logo ? (
                        <img
                          src={savedJob.job.company.logo}
                          alt={savedJob.job.company.company_name}
                          className="job-card__logo"
                        />
                      ) : (
                        <div className="job-card__logo job-card__logo--placeholder">
                          <i className="fas fa-building"></i>
                        </div>
                      )}
                      <div className="job-card__company-info">
                        <h3
                          className="job-card__title"
                          onClick={() => navigate(`/jobs/${savedJob.job.id}`)}
                        >
                          {savedJob.job.title}
                        </h3>
                        <p
                          className="job-card__company-name"
                          onClick={() => navigate(`/companies/${savedJob.job.company.id}`)}
                        >
                          {savedJob.job.company.company_name}
                        </p>
                      </div>
                    </div>
                    <button
                      className="job-card__remove"
                      onClick={() => handleRemove(savedJob.id, savedJob.job.title)}
                      title="Xóa khỏi danh sách lưu"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <div className="job-card__details">
                    <div className="detail-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{savedJob.job.location}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-briefcase"></i>
                      <span>{getJobTypeLabel(savedJob.job.job_type)}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-layer-group"></i>
                      <span>{getExperienceLabel(savedJob.job.experience_level)}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-money-bill-wave"></i>
                      <span>{formatSalary(savedJob.job.salary_min, savedJob.job.salary_max)}</span>
                    </div>
                  </div>

                  <div className="job-card__meta">
                    <div className="job-card__saved-date">
                      <i className="fas fa-bookmark"></i>
                      <span>Đã lưu: {formatDate(savedJob.created_at)}</span>
                    </div>
                    <div className={`job-card__deadline job-card__deadline--${deadlineStatus.className}`}>
                      <i className="fas fa-clock"></i>
                      <span>{deadlineStatus.label}</span>
                    </div>
                  </div>

                  <div className="job-card__actions">
                    <button
                      className="btn btn--primary"
                      onClick={() => navigate(`/jobs/${savedJob.job.id}`)}
                    >
                      <i className="fas fa-eye"></i>
                      Xem chi tiết
                    </button>
                    <button
                      className="btn btn--success"
                      onClick={() => navigate(`/jobs/${savedJob.job.id}`)}
                      disabled={savedJob.job.status !== 'active' || getDaysUntilDeadline(savedJob.job.deadline) < 0}
                    >
                      <i className="fas fa-paper-plane"></i>
                      Ứng tuyển ngay
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="saved-jobs__empty">
            <i className="fas fa-bookmark"></i>
            <h3>Chưa có việc làm nào được lưu</h3>
            <p>
              {searchQuery || filterType !== 'all'
                ? 'Không tìm thấy việc làm phù hợp với bộ lọc'
                : 'Hãy lưu các công việc bạn quan tâm để theo dõi và ứng tuyển sau'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <button className="btn btn--primary" onClick={() => navigate('/jobs')}>
                <i className="fas fa-search"></i>
                Khám phá việc làm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
