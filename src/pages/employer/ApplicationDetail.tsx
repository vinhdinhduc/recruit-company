import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faFileDownload,
  faDollarSign,
  faCalendar,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faHourglassHalf,
  faEye,
  faStar,
  faComments,
  faEdit,
  faBriefcase,
  faGraduationCap,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { applicationService } from '../../services/applicationService';
import './ApplicationDetail.scss';

interface Application {
  id: number;
  job: {
    id: number;
    title: string;
    company: {
      id: number;
      company_name: string;
      logo?: string;
    };
  };
  candidate: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    address?: string;
    avatar?: string;
    profile?: {
      experience_years?: number;
      education_level?: string;
      skills?: string[];
    };
  };
  cv_file: string;
  cover_letter: string;
  expected_salary?: number;
  status: string;
  applied_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  reviewer?: {
    full_name: string;
  };
  interview_date?: string;
  interview_location?: string;
  interview_notes?: string;
  notes?: string;
}

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: 'Chờ xử lý', icon: faClock, color: '#f59e0b' },
  reviewing: { label: 'Đang xem xét', icon: faEye, color: '#3b82f6' },
  shortlisted: { label: 'Đạt vòng sơ tuyển', icon: faStar, color: '#8b5cf6' },
  interviewed: { label: 'Đã phỏng vấn', icon: faComments, color: '#06b6d4' },
  offered: { label: 'Đã gửi offer', icon: faCheckCircle, color: '#10b981' },
  rejected: { label: 'Từ chối', icon: faTimesCircle, color: '#ef4444' },
  withdrawn: { label: 'Đã rút đơn', icon: faHourglassHalf, color: '#6b7280' },
};

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    fetchApplicationDetail();
  }, [id]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      // This would need to be implemented in applicationService
      const response = await applicationService.getApplicationDetail(Number(id));
      setApplication(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    try {
      setUpdating(true);
      await applicationService.updateApplicationStatus(Number(id), {
        status: newStatus,
        notes: statusNotes,
      });
      setShowStatusModal(false);
      fetchApplicationDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(salary);
  };

  if (loading) {
    return (
      <div className="application-detail">
        <div className="application-detail__loading">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="application-detail">
        <div className="application-detail__error">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <p>{error || 'Không tìm thấy hồ sơ ứng tuyển'}</p>
          <button onClick={() => navigate(-1)} className="btn btn--primary">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[application.status];

  return (
    <div className="application-detail">
      <div className="application-detail__container">
        {/* Header */}
        <div className="application-detail__header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Quay lại</span>
          </button>
          <div className="header-content">
            <h1>Chi tiết hồ sơ ứng tuyển</h1>
            <div className="status-badge" style={{ background: currentStatus.color }}>
              <FontAwesomeIcon icon={currentStatus.icon} />
              <span>{currentStatus.label}</span>
            </div>
          </div>
        </div>

        <div className="application-detail__content">
          {/* Left Column */}
          <div className="left-column">
            {/* Candidate Info */}
            <div className="card candidate-card">
              <div className="candidate-header">
                {application.candidate.avatar ? (
                  <img
                    src={application.candidate.avatar}
                    alt={application.candidate.full_name}
                    className="candidate-avatar"
                  />
                ) : (
                  <div className="candidate-avatar placeholder">
                    {application.candidate.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="candidate-info">
                  <h2>{application.candidate.full_name}</h2>
                  <p className="job-title">Ứng tuyển: {application.job.title}</p>
                </div>
              </div>

              <div className="candidate-details">
                <div className="detail-item">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>{application.candidate.email}</span>
                </div>
                {application.candidate.phone && (
                  <div className="detail-item">
                    <FontAwesomeIcon icon={faPhone} />
                    <span>{application.candidate.phone}</span>
                  </div>
                )}
                {application.candidate.address && (
                  <div className="detail-item">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{application.candidate.address}</span>
                  </div>
                )}
                {application.candidate.profile?.experience_years !== undefined && (
                  <div className="detail-item">
                    <FontAwesomeIcon icon={faBriefcase} />
                    <span>{application.candidate.profile.experience_years} năm kinh nghiệm</span>
                  </div>
                )}
                {application.candidate.profile?.education_level && (
                  <div className="detail-item">
                    <FontAwesomeIcon icon={faGraduationCap} />
                    <span>{application.candidate.profile.education_level}</span>
                  </div>
                )}
              </div>

              {application.candidate.profile?.skills && application.candidate.profile.skills.length > 0 && (
                <div className="skills-section">
                  <h3>Kỹ năng</h3>
                  <div className="skills-list">
                    {application.candidate.profile.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="cv-download">
                <a
                  href={application.cv_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--outline btn--full"
                >
                  <FontAwesomeIcon icon={faFileDownload} />
                  <span>Tải CV</span>
                </a>
              </div>
            </div>

            {/* Application Info */}
            <div className="card info-card">
              <h3>Thông tin ứng tuyển</h3>
              <div className="info-list">
                <div className="info-item">
                  <label>Ngày nộp đơn:</label>
                  <span>{formatDate(application.applied_at)}</span>
                </div>
                {application.expected_salary && (
                  <div className="info-item">
                    <label>Mức lương mong muốn:</label>
                    <span className="salary">{formatSalary(application.expected_salary)}</span>
                  </div>
                )}
                {application.reviewed_at && (
                  <div className="info-item">
                    <label>Ngày xem xét:</label>
                    <span>{formatDate(application.reviewed_at)}</span>
                  </div>
                )}
                {application.reviewer && (
                  <div className="info-item">
                    <label>Người xem xét:</label>
                    <span>{application.reviewer.full_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Interview Info */}
            {application.interview_date && (
              <div className="card interview-card">
                <h3>
                  <FontAwesomeIcon icon={faCalendar} />
                  Lịch phỏng vấn
                </h3>
                <div className="info-list">
                  <div className="info-item">
                    <label>Thời gian:</label>
                    <span>{formatDate(application.interview_date)}</span>
                  </div>
                  {application.interview_location && (
                    <div className="info-item">
                      <label>Địa điểm:</label>
                      <span>{application.interview_location}</span>
                    </div>
                  )}
                  {application.interview_notes && (
                    <div className="info-item">
                      <label>Ghi chú:</label>
                      <span>{application.interview_notes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Cover Letter */}
            <div className="card cover-letter-card">
              <h3>Thư xin việc</h3>
              <div className="cover-letter-content">
                <p>{application.cover_letter}</p>
              </div>
            </div>

            {/* Notes */}
            {application.notes && (
              <div className="card notes-card">
                <h3>Ghi chú của nhà tuyển dụng</h3>
                <div className="notes-content">
                  <p>{application.notes}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="card actions-card">
              <h3>Hành động</h3>
              <div className="action-buttons">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="btn btn--primary btn--full"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  <span>Cập nhật trạng thái</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cập nhật trạng thái hồ sơ</h3>
              <button onClick={() => setShowStatusModal(false)} className="close-btn">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Trạng thái mới:</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="">-- Chọn trạng thái --</option>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú:</label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Thêm ghi chú về quyết định này..."
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowStatusModal(false)} className="btn btn--outline">
                Hủy
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || updating}
                className="btn btn--primary"
              >
                {updating ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;
