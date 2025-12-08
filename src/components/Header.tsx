import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.scss';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>JobPortal</h1>
          </Link>

          <nav className="nav">
            <Link to="/jobs" className="nav-link">Jobs</Link>
            <Link to="/companies" className="nav-link">Companies</Link>
            
            {user ? (
              <>
                {user.role === 'candidate' && (
                  <>
                    <Link to="/my-applications" className="nav-link">My Applications</Link>
                    <Link to="/saved-jobs" className="nav-link">Saved Jobs</Link>
                  </>
                )}
                
                {user.role === 'employer' && (
                  <>
                    <Link to="/employer/jobs" className="nav-link">My Jobs</Link>
                    <Link to="/employer/applications" className="nav-link">Applications</Link>
                    <Link to="/employer/company" className="nav-link">Company</Link>
                  </>
                )}
                
                <div className="user-menu">
                  <span className="user-name">{user.full_name}</span>
                  <div className="dropdown">
                    <Link to="/profile" className="dropdown-item">Profile</Link>
                    <button onClick={logout} className="dropdown-item">Logout</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
