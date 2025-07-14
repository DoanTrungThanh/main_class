# Hướng dẫn Hệ thống Phân quyền Tình nguyện viên

## 🎯 Tổng quan

Hệ thống phân quyền cho phép quản trị viên tạo tài khoản **Tình nguyện viên** và cấp quyền truy cập cụ thể cho từng nhóm chức năng trong hệ thống.

## 👥 Các vai trò trong hệ thống

### 1. **Quản trị viên (Admin)**
- Có tất cả quyền trong hệ thống
- Có thể tạo và quản lý tài khoản tình nguyện viên
- Có thể cấp/thu hồi quyền cho tình nguyện viên

### 2. **Quản sinh (Manager)**
- Có quyền quản lý hầu hết các chức năng
- Không có quyền quản lý tài khoản người dùng

### 3. **Giáo viên (Teacher)**
- Chỉ có quyền điểm danh và nhập điểm
- Xem hồ sơ cá nhân

### 4. **Tình nguyện viên (Volunteer)** ⭐ MỚI
- Quyền truy cập được cấp tùy chỉnh theo nhóm chức năng
- Có thể được cấp quyền cho một hoặc nhiều nhóm chức năng

## 🔧 Cách tạo và quản lý tình nguyện viên

### Bước 1: Tạo tài khoản tình nguyện viên
1. Đăng nhập với tài khoản **Admin**
2. Vào **Quản lý tài khoản** → **Thêm người dùng**
3. Chọn vai trò: **Tình nguyện viên**
4. Điền thông tin cơ bản (tên, email, mật khẩu)
5. Nhấn **Lưu** để tạo tài khoản

### Bước 2: Cấp quyền truy cập
1. Trong danh sách tài khoản, tìm tình nguyện viên vừa tạo
2. Nhấn nút **⚙️ Quản lý quyền** (màu tím)
3. Chọn các nhóm chức năng muốn cấp quyền
4. Nhấn **Lưu quyền**

## 📋 Các nhóm chức năng có thể cấp quyền

### 🏠 **Tổng quan**
- Xem trang dashboard với thống kê tổng quan

### 👨‍🎓 **Quản lý học sinh**
- Xem danh sách học sinh
- Thêm/sửa/xóa thông tin học sinh
- Quản lý hồ sơ học sinh

### 📚 **Quản lý lớp học**
- Xem danh sách lớp học
- Tạo/chỉnh sửa lớp học
- Quản lý học sinh trong lớp

### 📖 **Quản lý môn học**
- Xem danh sách môn học
- Thêm/sửa/xóa môn học

### 🏢 **Quản lý phòng học**
- Xem danh sách phòng học
- Thêm/sửa/xóa phòng học

### 📅 **Quản lý lịch dạy**
- Xem lịch dạy
- Tạo/chỉnh sửa lịch dạy
- Quản lý thời khóa biểu

### ✅ **Điểm danh học sinh**
- Xem thông tin điểm danh
- Thực hiện điểm danh
- Chỉnh sửa điểm danh

### 🏆 **Quản lý điểm số**
- Xem điểm học sinh
- Nhập điểm
- Tạo đợt điểm

### 🎉 **Quản lý sự kiện**
- Xem danh sách sự kiện
- Tạo/chỉnh sửa sự kiện
- Quản lý danh sách tham gia

### 👤 **Quản lý tài khoản**
- Xem danh sách tài khoản
- Tạo/chỉnh sửa tài khoản
- Quản lý quyền truy cập

### 💰 **Quản lý thu chi**
- Xem thông tin tài chính
- Thêm giao dịch thu/chi
- Quản lý báo cáo tài chính

### 📦 **Quản lý tài sản**
- Xem danh sách tài sản
- Thêm/sửa thông tin tài sản
- Quản lý phân phối tài sản

### 📢 **Thông báo lịch học**
- Xem thông báo
- Tạo thông báo lịch học

### 📊 **Báo cáo thống kê**
- Xem các báo cáo
- Tạo báo cáo mới

### 📝 **Báo cáo hoạt động**
- Xem báo cáo hoạt động sự kiện
- Tạo/chỉnh sửa báo cáo

### ⚙️ **Hồ sơ cá nhân**
- Xem thông tin cá nhân
- Chỉnh sửa hồ sơ

## 🔍 Cách kiểm tra quyền

### Trong giao diện Header:
- Tình nguyện viên chỉ thấy các menu mà họ có quyền truy cập
- Menu sẽ tự động ẩn/hiện dựa trên quyền được cấp

### Trong danh sách tài khoản:
- Cột "Vai trò" hiển thị số lượng quyền đã cấp cho tình nguyện viên
- Ví dụ: "Tình nguyện viên - 5 quyền"

## 🧪 Test tài khoản mẫu

Hệ thống cung cấp chức năng tạo tài khoản test:

**Thông tin đăng nhập:**
- Email: `volunteer@test.com`
- Mật khẩu: `123456`
- Quyền mặc định: Tổng quan, Xem học sinh, Xem lớp học, Điểm danh, Sự kiện, Hồ sơ

## ⚠️ Lưu ý quan trọng

1. **Chỉ Admin** mới có thể tạo và quản lý quyền cho tình nguyện viên
2. **Quyền có hiệu lực ngay lập tức** sau khi lưu
3. **Tình nguyện viên cần đăng xuất và đăng nhập lại** để thấy thay đổi menu
4. **Không thể tự cấp quyền** cho chính mình
5. **Quyền được kiểm tra ở cả frontend và backend**

## 🔧 Cấu hình nâng cao

### Thêm quyền mới:
1. Chỉnh sửa file `src/constants/permissions.ts`
2. Thêm permission mới vào mảng `PERMISSIONS`
3. Cập nhật nhóm quyền trong `PERMISSION_GROUPS`

### Tùy chỉnh menu:
1. Chỉnh sửa function `getVolunteerMenuItems()` trong `src/components/Header.tsx`
2. Thêm điều kiện kiểm tra quyền cho menu item mới

## 🎯 Kết luận

Hệ thống phân quyền tình nguyện viên giúp:
- **Linh hoạt** trong việc cấp quyền truy cập
- **Bảo mật** thông tin hệ thống
- **Dễ quản lý** và theo dõi quyền của từng người
- **Mở rộng** dễ dàng khi cần thêm chức năng mới
