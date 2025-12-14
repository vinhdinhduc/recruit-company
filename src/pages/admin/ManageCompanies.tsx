import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faSyncAlt,
  faExclamationCircle,
  faCheckCircle,
  faTimes,
  faSearch,
  faFilter,
  faCertificate,
  faIndustry,
  faMapMarkerAlt,
  faEnvelope,
  faPhone,
  faGlobe,
  faCalendarAlt,
  faBriefcase,
  faEdit,
  faTrash,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { adminService } from '../../services/adminService';
import './ManageCompanies.scss';
import { companyService } from '../../services/companyService';

interface Company {
  id: number;
  company_name: string;
  email: string;
  phone?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  logo?: string;
  address?: string;
  city?: string;
  verified: boolean;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  user_id: number;
  jobs_count?: number;
}

const ManageCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'status' | 'verify' | 'delete'>('status');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, statusFilter, verifiedFilter, searchQuery]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await companyService.getAllCompanies();
      if(res.code === 0 && res.data){
        setCompanies(res.data.companies);
      }
      setError('');
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError(err.response?.data?.message || 'Lỗi tải danh sách công ty');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = [...companies];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter);
    }

    if (verifiedFilter !== 'all') {
      const isVerified = verifiedFilter === 'verified';
      filtered = filtered.filter(company => company.verified === isVerified);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        company =>
          company.company_name?.toLowerCase().includes(query) ||
          company.email?.toLowerCase().includes(query) ||
          company.industry?.toLowerCase().includes(query) ||
          company.city?.toLowerCase().includes(query)
      );
    }

    setFilteredCompanies(filtered);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedCompany) return;

    try {
      await adminService.updateCompanyStatus(selectedCompany.id, newStatus);
      setCompanies(prev =>
        prev.map(company =>
          company.id === selectedCompany.id ? { ...company, status: newStatus as any } : company
        )
      );
      setShowModal(false);
      setSelectedCompany(null);
      alert('Cập nhật trạng thái công ty thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleUpdateVerification = async (verified: boolean) => {
    if (!selectedCompany) return;

    try {
      await adminService.updateCompanyVerification(selectedCompany.id, verified);
      setCompanies(prev =>
        prev.map(company =>
          company.id === selectedCompany.id ? { ...company, verified } : company
        )
      );
      setShowModal(false);
      setSelectedCompany(null);
      alert(`Công ty đã được ${verified ? 'xác minh' : 'hủy xác minh'} thành công`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi cập nhật xác minh');
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;

    if (!confirm(`Xác nhận xóa công ty "${selectedCompany.company_name}"? Hành động này không thể hoàn tác!`)) return;

    try {
      await adminService.deleteCompany(selectedCompany.id);
      setCompanies(prev => prev.filter(company => company.id !== selectedCompany.id));
      setShowModal(false);
      setSelectedCompany(null);
      alert('Xóa công ty thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi xóa công ty');
    }
  };

  const openModal = (company: Company, type: 'status' | 'verify' | 'delete') => {
    setSelectedCompany(company);
    setActionType(type);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      active: { label: 'Hoạt động', className: 'status--active', icon: 'check-circle' },
      inactive: { label: 'Tạm ngưng', className: 'status--inactive', icon: 'minus-circle' },
      pending: { label: 'Chờ duyệt', className: 'status--pending', icon: 'clock' },
    };
    const item = config[status] || config.pending;
    return (
      <span className={`status-badge ${item.className}`}>
        <i className={`fas fa-${item.icon}`}></i>
        {item.label}
      </span>
    );
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getCompanyCount = (status: string, verified?: string): number => {
    let count = companies;
    if (status !== 'all') {
      count = count.filter(c => c.status === status);
    }
    if (verified === 'verified') {
      count = count.filter(c => c.verified === true);
    } else if (verified === 'unverified') {
      count = count.filter(c => c.verified === false);
    }
    return count.length;
  };

  if (loading) {
    return (
      <div className="manage-companies__loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách công ty...</p>
      </div>
    );
  }

  return (
    <div className="manage-companies">
      <div className="manage-companies__container">
        {/* Header */}
        <div className="manage-companies__header">
          <div>
            <h1 className="manage-companies__title">
              <i className="fas fa-building"></i>
              Quản lý công ty
            </h1>
            <p className="manage-companies__subtitle">
              Tổng {companies.length} công ty đã đăng ký
            </p>
          </div>
          <button className="btn btn--primary" onClick={fetchCompanies}>
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
        <div className="company-stats">
          <div className="stat-item stat-item--all">
            <i className="fas fa-building"></i>
            <div>
              <div className="stat-item__value">{getCompanyCount('all')}</div>
              <div className="stat-item__label">Tổng công ty</div>
            </div>
          </div>
          <div className="stat-item stat-item--active">
            <i className="fas fa-check-circle"></i>
            <div>
              <div className="stat-item__value">{getCompanyCount('active')}</div>
              <div className="stat-item__label">Đang hoạt động</div>
            </div>
          </div>
          <div className="stat-item stat-item--verified">
            <i className="fas fa-certificate"></i>
            <div>
              <div className="stat-item__value">{getCompanyCount('all', 'verified')}</div>
              <div className="stat-item__label">Đã xác minh</div>
            </div>
          </div>
          <div className="stat-item stat-item--pending">
            <i className="fas fa-clock"></i>
            <div>
              <div className="stat-item__value">{getCompanyCount('pending')}</div>
              <div className="stat-item__label">Chờ duyệt</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="manage-companies__filters">
          <div className="manage-companies__search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, ngành nghề, thành phố..."
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
            <i className="fas fa-toggle-on"></i>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động ({getCompanyCount('active')})</option>
              <option value="inactive">Tạm ngưng ({getCompanyCount('inactive')})</option>
              <option value="pending">Chờ duyệt ({getCompanyCount('pending')})</option>
            </select>
          </div>

          <div className="filter-select">
            <i className="fas fa-certificate"></i>
            <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="verified">Đã xác minh ({getCompanyCount('all', 'verified')})</option>
              <option value="unverified">Chưa xác minh ({getCompanyCount('all', 'unverified')})</option>
            </select>
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="companies-grid">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="company-card">
                <div className="company-card__header">
                  {company.logo ? (
                    <img src={`http://localhost:3000${company.logo}`} alt={company.company_name} className="company-logo" />
                  ) : (
                    <div className="company-logo company-logo--placeholder">
                      <i className="fas fa-building"></i>
                    </div>
                  )}
                  <div className="company-card__badges">
                    {getStatusBadge(company.status)}
                    {company.verified && (
                      <span className="verified-badge">
                        <i className="fas fa-check-circle"></i>
                        Đã xác minh
                      </span>
                    )}
                  </div>
                </div>

                <div className="company-card__body">
                  <h3 className="company-name">{company.company_name}</h3>
                  
                  <div className="company-info">
                    {company.industry && (
                      <div className="info-row">
                        <i className="fas fa-industry"></i>
                        <span>{company.industry}</span>
                      </div>
                    )}
                    {company.company_size && (
                      <div className="info-row">
                        <i className="fas fa-users"></i>
                        <span>{company.company_size} nhân viên</span>
                      </div>
                    )}
                    {company.city && (
                      <div className="info-row">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{company.city}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <i className="fas fa-envelope"></i>
                      <span>{company.email}</span>
                    </div>
                    {company.phone && (
                      <div className="info-row">
                        <i className="fas fa-phone"></i>
                        <span>{company.phone}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="info-row">
                        <i className="fas fa-globe"></i>
                        <a href={company.website} target="_blank" rel="noopener noreferrer">
                          Website
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="company-meta">
                    <span className="meta-item">
                      <i className="fas fa-calendar"></i>
                      Đăng ký: {formatDate(company.created_at)}
                    </span>
                    {company.jobs_count !== undefined && (
                      <span className="meta-item">
                        <i className="fas fa-briefcase"></i>
                        {company.jobs_count} tin tuyển dụng
                      </span>
                    )}
                  </div>
                </div>

                <div className="company-card__actions">
                  <button
                    className="btn-action btn-action--status"
                    onClick={() => openModal(company, 'status')}
                    title="Thay đổi trạng thái"
                  >
                    <i className="fas fa-toggle-on"></i>
                    Trạng thái
                  </button>
                  <button
                    className={`btn-action ${company.verified ? 'btn-action--unverify' : 'btn-action--verify'}`}
                    onClick={() => openModal(company, 'verify')}
                    title={company.verified ? 'Hủy xác minh' : 'Xác minh'}
                  >
                    <i className={`fas ${company.verified ? 'fa-times-circle' : 'fa-check-circle'}`}></i>
                    {company.verified ? 'Hủy XM' : 'Xác minh'}
                  </button>
                  <button
                    className="btn-action btn-action--delete"
                    onClick={() => openModal(company, 'delete')}
                    title="Xóa công ty"
                  >
                    <i className="fas fa-trash"></i>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="manage-companies__empty">
            <i className="fas fa-building"></i>
            <h3>Không tìm thấy công ty</h3>
            <p>Không có công ty nào phù hợp với bộ lọc</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && selectedCompany && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>
                {actionType === 'status' && 'Thay đổi trạng thái'}
                {actionType === 'verify' && (selectedCompany.verified ? 'Hủy xác minh công ty' : 'Xác minh công ty')}
                {actionType === 'delete' && 'Xóa công ty'}
              </h3>
              <button className="modal__close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal__body">
              <div className="company-preview">
                {selectedCompany.logo ? (
                  <img src={`http://localhost:3000${selectedCompany.logo}`} alt={selectedCompany.company_name} />
                ) : (
                  <div className="company-preview__placeholder">
                    <i className="fas fa-building"></i>
                  </div>
                )}
                <div>
                  <div className="company-preview__name">{selectedCompany.company_name}</div>
                  <div className="company-preview__email">{selectedCompany.email}</div>
                  {getStatusBadge(selectedCompany.status)}
                </div>
              </div>

              {actionType === 'status' && (
                <div className="status-actions">
                  <p>Chọn trạng thái mới:</p>
                  <div className="status-buttons">
                    <button
                      className="btn-status btn-status--active"
                      onClick={() => handleUpdateStatus('active')}
                      disabled={selectedCompany.status === 'active'}
                    >
                      <i className="fas fa-check-circle"></i>
                      Hoạt động
                    </button>
                    <button
                      className="btn-status btn-status--inactive"
                      onClick={() => handleUpdateStatus('inactive')}
                      disabled={selectedCompany.status === 'inactive'}
                    >
                      <i className="fas fa-minus-circle"></i>
                      Tạm ngưng
                    </button>
                    <button
                      className="btn-status btn-status--pending"
                      onClick={() => handleUpdateStatus('pending')}
                      disabled={selectedCompany.status === 'pending'}
                    >
                      <i className="fas fa-clock"></i>
                      Chờ duyệt
                    </button>
                  </div>
                </div>
              )}

              {actionType === 'verify' && (
                <div className="verify-actions">
                  <p>
                    {selectedCompany.verified
                      ? 'Xác nhận hủy xác minh công ty này?'
                      : 'Xác nhận công ty này đã được kiểm tra và đáng tin cậy?'}
                  </p>
                  <div className="verify-buttons">
                    <button
                      className="btn btn--outline"
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      className={`btn ${selectedCompany.verified ? 'btn--warning' : 'btn--success'}`}
                      onClick={() => handleUpdateVerification(!selectedCompany.verified)}
                    >
                      <i className={`fas ${selectedCompany.verified ? 'fa-times' : 'fa-check'}`}></i>
                      {selectedCompany.verified ? 'Hủy xác minh' : 'Xác minh'}
                    </button>
                  </div>
                </div>
              )}

              {actionType === 'delete' && (
                <div className="delete-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>
                    Bạn có chắc chắn muốn xóa công ty <strong>{selectedCompany.company_name}</strong>?
                  </p>
                  <p className="warning-note">
                    Tất cả tin tuyển dụng và dữ liệu liên quan sẽ bị xóa!
                  </p>
                  <div className="delete-buttons">
                    <button className="btn btn--outline" onClick={() => setShowModal(false)}>
                      Hủy
                    </button>
                    <button className="btn btn--danger" onClick={handleDeleteCompany}>
                      <i className="fas fa-trash"></i>
                      Xác nhận xóa
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

export default ManageCompanies;
