import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import './Applications.scss';

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
  candidate: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  job: {
    id: number;
    title: string;
    location: string;
  };
}

interface Job {
  id: number;
  title: string;
}

const Applications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortApplications();
  }, [applications, selectedJob, statusFilter, searchQuery, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

  

      const appsData = await applicationService.getCompanyApplications();
      console.log("Check appdataa",appsData);
      
      if(appsData && appsData.data){
        const res = appsData.data;
        console.log("Check res",res);
   setApplications(Array.isArray(res) ? res : []);
      }
      const jobsData = await jobService.getJobs();
      console.log("Check jobsData",jobsData);


   
      setJobs(jobsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Lỗi tải dữ liệu');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortApplications = () => {
    let filtered = [...applications];

    // Filter by job
    if (selectedJob !== 'all') {
      filtered = filtered.filter(app => app.job_id === parseInt(selectedJob));
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        app =>
          app.candidate.full_name.toLowerCase().includes(query) ||
          app.candidate.email.toLowerCase().includes(query) ||
          app.job.title.toLowerCase().includes(query)
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

  const handleStatusChange = async () => {
    if (!selectedApplication || !newStatus) return;

    try {
      await applicationService.updateApplicationStatus(selectedApplication.id, {
        status: newStatus,
      });

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApplication.id ? { ...app, status: newStatus as any } : app
        )
      );

      setShowStatusModal(false);
      setSelectedApplication(null);
      setNewStatus('');
      alert('Cập nhật trạng thái thành công');
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const openStatusModal = (application: Application) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setShowStatusModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; className: string; icon: string } } = {
      pending: { label: 'Chờ duyệt', className: 'status--pending', icon: 'clock' },
      reviewing: { label: 'Đang xem xét', className: 'status--reviewing', icon: 'eye' },
      shortlisted: { label: 'Đạt vòng sơ tuyển', className: 'status--shortlisted', icon: 'check-circle' },
      interviewed: { label: 'Đã phỏng vấn', className: 'status--interviewed', icon: 'user-check' },
      offered: { label: 'Đã gửi offer', className: 'status--offered', icon: 'trophy' },
      rejected: { label: 'Từ chối', className: 'status--rejected', icon: 'times-circle' },
      withdrawn: { label: 'Ứng viên rút', className: 'status--withdrawn', icon: 'ban' },
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

  const getStatusCount = (status: string): number => {
    return applications?.filter(app => app.status === status).length ?? 0;
  };

  const getStatusIcon = (status: string): string => {
    const icons: { [key: string]: string } = {
      pending: 'clock',
      reviewing: 'eye',
      shortlisted: 'check-circle',
      interviewed: 'user-check',
      offered: 'trophy',
      rejected: 'times-circle',
    };
    return icons[status] || 'file-alt';
  };

  if (loading) {
    return (
      <div className="applications__loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách ứng viên...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications__error">
        <i className="fas fa-exclamation-circle"></i>
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button className="btn btn--primary" onClick={fetchData}>
          <i className="fas fa-redo"></i>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="applications">
      <div className="applications__container">
        {/* Header */}
        <div className="applications__header">
          <div className="applications__header-content">
            <h1 className="applications__title">
              <i className="fas fa-users"></i>
              Quản lý ứng viên
            </h1>
            <p className="applications__subtitle">
              Theo dõi và quản lý tất cả ứng viên đã nộp hồ sơ
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="applications__stats">
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
              <div className="stat-card__value">{getStatusCount('pending')}</div>
              <div className="stat-card__label">Chờ duyệt</div>
            </div>
          </div>
          <div className="stat-card stat-card--info">
            <i className="fas fa-eye"></i>
            <div className="stat-card__content">
              <div className="stat-card__value">{getStatusCount('reviewing')}</div>
              <div className="stat-card__label">Đang xét</div>
            </div>
          </div>
          <div className="stat-card stat-card--success">
            <i className="fas fa-trophy"></i>
            <div className="stat-card__content">
              <div className="stat-card__value">{getStatusCount('offered')}</div>
              <div className="stat-card__label">Đã offer</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="applications__filters">
          <div className="applications__search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, công việc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className="applications__filter-group">
            <div className="filter-select">
              <i className="fas fa-briefcase"></i>
              <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
                <option value="all">Tất cả công việc</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>

            <div className="filter-select">
              <i className="fas fa-filter"></i>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt ({getStatusCount('pending')})</option>
                <option value="reviewing">Đang xem xét ({getStatusCount('reviewing')})</option>
                <option value="shortlisted">Đạt vòng sơ tuyển ({getStatusCount('shortlisted')})</option>
                <option value="interviewed">Đã phỏng vấn ({getStatusCount('interviewed')})</option>
                <option value="offered">Đã gửi offer ({getStatusCount('offered')})</option>
                <option value="rejected">Từ chối ({getStatusCount('rejected')})</option>
              </select>
            </div>

            <div className="filter-select">
              <i className="fas fa-sort"></i>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'status')}>
                <option value="date">Ngày nộp mới nhất</option>
                <option value="status">Trạng thái</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="applications__list">
            {filteredApplications.map((application) => (
              <div key={application.id} className="application-card">
                <div className="application-card__header">
                  <div className="application-card__candidate">
                    {application.candidate.avatar ? (
                      <img
                        src={application.candidate.avatar}
                        alt={application.candidate.full_name}
                        className="application-card__avatar"
                      />
                    ) : (
                      <div className="application-card__avatar application-card__avatar--placeholder">
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                    <div className="application-card__candidate-info">
                      <h3 className="application-card__name">{application.candidate.full_name}</h3>
                      <p className="application-card__email">{application.candidate.email}</p>
                      {application.candidate.phone && (
                        <p className="application-card__phone">
                          <i className="fas fa-phone"></i>
                          {application.candidate.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(application.status)}
                </div>

                <div className="application-card__details">
                  <div className="detail-item">
                    <i className="fas fa-briefcase"></i>
                    <span>{application.job.title}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar"></i>
                    <span>Nộp: {formatDate(application.created_at)}</span>
                  </div>
                  {application.expected_salary && (
                    <div className="detail-item">
                      <i className="fas fa-money-bill-wave"></i>
                      <span>Mức lương mong muốn: {application.expected_salary.toLocaleString()} VNĐ</span>
                    </div>
                  )}
                </div>

                {application.cover_letter && (
                  <div className="application-card__cover-letter">
                    <strong>Thư giới thiệu:</strong>
                    <p>{application.cover_letter.substring(0, 150)}...</p>
                  </div>
                )}

                <div className="application-card__actions">
                  {application.cv_file && (
                    <a
                      href={application.cv_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--outline"
                    >
                      <i className="fas fa-file-pdf"></i>
                      Xem CV
                    </a>
                  )}
                  <button
                    className="btn btn--primary"
                    onClick={() => openStatusModal(application)}
                  >
                    <i className="fas fa-edit"></i>
                    Cập nhật trạng thái
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="applications__empty">
            <i className="fas fa-inbox"></i>
            <h3>Không có ứng viên nào</h3>
            <p>
              {searchQuery || statusFilter !== 'all' || selectedJob !== 'all'
                ? 'Không tìm thấy ứng viên phù hợp với bộ lọc'
                : 'Chưa có ứng viên nào nộp hồ sơ'}
            </p>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Cập nhật trạng thái</h3>
              <button className="modal__close" onClick={() => setShowStatusModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal__body">
              <p className="modal__candidate-name">
                <strong>Ứng viên:</strong> {selectedApplication.candidate.full_name}
              </p>
              <p className="modal__job-title">
                <strong>Công việc:</strong> {selectedApplication.job.title}
              </p>

              <div className="modal__form-group">
                <label>Trạng thái mới</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="modal__select"
                >
                  <option value="pending">Chờ duyệt</option>
                  <option value="reviewing">Đang xem xét</option>
                  <option value="shortlisted">Đạt vòng sơ tuyển</option>
                  <option value="interviewed">Đã phỏng vấn</option>
                  <option value="offered">Đã gửi offer</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--outline" onClick={() => setShowStatusModal(false)}>
                Hủy
              </button>
              <button className="btn btn--primary" onClick={handleStatusChange}>
                <i className="fas fa-check"></i>
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
