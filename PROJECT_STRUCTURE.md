# 📁 Cấu trúc dự án - Hệ thống quản lý trung tâm luyện thi

## 🗂️ Tổng quan cấu trúc

```
project/
├── 📄 Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── package-lock.json         # Lock file
│   ├── vite.config.ts           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS config
│   ├── postcss.config.js        # PostCSS config
│   ├── eslint.config.js         # ESLint configuration
│   ├── tsconfig.json            # TypeScript config
│   ├── tsconfig.app.json        # App TypeScript config
│   └── tsconfig.node.json       # Node TypeScript config
│
├── 📚 Documentation
│   ├── README.md                # Hướng dẫn cài đặt & sử dụng
│   ├── SYSTEM_FEATURES.md       # Danh sách tính năng chi tiết
│   ├── USER_GUIDE.md           # Hướng dẫn người dùng
│   ├── PERMISSION_GUIDE.md     # Hướng dẫn phân quyền
│   ├── CHANGELOG.md            # Lịch sử thay đổi
│   ├── PROJECT_STATUS.md       # Trạng thái dự án
│   └── PROJECT_STRUCTURE.md    # Cấu trúc dự án (file này)
│
├── 🗄️ Database
│   └── database_setup.sql       # Script setup database
│
├── 🎯 Source Code
│   └── src/
│       ├── 🧩 Components (React Components)
│       ├── 🔧 Context (React Context)
│       ├── 📋 Constants (Hằng số & cấu hình)
│       ├── 📚 Lib (Thư viện & utilities)
│       ├── 🔗 Hooks (Custom React hooks)
│       ├── 📝 Types (TypeScript definitions)
│       └── 🛠️ Utils (Utility functions)
│
└── 🏗️ Build & Deploy
    ├── dist/                    # Build output
    ├── node_modules/           # Dependencies
    ├── index.html              # Entry HTML
    └── supabase/               # Supabase config
```

## 🧩 Components (src/components/)

### 📊 Core Management Components
- **Dashboard.tsx** - Trang tổng quan admin
- **Header.tsx** - Navigation header
- **LoginPage.tsx** - Trang đăng nhập

### 👥 User & Student Management
- **StudentsManager.tsx** - Quản lý học sinh
- **UserManager.tsx** - Quản lý người dùng
- **ProfileManager.tsx** - Quản lý profile cá nhân
- **PermissionManager.tsx** - Quản lý phân quyền

### 🏫 Class & Schedule Management
- **ClassesManager.tsx** - Quản lý lớp học
- **ClassroomManager.tsx** - Quản lý phòng học
- **ScheduleManager.tsx** - Quản lý lịch dạy
- **SubjectsManager.tsx** - Quản lý môn học

### ✅ Attendance & Grading
- **AttendanceManager.tsx** - Quản lý điểm danh
- **GradeManager.tsx** - Quản lý chấm điểm

### 💰 Finance & Assets
- **FinanceManager.tsx** - Quản lý thu chi
- **FinancePublicView.tsx** - Hiển thị thu chi công khai
- **AssetManager.tsx** - Quản lý tài sản
- **AssetCategoryManager.tsx** - Quản lý danh mục tài sản
- **AssetDistributionManager.tsx** - Quản lý phân phối tài sản
- **PublicAssetStats.tsx** - Thống kê tài sản công khai

### 📦 Inventory Management
- **ClassInventoryManager.tsx** - Quản lý kho lớp
- **InventoryCategoryManager.tsx** - Quản lý danh mục kho

### 📢 Communication & Events
- **NotificationManager.tsx** - Quản lý thông báo lịch học
- **EventManager.tsx** - Quản lý sự kiện
- **ActivityReport.tsx** - Báo cáo hoạt động

### 🌐 Public Pages
- **PublicIndexPage.tsx** - Trang chủ công khai
- **PublicPageEditor.tsx** - Chỉnh sửa trang công khai
- **PublicScheduleView.tsx** - Xem lịch học công khai
- **PublicFinanceAndAssets.tsx** - Thu chi & tài sản công khai
- **PublicActivityReport.tsx** - Báo cáo hoạt động công khai

### 📊 Reports & Analytics
- **ReportsManager.tsx** - Quản lý báo cáo
- **DatabaseManager.tsx** - Quản lý database

### 🎨 UI Components
- **Toast.tsx** - Toast notification component
- **ToastContainer.tsx** - Toast container
- **HomePage.tsx** - Trang chủ admin

## 🔧 Context (src/context/)
- **AuthContext.tsx** - Quản lý authentication
- **DataContext.tsx** - Quản lý dữ liệu toàn cục
- **ToastContext.tsx** - Quản lý toast notifications

## 📋 Constants (src/constants/)
- **permissions.ts** - Định nghĩa phân quyền hệ thống

## 📚 Lib (src/lib/)
- **supabase.ts** - Supabase client configuration
- **supabaseService.ts** - Supabase service functions
- **excelExport.ts** - Excel export utilities
- **publicPageSettingsService.ts** - Public page settings service

## 🔗 Hooks (src/hooks/)
- **useToast.ts** - Custom toast hook

## 📝 Types (src/types/)
- **index.ts** - TypeScript type definitions

## 🛠️ Utils (src/utils/)
- **dateUtils.ts** - Date/timezone utilities (Vietnam timezone)
- **wordExport.ts** - Word document export utilities

## 🗄️ Database Schema

### Core Tables:
- **users** - Người dùng & phân quyền
- **students** - Thông tin học sinh
- **classes** - Lớp học
- **classrooms** - Phòng học
- **subjects** - Môn học
- **schedules** - Lịch dạy
- **attendance** - Điểm danh

### Grading System:
- **grade_periods** - Đợt chấm điểm
- **grade_columns** - Cột điểm
- **grades** - Điểm số
- **grade_batches** - Batch điểm

### Finance & Assets:
- **finances** - Thu chi
- **assets** - Tài sản
- **asset_categories** - Danh mục tài sản
- **asset_distributions** - Phân phối tài sản

### Inventory:
- **inventory_categories** - Danh mục kho
- **class_inventory** - Kho lớp

### Events & Reports:
- **events** - Sự kiện
- **activity_reports** - Báo cáo hoạt động

### Settings:
- **public_page_settings** - Cài đặt trang công khai

## 🚀 Key Features

### ✅ Completed Features:
- ✅ User management với phân quyền chi tiết
- ✅ Student management với trạng thái active/inactive
- ✅ Class & classroom management
- ✅ Schedule management với timezone VN
- ✅ Attendance management với permissions
- ✅ Grading system hoàn chỉnh
- ✅ Finance management với public view
- ✅ Asset management với categories & distributions
- ✅ Class inventory management
- ✅ Event management
- ✅ Activity reports với Word export
- ✅ Notification system cho lịch học
- ✅ Public pages với customizable settings
- ✅ Excel/Word export functionality
- ✅ Responsive design cho mobile

### 🎯 Technical Highlights:
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Export**: ExcelJS + DocX
- **Timezone**: Vietnam (UTC+7) support
- **Responsive**: Mobile-first design
- **Performance**: Lazy loading & code splitting

## 📱 Mobile Optimization
- Compact UI components
- Touch-friendly interfaces
- Responsive grid layouts
- Optimized for small screens

## 🔐 Security & Permissions
- Role-based access control (RBAC)
- Granular permissions system
- Secure API endpoints
- Data validation & sanitization

---

*Dự án được tổ chức theo cấu trúc modular, dễ bảo trì và mở rộng. Mỗi component có trách nhiệm rõ ràng và tách biệt.*
