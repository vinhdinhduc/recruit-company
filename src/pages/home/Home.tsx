import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import api from '../../services/api';
import './Home.scss';

interface Company {
  id: number;
  company_name: string;
  logo?: string;
  city?: string;
  verified?: boolean;
}

interface Job {
  id: number;
  title: string;
  company: string | Company;
  location: string;
  salary: string;
  salaryMin?: number;
  salaryMax?: number;
  type: string;
  experience: string;
  tags?: string[];
  featured: boolean;
  remote?: boolean;
  views?: number;
  applicants?: number;
}

interface Category {
  id: number;
  category_name: string;
  slug?: string;
  description?: string;
  icon?: string;
  job_count?: number;
}

interface Stats {
  totalJobs: number;
  totalCompanies: number;
  totalCandidates: number;
  monthlyHires: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      // Fetch featured jobs
      const jobsResponse = await jobService.getJobs({ 
        featured: true, 
        limit: 8 
      });
      console.log("jobs hoem",jobsResponse);
      if(jobsResponse.code === 0 && jobsResponse.data){
      setFeaturedJobs(jobsResponse.data.jobs);
      }
      // Fetch categories
      try {
        const categoriesResponse = await api.get('/categories/popular');
        console.log("Category home",categoriesResponse);
        
        setCategories(categoriesResponse.data.data || categoriesResponse.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to all categories if popular endpoint doesn't exist
        try {
          const allCategoriesResponse = await api.get('/categories');
          const allCategories = allCategoriesResponse.data.data || allCategoriesResponse.data.categories || [];
          setCategories(allCategories.slice(0, 8));
        } catch (err) {
          console.error('Error fetching all categories:', err);
        }
      }

      // Fetch stats (if endpoint exists)
      try {
        const statsResponse = await api.get('/stats');
        setStats(statsResponse.data.data || statsResponse.data);
      } catch (error) {
        console.error('Stats endpoint not available:', error);
      }

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchKeyword) params.append('search', searchKeyword);
    if (searchLocation) params.append('city', searchLocation);
    
    navigate(`/jobs?${params.toString()}`);
  };

  const getCompanyName = (company: string | Company): string => {
    return typeof company === 'string' ? company : company.company_name;
  };

  const getCompanyLogo = (company: string | Company): string | undefined => {
    return typeof company === 'object' ? company.logo : undefined;
  };

  const formatSalary = (job: Job): string => {
    if (job.salary) return job.salary;
    if (job.salaryMin && job.salaryMax) {
      return `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} VND`;
    }
    if (job.salaryMin) {
      return `Từ ${job.salaryMin.toLocaleString()} VND`;
    }
    return 'Thỏa thuận';
  };

  const getCategoryIcon = (category: Category): string => {
    // Map category names to icons
    const iconMap: { [key: string]: string } = {
      'Technology': '💻',
      'IT': '💻',
      'Software': '💻',
      'Marketing': '📢',
      'Design': '🎨',
      'Finance': '💰',
      'Banking': '💰',
      'Healthcare': '🏥',
      'Education': '📚',
      'Sales': '🤝',
      'HR': '👥',
      'Customer Service': '🎧',
      'Engineering': '⚙️',
      'Manufacturing': '🏭',
    };

    // Try to find icon from category name
    for (const [key, icon] of Object.entries(iconMap)) {
      if (category.category_name.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }

    return category.icon || '📁';
  };

  const displayStats = stats ? [
    { number: stats.totalJobs?.toLocaleString() || '0', label: 'Việc làm' },
    { number: stats.totalCompanies?.toLocaleString() || '0', label: 'Công ty' },
    { number: stats.totalCandidates?.toLocaleString() || '0', label: 'Ứng viên' },
    { number: stats.monthlyHires?.toLocaleString() || '0', label: 'Tuyển dụng/tháng' },
  ] : [
    { number: '10,000+', label: 'Việc làm' },
    { number: '5,000+', label: 'Công ty' },
    { number: '50,000+', label: 'Ứng viên' },
    { number: '2,000+', label: 'Tuyển dụng/tháng' },
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="home__hero">
        <div className="home__hero-container">
          <div className="home__hero-content">
            <h1 className="home__hero-title">
              Tìm Công Việc <span className="home__hero-title--highlight">Mơ Ước</span> Của Bạn
            </h1>
            <p className="home__hero-subtitle">
              Kết nối với hàng nghìn công ty hàng đầu và tìm kiếm cơ hội nghề nghiệp phù hợp với bạn
            </p>

            {/* Search Box */}
            <form className="home__search" onSubmit={handleSearch}>
              <div className="home__search-wrapper">
                <div className="home__search-field home__search-field--keyword">
                  <i className="fas fa-search home__search-icon"></i>
                  <input
                    type="text"
                    className="home__search-input"
                    placeholder="Vị trí, công ty, kỹ năng..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
                <div className="home__search-field home__search-field--location">
                  <i className="fas fa-map-marker-alt home__search-icon"></i>
                  <input
                    type="text"
                    className="home__search-input"
                    placeholder="Địa điểm"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <button type="submit" className="home__search-button">
                  <i className="fas fa-search"></i>
                  Tìm kiếm
                </button>
              </div>
            </form>

            {/* Popular Keywords */}
            <div className="home__popular">
              <span className="home__popular-label">Từ khóa phổ biến:</span>
              <div className="home__popular-tags">
                {['Frontend', 'Backend', 'UI/UX', 'DevOps', 'Marketing'].map((tag) => (
                  <button 
                    key={tag} 
                    className="home__popular-tag"
                    onClick={() => {
                      setSearchKeyword(tag);
                      navigate(`/jobs?search=${tag}`);
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="home__stats">
        <div className="home__stats-container">
          {displayStats.map((stat, index) => (
            <div key={index} className="home__stats-item">
              <div className="home__stats-number">{stat.number}</div>
              <div className="home__stats-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="home__categories">
        <div className="home__categories-container">
          <div className="home__section-header">
            <h2 className="home__section-title">Danh Mục Ngành Nghề</h2>
            <p className="home__section-subtitle">Khám phá cơ hội việc làm theo lĩnh vực</p>
          </div>

          {loading ? (
            <div className="home__loading">
              <div className="spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              <div className="home__categories-grid">
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="home__category-card"
                    onClick={() => navigate(`/jobs?category_id=${category.id}`)}
                  >
                    <div className="home__category-icon">{getCategoryIcon(category)}</div>
                    <h3 className="home__category-name">{category.category_name}</h3>
                    <p className="home__category-count">
                      {category.job_count || 0} việc làm
                    </p>
                  </div>
                ))}
              </div>

              <div className="home__section-footer">
                <button 
                  className="home__view-all-button"
                  onClick={() => navigate('/jobs')}
                >
                  Xem tất cả danh mục <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="home__featured-jobs">
        <div className="home__featured-jobs-container">
          <div className="home__section-header">
            <h2 className="home__section-title">Việc Làm Nổi Bật</h2>
            <p className="home__section-subtitle">Các cơ hội việc làm tốt nhất dành cho bạn</p>
          </div>

          {loading ? (
            <div className="home__loading">
              <div className="spinner"></div>
              <p>Đang tải công việc...</p>
            </div>
          ) : featuredJobs.length > 0 ? (
            <>
              <div className="home__jobs-grid">
                {featuredJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="home__job-card"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    {job.featured && (
                      <div className="home__job-card-badge">
                        <i className="fas fa-star"></i> Nổi bật
                      </div>
                    )}
                    <div className="home__job-card-header">
                      <div className="home__job-card-logo">
                        {getCompanyLogo(job.company) ? (
                          <img src={getCompanyLogo(job.company)} alt={getCompanyName(job.company)} />
                        ) : (
                          <i className="fas fa-building"></i>
                        )}
                      </div>
                      <div className="home__job-card-info">
                        <h3 className="home__job-card-title">{job.title}</h3>
                        <p className="home__job-card-company">{getCompanyName(job.company)}</p>
                      </div>
                    </div>

                    <div className="home__job-card-details">
                      <div className="home__job-card-detail">
                        <i className="fas fa-map-marker-alt home__job-card-detail-icon"></i>
                        <span className="home__job-card-detail-text">{job.location}</span>
                      </div>
                      <div className="home__job-card-detail">
                        <i className="fas fa-dollar-sign home__job-card-detail-icon"></i>
                        <span className="home__job-card-detail-text">{formatSalary(job)}</span>
                      </div>
                      <div className="home__job-card-detail">
                        <i className="far fa-clock home__job-card-detail-icon"></i>
                        <span className="home__job-card-detail-text">{job.type}</span>
                      </div>
                    </div>

                    {job.tags && job.tags.length > 0 && (
                      <div className="home__job-card-tags">
                        {job.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="home__job-card-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="home__job-card-footer">
                      <button 
                        className="home__job-card-button home__job-card-button--primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/jobs/${job.id}`);
                        }}
                      >
                        Ứng tuyển ngay
                      </button>
                      <button 
                        className="home__job-card-button home__job-card-button--secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement save job
                        }}
                        title="Lưu công việc"
                      >
                        <i className="far fa-bookmark"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="home__section-footer">
                <button 
                  className="home__view-all-button home__view-all-button--large"
                  onClick={() => navigate('/jobs')}
                >
                  Xem tất cả việc làm <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </>
          ) : (
            <div className="home__empty">
              <i className="fas fa-briefcase"></i>
              <p>Chưa có việc làm nổi bật</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="home__cta">
        <div className="home__cta-container">
          <div className="home__cta-content">
            <h2 className="home__cta-title">Bạn là nhà tuyển dụng?</h2>
            <p className="home__cta-description">
              Đăng tin tuyển dụng và tìm kiếm ứng viên phù hợp cho công ty của bạn
            </p>
            <div className="home__cta-buttons">
              <button 
                className="home__cta-button home__cta-button--primary"
                onClick={() => navigate('/employer/jobs/create')}
              >
                Đăng tin tuyển dụng
              </button>
              <button 
                className="home__cta-button home__cta-button--secondary"
                onClick={() => navigate('/about')}
              >
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;