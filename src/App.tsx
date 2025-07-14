import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import PublicIndexPage from './components/PublicIndexPage';
import StudentsManager from './components/StudentsManager';
import ClassesManager from './components/ClassesManager';
import ClassroomManager from './components/ClassroomManager';
import ScheduleManager from './components/ScheduleManager';
import AttendanceManager from './components/AttendanceManager';

import UserManager from './components/UserManager';
import FinanceManager from './components/FinanceManager';
import AssetManager from './components/AssetManager';
import NotificationManager from './components/NotificationManager';
import ReportsManager from './components/ReportsManager';
import ProfileManager from './components/ProfileManager';
import DatabaseManager from './components/DatabaseManager';
import GradeManager from './components/GradeManager';
import SubjectsManager from './components/SubjectsManager';
import EventManager from './components/EventManager';
import PublicPageEditor from './components/PublicPageEditor';
import ActivityReport from './components/ActivityReport';
import ClassInventoryManager from './components/ClassInventoryManager';

function App() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return (
        <ToastProvider>
          <LoginPage onBackClick={() => setShowLogin(false)} />
        </ToastProvider>
      );
    }

    return (
      <ToastProvider>
        <PublicIndexPage onLoginClick={() => setShowLogin(true)} />
      </ToastProvider>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <HomePage />;
      case 'reports':
        return <ReportsManager />;
      case 'activity-report':
        return <ActivityReport />;
      case 'students':
        return <StudentsManager />;
      case 'classes':
        return <ClassesManager />;
      case 'subjects':
        return <SubjectsManager />;
      case 'classrooms':
        return <ClassroomManager />;
      case 'schedules':
        return <ScheduleManager />;
      case 'attendance':
        return <AttendanceManager />;
      case 'grades':
        return <GradeManager />;
      case 'events':
        return <EventManager />;
      case 'users':
        return <UserManager />;
      case 'finances':
        return <FinanceManager />;
      case 'assets':
        return <AssetManager />;
      case 'class-inventory':
        return <ClassInventoryManager />;
      case 'notifications':
        return <NotificationManager />;
      case 'public-page':
        return <PublicPageEditor />;
      case 'profile':
        return <ProfileManager />;
      case 'database':
        return <DatabaseManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Header activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 mt-2">
          {renderContent()}
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;