import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './MainLayout.scss';

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-layout__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
