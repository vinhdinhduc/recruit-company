import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faSyncAlt,
  faExclamationCircle,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faSearch,
  faTimes,
  faFilter,
  faBuilding,
  faMapMarkerAlt,
  faMoneyBillWave,
  faCalendarAlt,
  faEye,
  faFileAlt,
  faCheck,
  faToggleOn,
  faTrash,
  faExclamationTriangle,
  faPauseCircle,
} from '@fortawesome/free-solid-svg-icons';
import { adminService } from '../../services/adminService';
import './ManageJobs.scss';

interface Job {
  id: number;
  title: string;
  job_type: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  description: string;
  requirements?: string;
  benefits?: string;
  deadline: string;
  status: 'active' | 'inactive' | 'closed' | 'pending';
  created_at: string;
  views_count?: number;
  applications_count?: number;
  company: {
    id: number;
    company_name: string;
    logo?: string;
    verified: boolean;
  };
}

const ManageJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'status' | 'delete'>('status');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, statusFilter, searchQuery]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllJobs();
      const jobList = data.data || data;
      setJobs(Array.isArray(jobList) ? jobList : []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.message || 'Lỗi tải danh sách tin tuyển dụng');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        job =>
          job.title?.toLowerCase().includes(query) ||
          job.company.company_name?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query)
      );
    }

    setFilteredJobs(filtered);
  };

  const handleApprove = async () => {
    if (!selectedJob) return;

    try {
      await adminService.approveJob(selectedJob.id);
      setJobs(prev =>
        prev.map(job =>
          job.id === selectedJob.id ? { ...job, status: 'active' as any } : job
        )
      );
      setShowModal(false);
      setSelectedJob(null);
      alert('Duyệt tin tuyển dụng thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi duyệt tin tuyển dụng');
    }
  };

  const handleReject = async () => {
    if (!selectedJob) return;

    try {
      await adminService.rejectJob(selectedJob.id, rejectReason);
      setJobs(prev => prev.filter(job => job.id !== selectedJob.id));
      setShowModal(false);
      setSelectedJob(null);
      setRejectReason('');
      alert('Từ chối tin tuyển dụng thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi từ chối tin tuyển dụng');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedJob) return;

    try {
      await adminService.updateJobStatus(selectedJob.id, newStatus);
      setJobs(prev =>
        prev.map(job =>
          job.id === selectedJob.id ? { ...job, status: newStatus as any } : job
        )
      );
      setShowModal(false);
      setSelectedJob(null);
      alert('Cập nhật trạng thái thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;

    if (!confirm(`Xác nhận xóa tin "${selectedJob.title}"?`)) return;

    try {
      await adminService.deleteJob(selectedJob.id);
      setJobs(prev => prev.filter(job => job.id !== selectedJob.id));
      setShowModal(false);
      setSelectedJob(null);
      alert('Xóa tin tuyển dụng thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi xóa tin tuyển dụng');
    }
  };

  const openModal = (job: Job, type: 'approve' | 'reject' | 'status' | 'delete') => {
    setSelectedJob(job);
    setActionType(type);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      active: { label: 'Đang tuyển', className: 'status--active', icon: faCheckCircle },
      inactive: { label: 'Tạm ngưng', className: 'status--inactive', icon: faPauseCircle },
      closed: { label: 'Đã đóng', className: 'status--closed', icon: faTimesCircle },
      pending: { label: 'Chờ duyệt', className: 'status--pending', icon: faClock },
    };
    const item = config[status] || config.pending;
    return (
      <span className={`status-badge ${item.className}`}>
        <FontAwesomeIcon icon={item.icon} />
        {item.label}
      </span>
    );
  };

  const getJobTypeBadge = (type: string) => {
    const config: any = {
      'full-time': { label: 'Full-time', className: 'job-type--fulltime' },
      'part-time': { label: 'Part-time', className: 'job-type--parttime' },
      contract: { label: 'Hợp đồng', className: 'job-type--contract' },
      internship: { label: 'Thực tập', className: 'job-type--internship' },
      freelance: { label: 'Freelance', className: 'job-type--freelance' },
    };
    const item = config[type] || config['full-time'];
    return <span className={`job-type-badge ${item.className}`}>{item.label}</span>;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatSalary = (min?: number, max?: number): string => {
    if (!min && !max) return 'Thỏa thuận';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} VNĐ`;
    if (min) return `Từ ${min.toLocaleString()} VNĐ`;
    return `Lên đến ${max?.toLocaleString()} VNĐ`;
  };

  const getJobCount = (status: string): number => {
    if (status === 'all') return jobs.length;
    return jobs.filter(j => j.status === status).length;
  };

  if (loading) {
    return (
      <div className="manage-jobs__loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách tin tuyển dụng...</p>
      </div>
    );
  }

  return (
    <div className="manage-jobs">
      <div className="manage-jobs__container">
        {/* Header */}
        <div className="manage-jobs__header">
          <div>
            <h1 className="manage-jobs__title">
              <i className="fas fa-briefcase"></i>
              Quản lý tin tuyển dụng
            </h1>
            <p className="manage-jobs__subtitle">
              Tổng {jobs.length} tin tuyển dụng
            </p>
          </div>
          <button className="btn btn--primary" onClick={fetchJobs}>
            <i className="fas fa-sync-alt"></i>
            Làm mới
          </button>
        </div>

        {error && (
          <div className="alert alert--error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="job-stats">
          <div className="stat-item stat-item--all">
            <i className="fas fa-briefcase"></i>
            <div>
              <div className="stat-item__value">{getJobCount('all')}</div>
              <div className="stat-item__label">Tổng tin</div>
            </div>
          </div>
          <div className="stat-item stat-item--active">
            <i className="fas fa-check-circle"></i>
            <div>
              <div className="stat-item__value">{getJobCount('active')}</div>
              <div className="stat-item__label">Đang tuyển</div>
            </div>
          </div>
          <div className="stat-item stat-item--pending">
            <i className="fas fa-clock"></i>
            <div>
              <div className="stat-item__value">{getJobCount('pending')}</div>
              <div className="stat-item__label">Chờ duyệt</div>
            </div>
          </div>
          <div className="stat-item stat-item--closed">
            <i className="fas fa-times-circle"></i>
            <div>
              <div className="stat-item__value">{getJobCount('closed')}</div>
              <div className="stat-item__label">Đã đóng</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="manage-jobs__filters">
          <div className="manage-jobs__search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên tin, công ty, địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className="filter-select">
            <i className="fas fa-filter"></i>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt ({getJobCount('pending')})</option>
              <option value="active">Đang tuyển ({getJobCount('active')})</option>
              <option value="inactive">Tạm ngưng ({getJobCount('inactive')})</option>
              <option value="closed">Đã đóng ({getJobCount('closed')})</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length > 0 ? (
          <div className="jobs-list">
            {filteredJobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-card__header">
                  <div className="job-card__company">
                    {job.company.logo ? (
                      <img src={`http://localhost:3000${job.company.logo}`} alt={job.company.company_name} className="company-logo" />
                    ) : (
                      <div className="company-logo company-logo--placeholder">
                        <i className="fas fa-building"></i>
                      </div>
                    )}
                    <div>
                      <h3 className="job-title">{job.title}</h3>
                      <div className="company-name">
                        {job.company.company_name}
                        {job.company.verified && (
                          <i className="fas fa-check-circle verified-icon" title="Đã xác minh"></i>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="job-card__badges">
                    {getStatusBadge(job.status)}
                    {getJobTypeBadge(job.job_type)}
                  </div>
                </div>

                <div className="job-card__body">
                  <div className="job-info">
                    <div className="info-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{job.location}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-money-bill-wave"></i>
                      <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-calendar-alt"></i>
                      <span>Hạn: {formatDate(job.deadline)}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-clock"></i>
                      <span>Đăng: {formatDate(job.created_at)}</span>
                    </div>
                  </div>

                  <div className="job-stats-row">
                    <span className="stat-badge">
                      <i className="fas fa-eye"></i>
                      {job.views_count || 0} lượt xem
                    </span>
                    <span className="stat-badge">
                      <i className="fas fa-file-alt"></i>
                      {job.applications_count || 0} hồ sơ
                    </span>
                  </div>
                </div>

                <div className="job-card__actions">
                  {job.status === 'pending' && (
                    <>
                      <button
                        className="btn-action btn-action--approve"
                        onClick={() => openModal(job, 'approve')}
                      >
                        <i className="fas fa-check"></i>
                        Duyệt
                      </button>
                      <button
                        className="btn-action btn-action--reject"
                        onClick={() => openModal(job, 'reject')}
                      >
                        <i className="fas fa-times"></i>
                        Từ chối
                      </button>
                    </>
                  )}
                  {job.status !== 'pending' && (
                    <button
                      className="btn-action btn-action--status"
                      onClick={() => openModal(job, 'status')}
                    >
                      <i className="fas fa-toggle-on"></i>
                      Trạng thái
                    </button>
                  )}
                  <button
                    className="btn-action btn-action--delete"
                    onClick={() => openModal(job, 'delete')}
                  >
                    <i className="fas fa-trash"></i>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="manage-jobs__empty">
            <i className="fas fa-briefcase"></i>
            <h3>Không tìm thấy tin tuyển dụng</h3>
            <p>Không có tin tuyển dụng nào phù hợp với bộ lọc</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>
                {actionType === 'approve' && 'Duyệt tin tuyển dụng'}
                {actionType === 'reject' && 'Từ chối tin tuyển dụng'}
                {actionType === 'status' && 'Thay đổi trạng thái'}
                {actionType === 'delete' && 'Xóa tin tuyển dụng'}
              </h3>
              <button className="modal__close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal__body">
              <div className="job-preview">
                <h4>{selectedJob.title}</h4>
                <p className="company">{selectedJob.company.company_name}</p>
                <div className="preview-badges">
                  {getStatusBadge(selectedJob.status)}
                  {getJobTypeBadge(selectedJob.job_type)}
                </div>
              </div>

              {actionType === 'approve' && (
                <div className="approve-content">
                  <p>Xác nhận duyệt tin tuyển dụng này?</p>
                  <p className="note">Tin sẽ được công khai và ứng viên có thể ứng tuyển.</p>
                  <div className="action-buttons">
                    <button className="btn btn--outline" onClick={() => setShowModal(false)}>
                      Hủy
                    </button>
                    <button className="btn btn--success" onClick={handleApprove}>
                      <i className="fas fa-check"></i>
                      Duyệt tin
                    </button>
                  </div>
                </div>
              )}

              {actionType === 'reject' && (
                <div className="reject-content">
                  <p>Lý do từ chối (tùy chọn):</p>
                  <textarea
                    className="reject-reason"
                    placeholder="Nhập lý do từ chối..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                  />
                  <div className="action-buttons">
                    <button className="btn btn--outline" onClick={() => setShowModal(false)}>
                      Hủy
                    </button>
                    <button className="btn btn--danger" onClick={handleReject}>
                      <i className="fas fa-times"></i>
                      Từ chối
                    </button>
                  </div>
                </div>
              )}

              {actionType === 'status' && (
                <div className="status-actions">
                  <p>Chọn trạng thái mới:</p>
                  <div className="status-buttons">
                    <button
                      className="btn-status btn-status--active"
                      onClick={() => handleUpdateStatus('active')}
                      disabled={selectedJob.status === 'active'}
                    >
                      <i className="fas fa-check-circle"></i>
                      Đang tuyển
                    </button>
                    <button
                      className="btn-status btn-status--inactive"
                      onClick={() => handleUpdateStatus('inactive')}
                      disabled={selectedJob.status === 'inactive'}
                    >
                      <i className="fas fa-pause-circle"></i>
                      Tạm ngưng
                    </button>
                    <button
                      className="btn-status btn-status--closed"
                      onClick={() => handleUpdateStatus('closed')}
                      disabled={selectedJob.status === 'closed'}
                    >
                      <i className="fas fa-times-circle"></i>
                      Đã đóng
                    </button>
                  </div>
                </div>
              )}

              {actionType === 'delete' && (
                <div className="delete-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>Xác nhận xóa tin tuyển dụng <strong>"{selectedJob.title}"</strong>?</p>
                  <p className="warning-note">Hành động này không thể hoàn tác!</p>
                  <div className="action-buttons">
                    <button className="btn btn--outline" onClick={() => setShowModal(false)}>
                      Hủy
                    </button>
                    <button className="btn btn--danger" onClick={handleDelete}>
                      <i className="fas fa-trash"></i>
                      Xóa tin
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;

