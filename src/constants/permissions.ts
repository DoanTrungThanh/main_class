import { Permission, PermissionGroup } from '../types';

// Định nghĩa tất cả các quyền trong hệ thống
export const PERMISSIONS: Permission[] = [
  // Dashboard
  { id: 'dashboard', name: 'Tổng quan', description: 'Xem trang tổng quan', group: 'dashboard' },
  
  // Quản lý học sinh
  { id: 'students.view', name: 'Xem học sinh', description: 'Xem danh sách học sinh', group: 'students' },
  { id: 'students.create', name: 'Thêm học sinh', description: 'Thêm học sinh mới', group: 'students' },
  { id: 'students.edit', name: 'Sửa học sinh', description: 'Chỉnh sửa thông tin học sinh', group: 'students' },
  { id: 'students.delete', name: 'Xóa học sinh', description: 'Xóa học sinh', group: 'students' },
  
  // Quản lý lớp học
  { id: 'classes.view', name: 'Xem lớp học', description: 'Xem danh sách lớp học', group: 'classes' },
  { id: 'classes.create', name: 'Thêm lớp học', description: 'Tạo lớp học mới', group: 'classes' },
  { id: 'classes.edit', name: 'Sửa lớp học', description: 'Chỉnh sửa thông tin lớp học', group: 'classes' },
  { id: 'classes.delete', name: 'Xóa lớp học', description: 'Xóa lớp học', group: 'classes' },
  
  // Quản lý môn học
  { id: 'subjects.view', name: 'Xem môn học', description: 'Xem danh sách môn học', group: 'subjects' },
  { id: 'subjects.create', name: 'Thêm môn học', description: 'Thêm môn học mới', group: 'subjects' },
  { id: 'subjects.edit', name: 'Sửa môn học', description: 'Chỉnh sửa thông tin môn học', group: 'subjects' },
  { id: 'subjects.delete', name: 'Xóa môn học', description: 'Xóa môn học', group: 'subjects' },
  
  // Quản lý phòng học
  { id: 'classrooms.view', name: 'Xem phòng học', description: 'Xem danh sách phòng học', group: 'classrooms' },
  { id: 'classrooms.create', name: 'Thêm phòng học', description: 'Thêm phòng học mới', group: 'classrooms' },
  { id: 'classrooms.edit', name: 'Sửa phòng học', description: 'Chỉnh sửa thông tin phòng học', group: 'classrooms' },
  { id: 'classrooms.delete', name: 'Xóa phòng học', description: 'Xóa phòng học', group: 'classrooms' },
  
  // Quản lý lịch dạy
  { id: 'schedules.view', name: 'Xem lịch dạy', description: 'Xem lịch dạy', group: 'schedules' },
  { id: 'schedules.create', name: 'Thêm lịch dạy', description: 'Tạo lịch dạy mới', group: 'schedules' },
  { id: 'schedules.edit', name: 'Sửa lịch dạy', description: 'Chỉnh sửa lịch dạy', group: 'schedules' },
  { id: 'schedules.delete', name: 'Xóa lịch dạy', description: 'Xóa lịch dạy', group: 'schedules' },
  
  // Điểm danh
  { id: 'attendance.view', name: 'Xem điểm danh', description: 'Xem thông tin điểm danh', group: 'attendance' },
  { id: 'attendance.create', name: 'Điểm danh', description: 'Thực hiện điểm danh học sinh', group: 'attendance' },
  { id: 'attendance.edit', name: 'Sửa điểm danh', description: 'Chỉnh sửa thông tin điểm danh', group: 'attendance' },
  
  // Quản lý điểm
  { id: 'grades.view', name: 'Xem điểm', description: 'Xem điểm số học sinh', group: 'grades' },
  { id: 'grades.create', name: 'Nhập điểm', description: 'Nhập điểm cho học sinh', group: 'grades' },
  { id: 'grades.edit', name: 'Sửa điểm', description: 'Chỉnh sửa điểm số', group: 'grades' },
  { id: 'grades.manage', name: 'Quản lý đợt điểm', description: 'Tạo và quản lý đợt điểm', group: 'grades' },
  
  // Sự kiện
  { id: 'events.view', name: 'Xem sự kiện', description: 'Xem danh sách sự kiện', group: 'events' },
  { id: 'events.create', name: 'Thêm sự kiện', description: 'Tạo sự kiện mới', group: 'events' },
  { id: 'events.edit', name: 'Sửa sự kiện', description: 'Chỉnh sửa thông tin sự kiện', group: 'events' },
  { id: 'events.delete', name: 'Xóa sự kiện', description: 'Xóa sự kiện', group: 'events' },
  
  // Quản lý tài khoản
  { id: 'users.view', name: 'Xem tài khoản', description: 'Xem danh sách tài khoản', group: 'users' },
  { id: 'users.create', name: 'Thêm tài khoản', description: 'Tạo tài khoản mới', group: 'users' },
  { id: 'users.edit', name: 'Sửa tài khoản', description: 'Chỉnh sửa thông tin tài khoản', group: 'users' },
  { id: 'users.delete', name: 'Xóa tài khoản', description: 'Xóa tài khoản', group: 'users' },
  
  // Thu chi
  { id: 'finances.view', name: 'Xem thu chi', description: 'Xem thông tin thu chi', group: 'finances' },
  { id: 'finances.create', name: 'Thêm thu chi', description: 'Thêm giao dịch thu chi', group: 'finances' },
  { id: 'finances.edit', name: 'Sửa thu chi', description: 'Chỉnh sửa giao dịch thu chi', group: 'finances' },
  { id: 'finances.delete', name: 'Xóa thu chi', description: 'Xóa giao dịch thu chi', group: 'finances' },
  
  // Tài sản
  { id: 'assets.view', name: 'Xem tài sản', description: 'Xem thông tin tài sản', group: 'assets' },
  { id: 'assets.create', name: 'Thêm tài sản', description: 'Thêm tài sản mới', group: 'assets' },
  { id: 'assets.edit', name: 'Sửa tài sản', description: 'Chỉnh sửa thông tin tài sản', group: 'assets' },
  { id: 'assets.delete', name: 'Xóa tài sản', description: 'Xóa tài sản', group: 'assets' },
  
  // Thông báo lịch học
  { id: 'notifications.view', name: 'Xem thông báo', description: 'Xem thông báo lịch học', group: 'notifications' },
  { id: 'notifications.create', name: 'Tạo thông báo', description: 'Tạo thông báo lịch học', group: 'notifications' },
  
  // Báo cáo
  { id: 'reports.view', name: 'Xem báo cáo', description: 'Xem các báo cáo', group: 'reports' },
  { id: 'reports.create', name: 'Tạo báo cáo', description: 'Tạo báo cáo mới', group: 'reports' },
  { id: 'reports.edit', name: 'Sửa báo cáo', description: 'Chỉnh sửa báo cáo', group: 'reports' },
  { id: 'reports.delete', name: 'Xóa báo cáo', description: 'Xóa báo cáo', group: 'reports' },
  
  // Báo cáo hoạt động
  { id: 'activity-report.view', name: 'Xem báo cáo hoạt động', description: 'Xem báo cáo hoạt động', group: 'activity-report' },
  { id: 'activity-report.create', name: 'Tạo báo cáo hoạt động', description: 'Tạo báo cáo hoạt động', group: 'activity-report' },
  { id: 'activity-report.edit', name: 'Sửa báo cáo hoạt động', description: 'Chỉnh sửa báo cáo hoạt động', group: 'activity-report' },
  { id: 'activity-report.delete', name: 'Xóa báo cáo hoạt động', description: 'Xóa báo cáo hoạt động', group: 'activity-report' },

  // Quản lý kho lớp
  { id: 'class-inventory.view', name: 'Xem kho lớp', description: 'Xem thông tin kho lớp', group: 'class-inventory' },
  { id: 'class-inventory.create', name: 'Thêm vật phẩm', description: 'Thêm vật phẩm vào kho lớp', group: 'class-inventory' },
  { id: 'class-inventory.edit', name: 'Sửa vật phẩm', description: 'Chỉnh sửa thông tin vật phẩm', group: 'class-inventory' },
  { id: 'class-inventory.delete', name: 'Xóa vật phẩm', description: 'Xóa vật phẩm khỏi kho lớp', group: 'class-inventory' },

  // Hồ sơ cá nhân
  { id: 'profile.view', name: 'Xem hồ sơ', description: 'Xem hồ sơ cá nhân', group: 'profile' },
  { id: 'profile.edit', name: 'Sửa hồ sơ', description: 'Chỉnh sửa hồ sơ cá nhân', group: 'profile' },
];

// Định nghĩa các nhóm chức năng
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'dashboard',
    name: 'Tổng quan',
    description: 'Truy cập trang tổng quan hệ thống',
    permissions: ['dashboard']
  },
  {
    id: 'students',
    name: 'Quản lý học sinh',
    description: 'Quản lý thông tin học sinh',
    permissions: ['students.view', 'students.create', 'students.edit', 'students.delete']
  },
  {
    id: 'classes',
    name: 'Quản lý lớp học',
    description: 'Quản lý thông tin lớp học',
    permissions: ['classes.view', 'classes.create', 'classes.edit', 'classes.delete']
  },
  {
    id: 'subjects',
    name: 'Quản lý môn học',
    description: 'Quản lý thông tin môn học',
    permissions: ['subjects.view', 'subjects.create', 'subjects.edit', 'subjects.delete']
  },
  {
    id: 'classrooms',
    name: 'Quản lý phòng học',
    description: 'Quản lý thông tin phòng học',
    permissions: ['classrooms.view', 'classrooms.create', 'classrooms.edit', 'classrooms.delete']
  },
  {
    id: 'schedules',
    name: 'Quản lý lịch dạy',
    description: 'Quản lý lịch dạy và thời khóa biểu',
    permissions: ['schedules.view', 'schedules.create', 'schedules.edit', 'schedules.delete']
  },
  {
    id: 'attendance',
    name: 'Điểm danh học sinh',
    description: 'Thực hiện và quản lý điểm danh học sinh',
    permissions: ['attendance.view', 'attendance.create', 'attendance.edit']
  },
  {
    id: 'grades',
    name: 'Quản lý điểm số',
    description: 'Quản lý điểm số và đánh giá học sinh',
    permissions: ['grades.view', 'grades.create', 'grades.edit', 'grades.manage']
  },
  {
    id: 'events',
    name: 'Quản lý sự kiện',
    description: 'Quản lý các sự kiện và hoạt động',
    permissions: ['events.view', 'events.create', 'events.edit', 'events.delete']
  },
  {
    id: 'users',
    name: 'Quản lý tài khoản',
    description: 'Quản lý tài khoản người dùng',
    permissions: ['users.view', 'users.create', 'users.edit', 'users.delete']
  },
  {
    id: 'finances',
    name: 'Quản lý thu chi',
    description: 'Quản lý tài chính và giao dịch',
    permissions: ['finances.view', 'finances.create', 'finances.edit', 'finances.delete']
  },
  {
    id: 'assets',
    name: 'Quản lý tài sản',
    description: 'Quản lý tài sản và thiết bị',
    permissions: ['assets.view', 'assets.create', 'assets.edit', 'assets.delete']
  },
  {
    id: 'notifications',
    name: 'Thông báo lịch học',
    description: 'Tạo và gửi thông báo lịch học',
    permissions: ['notifications.view', 'notifications.create']
  },
  {
    id: 'reports',
    name: 'Báo cáo',
    description: 'Tạo và quản lý các báo cáo',
    permissions: ['reports.view', 'reports.create', 'reports.edit', 'reports.delete']
  },
  {
    id: 'activity-report',
    name: 'Báo cáo hoạt động',
    description: 'Tạo và quản lý báo cáo hoạt động sự kiện',
    permissions: ['activity-report.view', 'activity-report.create', 'activity-report.edit', 'activity-report.delete']
  },
  {
    id: 'class-inventory',
    name: 'Quản lý kho lớp',
    description: 'Quản lý vật phẩm và thiết bị trong lớp học',
    permissions: ['class-inventory.view', 'class-inventory.create', 'class-inventory.edit', 'class-inventory.delete']
  },
  {
    id: 'profile',
    name: 'Hồ sơ cá nhân',
    description: 'Quản lý thông tin cá nhân',
    permissions: ['profile.view', 'profile.edit']
  }
];

// Các nhóm quyền mặc định cho từng vai trò
export const DEFAULT_ROLE_PERMISSIONS = {
  admin: PERMISSIONS.map(p => p.id), // Admin có tất cả quyền
  manager: [
    // Manager có tất cả quyền NGOẠI TRỪ finances và assets (cần được cấp riêng)
    'dashboard',
    'students.view', 'students.create', 'students.edit', 'students.delete',
    'classes.view', 'classes.create', 'classes.edit', 'classes.delete',
    'subjects.view', 'subjects.create', 'subjects.edit', 'subjects.delete',
    'classrooms.view', 'classrooms.create', 'classrooms.edit', 'classrooms.delete',
    'schedules.view', 'schedules.create', 'schedules.edit', 'schedules.delete',
    'attendance.view', 'attendance.create', 'attendance.edit',
    'grades.view', 'grades.create', 'grades.edit', 'grades.manage',
    'events.view', 'events.create', 'events.edit', 'events.delete',
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'notifications.view', 'notifications.create',
    'reports.view', 'reports.create', 'reports.edit', 'reports.delete',
    'activity-report.view', 'activity-report.create', 'activity-report.edit', 'activity-report.delete',
    'class-inventory.view', 'class-inventory.create', 'class-inventory.edit', 'class-inventory.delete',
    'profile.view', 'profile.edit'
    // Note: finances.* và assets.* không có - cần được Admin cấp riêng
  ],
  teacher: [
    'dashboard',
    'attendance.view', 'attendance.create', 'attendance.edit',
    'grades.view', 'grades.create', 'grades.edit',
    'class-inventory.view', 'class-inventory.create', 'class-inventory.edit', 'class-inventory.delete',
    'profile.view', 'profile.edit'
  ],
  volunteer: [
    // Tình nguyện viên có quyền cơ bản và quản lý kho lớp
    'dashboard',
    'class-inventory.view', 'class-inventory.create', 'class-inventory.edit', 'class-inventory.delete',
    'profile.view', 'profile.edit'
  ]
};

// Hàm kiểm tra quyền
export const hasPermission = (userPermissions: string[] = [], requiredPermission: string, userRole?: string): boolean => {
  // Admin có tất cả quyền
  if (userRole === 'admin') {
    return true;
  }

  // Manager có tất cả quyền NGOẠI TRỪ finances và assets (cần được cấp riêng)
  if (userRole === 'manager') {
    const restrictedPermissions = [
      'finances.view', 'finances.create', 'finances.edit', 'finances.delete',
      'assets.view', 'assets.create', 'assets.edit', 'assets.delete'
    ];

    // Nếu là quyền bị hạn chế, kiểm tra trong permissions array
    if (restrictedPermissions.includes(requiredPermission)) {
      return userPermissions.includes(requiredPermission);
    }

    // Các quyền khác thì Manager tự động có
    return true;
  }

  return userPermissions.includes(requiredPermission);
};

// Hàm kiểm tra quyền theo nhóm
export const hasGroupPermission = (userPermissions: string[] = [], groupId: string, userRole?: string): boolean => {
  // Admin có tất cả quyền
  if (userRole === 'admin') {
    return true;
  }

  // Manager có tất cả quyền NGOẠI TRỪ finances và assets
  if (userRole === 'manager') {
    const restrictedGroups = ['finances', 'assets'];

    // Nếu là nhóm bị hạn chế, kiểm tra trong permissions array
    if (restrictedGroups.includes(groupId)) {
      const group = PERMISSION_GROUPS.find(g => g.id === groupId);
      if (!group) return false;
      return group.permissions.some(permission => userPermissions.includes(permission));
    }

    // Các nhóm khác thì Manager tự động có
    return true;
  }

  const group = PERMISSION_GROUPS.find(g => g.id === groupId);
  if (!group) return false;

  return group.permissions.some(permission => userPermissions.includes(permission));
};

// Hàm lấy quyền theo vai trò
export const getPermissionsByRole = (role: string): string[] => {
  return DEFAULT_ROLE_PERMISSIONS[role as keyof typeof DEFAULT_ROLE_PERMISSIONS] || [];
};

// Hàm lấy effective permissions với fallback cho teacher
export const getEffectivePermissions = (userPermissions: string[] = [], userRole?: string): string[] => {
  // Nếu là teacher và không có permissions, sử dụng permissions mặc định
  if (userRole === 'teacher' && userPermissions.length === 0) {
    return getPermissionsByRole('teacher');
  }
  return userPermissions;
};
