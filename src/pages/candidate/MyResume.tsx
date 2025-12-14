import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import './MyResume.scss';

interface ResumeHistory {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  fileSize: number;
  isActive: boolean;
}

const MyResume: React.FC = () => {
  const { user } = useAuth();
  const [currentResume, setCurrentResume] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchCurrentResume();
  }, []);

  const fetchCurrentResume = async () => {
    try {
      setLoading(true);
      const response = await authService.getMe();
      const userData = response.data || response;
      setCurrentResume(userData.cv_file || null);
    } catch (error) {
      console.error('Error fetching resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ chấp nhận file PDF, DOC, hoặc DOCX');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('cv', selectedFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await authService.updateProfile(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        alert('Tải CV lên thành công!');
        setSelectedFile(null);
        setUploadProgress(0);
        fetchCurrentResume();
      }, 500);
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      alert(error.response?.data?.message || 'Lỗi tải CV lên');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa CV hiện tại?')) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('cv_file', '');

      await authService.updateProfile(formData);
      alert('Đã xóa CV thành công');
      setCurrentResume(null);
    } catch (error: any) {
      console.error('Error deleting resume:', error);
      alert(error.response?.data?.message || 'Lỗi xóa CV');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    if (fileName.endsWith('.pdf')) return 'file-pdf';
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'file-word';
    return 'file-alt';
  };

  const getFileName = (url: string): string => {
    return url.split('/').pop() || 'CV';
  };

  if (loading) {
    return (
      <div className="my-resume__loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin CV...</p>
      </div>
    );
  }

  return (
    <div className="my-resume">
      <div className="my-resume__container">
        {/* Header */}
        <div className="my-resume__header">
          <div className="my-resume__header-content">
            <h1 className="my-resume__title">
              <i className="fas fa-file-alt"></i>
              Quản lý CV của tôi
            </h1>
            <p className="my-resume__subtitle">
              Tải lên và quản lý CV của bạn để ứng tuyển nhanh chóng
            </p>
          </div>
        </div>

        <div className="my-resume__content">
          {/* Current Resume Section */}
          {currentResume && (
            <div className="resume-card resume-card--current">
              <div className="resume-card__header">
                <div className="resume-card__badge">
                  <i className="fas fa-check-circle"></i>
                  CV hiện tại
                </div>
                <button className="resume-card__delete" onClick={handleDelete}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>

              <div className="resume-card__content">
                <div className="resume-card__icon">
                  <i className={`fas fa-${getFileIcon(currentResume)}`}></i>
                </div>
                <div className="resume-card__info">
                  <h3 className="resume-card__name">{getFileName(currentResume)}</h3>
                  <p className="resume-card__meta">
                    <i className="fas fa-check"></i>
                    Đang sử dụng
                  </p>
                </div>
              </div>

              <div className="resume-card__actions">
                <a
                  href={currentResume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                >
                  <i className="fas fa-eye"></i>
                  Xem CV
                </a>
                <a
                  href={currentResume}
                  download
                  className="btn btn--outline"
                >
                  <i className="fas fa-download"></i>
                  Tải xuống
                </a>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="upload-section">
            <h2 className="upload-section__title">
              <i className="fas fa-cloud-upload-alt"></i>
              {currentResume ? 'Cập nhật CV mới' : 'Tải CV lên'}
            </h2>

            {!selectedFile ? (
              <div
                className={`upload-dropzone ${dragActive ? 'upload-dropzone--active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div className="upload-dropzone__icon">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <h3 className="upload-dropzone__title">
                  Kéo thả file CV vào đây
                </h3>
                <p className="upload-dropzone__text">hoặc</p>
                <label className="upload-dropzone__button">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <i className="fas fa-folder-open"></i>
                  Chọn file từ máy tính
                </label>
                <p className="upload-dropzone__hint">
                  Hỗ trợ: PDF, DOC, DOCX (tối đa 5MB)
                </p>
              </div>
            ) : (
              <div className="file-preview">
                <div className="file-preview__card">
                  <div className="file-preview__icon">
                    <i className={`fas fa-${getFileIcon(selectedFile.name)}`}></i>
                  </div>
                  <div className="file-preview__info">
                    <h4 className="file-preview__name">{selectedFile.name}</h4>
                    <p className="file-preview__size">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    className="file-preview__remove"
                    onClick={() => setSelectedFile(null)}
                    disabled={uploading}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {uploading && (
                  <div className="upload-progress">
                    <div className="upload-progress__bar">
                      <div
                        className="upload-progress__fill"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="upload-progress__text">{uploadProgress}%</p>
                  </div>
                )}

                <div className="file-preview__actions">
                  <button
                    className="btn btn--primary btn--large"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Đang tải lên...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload"></i>
                        Tải lên ngay
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn--outline btn--large"
                    onClick={() => setSelectedFile(null)}
                    disabled={uploading}
                  >
                    <i className="fas fa-times"></i>
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div className="tips-section">
            <h3 className="tips-section__title">
              <i className="fas fa-lightbulb"></i>
              Mẹo tạo CV hiệu quả
            </h3>
            <div className="tips-grid">
              <div className="tip-card">
                <div className="tip-card__icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h4 className="tip-card__title">Thông tin đầy đủ</h4>
                <p className="tip-card__text">
                  Đảm bảo CV có đầy đủ thông tin cá nhân, học vấn, kinh nghiệm và kỹ năng
                </p>
              </div>

              <div className="tip-card">
                <div className="tip-card__icon">
                  <i className="fas fa-align-left"></i>
                </div>
                <h4 className="tip-card__title">Ngắn gọn, súc tích</h4>
                <p className="tip-card__text">
                  CV nên từ 1-2 trang, tập trung vào thông tin quan trọng và liên quan
                </p>
              </div>

              <div className="tip-card">
                <div className="tip-card__icon">
                  <i className="fas fa-file-pdf"></i>
                </div>
                <h4 className="tip-card__title">Định dạng chuẩn</h4>
                <p className="tip-card__text">
                  Sử dụng file PDF để đảm bảo format không bị lỗi khi nhà tuyển dụng mở
                </p>
              </div>

              <div className="tip-card">
                <div className="tip-card__icon">
                  <i className="fas fa-sync-alt"></i>
                </div>
                <h4 className="tip-card__title">Cập nhật thường xuyên</h4>
                <p className="tip-card__text">
                  Thường xuyên cập nhật CV với kinh nghiệm và kỹ năng mới nhất của bạn
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          {currentResume && (
            <div className="stats-section">
              <div className="stat-item">
                <div className="stat-item__icon">
                  <i className="fas fa-eye"></i>
                </div>
                <div className="stat-item__content">
                  <div className="stat-item__value">-</div>
                  <div className="stat-item__label">Lượt xem CV</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-item__icon">
                  <i className="fas fa-download"></i>
                </div>
                <div className="stat-item__content">
                  <div className="stat-item__value">-</div>
                  <div className="stat-item__label">Lượt tải xuống</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-item__icon">
                  <i className="fas fa-paper-plane"></i>
                </div>
                <div className="stat-item__content">
                  <div className="stat-item__value">-</div>
                  <div className="stat-item__label">Đơn ứng tuyển</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyResume;
