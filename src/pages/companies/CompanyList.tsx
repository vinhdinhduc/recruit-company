import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { companyService } from '../../services/companyService';
import './CompanyList.scss';

interface Company {
  id: number;
  company_name: string;
  logo?: string;
  banner?: string;
  city: string;
  industry?: string;
  company_size?: string;
  website?: string;
  description?: string;
  verified: boolean;
  job_count?: number;
  email?: string;
  phone?: string;
  address?: string;
}

interface FilterState {
  search: string;
  city: string;
  industry: string;
}

const CompanyList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const companiesPerPage = 12;

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    industry: searchParams.get('industry') || '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [companies, filters]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyService.getAllCompanies();
      console.log("check company ",response);
      if(response && response.code === 0){
        setCompanies(response.data.companies);
      }
      
      
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...companies];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (company) =>
          company.company_name.toLowerCase().includes(searchLower) ||
          company.description?.toLowerCase().includes(searchLower) ||
          company.industry?.toLowerCase().includes(searchLower)
      );
    }

    // City filter
    if (filters.city) {
      result = result.filter((company) => 
        company.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Industry filter
    if (filters.industry) {
      result = result.filter((company) => 
        company.industry?.toLowerCase().includes(filters.industry.toLowerCase())
      );
    }

    setFilteredCompanies(result);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.industry) params.set('industry', newFilters.industry);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      industry: '',
    });
    setSearchParams(new URLSearchParams());
  };

  // Pagination
  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstCompany, indexOfLastCompany);
  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCompanySizeLabel = (size?: string) => {
    if (!size) return 'Chưa xác định';
    const sizeMap: { [key: string]: string } = {
      '1-50': '1-50 nhân viên',
      '51-200': '51-200 nhân viên',
      '201-500': '201-500 nhân viên',
      '501-1000': '501-1000 nhân viên',
      '1000+': 'Trên 1000 nhân viên',
    };
    return sizeMap[size] || size;
  };

  return (
    <div className="company-list">
      {/* Hero Section */}
      <section className="company-list__hero">
        <div className="company-list__hero-container">
          <h1 className="company-list__hero-title">Khám Phá Công Ty Hàng Đầu</h1>
          <p className="company-list__hero-subtitle">
            {filteredCompanies.length} công ty đang tìm kiếm nhân tài
          </p>

          {/* Search Bar */}
          <div className="company-list__search">
            <div className="company-list__search-wrapper">
              <div className="company-list__search-field">
                <i className="fas fa-search company-list__search-icon"></i>
                <input
                  type="text"
                  className="company-list__search-input"
                  placeholder="Tìm kiếm công ty, ngành nghề..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div className="company-list__search-field">
                <i className="fas fa-map-marker-alt company-list__search-icon"></i>
                <input
                  type="text"
                  className="company-list__search-input"
                  placeholder="Địa điểm"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>
              <button className="company-list__search-button">
                <i className="fas fa-search"></i>
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="company-list__container">
        <div className="company-list__layout">
          {/* Sidebar Filters */}
          <aside className={`company-list__sidebar ${showFilters ? 'company-list__sidebar--show' : ''}`}>
            <div className="company-list__sidebar-header">
              <h3 className="company-list__sidebar-title">Bộ lọc</h3>
              <button
                className="company-list__sidebar-close"
                onClick={() => setShowFilters(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="company-list__filter-group">
              <h4 className="company-list__filter-title">Ngành nghề</h4>
              <input
                type="text"
                className="company-list__filter-input"
                placeholder="Nhập ngành nghề..."
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
              />
            </div>

            <div className="company-list__filter-group">
              <h4 className="company-list__filter-title">Địa điểm</h4>
              <input
                type="text"
                className="company-list__filter-input"
                placeholder="Nhập địa điểm..."
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>

            <button className="company-list__filter-clear" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </aside>

          {/* Company Results */}
          <main className="company-list__main">
            {/* Toolbar */}
            <div className="company-list__toolbar">
              <div className="company-list__toolbar-left">
                <button
                  className="company-list__filter-toggle"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className="fas fa-sliders-h"></i>
                  Bộ lọc
                </button>
                <span className="company-list__result-count">
                  {filteredCompanies.length} công ty
                </span>
              </div>

              <div className="company-list__toolbar-right">
                <div className="company-list__view-toggle">
                  <button
                    className={`company-list__view-button ${
                      viewMode === 'list' ? 'company-list__view-button--active' : ''
                    }`}
                    onClick={() => setViewMode('list')}
                    title="List view"
                  >
                    <i className="fas fa-list"></i>
                  </button>
                  <button
                    className={`company-list__view-button ${
                      viewMode === 'grid' ? 'company-list__view-button--active' : ''
                    }`}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <i className="fas fa-th"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Company Cards */}
            {loading ? (
              <div className="company-list__loading">
                <div className="spinner"></div>
                <p>Đang tải danh sách công ty...</p>
              </div>
            ) : currentCompanies.length > 0 ? (
              <>
                <div className={`company-list__grid company-list__grid--${viewMode}`}>
                  {currentCompanies.map((company) => (
                    <article
                      key={company.id}
                      className="company-list__card"
                      onClick={() => navigate(`/companies/${company.id}`)}
                    >
                      {/* Banner */}
                      <div className="company-list__card-banner">
                        {company.banner ? (
                          <img src={company.banner} alt={company.company_name} />
                        ) : (
                          <div className="company-list__card-banner-placeholder">
                            <i className="fas fa-building"></i>
                          </div>
                        )}
                      </div>

                      {/* Logo */}
                      <div className="company-list__card-logo">
                        {company.logo ? (
                          <img src={company.logo} alt={company.company_name} />
                        ) : (
                          <i className="fas fa-building"></i>
                        )}
                      </div>

                      {/* Content */}
                      <div className="company-list__card-content">
                        <h3 className="company-list__card-title">
                          {company.company_name}
                          {company.verified && (
                            <i className="fas fa-check-circle company-list__verified" title="Đã xác minh"></i>
                          )}
                        </h3>

                        {company.industry && (
                          <p className="company-list__card-industry">
                            <i className="fas fa-industry"></i>
                            {company.industry}
                          </p>
                        )}

                        <div className="company-list__card-details">
                          <div className="company-list__card-detail">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{company.city}</span>
                          </div>
                          {company.company_size && (
                            <div className="company-list__card-detail">
                              <i className="fas fa-users"></i>
                              <span>{getCompanySizeLabel(company.company_size)}</span>
                            </div>
                          )}
                        </div>

                        {company.description && (
                          <p className="company-list__card-description">
                            {company.description.substring(0, 120)}
                            {company.description.length > 120 ? '...' : ''}
                          </p>
                        )}

                        <div className="company-list__card-footer">
                          <div className="company-list__card-jobs">
                            <i className="fas fa-briefcase"></i>
                            <span>{company.job_count || 0} việc làm</span>
                          </div>
                          <button className="company-list__card-button">
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="company-list__pagination">
                    <button
                      className="company-list__pagination-button"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <i className="fas fa-chevron-left"></i> Trước
                    </button>

                    <div className="company-list__pagination-pages">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => paginate(page)}
                              className={`company-list__pagination-page ${
                                currentPage === page ? 'company-list__pagination-page--active' : ''
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="company-list__pagination-dots">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      className="company-list__pagination-button"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Sau <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="company-list__empty">
                <i className="fas fa-building"></i>
                <h3>Không tìm thấy công ty</h3>
                <p>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                <button className="company-list__empty-button" onClick={clearFilters}>
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CompanyList;
