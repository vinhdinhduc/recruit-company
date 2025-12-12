import React from 'react';
import './LoadingSpinner.scss';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = 'medium',
  text = 'Đang tải...',
}) => {
  if (fullScreen) {
    return (
      <div className="loading-spinner-fullscreen">
        <div className="spinner-container">
          <div className={`spinner spinner--${size}`}>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          {text && <p className="loading-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-spinner">
      <div className={`spinner spinner--${size}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
