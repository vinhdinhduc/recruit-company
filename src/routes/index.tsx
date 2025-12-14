import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ManageApplications from '../pages/admin/ManageApplications';

// Public Pages (Lazy loaded)
const Home = lazy(() => import('../pages/home/Home'));
const JobList = lazy(() => import('../pages/jobs/JobList'));
const JobDetail = lazy(() => import('../pages/jobs/JobDetail'));
const CompanyList = lazy(() => import('../pages/companies/CompanyList'));
const CompanyDetail = lazy(() => import('../pages/companies/CompanyDetail'));

// Auth Pages
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

// Candidate Pages
const CandidateDashboard = lazy(() => import('../pages/candidate/Dashboard'));
const CandidateProfile = lazy(() => import('../pages/candidate/Profile'));
const MyApplications = lazy(() => import('../pages/candidate/MyApplications'));
const SavedJobs = lazy(() => import('../pages/candidate/SavedJobs'));
const MyResume = lazy(() => import('../pages/candidate/MyResume'));

// Employer Pages
const EmployerDashboard = lazy(() => import('../pages/employer/Dashboard'));
const EmployerProfile = lazy(() => import('../pages/employer/Profile'));
const PostJob = lazy(() => import('../pages/employer/PostJob'));
const ManageJobs = lazy(() => import('../pages/employer/ManageJobs'));
const Applications = lazy(() => import('../pages/employer/Applications'));
const CompanyProfile = lazy(() => import('../pages/employer/CompanyProfile'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const ManageUsers = lazy(() => import('../pages/admin/ManageUsers'));
const ManageCompanies = lazy(() => import('../pages/admin/ManageCompanies'));
const ManageCategories = lazy(() => import('../pages/admin/ManageCategories'));

// Error Pages
const NotFound = lazy(() => import('../pages/errors/NotFound'));
const Unauthorized = lazy(() => import('../pages/errors/Unauthorized'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public Routes with Main Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/companies" element={<CompanyList />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
        </Route>

        {/* Auth Routes with Auth Layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* Candidate Routes */}
        <Route
          path="/candidate"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <DashboardLayout userType="candidate" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/candidate/dashboard" replace />} />
          <Route path="dashboard" element={<CandidateDashboard />} />
          <Route path="profile" element={<CandidateProfile />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
          <Route path="resume" element={<MyResume />} />
        </Route>

        {/* Employer Routes */}
        <Route
          path="/employer"
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <DashboardLayout userType="employer" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/employer/dashboard" replace />} />
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route path="profile" element={<EmployerProfile />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="jobs" element={<ManageJobs />} />
          <Route path="jobs/:id/edit" element={<PostJob />} />
          <Route path="applications" element={<Applications />} />
          <Route path="company" element={<CompanyProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout userType="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="companies" element={<ManageCompanies />} />
          <Route path="jobs" element={<ManageJobs />} />
          <Route path="applications" element={<ManageApplications />} />
          <Route path="categories" element={<ManageCategories />} />
        </Route>

        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
