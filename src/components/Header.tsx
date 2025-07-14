import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission, hasGroupPermission } from '../constants/permissions';
import {
  Home,
  Users,
  BookOpen,
  Calendar,
  UserCheck,
  DollarSign,
  Package,
  MessageSquare,
  UserPlus,
  Settings,
  LogOut,
  GraduationCap,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  Database,
  Search,
  Sun,
  Moon,
  Shield,
  Building,
  Award,
  BookMarked,
  PartyPopper,
  Edit3,
  FileText,
  Warehouse,
} from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Header({ activeSection, setActiveSection }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll event listener to detect when page is scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const adminMenuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'students', label: 'Học sinh', icon: GraduationCap },
    { id: 'classes', label: 'Lớp học', icon: BookOpen },
    { id: 'subjects', label: 'Môn học', icon: BookMarked },
    { id: 'classrooms', label: 'Phòng học', icon: Building },
    { id: 'schedules', label: 'Lịch dạy', icon: Calendar },
    { id: 'attendance', label: 'Điểm danh', icon: UserCheck },
    { id: 'grades', label: 'Quản lý điểm', icon: Award },
    { id: 'events', label: 'Sự kiện', icon: PartyPopper },
    { id: 'users', label: 'Tài khoản', icon: Shield },
    { id: 'finances', label: 'Thu chi', icon: DollarSign },
    { id: 'assets', label: 'Tài sản', icon: Package },
    { id: 'class-inventory', label: 'Kho lớp', icon: Warehouse },
    { id: 'notifications', label: 'Thông báo lịch học', icon: MessageSquare },
    { id: 'public-page', label: 'Chỉnh sửa trang chủ', icon: Edit3 },
    { id: 'reports', label: 'Báo cáo thống kê', icon: BarChart3 },
    { id: 'activity-report', label: 'Báo cáo hoạt động sự kiện', icon: FileText },
    { id: 'database', label: 'Cơ sở dữ liệu', icon: Database },
  ];

  const managerMenuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'students', label: 'Học sinh', icon: GraduationCap },
    { id: 'classes', label: 'Lớp học', icon: BookOpen },
    { id: 'subjects', label: 'Môn học', icon: BookMarked },
    { id: 'classrooms', label: 'Phòng học', icon: Building },
    { id: 'schedules', label: 'Lịch dạy', icon: Calendar },
    { id: 'attendance', label: 'Điểm danh', icon: UserCheck },
    { id: 'grades', label: 'Quản lý điểm', icon: Award },
    { id: 'events', label: 'Sự kiện', icon: PartyPopper },
    { id: 'assets', label: 'Tài sản', icon: Package },
    { id: 'notifications', label: 'Thông báo lịch học', icon: MessageSquare },
    { id: 'reports', label: 'Báo cáo thống kê', icon: BarChart3 },
    { id: 'activity-report', label: 'Báo cáo hoạt động', icon: FileText },
  ];

  const teacherMenuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'attendance', label: 'Điểm danh', icon: UserCheck },
    { id: 'grades', label: 'Quản lý điểm', icon: Award },
    { id: 'class-inventory', label: 'Kho lớp', icon: Warehouse },
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: Settings },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminMenuItems;
      case 'manager':
        return getManagerMenuItems();
      case 'teacher':
        return teacherMenuItems;
      case 'volunteer':
        return getVolunteerMenuItems();
      default:
        return [];
    }
  };

  // Tạo menu items cho quản sinh dựa trên quyền
  const getManagerMenuItems = () => {
    const userPermissions = user?.permissions || [];
    const userRole = user?.role;
    const menuItems = [];

    // Tổng quan - luôn có
    if (hasPermission(userPermissions, 'dashboard', userRole)) {
      menuItems.push({ id: 'dashboard', label: 'Tổng quan', icon: Home });
    }

    // Học sinh
    if (hasGroupPermission(userPermissions, 'students', userRole)) {
      menuItems.push({ id: 'students', label: 'Học sinh', icon: GraduationCap });
    }

    // Lớp học
    if (hasGroupPermission(userPermissions, 'classes', userRole)) {
      menuItems.push({ id: 'classes', label: 'Lớp học', icon: BookOpen });
    }

    // Môn học
    if (hasGroupPermission(userPermissions, 'subjects', userRole)) {
      menuItems.push({ id: 'subjects', label: 'Môn học', icon: BookMarked });
    }

    // Phòng học
    if (hasGroupPermission(userPermissions, 'classrooms', userRole)) {
      menuItems.push({ id: 'classrooms', label: 'Phòng học', icon: Building });
    }

    // Lịch dạy
    if (hasGroupPermission(userPermissions, 'schedules', userRole)) {
      menuItems.push({ id: 'schedules', label: 'Lịch dạy', icon: Calendar });
    }

    // Điểm danh
    if (hasGroupPermission(userPermissions, 'attendance', userRole)) {
      menuItems.push({ id: 'attendance', label: 'Điểm danh', icon: UserCheck });
    }

    // Quản lý điểm
    if (hasGroupPermission(userPermissions, 'grades', userRole)) {
      menuItems.push({ id: 'grades', label: 'Quản lý điểm', icon: Award });
    }

    // Sự kiện
    if (hasGroupPermission(userPermissions, 'events', userRole)) {
      menuItems.push({ id: 'events', label: 'Sự kiện', icon: PartyPopper });
    }

    // Tài khoản
    if (hasGroupPermission(userPermissions, 'users', userRole)) {
      menuItems.push({ id: 'users', label: 'Tài khoản', icon: Shield });
    }

    // Thu chi
    if (hasGroupPermission(userPermissions, 'finances', userRole)) {
      menuItems.push({ id: 'finances', label: 'Thu chi', icon: DollarSign });
    }

    // Tài sản
    if (hasGroupPermission(userPermissions, 'assets', userRole)) {
      menuItems.push({ id: 'assets', label: 'Tài sản', icon: Package });
    }

    // Kho lớp
    if (hasGroupPermission(userPermissions, 'class-inventory', userRole)) {
      menuItems.push({ id: 'class-inventory', label: 'Kho lớp', icon: Warehouse });
    }

    // Thông báo lịch học
    if (hasGroupPermission(userPermissions, 'notifications', userRole)) {
      menuItems.push({ id: 'notifications', label: 'Thông báo lịch học', icon: MessageSquare });
    }

    // Báo cáo thống kê
    if (hasGroupPermission(userPermissions, 'reports', userRole)) {
      menuItems.push({ id: 'reports', label: 'Báo cáo thống kê', icon: BarChart3 });
    }

    // Báo cáo hoạt động
    if (hasGroupPermission(userPermissions, 'activity-report', userRole)) {
      menuItems.push({ id: 'activity-report', label: 'Báo cáo hoạt động', icon: FileText });
    }

    // Hồ sơ cá nhân - luôn có
    if (hasGroupPermission(userPermissions, 'profile', userRole)) {
      menuItems.push({ id: 'profile', label: 'Hồ sơ cá nhân', icon: Settings });
    }

    return menuItems;
  };

  // Tạo menu items cho tình nguyện viên dựa trên quyền
  const getVolunteerMenuItems = () => {
    const userPermissions = user?.permissions || [];
    const userRole = user?.role;
    const menuItems = [];

    // Tổng quan - luôn có
    if (hasPermission(userPermissions, 'dashboard', userRole)) {
      menuItems.push({ id: 'dashboard', label: 'Tổng quan', icon: Home });
    }

    // Học sinh
    if (hasGroupPermission(userPermissions, 'students', userRole)) {
      menuItems.push({ id: 'students', label: 'Học sinh', icon: GraduationCap });
    }

    // Lớp học
    if (hasGroupPermission(userPermissions, 'classes', userRole)) {
      menuItems.push({ id: 'classes', label: 'Lớp học', icon: BookOpen });
    }

    // Môn học
    if (hasGroupPermission(userPermissions, 'subjects', userRole)) {
      menuItems.push({ id: 'subjects', label: 'Môn học', icon: BookMarked });
    }

    // Phòng học
    if (hasGroupPermission(userPermissions, 'classrooms', userRole)) {
      menuItems.push({ id: 'classrooms', label: 'Phòng học', icon: Building });
    }

    // Lịch dạy
    if (hasGroupPermission(userPermissions, 'schedules', userRole)) {
      menuItems.push({ id: 'schedules', label: 'Lịch dạy', icon: Calendar });
    }

    // Điểm danh
    if (hasGroupPermission(userPermissions, 'attendance', userRole)) {
      menuItems.push({ id: 'attendance', label: 'Điểm danh', icon: UserCheck });
    }

    // Quản lý điểm
    if (hasGroupPermission(userPermissions, 'grades', userRole)) {
      menuItems.push({ id: 'grades', label: 'Quản lý điểm', icon: Award });
    }

    // Sự kiện
    if (hasGroupPermission(userPermissions, 'events', userRole)) {
      menuItems.push({ id: 'events', label: 'Sự kiện', icon: PartyPopper });
    }

    // Tài khoản
    if (hasGroupPermission(userPermissions, 'users', userRole)) {
      menuItems.push({ id: 'users', label: 'Tài khoản', icon: Shield });
    }

    // Thu chi
    if (hasGroupPermission(userPermissions, 'finances', userRole)) {
      menuItems.push({ id: 'finances', label: 'Thu chi', icon: DollarSign });
    }

    // Tài sản
    if (hasGroupPermission(userPermissions, 'assets', userRole)) {
      menuItems.push({ id: 'assets', label: 'Tài sản', icon: Package });
    }

    // Kho lớp
    if (hasGroupPermission(userPermissions, 'class-inventory', userRole)) {
      menuItems.push({ id: 'class-inventory', label: 'Kho lớp', icon: Warehouse });
    }

    // Thông báo lịch học
    if (hasGroupPermission(userPermissions, 'notifications', userRole)) {
      menuItems.push({ id: 'notifications', label: 'Thông báo lịch học', icon: MessageSquare });
    }

    // Báo cáo thống kê
    if (hasGroupPermission(userPermissions, 'reports', userRole)) {
      menuItems.push({ id: 'reports', label: 'Báo cáo thống kê', icon: BarChart3 });
    }

    // Báo cáo hoạt động
    if (hasGroupPermission(userPermissions, 'activity-report', userRole)) {
      menuItems.push({ id: 'activity-report', label: 'Báo cáo hoạt động', icon: FileText });
    }

    // Hồ sơ cá nhân - luôn có
    if (hasGroupPermission(userPermissions, 'profile', userRole)) {
      menuItems.push({ id: 'profile', label: 'Hồ sơ cá nhân', icon: Settings });
    }

    return menuItems;
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'manager':
        return 'Quản sinh';
      case 'teacher':
        return 'Giáo viên';
      case 'volunteer':
        return 'Tình nguyện viên';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'manager':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'teacher':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'volunteer':
        return 'bg-gradient-to-r from-purple-500 to-violet-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const menuItems = getMenuItems();
  const currentMenuItem = menuItems.find(item => item.id === activeSection);

  // Divide menu items into primary and secondary for desktop view
  const primaryMenuItems = menuItems.slice(0, 7);
  const secondaryMenuItems = menuItems.slice(7);

  return (
    <>
      {/* Main Header */}
      <header className={`bg-white/95 backdrop-blur-xl border-b border-gray-200/50 fixed top-0 left-0 right-0 z-50 ${scrolled ? 'shadow-md' : 'shadow-sm'} transition-all duration-300 animate-slide-in-down`}>
        <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo và Brand */}
            <div className="flex items-center gap-2 sm:gap-4 animate-slide-in-left">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-lg hover-glow hover:scale-110 transition-all duration-300 animate-rotate-in ${getRoleColor(user?.role || '')}`}>
                  <GraduationCap size={20} className="sm:text-2xl animate-heartbeat" />
                </div>
                <div className="hidden sm:block animate-fade-in-delay">
                  <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
                    ClassRoom
                  </h1>
                  <p className="text-xs text-gray-500 font-medium animate-slide-in-right">{getRoleLabel(user?.role || '')}</p>
                </div>
              </div>

              {/* Desktop Navigation - Primary Items */}
              <nav className="hidden lg:flex items-center space-x-1 ml-4 animate-slide-in-right">
                {primaryMenuItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`group flex items-center gap-1 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 hover-lift animate-fade-in animate-stagger-${index + 1} ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md animate-glow'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 hover-scale'
                    }`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <item.icon size={16} className={`transition-transform duration-300 ${activeSection === item.id ? 'animate-bounce-slow' : 'group-hover:rotate-12'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                ))}
                
                {/* More dropdown for secondary items */}
                {secondaryMenuItems.length > 0 && (
                  <div className="relative group animate-fade-in-delay-2">
                    <button className="flex items-center gap-1 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-300 hover-scale">
                      <span>Thêm</span>
                      <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
                    </button>
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 z-50 animate-slide-in-down">
                      {secondaryMenuItems.map((item, index) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-all duration-200 hover-lift animate-slide-in-left ${
                            activeSection === item.id ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                          }`}
                          style={{animationDelay: `${index * 0.05}s`}}
                        >
                          <item.icon size={16} />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </nav>
            </div>

            {/* Right side - Search, User menu */}
            <div className="flex items-center gap-1 sm:gap-2 animate-slide-in-right">
              {/* Search */}
              <div className="hidden md:flex items-center animate-fade-in-delay">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-pulse-slow" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-40 sm:w-56 pl-9 pr-4 py-2 bg-gray-100/80 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 text-sm hover-glow focus:animate-glow"
                  />
                </div>
              </div>

              {/* Current page indicator for mobile */}
              <div className="lg:hidden flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-100/80 rounded-xl text-xs sm:text-sm animate-scale-in">
                {currentMenuItem && (
                  <>
                    <currentMenuItem.icon size={14} className="text-gray-600 animate-bounce-slow" />
                    <span className="font-medium text-gray-900 truncate max-w-[100px] sm:max-w-[150px]">{currentMenuItem.label}</span>
                  </>
                )}
              </div>

              {/* User dropdown */}
              <div className="relative animate-fade-in-delay-2">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-300 hover-scale"
                >
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-md hover-glow animate-heartbeat ${getRoleColor(user?.role || '')}`}>
                    {user?.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[80px]">{user?.name}</p>
                    <p className="text-xs text-gray-500">{getRoleLabel(user?.role || '')}</p>
                  </div>
                  <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                </button>

                {/* User dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 sm:w-72 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-50">
                    <div className="px-4 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white text-lg font-semibold shadow-md ${getRoleColor(user?.role || '')}`}>
                          {user?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 truncate max-w-[180px]">{user?.name}</p>
                          <p className="text-sm text-gray-600 truncate max-w-[180px]">{user?.email}</p>
                          <span className={`inline-block mt-1 px-2 py-1 rounded-lg text-xs font-medium text-white ${getRoleColor(user?.role || '')}`}>
                            {getRoleLabel(user?.role || '')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setActiveSection('profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-all"
                      >
                        <Settings size={16} className="text-gray-400" />
                        <span className="text-gray-700 font-medium">Hồ sơ cá nhân</span>
                      </button>
                      
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-600 hover:bg-red-50 transition-all"
                      >
                        <LogOut size={16} />
                        <span className="font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-1.5 sm:p-2.5 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-200"
              >
                {showMobileMenu ? <X size={18} className="sm:text-xl" /> : <Menu size={18} className="sm:text-xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl">
            <nav className="px-4 py-2 space-y-1 max-h-[60vh] overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
            
            {/* Mobile search */}
            <div className="px-4 pb-4 pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-100/80 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div className="h-14 sm:h-16"></div>

      {/* Overlay for mobile menu */}
      {showMobileMenu && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Overlay for dropdowns */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}