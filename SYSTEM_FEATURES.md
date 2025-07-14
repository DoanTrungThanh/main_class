# HỆ THỐNG QUẢN LÝ LUYỆN THI TOÁN BỒI BỔNG (QL LHTTBB)

## 📋 TỔNG QUAN HỆ THỐNG

Hệ thống quản lý toàn diện cho trung tâm luyện thi toán bồi bổng, hỗ trợ quản lý học sinh, lớp học, lịch dạy, điểm danh, chấm điểm, tài chính và tài sản.

---

## 🔐 HỆ THỐNG PHÂN QUYỀN

### **Vai trò người dùng:**
- **👑 Admin**: Toàn quyền quản lý hệ thống
- **👨‍💼 Manager**: Quản lý theo nhóm quyền được cấp
- **👨‍🏫 Teacher**: Giảng dạy và nhập điểm
- **🤝 Volunteer**: Hỗ trợ theo quyền được cấp

### **Nhóm quyền chính:**
- **📚 Classes**: Quản lý lớp học
- **👥 Students**: Quản lý học sinh  
- **📅 Schedules**: Quản lý lịch dạy
- **✅ Attendance**: Quản lý điểm danh
- **📊 Grades**: Quản lý chấm điểm
- **💰 Finances**: Quản lý thu chi
- **📦 Assets**: Quản lý tài sản
- **📢 Notifications**: Quản lý thông báo
- **📄 Reports**: Quản lý báo cáo

---

## 🏠 TRANG CHỦ CÔNG KHAI

### **Thống kê hiển thị:**
- 📊 Tổng số lớp học đang hoạt động
- 👥 Phân bố độ tuổi học sinh (chi tiết từng tuổi)
- 📅 Lịch dạy tuần hiện tại
- 💰 Tóm tắt tài chính (thu/chi/quyên góp)
- 📦 Thống kê tài sản (nhận/phân phối)

### **Tính năng công khai:**
- 🔍 Xem lịch dạy theo tuần
- 📊 Tra cứu thông tin tài chính
- 📦 Xem thống kê tài sản
- 📄 Đọc báo cáo hoạt động

---

## 👥 QUẢN LÝ HỌC SINH

### **Thông tin học sinh:**
- 📝 Thông tin cá nhân (họ tên, ngày sinh, giới tính)
- 📞 Thông tin liên hệ (SĐT phụ huynh, địa chỉ)
- 🏫 Thông tin học tập (trường, lớp)
- ⚡ Trạng thái (đang học/nghỉ học)

### **Tính năng:**
- ➕ Thêm/sửa/xóa học sinh
- 🔍 Tìm kiếm và lọc theo nhiều tiêu chí
- 📊 Xuất danh sách Excel
- 📈 Thống kê theo độ tuổi, trạng thái

---

## 🏫 QUẢN LÝ LỚP HỌC

### **Thông tin lớp:**
- 📚 Tên lớp và mô tả
- 👨‍🏫 Giáo viên phụ trách
- 📖 Môn học
- 👥 Danh sách học sinh
- ⚡ Trạng thái hoạt động

### **Tính năng:**
- ➕ Tạo/chỉnh sửa lớp học
- 👥 Quản lý học sinh trong lớp
- 📊 Thống kê lớp học
- 📄 Xuất thông tin lớp

---

## 📅 QUẢN LÝ LỊCH DẠY

### **Thông tin lịch:**
- 📅 Ngày và thời gian dạy
- 🏫 Lớp học và phòng học
- 👨‍🏫 Giáo viên phụ trách
- 📖 Môn học
- 🕐 Ca dạy (sáng/chiều/tối)

### **Tính năng:**
- ➕ Tạo/sửa/xóa lịch dạy
- 📋 Xem lịch theo tuần (dạng lưới)
- 📊 Xuất lịch dạy Excel
- 📱 Tạo thông báo lịch học
- 📅 Copy lịch tuần
- 🔍 Tìm kiếm và lọc lịch

### **Hiển thị công khai:**
- 📅 Lịch tuần trên trang chủ
- 🔄 Điều hướng tuần trước/sau
- 📱 Responsive trên mobile

---

## ✅ QUẢN LÝ ĐIỂM DANH

### **Chức năng điểm danh:**
- ✅ Điểm danh theo lịch dạy
- 📊 Trạng thái: Có mặt/Vắng/Đi muộn
- ⏰ Ghi nhận thời gian check-in
- 📝 Ghi chú cho từng học sinh

### **Báo cáo điểm danh:**
- 📊 Thống kê theo lớp/học sinh
- 📅 Báo cáo theo khoảng thời gian
- 📄 Xuất báo cáo Excel
- 📈 Tỷ lệ tham gia học tập

---

## 📊 QUẢN LÝ CHẤM ĐIỂM

### **Hệ thống chấm điểm:**
- 📋 Tạo đợt chấm điểm
- 📊 Tạo cột điểm cho từng đợt
- 📝 Nhập điểm cho học sinh
- ⚖️ Tính điểm trung bình có trọng số

### **Phân quyền chấm điểm:**
- 👑 Admin: Quản lý đợt điểm và cột điểm
- 👨‍🏫 Teacher: Chỉ nhập điểm
- ⏰ Kiểm soát thời gian nhập điểm

### **Báo cáo điểm:**
- 📊 Bảng điểm chi tiết
- 📈 Thống kê điểm trung bình
- 📄 Xuất bảng điểm Excel

---

## 💰 QUẢN LÝ THU CHI

### **Quản lý giao dịch:**
- 💵 Thu nhập (học phí, tài trợ, phụ cấp)
- 💸 Chi tiêu (lương, vật tư, hoạt động)
- 📊 Phân loại theo danh mục
- 📅 Theo dõi theo thời gian

### **Tính năng:**
- ➕ Thêm/sửa/xóa giao dịch
- 🔍 Tìm kiếm và lọc
- 📊 Thống kê tổng quan
- 📄 Xuất báo cáo Excel
- 📅 Lọc theo tháng/khoảng thời gian

### **Hiển thị công khai:**
- 💰 Tổng thu/chi trên trang chủ
- 🔍 Tra cứu công khai
- 📊 Thống kê minh bạch

---

## 📦 QUẢN LÝ TÀI SẢN

### **Quản lý danh mục:**
- 📂 Tạo/sửa/xóa danh mục tài sản
- 🏷️ Phân loại tài sản theo nhóm

### **Nhận tài sản:**
- 📦 Ghi nhận tài sản nhận được
- 📅 Ngày nhận và nguồn gốc
- 📊 Số lượng và trạng thái
- 📝 Mô tả chi tiết

### **Phân phối tài sản:**
- 📤 Quản lý việc phân phối
- 👥 Người nhận và mục đích
- 📅 Thời gian phân phối
- ⚡ Trạng thái phân phối

### **Hiển thị công khai:**
- 📊 Thống kê tài sản trên trang chủ
- 📦 Tài sản có sẵn/đã phân phối
- 📈 Báo cáo minh bạch

---

## 📢 QUẢN LÝ THÔNG BÁO

### **Thông báo lịch học:**
- 📅 Tạo thông báo theo ngày
- 📱 Format chuẩn cho chia sẻ
- 🕐 Phân chia theo ca (sáng/chiều/tối)
- 👨‍🏫 Thông tin giáo viên và phòng học

### **Tính năng:**
- 📋 Tạo thông báo tự động
- 📝 Chỉnh sửa nội dung
- 📱 Copy để chia sẻ
- 📅 Điều hướng theo ngày

---

## 📄 QUẢN LÝ BÁO CÁO

### **Báo cáo hoạt động:**
- 📝 Tạo báo cáo sự kiện
- 📄 Nội dung chi tiết hoạt động
- 📅 Thời gian tạo báo cáo
- 🌐 Hiển thị công khai

### **Tính năng:**
- ➕ Thêm/sửa/xóa báo cáo
- 📄 Xuất file Word (UTF-8)
- 🔍 Tìm kiếm báo cáo
- 📊 Quản lý trạng thái công khai

---

## 🛠️ TÍNH NĂNG KỸ THUẬT

### **Múi giờ:**
- 🇻🇳 Hỗ trợ múi giờ Việt Nam (UTC+7)
- ⏰ Hiển thị thời gian chính xác
- 📅 Tính toán tuần theo lịch VN

### **Xuất dữ liệu:**
- 📊 Excel: Học sinh, lịch dạy, điểm danh, tài chính
- 📄 Word: Báo cáo hoạt động
- 🔤 UTF-8: Hỗ trợ tiếng Việt đầy đủ

### **Giao diện:**
- 📱 Responsive design
- 🎨 UI/UX thân thiện
- 🔍 Tìm kiếm và lọc mạnh mẽ
- 📊 Thống kê trực quan

### **Bảo mật:**
- 🔐 Phân quyền chi tiết
- 🛡️ Kiểm tra quyền nhiều lớp
- 🚫 Ẩn chức năng không có quyền
- ⚠️ Thông báo lỗi phân quyền

---

## 🗄️ CƠ SỞ DỮ LIỆU

### **Lưu trữ:**
- ☁️ Supabase (PostgreSQL)
- 🔄 Đồng bộ real-time
- 💾 Backup tự động
- 🔒 Bảo mật cao

### **Cấu trúc:**
- 👥 Users & Permissions
- 🏫 Classes & Students
- 📅 Schedules & Attendance
- 📊 Grades & Finance
- 📦 Assets & Reports

---

## 🚀 TRIỂN KHAI

### **Môi trường phát triển:**
- ⚛️ React + TypeScript
- 🎨 Tailwind CSS
- ⚡ Vite build tool
- 📦 NPM package manager

### **Hosting:**
- 🌐 Static hosting (Vercel/Netlify)
- ☁️ Database: Supabase
- 📱 PWA ready
- 🔄 Auto deployment

---

---

## 📁 CẤU TRÚC DỰ ÁN

```
src/
├── components/           # React Components
│   ├── ActivityReport.tsx       # Báo cáo hoạt động
│   ├── AssetManager.tsx         # Quản lý tài sản
│   ├── AttendanceManager.tsx    # Quản lý điểm danh
│   ├── ClassesManager.tsx       # Quản lý lớp học
│   ├── Dashboard.tsx            # Trang tổng quan
│   ├── EventManager.tsx         # Quản lý sự kiện
│   ├── FinanceManager.tsx       # Quản lý thu chi
│   ├── GradeManager.tsx         # Quản lý chấm điểm
│   ├── Header.tsx               # Header navigation
│   ├── HomePage.tsx             # Trang chủ admin
│   ├── LoginPage.tsx            # Trang đăng nhập
│   ├── NotificationManager.tsx  # Quản lý thông báo
│   ├── PublicIndexPage.tsx      # Trang chủ công khai
│   ├── ReportsManager.tsx       # Báo cáo thống kê
│   ├── ScheduleManager.tsx      # Quản lý lịch dạy
│   ├── StudentsManager.tsx      # Quản lý học sinh
│   └── UserManager.tsx          # Quản lý người dùng
├── context/              # React Context
│   ├── AuthContext.tsx          # Authentication
│   ├── DataContext.tsx          # Data management
│   └── ToastContext.tsx         # Toast notifications
├── constants/            # Constants & Config
│   └── permissions.ts           # Permission definitions
├── lib/                  # Libraries & Utils
│   ├── excelExport.ts          # Excel export functions
│   └── supabase.ts             # Supabase client
├── types/                # TypeScript Types
│   └── index.ts                # Type definitions
└── utils/                # Utility Functions
    ├── dateUtils.ts            # Date/timezone utilities
    └── wordExport.ts           # Word export functions
```

---

## 🗃️ DATABASE SCHEMA

### Core Tables:
- **users** - Người dùng & phân quyền
- **students** - Thông tin học sinh
- **classes** - Lớp học
- **schedules** - Lịch dạy
- **attendance** - Điểm danh
- **grade_periods** - Đợt chấm điểm
- **grade_columns** - Cột điểm
- **grades** - Điểm số
- **finances** - Thu chi
- **assets** - Tài sản
- **asset_distributions** - Phân phối tài sản
- **events** - Sự kiện
- **activity_reports** - Báo cáo hoạt động

---

*Hệ thống được thiết kế để đáp ứng đầy đủ nhu cầu quản lý của trung tâm luyện thi toán bồi bổng, với giao diện thân thiện và tính năng phong phú.*
