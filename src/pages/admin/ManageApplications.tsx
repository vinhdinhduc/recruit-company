import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt,
  faSyncAlt,
  faExclamationCircle,
  faClock,
  faCheck,
  faCheckCircle,
  faSearch,
  faTimes,
  faBuilding,
  faFilter,
  faUser,
  faMapMarkerAlt,
  faCalendarAlt,
  faEye,
  faTrash,
  faExclamationTriangle,
  faDownload,
  faUserCheck,
  faHandshake,
  faTimesCircle,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';
import { adminService } from '../../services/adminService';
import './ManageApplications.scss';
import { applicationService } from '../../services/applicationService';

interface Application {
  id: number;
  status: string;
  created_at: string;
  cv_file?: string;
  cover_letter?: string;
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
    company: {
      id: number;
      company_name: string;
      logo?: string;
      verified: boolean;
    };
  };
}

const ManageApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false);

  // Get unique companies for filter
  const companies = Array.from(
    new Set(applications.map((app) => app.job.company.company_name))
  ).sort();

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, statusFilter, companyFilter, searchQuery]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getAllApplications();
      console.log("check response application",res);
      
      if(res.code === 0 && res.data){
        setApplications(res.data.applications);
      }
      setError('');
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.message || 'Lỗi tải danh sách hồ sơ');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (companyFilter !== 'all') {
      filtered = filtered.filter((app) => app.job.company.company_name === companyFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.candidate.full_name?.toLowerCase().includes(query) ||
          app.candidate.email?.toLowerCase().includes(query) ||
          app.job.title?.toLowerCase().includes(query) ||
          app.job.company.company_name?.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleDeleteApplication = async () => {
    if (!selectedApplication) return;

    try {
      await adminService.deleteApplication(selectedApplication.id);
      setApplications((prev) => prev.filter((app) => app.id !== selectedApplication.id));
      setShowDeleteModal(false);
      setSelectedApplication(null);
      alert('Xóa hồ sơ thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi xóa hồ sơ');
    }
  };

  const openDeleteModal = (app: Application) => {
    setSelectedApplication(app);
    setShowDeleteModal(true);
  };

  const openCVModal = (app: Application) => {
    setSelectedApplication(app);
    setShowCVModal(true);
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      pending: { label: 'Chờ duyệt', className: 'status--pending', icon: faClock },
      reviewing: { label: 'Đang xem xét', className: 'status--reviewing', icon: faEye },
      shortlisted: { label: 'Đạt vòng sơ tuyển', className: 'status--shortlisted', icon: faCheck },
      interviewed: { label: 'Đã phỏng vấn', className: 'status--interviewed', icon: faUserCheck },
      offered: { label: 'Đã offer', className: 'status--offered', icon: faHandshake },
      accepted: { label: 'Đã chấp nhận', className: 'status--accepted', icon: faCheckCircle },
      rejected: { label: 'Bị từ chối', className: 'status--rejected', icon: faTimesCircle },
      withdrawn: { label: 'Đã rút', className: 'status--withdrawn', icon: faUndo },
    };
    const item = config[status] || config.pending;
    return (
      <span className={`status-badge ${item.className}`}>
        <FontAwesomeIcon icon={item.icon} />
        {item.label}
      </span>
    );
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getApplicationCount = (status: string): number => {
    if (status === 'all') return applications.length;
    return applications.filter((app) => app.status === status).length;
  };

  if (loading) {
    return (
      <div className="manage-applications__loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="manage-applications">
      <div className="manage-applications__container">
        {/* Header */}
        <div className="manage-applications__header">
          <div>
            <h1 className="manage-applications__title">
              <FontAwesomeIcon icon={faFileAlt} />
              Quản lý hồ sơ ứng tuyển
            </h1>
            <p className="manage-applications__subtitle">Tổng {applications.length} hồ sơ</p>
          </div>
          <button className="btn btn--primary" onClick={fetchApplications}>
            <FontAwesomeIcon icon={faSyncAlt} />
            Làm mới
          </button>
        </div>

        {error && (
          <div className="alert alert--error">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="application-stats">
          <div className="stat-item stat-item--all">
            <FontAwesomeIcon icon={faFileAlt} />
            <div>
              <div className="stat-item__value">{getApplicationCount('all')}</div>
              <div className="stat-item__label">Tổng hồ sơ</div>
            </div>
          </div>
          <div className="stat-item stat-item--pending">
            <FontAwesomeIcon icon={faClock} />
            <div>
              <div className="stat-item__value">{getApplicationCount('pending')}</div>
              <div className="stat-item__label">Chờ duyệt</div>
            </div>
          </div>
          <div className="stat-item stat-item--shortlisted">
            <FontAwesomeIcon icon={faCheck} />
            <div>
              <div className="stat-item__value">{getApplicationCount('shortlisted')}</div>
              <div className="stat-item__label">Đạt vòng sơ tuyển</div>
            </div>
          </div>
          <div className="stat-item stat-item--accepted">
            <FontAwesomeIcon icon={faCheckCircle} />
            <div>
              <div className="stat-item__value">{getApplicationCount('accepted')}</div>
              <div className="stat-item__label">Đã chấp nhận</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="manage-applications__filters">
          <div className="manage-applications__search">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên ứng viên, email, tin tuyển dụng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          <div className="filter-select">
            <FontAwesomeIcon icon={faBuilding} />
            <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}>
              <option value="all">Tất cả công ty</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select">
            <FontAwesomeIcon icon={faFilter} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt ({getApplicationCount('pending')})</option>
              <option value="reviewing">Đang xem xét ({getApplicationCount('reviewing')})</option>
              <option value="shortlisted">Đạt vòng sơ tuyển ({getApplicationCount('shortlisted')})</option>
              <option value="interviewed">Đã phỏng vấn ({getApplicationCount('interviewed')})</option>
              <option value="offered">Đã offer ({getApplicationCount('offered')})</option>
              <option value="accepted">Đã chấp nhận ({getApplicationCount('accepted')})</option>
              <option value="rejected">Bị từ chối ({getApplicationCount('rejected')})</option>
              <option value="withdrawn">Đã rút ({getApplicationCount('withdrawn')})</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        {filteredApplications.length > 0 ? (
          <div className="applications-table-wrapper">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Ứng viên</th>
                  <th>Tin tuyển dụng</th>
                  <th>Công ty</th>
                  <th>Trạng thái</th>
                  <th>Ngày ứng tuyển</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="candidate-cell">
                        {app.candidate.avatar ? (
                          <img
                            src={`http://localhost:3000${app.candidate.avatar}`}
                            alt={app.candidate.full_name}
                            className="candidate-avatar"
                          />
                        ) : (
                          <div className="candidate-avatar candidate-avatar--placeholder">
                            <FontAwesomeIcon icon={faUser} />
                          </div>
                        )}
                        <div className="candidate-info">
                          <div className="candidate-name">{app.candidate.full_name}</div>
                          <div className="candidate-contact">
                            <span>{app.candidate.email}</span>
                            {app.candidate.phone && <span> • {app.candidate.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="job-cell">
                        <div className="job-title">{app.job.title}</div>
                        <div className="job-location">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          {app.job.location}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="company-cell">
                        {app.job.company.logo ? (
                          <img
                            src={`http://localhost:3000${app.job.company.logo}`}
                            alt={app.job.company.company_name}
                            className="company-logo-small"
                          />
                        ) : (
                          <div className="company-logo-small company-logo-small--placeholder">
                            <FontAwesomeIcon icon={faBuilding} />
                          </div>
                        )}
                        <div>
                          <div className="company-name-small">
                            {app.job.company.company_name}
                            {app.job.company.verified && (
                              <FontAwesomeIcon icon={faCheckCircle} className="verified-icon" title="Đã xác minh" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td>
                      <div className="date-cell">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {formatDate(app.created_at)}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        {app.cv_file && (
                          <button
                            className="btn-icon btn-icon--view"
                            onClick={() => openCVModal(app)}
                            title="Xem CV"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        )}
                        <button
                          className="btn-icon btn-icon--delete"
                          onClick={() => openDeleteModal(app)}
                          title="Xóa"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="manage-applications__empty">
            <FontAwesomeIcon icon={faFileAlt} />
            <h3>Không tìm thấy hồ sơ</h3>
            <p>Không có hồ sơ ứng tuyển nào phù hợp với bộ lọc</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Xóa hồ sơ ứng tuyển</h3>
              <button className="modal__close" onClick={() => setShowDeleteModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal__body">
              <div className="delete-warning">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <p>
                  Xác nhận xóa hồ sơ của <strong>{selectedApplication.candidate.full_name}</strong> ứng tuyển vào vị trí{' '}
                  <strong>{selectedApplication.job.title}</strong>?
                </p>
                <p className="warning-note">Hành động này không thể hoàn tác!</p>
                <div className="action-buttons">
                  <button className="btn btn--outline" onClick={() => setShowDeleteModal(false)}>
                    Hủy
                  </button>
                  <button className="btn btn--danger" onClick={handleDeleteApplication}>
                    <FontAwesomeIcon icon={faTrash} />
                    Xóa hồ sơ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CV Modal */}
      {showCVModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowCVModal(false)}>
          <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>CV ứng tuyển - {selectedApplication.candidate.full_name}</h3>
              <button className="modal__close" onClick={() => setShowCVModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal__body">
              <div className="cv-preview">
                <div className="cv-info">
                  <div className="info-row">
                    <strong>Ứng viên:</strong>
                    <span>{selectedApplication.candidate.full_name}</span>
                  </div>
                  <div className="info-row">
                    <strong>Email:</strong>
                    <span>{selectedApplication.candidate.email}</span>
                  </div>
                  {selectedApplication.candidate.phone && (
                    <div className="info-row">
                      <strong>SĐT:</strong>
                      <span>{selectedApplication.candidate.phone}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <strong>Vị trí:</strong>
                    <span>{selectedApplication.job.title}</span>
                  </div>
                  <div className="info-row">
                    <strong>Công ty:</strong>
                    <span>{selectedApplication.job.company.company_name}</span>
                  </div>
                  <div className="info-row">
                    <strong>Trạng thái:</strong>
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                </div>

                {selectedApplication.cover_letter && (
                  <div className="cover-letter">
                    <h4>Thư xin việc:</h4>
                    <p>{selectedApplication.cover_letter}</p>
                  </div>
                )}

                {selectedApplication.cv_file && (
                  <div className="cv-file">
                    <h4>File CV:</h4>
                    <a
                      href={`http://localhost:3000${selectedApplication.cv_file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--primary"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                      Tải xuống CV
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageApplications;
