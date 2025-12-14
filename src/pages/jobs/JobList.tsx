import React, { useState, useEffect } from 'react';
import {jobService} from "../../services/jobService";
import './JobList.scss';
import type { responseEncoding } from 'axios';
import { useNavigate } from 'react-router-dom';

interface Job {
  id: number;
  title: string;
  company: string | { id: number; company_name: string; logo: string; city: string; verified: boolean };
  companyLogo: string;
  location: string;
  city: string;
  salary: string;
  salaryMin?: number;
  salaryMax?: number;
  type: string;
  experience: string;
  deadline: string;
  tags: string[];
  description: string;
  featured: boolean;
  remote: boolean;
  views: number;
  applicants: number;
  postedDate: string;
}

interface FilterState {
  keyword: string;
  location: string;
  category: string;
  jobType: string;
  experience: string;
  salaryRange: string;
  remote: boolean;
}

const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 12;
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    location: '',
    category: '',
    jobType: '',
    experience: '',
    salaryRange: '',
    remote: false,
  });

  const [showFilters, setShowFilters] = useState(false);


  useEffect(() => {
   const fetchJobs = async() => {
    try {
      const res = await jobService.getJobs();
      console.log("Check res",res);
      
      if(res.code === 0 && res.data ){
        setJobs(res.data.jobs);
      }
    } catch (error) {
      console.error("Lỗi khi load jobs",error);
      
    }
   }
   fetchJobs();
  }, []);
  console.log("Check jobs",jobs);
  
  const handleViewDetail = (jobId:number) => {
    console.log("View detail job id:",jobId);
    navigate(`/jobs/${jobId}`);

  }
  const getCompanyName = (company: Job['company']): string => {
    return typeof company === 'string' ? company : company.company_name;
  };

  const applyFilters = async() => {
    let result = [...jobs];

    // Keyword filter
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(keyword) ||
          getCompanyName(job.company).toLowerCase().includes(keyword) ||
          job.tags?.some((tag) => tag.toLowerCase().includes(keyword))
      );
    }
 

    // Location filter
    if (filters.location) {
      result = result.filter((job) =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Job type filter
    if (filters.jobType) {
      result = result.filter((job) => job.type === filters.jobType);
    }

    // Experience filter
    if (filters.experience) {
      result = result.filter((job) => job.experience === filters.experience);
    }

    // Remote filter
    if (filters.remote) {
      result = result.filter((job) => job.remote);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime());
        break;
      case 'salary-high':
        result.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
        break;
      case 'salary-low':
        result.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
        break;
      case 'popular':
        result.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }

    setFilteredJobs(result);
    setCurrentPage(1);
  };
       useEffect(() => {
    applyFilters();
  }, [filters, sortBy, jobs]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      category: '',
      jobType: '',
      experience: '',
      salaryRange: '',
      remote: false,
    });
  };

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  return (
    <div className="job-list">
      {/* Hero Section */}
      <section className="job-list__hero">
        <div className="job-list__hero-container">
          <h1 className="job-list__hero-title">Tìm Công Việc Mơ Ước</h1>
          <p className="job-list__hero-subtitle">
            {filteredJobs.length} công việc đang chờ đón bạn
          </p>

          {/* Search Bar */}
          <div className="job-list__search">
            <div className="job-list__search-wrapper">
              <div className="job-list__search-field">
                <i className="fas fa-search job-list__search-icon"></i>
                <input
                  type="text"
                  className="job-list__search-input"
                  placeholder="Tìm kiếm theo vị trí, công ty, kỹ năng..."
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                />
              </div>
              <div className="job-list__search-field">
                <i className="fas fa-map-marker-alt job-list__search-icon"></i>
                <input
                  type="text"
                  className="job-list__search-input"
                  placeholder="Địa điểm"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
              <button className="job-list__search-button">Tìm kiếm</button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="job-list__container">
        <div className="job-list__layout">
          {/* Sidebar Filters */}
          <aside className={`job-list__sidebar ${showFilters ? 'job-list__sidebar--show' : ''}`}>
            <div className="job-list__sidebar-header">
              <h3 className="job-list__sidebar-title">Bộ lọc</h3>
              <button
                className="job-list__sidebar-close"
                onClick={() => setShowFilters(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="job-list__filter-group">
              <label className="job-list__filter-label">Loại công việc</label>
              <select
                className="job-list__filter-select"
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="job-list__filter-group">
              <label className="job-list__filter-label">Kinh nghiệm</label>
              <select
                className="job-list__filter-select"
                value={filters.experience}
                onChange={(e) => handleFilterChange('experience', e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="Intern">Intern</option>
                <option value="Junior">Junior</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <div className="job-list__filter-group">
              <label className="job-list__filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.remote}
                  onChange={(e) => handleFilterChange('remote', e.target.checked)}
                />
                <span className="job-list__filter-checkbox-label">Làm việc từ xa</span>
              </label>
            </div>

            <button className="job-list__filter-clear" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </aside>

          {/* Job Results */}
          <main className="job-list__main">
            {/* Toolbar */}
            <div className="job-list__toolbar">
              <div className="job-list__toolbar-left">
                <button
                  className="job-list__filter-toggle"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className="fas fa-sliders-h"></i>
                  Bộ lọc
                </button>
                <span className="job-list__result-count">
                  {filteredJobs.length} công việc
                </span>
              </div>

              <div className="job-list__toolbar-right">
                <select
                  className="job-list__sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="salary-high">Lương cao nhất</option>
                  <option value="salary-low">Lương thấp nhất</option>
                  <option value="popular">Phổ biến nhất</option>
                </select>

                <div className="job-list__view-toggle">
                  <button
                    className={`job-list__view-button ${
                      viewMode === 'list' ? 'job-list__view-button--active' : ''
                    }`}
                    onClick={() => setViewMode('list')}
                    title="List view"
                  >
                    <i className="fas fa-list"></i>
                  </button>
                  <button
                    className={`job-list__view-button ${
                      viewMode === 'grid' ? 'job-list__view-button--active' : ''
                    }`}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <i className="fas fa-th"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Job Cards */}
            {currentJobs.length > 0 ? (
              <div className={`job-list__grid job-list__grid--${viewMode}`}>
                {currentJobs.map((job) => (
                  <article key={job.id} className="job-list__card" onClick={() => handleViewDetail(job.id)}>
                    {job.featured && (
                      <div className="job-list__card-badge">
                        <i className="fas fa-star"></i> Nổi bật
                      </div>
                    )}

                    <div className="job-list__card-header">
                      <div className="job-list__card-logo">{job.companyLogo}</div>
                      <div className="job-list__card-info">
                        <h3 className="job-list__card-title">{job.title}</h3>
                        <p className="job-list__card-company">{getCompanyName(job.company)}</p>
                      </div>
                      <button className="job-list__card-bookmark" title="Lưu công việc">
                        <i className="far fa-bookmark"></i>
                      </button>
                    </div>

                    <div className="job-list__card-details">
                      <div className="job-list__card-detail">
                        <i className="fas fa-map-marker-alt job-list__card-detail-icon"></i>
                        <span className="job-list__card-detail-text">{job.location}</span>
                      </div>
                      <div className="job-list__card-detail">
                        <i className="fas fa-dollar-sign job-list__card-detail-icon"></i>
                        <span className="job-list__card-detail-text">{job.salary}</span>
                      </div>
                      <div className="job-list__card-detail">
                        <i className="far fa-clock job-list__card-detail-icon"></i>
                        <span className="job-list__card-detail-text">{job.type}</span>
                      </div>
                      <div className="job-list__card-detail">
                        <i className="fas fa-chart-line job-list__card-detail-icon"></i>
                        <span className="job-list__card-detail-text">{job.experience}</span>
                      </div>
                    </div>

                    <div className="job-list__card-tags">
                      {job.tags?.map((tag) => (
                        <span key={tag} className="job-list__card-tag">
                          {tag}
                        </span>
                      )) || null}
                    </div>

                    <div className="job-list__card-footer">
                      <div className="job-list__card-meta">
                        <span className="job-list__card-meta-item">
                          <i className="far fa-eye"></i> {job.views}
                        </span>
                        <span className="job-list__card-meta-item">
                          <i className="fas fa-users"></i> {job.applicants} ứng viên
                        </span>
                        <span className="job-list__card-meta-item">
                          {formatDate(job.postedDate)}
                        </span>
                      </div>
                      <button className="job-list__card-apply">Ứng tuyển</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="job-list__empty">
                <i className="fas fa-search job-list__empty-icon"></i>
                <h3 className="job-list__empty-title">Không tìm thấy công việc</h3>
                <p className="job-list__empty-text">
                  Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button className="job-list__empty-button" onClick={clearFilters}>
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="job-list__pagination">
                <button
                  className="job-list__pagination-button"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i> Trước
                </button>

                <div className="job-list__pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`job-list__pagination-page ${
                            currentPage === page ? 'job-list__pagination-page--active' : ''
                          }`}
                          onClick={() => paginate(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="job-list__pagination-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  className="job-list__pagination-button"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default JobList;