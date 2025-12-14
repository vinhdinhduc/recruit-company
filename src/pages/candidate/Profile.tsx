import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import api from '../../services/api';
import './Profile.scss';

interface Education {
  id: number;
  school_name: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  grade?: string;
  description?: string;
}

interface WorkExperience {
  id: number;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  location?: string;
}

interface Skill {
  id: number;
  name: string;
  proficiency_level?: string;
}

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  avatar?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  bio?: string;
  cv_file?: string;
  linkedin_url?: string;
  github_url?: string;
  website?: string;
}

const CandidateProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [educations, setEducations] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'education' | 'experience' | 'skills'>('overview');

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
    website: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileResponse = await authService.getMe();
      const profileData = profileResponse.data || profileResponse;
      setProfile(profileData);
      
      // Set form data
      setFormData({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        date_of_birth: profileData.date_of_birth ? profileData.date_of_birth.split('T')[0] : '',
        gender: profileData.gender || '',
        address: profileData.address || '',
        city: profileData.city || '',
        bio: profileData.bio || '',
        linkedin_url: profileData.linkedin_url || '',
        github_url: profileData.github_url || '',
        website: profileData.website || '',
      });

      // Fetch education, experience, and skills
      try {
        const [eduResponse, expResponse, skillsResponse] = await Promise.all([
          api.get('/user/education'),
          api.get('/user/experience'),
          api.get('/user/skills'),
        ]);

        setEducations(eduResponse.data?.data || []);
        setExperiences(expResponse.data?.data || []);
        setSkills(skillsResponse.data?.data || []);
      } catch (error) {
        console.log('Some profile sections may not be available:', error);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      await authService.updateProfile(formDataToSend);
      await fetchProfileData();
      setEditing(false);
      alert('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Lỗi cập nhật hồ sơ');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        
        await authService.updateProfile(formData);
        await fetchProfileData();
        alert('Cập nhật ảnh đại diện thành công!');
      } catch (error) {
        console.error('Error uploading avatar:', error);
        alert('Lỗi tải ảnh đại diện');
      }
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
  };

  const getDegreeLabel = (degree: string): string => {
    const degreeMap: { [key: string]: string } = {
      'high-school': 'Tốt nghiệp THPT',
      'diploma': 'Cao đẳng',
      'associate': 'Cử nhân nghề',
      'bachelor': 'Cử nhân',
      'master': 'Thạc sĩ',
      'phd': 'Tiến sĩ',
      'certificate': 'Chứng chỉ',
    };
    return degreeMap[degree] || degree;
  };

  if (loading) {
    return (
      <div className="profile__loading">
        <div className="spinner"></div>
        <p>Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile__error">
        <i className="fas fa-exclamation-circle"></i>
        <h3>Không thể tải hồ sơ</h3>
        <p>Vui lòng thử lại sau</p>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile__container">
        {/* Header Card */}
        <div className="profile__header-card">
          <div className="profile__cover"></div>
          <div className="profile__header-content">
            <div className="profile__avatar-section">
              <div className="profile__avatar">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.full_name} />
                ) : (
                  <i className="fas fa-user"></i>
                )}
                <label className="profile__avatar-upload">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                  <i className="fas fa-camera"></i>
                </label>
              </div>
              <div className="profile__header-info">
                <h1 className="profile__name">{profile.full_name}</h1>
                <p className="profile__email">
                  <i className="fas fa-envelope"></i>
                  {profile.email}
                </p>
                {profile.phone && (
                  <p className="profile__phone">
                    <i className="fas fa-phone"></i>
                    {profile.phone}
                  </p>
                )}
                {profile.city && (
                  <p className="profile__location">
                    <i className="fas fa-map-marker-alt"></i>
                    {profile.city}
                  </p>
                )}
              </div>
            </div>
            <div className="profile__header-actions">
              {!editing ? (
                <button className="profile__edit-button" onClick={() => setEditing(true)}>
                  <i className="fas fa-edit"></i>
                  Chỉnh sửa
                </button>
              ) : (
                <div className="profile__edit-actions">
                  <button className="profile__save-button" onClick={handleSaveProfile}>
                    <i className="fas fa-check"></i>
                    Lưu
                  </button>
                  <button className="profile__cancel-button" onClick={() => setEditing(false)}>
                    <i className="fas fa-times"></i>
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile__tabs">
          <button
            className={`profile__tab ${activeTab === 'overview' ? 'profile__tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-user"></i>
            Tổng quan
          </button>
          <button
            className={`profile__tab ${activeTab === 'education' ? 'profile__tab--active' : ''}`}
            onClick={() => setActiveTab('education')}
          >
            <i className="fas fa-graduation-cap"></i>
            Học vấn ({educations.length})
          </button>
          <button
            className={`profile__tab ${activeTab === 'experience' ? 'profile__tab--active' : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            <i className="fas fa-briefcase"></i>
            Kinh nghiệm ({experiences.length})
          </button>
          <button
            className={`profile__tab ${activeTab === 'skills' ? 'profile__tab--active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <i className="fas fa-code"></i>
            Kỹ năng ({skills.length})
          </button>
        </div>

        {/* Content */}
        <div className="profile__content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="profile__overview">
              {editing ? (
                <div className="profile__form">
                  <div className="profile__form-group">
                    <label>Họ và tên *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="profile__form-row">
                    <div className="profile__form-group">
                      <label>Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="profile__form-group">
                      <label>Ngày sinh</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="profile__form-row">
                    <div className="profile__form-group">
                      <label>Giới tính</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div className="profile__form-group">
                      <label>Thành phố</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="profile__form-group">
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="profile__form-group">
                    <label>Giới thiệu bản thân</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Viết vài dòng giới thiệu về bản thân..."
                    ></textarea>
                  </div>

                  <h3 className="profile__section-title">Liên kết</h3>

                  <div className="profile__form-group">
                    <label>LinkedIn</label>
                    <input
                      type="url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div className="profile__form-group">
                    <label>GitHub</label>
                    <input
                      type="url"
                      name="github_url"
                      value={formData.github_url}
                      onChange={handleInputChange}
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div className="profile__form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ) : (
                <div className="profile__view">
                  <section className="profile__section">
                    <h2 className="profile__section-title">
                      <i className="fas fa-user"></i>
                      Thông tin cá nhân
                    </h2>
                    <div className="profile__info-grid">
                      {profile.date_of_birth && (
                        <div className="profile__info-item">
                          <span className="profile__info-label">Ngày sinh:</span>
                          <span className="profile__info-value">
                            {new Date(profile.date_of_birth).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}
                      {profile.gender && (
                        <div className="profile__info-item">
                          <span className="profile__info-label">Giới tính:</span>
                          <span className="profile__info-value">
                            {profile.gender === 'male' ? 'Nam' : profile.gender === 'female' ? 'Nữ' : 'Khác'}
                          </span>
                        </div>
                      )}
                      {profile.address && (
                        <div className="profile__info-item">
                          <span className="profile__info-label">Địa chỉ:</span>
                          <span className="profile__info-value">{profile.address}</span>
                        </div>
                      )}
                    </div>
                  </section>

                  {profile.bio && (
                    <section className="profile__section">
                      <h2 className="profile__section-title">
                        <i className="fas fa-info-circle"></i>
                        Giới thiệu
                      </h2>
                      <p className="profile__bio">{profile.bio}</p>
                    </section>
                  )}

                  {(profile.linkedin_url || profile.github_url || profile.website) && (
                    <section className="profile__section">
                      <h2 className="profile__section-title">
                        <i className="fas fa-link"></i>
                        Liên kết
                      </h2>
                      <div className="profile__links">
                        {profile.linkedin_url && (
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="profile__link">
                            <i className="fab fa-linkedin"></i>
                            LinkedIn
                          </a>
                        )}
                        {profile.github_url && (
                          <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="profile__link">
                            <i className="fab fa-github"></i>
                            GitHub
                          </a>
                        )}
                        {profile.website && (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="profile__link">
                            <i className="fas fa-globe"></i>
                            Website
                          </a>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="profile__education">
              {educations.length > 0 ? (
                <div className="profile__timeline">
                  {educations.map((edu) => (
                    <div key={edu.id} className="profile__timeline-item">
                      <div className="profile__timeline-marker">
                        <i className="fas fa-graduation-cap"></i>
                      </div>
                      <div className="profile__timeline-content">
                        <h3 className="profile__timeline-title">{edu.school_name}</h3>
                        <p className="profile__timeline-subtitle">
                          {getDegreeLabel(edu.degree)} - {edu.field_of_study}
                        </p>
                        <p className="profile__timeline-date">
                          {formatDate(edu.start_date)} - {edu.is_current ? 'Hiện tại' : formatDate(edu.end_date)}
                        </p>
                        {edu.grade && (
                          <p className="profile__timeline-meta">
                            <i className="fas fa-award"></i>
                            {edu.grade}
                          </p>
                        )}
                        {edu.description && (
                          <p className="profile__timeline-description">{edu.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profile__empty">
                  <i className="fas fa-graduation-cap"></i>
                  <h3>Chưa có thông tin học vấn</h3>
                  <p>Thêm thông tin học vấn của bạn để tăng cơ hội được tuyển dụng</p>
                </div>
              )}
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="profile__experience">
              {experiences.length > 0 ? (
                <div className="profile__timeline">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="profile__timeline-item">
                      <div className="profile__timeline-marker">
                        <i className="fas fa-briefcase"></i>
                      </div>
                      <div className="profile__timeline-content">
                        <h3 className="profile__timeline-title">{exp.job_title}</h3>
                        <p className="profile__timeline-subtitle">{exp.company_name}</p>
                        <p className="profile__timeline-date">
                          {formatDate(exp.start_date)} - {exp.is_current ? 'Hiện tại' : formatDate(exp.end_date)}
                        </p>
                        {exp.location && (
                          <p className="profile__timeline-meta">
                            <i className="fas fa-map-marker-alt"></i>
                            {exp.location}
                          </p>
                        )}
                        {exp.description && (
                          <p className="profile__timeline-description">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profile__empty">
                  <i className="fas fa-briefcase"></i>
                  <h3>Chưa có kinh nghiệm làm việc</h3>
                  <p>Thêm kinh nghiệm làm việc của bạn để gây ấn tượng với nhà tuyển dụng</p>
                </div>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="profile__skills">
              {skills.length > 0 ? (
                <div className="profile__skills-grid">
                  {skills.map((skill) => (
                    <div key={skill.id} className="profile__skill-card">
                      <i className="fas fa-check-circle"></i>
                      <span className="profile__skill-name">{skill.name}</span>
                      {skill.proficiency_level && (
                        <span className="profile__skill-level">{skill.proficiency_level}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profile__empty">
                  <i className="fas fa-code"></i>
                  <h3>Chưa có kỹ năng</h3>
                  <p>Thêm các kỹ năng của bạn để tăng khả năng được tìm thấy</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
