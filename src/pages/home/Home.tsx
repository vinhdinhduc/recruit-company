import React, { useState } from 'react';
import './Home.scss';

interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  location: string;
  salary: string;
  type: string;
  tags: string[];
  featured: boolean;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  jobCount: number;
}

const Home: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // Mock data - Replace with API calls
  const featuredJobs: Job[] = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'Tech Corp',
      logo: '🏢',
      location: 'Hà Nội',
      salary: '2000 - 3000 USD',
      type: 'Full-time',
      tags: ['React', 'TypeScript', 'Next.js'],
      featured: true,
    },
    {
      id: 2,
      title: 'Backend Developer',
      company: 'Innovation Hub',
      logo: '🚀',
      location: 'TP.HCM',
      salary: '1500 - 2500 USD',
      type: 'Full-time',
      tags: ['Node.js', 'MongoDB', 'Express'],
      featured: true,
    },
    {
      id: 3,
      title: 'UX/UI Designer',
      company: 'Creative Studio',
      logo: '🎨',
      location: 'Đà Nẵng',
      salary: '1200 - 2000 USD',
      type: 'Part-time',
      tags: ['Figma', 'Adobe XD', 'Sketch'],
      featured: true,
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      company: 'Cloud Solutions',
      logo: '☁️',
      location: 'Remote',
      salary: 'Thỏa thuận',
      type: 'Contract',
      tags: ['AWS', 'Docker', 'Kubernetes'],
      featured: true,
    },
  ];

  const categories: Category[] = [
    { id: 1, name: 'Technology', icon: '💻', jobCount: 1234 },
    { id: 2, name: 'Marketing', icon: '📢', jobCount: 567 },
    { id: 3, name: 'Design', icon: '🎨', jobCount: 890 },
    { id: 4, name: 'Finance', icon: '💰', jobCount: 432 },
    { id: 5, name: 'Healthcare', icon: '🏥', jobCount: 321 },
    { id: 6, name: 'Education', icon: '📚', jobCount: 654 },
    { id: 7, name: 'Sales', icon: '🤝', jobCount: 789 },
    { id: 8, name: 'HR', icon: '👥', jobCount: 234 },
  ];

  const stats = [
    { number: '10,000+', label: 'Việc làm' },
    { number: '5,000+', label: 'Công ty' },
    { number: '50,000+', label: 'Ứng viên' },
    { number: '2,000+', label: 'Tuyển dụng/tháng' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', { searchKeyword, searchLocation });
    // Implement search logic
  };

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
                  <span className="home__search-icon">🔍</span>
                  <input
                    type="text"
                    className="home__search-input"
                    placeholder="Vị trí, công ty, kỹ năng..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
                <div className="home__search-field home__search-field--location">
                  <span className="home__search-icon">📍</span>
                  <input
                    type="text"
                    className="home__search-input"
                    placeholder="Địa điểm"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <button type="submit" className="home__search-button">
                  Tìm kiếm
                </button>
              </div>
            </form>

            {/* Popular Keywords */}
            <div className="home__popular">
              <span className="home__popular-label">Từ khóa phổ biến:</span>
              <div className="home__popular-tags">
                {['Frontend', 'Backend', 'UI/UX', 'DevOps', 'Marketing'].map((tag) => (
                  <button key={tag} className="home__popular-tag">
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
          {stats.map((stat, index) => (
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

          <div className="home__categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="home__category-card">
                <div className="home__category-icon">{category.icon}</div>
                <h3 className="home__category-name">{category.name}</h3>
                <p className="home__category-count">{category.jobCount} việc làm</p>
              </div>
            ))}
          </div>

          <div className="home__section-footer">
            <button className="home__view-all-button">
              Xem tất cả danh mục →
            </button>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="home__featured-jobs">
        <div className="home__featured-jobs-container">
          <div className="home__section-header">
            <h2 className="home__section-title">Việc Làm Nổi Bật</h2>
            <p className="home__section-subtitle">Các cơ hội việc làm tốt nhất dành cho bạn</p>
          </div>

          <div className="home__jobs-grid">
            {featuredJobs.map((job) => (
              <div key={job.id} className="home__job-card">
                {job.featured && (
                  <div className="home__job-card-badge">⭐ Nổi bật</div>
                )}
                <div className="home__job-card-header">
                  <div className="home__job-card-logo">{job.logo}</div>
                  <div className="home__job-card-info">
                    <h3 className="home__job-card-title">{job.title}</h3>
                    <p className="home__job-card-company">{job.company}</p>
                  </div>
                </div>

                <div className="home__job-card-details">
                  <div className="home__job-card-detail">
                    <span className="home__job-card-detail-icon">📍</span>
                    <span className="home__job-card-detail-text">{job.location}</span>
                  </div>
                  <div className="home__job-card-detail">
                    <span className="home__job-card-detail-icon">💰</span>
                    <span className="home__job-card-detail-text">{job.salary}</span>
                  </div>
                  <div className="home__job-card-detail">
                    <span className="home__job-card-detail-icon">⏰</span>
                    <span className="home__job-card-detail-text">{job.type}</span>
                  </div>
                </div>

                <div className="home__job-card-tags">
                  {job.tags.map((tag) => (
                    <span key={tag} className="home__job-card-tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="home__job-card-footer">
                  <button className="home__job-card-button home__job-card-button--primary">
                    Ứng tuyển ngay
                  </button>
                  <button className="home__job-card-button home__job-card-button--secondary">
                    💾
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="home__section-footer">
            <button className="home__view-all-button home__view-all-button--large">
              Xem tất cả việc làm →
            </button>
          </div>
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
              <button className="home__cta-button home__cta-button--primary">
                Đăng tin tuyển dụng
              </button>
              <button className="home__cta-button home__cta-button--secondary">
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