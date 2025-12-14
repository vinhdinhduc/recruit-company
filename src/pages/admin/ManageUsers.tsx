import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import './ManageUsers.scss';
import { toast } from 'react-toastify';

interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: 'candidate' | 'employer' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  avatar?: string;
  created_at: string;
  last_login?: string;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'status' | 'delete'>('status');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, roleFilter, statusFilter, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      console.log("Check data",data);
      
      if(data.code === 0 && data.data){
        setUsers(data.data.users);
      }
      
      setError('');
    } catch (err: any) {
      console.error('Error fetching users:', err);
      
      setError(err.response?.data?.message || 'Lỗi tải danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.full_name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedUser) return;

    try {
      await userService.updateUserStatus(selectedUser.id, newStatus);
      setUsers(prev =>
        prev.map(user =>
          user.id === selectedUser.id ? { ...user, status: newStatus as any } : user
        )
      );
      setShowModal(false);
      setSelectedUser(null);
      alert('Cập nhật trạng thái thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    if (!confirm(`Xác nhận xóa người dùng "${selectedUser.full_name}"?`)) return;

    try {
      await userService.deleteUser(selectedUser.id);
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setShowModal(false);
      setSelectedUser(null);
      alert('Xóa người dùng thành công');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi xóa người dùng');
    }
  };

  const openModal = (user: User, type: 'status' | 'delete') => {
    setSelectedUser(user);
    setActionType(type);
    setShowModal(true);
  };

  const getRoleBadge = (role: string) => {
    const config: any = {
      candidate: { label: 'Ứng viên', className: 'role--candidate', icon: 'user' },
      employer: { label: 'Nhà tuyển dụng', className: 'role--employer', icon: 'user-tie' },
      admin: { label: 'Quản trị viên', className: 'role--admin', icon: 'user-shield' },
    };
    const item = config[role] || config.candidate;
    return (
      <span className={`role-badge ${item.className}`}>
        <i className={`fas fa-${item.icon}`}></i>
        {item.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      active: { label: 'Hoạt động', className: 'status--active', icon: 'check-circle' },
      inactive: { label: 'Ngưng hoạt động', className: 'status--inactive', icon: 'minus-circle' },
      banned: { label: 'Đã khóa', className: 'status--banned', icon: 'ban' },
    };
    const item = config[status] || config.active;
    return (
      <span className={`status-badge ${item.className}`}>
        <i className={`fas fa-${item.icon}`}></i>
        {item.label}
      </span>
    );
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserCount = (role: string): number => {
    if (role === 'all') return users.length;
    return users.filter(u => u.role === role).length;
  };

  if (loading) {
    return (
      <div className="manage-users__loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <div className="manage-users">
      <div className="manage-users__container">
        {/* Header */}
        <div className="manage-users__header">
          <div>
            <h1 className="manage-users__title">
              <i className="fas fa-users-cog"></i>
              Quản lý người dùng
            </h1>
            <p className="manage-users__subtitle">
              Tổng {users.length} người dùng trong hệ thống
            </p>
          </div>
          <button className="btn btn--primary" onClick={fetchUsers}>
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
        <div className="user-stats">
          <div className="stat-item stat-item--all">
            <i className="fas fa-users"></i>
            <div>
              <div className="stat-item__value">{getUserCount('all')}</div>
              <div className="stat-item__label">Tất cả</div>
            </div>
          </div>
          <div className="stat-item stat-item--candidate">
            <i className="fas fa-user"></i>
            <div>
              <div className="stat-item__value">{getUserCount('candidate')}</div>
              <div className="stat-item__label">Ứng viên</div>
            </div>
          </div>
          <div className="stat-item stat-item--employer">
            <i className="fas fa-user-tie"></i>
            <div>
              <div className="stat-item__value">{getUserCount('employer')}</div>
              <div className="stat-item__label">Nhà tuyển dụng</div>
            </div>
          </div>
          <div className="stat-item stat-item--admin">
            <i className="fas fa-user-shield"></i>
            <div>
              <div className="stat-item__value">{getUserCount('admin')}</div>
              <div className="stat-item__label">Quản trị viên</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="manage-users__filters">
          <div className="manage-users__search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
            <i className="fas fa-user-tag"></i>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">Tất cả vai trò</option>
              <option value="candidate">Ứng viên ({getUserCount('candidate')})</option>
              <option value="employer">Nhà tuyển dụng ({getUserCount('employer')})</option>
              <option value="admin">Quản trị viên ({getUserCount('admin')})</option>
            </select>
          </div>

          <div className="filter-select">
            <i className="fas fa-toggle-on"></i>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngưng hoạt động</option>
              <option value="banned">Đã khóa</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length > 0 ? (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Vai trò</th>
                  <th>Liên hệ</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Đăng nhập</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.full_name} className="user-avatar" />
                        ) : (
                          <div className="user-avatar user-avatar--placeholder">
                            <i className="fas fa-user"></i>
                          </div>
                        )}
                        <div>
                          <div className="user-name">{user.full_name}</div>
                          <div className="user-id">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-item">
                          <i className="fas fa-envelope"></i>
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="contact-item">
                            <i className="fas fa-phone"></i>
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td className="date-cell">{formatDate(user.created_at)}</td>
                    <td className="date-cell">{formatDate(user.last_login || '')}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-action--status"
                          onClick={() => openModal(user, 'status')}
                          title="Thay đổi trạng thái"
                        >
                          <i className="fas fa-toggle-on"></i>
                        </button>
                        <button
                          className="btn-action btn-action--delete"
                          onClick={() => openModal(user, 'delete')}
                          title="Xóa người dùng"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="manage-users__empty">
            <i className="fas fa-users-slash"></i>
            <h3>Không tìm thấy người dùng</h3>
            <p>Không có người dùng nào phù hợp với bộ lọc</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>
                {actionType === 'status' ? 'Thay đổi trạng thái' : 'Xóa người dùng'}
              </h3>
              <button className="modal__close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal__body">
              <div className="user-preview">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.full_name} />
                ) : (
                  <div className="user-preview__placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
                <div>
                  <div className="user-preview__name">{selectedUser.full_name}</div>
                  <div className="user-preview__email">{selectedUser.email}</div>
                  {getRoleBadge(selectedUser.role)}
                </div>
              </div>

              {actionType === 'status' ? (
                <div className="status-actions">
                  <p>Chọn trạng thái mới:</p>
                  <div className="status-buttons">
                    <button
                      className="btn-status btn-status--active"
                      onClick={() => handleUpdateStatus('active')}
                      disabled={selectedUser.status === 'active'}
                    >
                      <i className="fas fa-check-circle"></i>
                      Hoạt động
                    </button>
                    <button
                      className="btn-status btn-status--inactive"
                      onClick={() => handleUpdateStatus('inactive')}
                      disabled={selectedUser.status === 'inactive'}
                    >
                      <i className="fas fa-minus-circle"></i>
                      Ngưng
                    </button>
                    <button
                      className="btn-status btn-status--banned"
                      onClick={() => handleUpdateStatus('banned')}
                      disabled={selectedUser.status === 'banned'}
                    >
                      <i className="fas fa-ban"></i>
                      Khóa
                    </button>
                  </div>
                </div>
              ) : (
                <div className="delete-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>
                    Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser.full_name}</strong>?
                  </p>
                  <p className="warning-note">Hành động này không thể hoàn tác!</p>
                </div>
              )}
            </div>
            {actionType === 'delete' && (
              <div className="modal__footer">
                <button className="btn btn--outline" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button className="btn btn--danger" onClick={handleDeleteUser}>
                  <i className="fas fa-trash"></i>
                  Xác nhận xóa
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
