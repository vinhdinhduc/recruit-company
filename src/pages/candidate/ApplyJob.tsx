import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileUpload, 
  faDollarSign, 
  faEnvelope, 
  faPaperPlane,
  faArrowLeft,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import './ApplyJob.scss';

interface Job {
  id: number;
  title: string;
  company: {
    id: number;
    company_name: string;
    logo?: string;
  };
  location: string;
  salary_range?: string;
  job_type?: string;
}

const ApplyJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    cvFile: null as File | null,
    coverLetter: '',
    expectedSalary: '',
  });

  const [errors, setErrors] = useState({
    cvFile: '',
    coverLetter: '',
    expectedSalary: '',
  });

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobService.getJob(Number(id));
      setJob(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông tin công việc');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, cvFile: 'Chỉ chấp nhận file PDF, DOC, DOCX' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, cvFile: 'File không được vượt quá 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, cvFile: file }));
      setErrors(prev => ({ ...prev, cvFile: '' }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      cvFile: '',
      coverLetter: '',
      expectedSalary: '',
    };

    if (!formData.cvFile) {
      newErrors.cvFile = 'Vui lòng tải lên CV của bạn';
    }

    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = 'Vui lòng viết thư xin việc';
    } else if (formData.coverLetter.trim().length < 50) {
      newErrors.coverLetter = 'Thư xin việc phải có ít nhất 50 ký tự';
    }

    if (formData.expectedSalary && isNaN(Number(formData.expectedSalary))) {
      newErrors.expectedSalary = 'Mức lương mong muốn phải là số';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(err => err !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const submitData = new FormData();
      submitData.append('job_id', id!);
      submitData.append('cv_file', formData.cvFile!);
      submitData.append('cover_letter', formData.coverLetter);
      if (formData.expectedSalary) {
        submitData.append('expected_salary', formData.expectedSalary);
      }

      await applicationService.applyJob(submitData);
      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/candidate/my-applications');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi nộp đơn');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="apply-job">
        <div className="apply-job__loading">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="apply-job">
        <div className="apply-job__error">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <p>Không tìm thấy công việc</p>
          <button onClick={() => navigate('/jobs')} className="btn btn--primary">
            Quay lại danh sách việc làm
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="apply-job">
        <div className="apply-job__success">
          <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
          <h2>Nộp đơn thành công!</h2>
          <p>Đơn ứng tuyển của bạn đã được gửi đến nhà tuyển dụng.</p>
          <p className="redirect-message">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-job">
      <div className="apply-job__container">
        {/* Header */}
        <div className="apply-job__header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Quay lại</span>
          </button>
          <h1>Ứng tuyển vị trí</h1>
        </div>

        {/* Job Info */}
        <div className="apply-job__job-info">
          <div className="job-info__content">
            {job.company.logo && (
              <img src={job.company.logo} alt={job.company.company_name} className="company-logo" />
            )}
            <div className="job-details">
              <h2>{job.title}</h2>
              <p className="company-name">{job.company.company_name}</p>
              <div className="job-meta">
                <span className="location">{job.location}</span>
                {job.salary_range && <span className="salary">{job.salary_range}</span>}
                {job.job_type && <span className="job-type">{job.job_type}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="apply-job__form">
          {error && (
            <div className="alert alert--error">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>{error}</span>
            </div>
          )}

          {/* CV Upload */}
          <div className="form-group">
            <label htmlFor="cvFile" className="form-label required">
              <FontAwesomeIcon icon={faFileUpload} />
              <span>Tải lên CV</span>
            </label>
            <div className="file-upload">
              <input
                type="file"
                id="cvFile"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className={errors.cvFile ? 'error' : ''}
              />
              <div className="file-upload__label">
                <FontAwesomeIcon icon={faFileUpload} />
                <span>{formData.cvFile ? formData.cvFile.name : 'Chọn file CV (PDF, DOC, DOCX - Max 5MB)'}</span>
              </div>
            </div>
            {errors.cvFile && <span className="error-message">{errors.cvFile}</span>}
            <p className="form-hint">Hỗ trợ: PDF, DOC, DOCX. Kích thước tối đa: 5MB</p>
          </div>

          {/* Cover Letter */}
          <div className="form-group">
            <label htmlFor="coverLetter" className="form-label required">
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Thư xin việc</span>
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này..."
              rows={8}
              className={errors.coverLetter ? 'error' : ''}
            />
            {errors.coverLetter && <span className="error-message">{errors.coverLetter}</span>}
            <p className="form-hint">Tối thiểu 50 ký tự</p>
          </div>

          {/* Expected Salary */}
          <div className="form-group">
            <label htmlFor="expectedSalary" className="form-label">
              <FontAwesomeIcon icon={faDollarSign} />
              <span>Mức lương mong muốn (VNĐ)</span>
            </label>
            <input
              type="text"
              id="expectedSalary"
              name="expectedSalary"
              value={formData.expectedSalary}
              onChange={handleInputChange}
              placeholder="Ví dụ: 15000000"
              className={errors.expectedSalary ? 'error' : ''}
            />
            {errors.expectedSalary && <span className="error-message">{errors.expectedSalary}</span>}
            <p className="form-hint">Để trống nếu thương lượng</p>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn--outline"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPaperPlane} />
                  <span>Nộp đơn ứng tuyển</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyJob;
