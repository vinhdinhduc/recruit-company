import React from 'react';
import './Footer.scss';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>JobPortal</h3>
            <p>Your gateway to career opportunities</p>
          </div>
          
          <div className="footer-section">
            <h4>For Candidates</h4>
            <ul>
              <li><a href="/jobs">Browse Jobs</a></li>
              <li><a href="/companies">Companies</a></li>
              <li><a href="/my-applications">My Applications</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>For Employers</h4>
            <ul>
              <li><a href="/employer/jobs">Post a Job</a></li>
              <li><a href="/employer/applications">View Applications</a></li>
              <li><a href="/employer/company">Company Profile</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 JobPortal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
