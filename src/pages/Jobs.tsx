import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import './Jobs.scss';

interface Job {
  id: number;
  title: string;
  company: {
    company_name: string;
    logo: string;
    city: string;
  };
  location: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  created_at: string;
}

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    job_type: '',
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getJobs(filters);
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="jobs-page">
      <div className="container">
        <h1>Find Your Next Job</h1>

        <div className="filters">
          <input
            type="text"
            name="search"
            placeholder="Search jobs..."
            value={filters.search}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="city"
            placeholder="City..."
            value={filters.city}
            onChange={handleFilterChange}
          />
          <select name="job_type" value={filters.job_type} onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <Link to={`/jobs/${job.id}`} key={job.id} className="job-card">
                <div className="job-header">
                  {job.company.logo && (
                    <img src={job.company.logo} alt={job.company.company_name} className="company-logo" />
                  )}
                  <div>
                    <h3>{job.title}</h3>
                    <p className="company-name">{job.company.company_name}</p>
                  </div>
                </div>
                <div className="job-details">
                  <span className="location">📍 {job.location || job.company.city}</span>
                  <span className="job-type">{job.job_type}</span>
                </div>
                {job.salary_min && job.salary_max && (
                  <p className="salary">
                    💰 ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
