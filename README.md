# 🎓 Hệ thống Quản lý Luyện thi Toán Bồi bổng (QL LHTTBB)

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39.0-3ECF8E.svg)](https://supabase.com/)

Hệ thống quản lý toàn diện cho trung tâm luyện thi toán bồi bổng, được xây dựng với React + TypeScript + Supabase.

## 🌟 Demo

🔗 **[Live Demo](https://your-demo-url.vercel.app)** (Sẽ cập nhật sau khi deploy)

## 📸 Screenshots

### 🏠 Trang chủ công khai
![Homepage](docs/screenshots/homepage.png)

### 📊 Dashboard quản trị
![Dashboard](docs/screenshots/dashboard.png)

### 👥 Quản lý học sinh
![Students](docs/screenshots/students.png)

## ✨ Tính năng chính

- 👥 **Quản lý học sinh & lớp học** - Thông tin chi tiết, phân loại theo độ tuổi
- 📅 **Lịch dạy thông minh** - Xếp lịch, thông báo, xuất Excel
- ✅ **Điểm danh điện tử** - Theo dõi tham gia, báo cáo chi tiết
- 📊 **Chấm điểm có trọng số** - Quản lý đợt điểm, cột điểm linh hoạt
- 💰 **Thu chi minh bạch** - Quản lý tài chính, báo cáo công khai
- 📦 **Quản lý tài sản** - Nhận, phân phối, thống kê tài sản
- 📢 **Thông báo tự động** - Tạo thông báo lịch học chuẩn
- 📄 **Báo cáo hoạt động** - Xuất Word, hiển thị công khai
- 🔐 **Phân quyền chi tiết** - 4 vai trò, 9 nhóm quyền

## 🚀 Công nghệ sử dụng

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Database**: Supabase (PostgreSQL)
- **Export**: ExcelJS + DocX
- **Authentication**: Supabase Auth

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js 18+
- NPM hoặc Yarn
- Tài khoản Supabase

### Cài đặt dependencies
```bash
npm install
```

### Cấu hình môi trường
Tạo file `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Chạy development
```bash
npm run dev
```

### Build production
```bash
npm run build
```

## 🗄️ Cấu trúc Database

### Tables chính:
- `users` - Người dùng và phân quyền
- `students` - Thông tin học sinh
- `classes` - Lớp học
- `schedules` - Lịch dạy
- `attendance` - Điểm danh
- `grades` - Hệ thống chấm điểm
- `finances` - Thu chi
- `assets` - Quản lý tài sản
- `reports` - Báo cáo hoạt động

### Thiết lập Database:
1. Import schema từ thư mục `sql/`
2. Chạy các migration scripts
3. Thiết lập RLS policies

## 👥 Hệ thống phân quyền

### Vai trò:
- **Admin** 👑 - Toàn quyền
- **Manager** 👨‍💼 - Quản lý theo nhóm quyền
- **Teacher** 👨‍🏫 - Giảng dạy và chấm điểm
- **Volunteer** 🤝 - Hỗ trợ theo quyền

### Nhóm quyền:
- `classes.*` - Quản lý lớp học
- `students.*` - Quản lý học sinh
- `schedules.*` - Quản lý lịch dạy
- `attendance.*` - Quản lý điểm danh
- `grades.*` - Quản lý chấm điểm
- `finances.*` - Quản lý thu chi
- `assets.*` - Quản lý tài sản
- `notifications.*` - Quản lý thông báo
- `reports.*` - Quản lý báo cáo

## 🌐 Trang chủ công khai

### Thống kê hiển thị:
- 📊 Tổng số lớp học
- 👥 Phân bố độ tuổi học sinh
- 📅 Lịch dạy tuần
- 💰 Tình hình tài chính
- 📦 Thống kê tài sản

### Tính năng tra cứu:
- Xem lịch dạy theo tuần
- Tra cứu thu chi công khai
- Thống kê tài sản minh bạch
- Đọc báo cáo hoạt động

## 📱 Responsive Design

- 📱 Mobile-first approach
- 🖥️ Desktop optimization
- 📊 Responsive tables
- 🎨 Adaptive UI components

## 🔧 Tính năng kỹ thuật

### Múi giờ:
- 🇻🇳 Hỗ trợ múi giờ Việt Nam (UTC+7)
- ⏰ Tính toán thời gian chính xác
- 📅 Lịch tuần theo chuẩn VN

### Export dữ liệu:
- 📊 Excel: UTF-8, định dạng VN
- 📄 Word: Báo cáo có format
- 🔤 Hỗ trợ tiếng Việt đầy đủ

### Performance:
- ⚡ Lazy loading components
- 🔄 Real-time data sync
- 💾 Efficient caching
- 📦 Code splitting

## 📚 Tài liệu

- 📋 [Danh sách tính năng chi tiết](SYSTEM_FEATURES.md)
- 📖 [Hướng dẫn sử dụng](USER_GUIDE.md)
- 🔐 [Hướng dẫn phân quyền](PERMISSION_GUIDE.md)

## 🚀 Deployment

### Vercel (Recommended):
```bash
npm run build
vercel --prod
```

### Netlify:
```bash
npm run build
# Upload dist/ folder
```

### Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- 📧 Email: support@qlhttbb.com
- 🌐 Website: [qlhttbb.com](https://qlhttbb.com)
- 📱 Demo: [demo.qlhttbb.com](https://demo.qlhttbb.com)

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Lucide Icons](https://lucide.dev/)
- [ExcelJS](https://github.com/exceljs/exceljs)

---

⭐ **Star this repo if you find it helpful!**
