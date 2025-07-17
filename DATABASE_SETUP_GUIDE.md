# 🗄️ Database Setup Guide

Hướng dẫn khởi tạo và kết nối cơ sở dữ liệu cho hệ thống quản lý lớp học.

## 📋 Tổng quan

Hệ thống sử dụng **Supabase** (PostgreSQL) làm cơ sở dữ liệu chính với các tính năng:
- ✅ Real-time database
- ✅ Row Level Security (RLS)
- ✅ Auto-generated APIs
- ✅ Built-in authentication
- ✅ Cloud hosting

## 🚀 Bước 1: Cấu hình Supabase

### 1.1 Thông tin kết nối hiện tại
```
URL: https://aejdkzhzrskwesaarwuh.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.2 File cấu hình (.env)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://aejdkzhzrskwesaarwuh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlamRremh6cnNrd2VzYWFyd3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjExNDIsImV4cCI6MjA2NzA5NzE0Mn0.P1vb7-l_0dSruUgPgUTuNgpQU5PLbrt2f2PjHv-uQ8c
```

## 🛠️ Bước 2: Khởi tạo Database

### 2.1 Tự động (Khuyến nghị)
```bash
# Chạy script khởi tạo tự động
node init-database.js
```

### 2.2 Thủ công
1. Truy cập Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/aejdkzhzrskwesaarwuh/sql/new
   ```

2. Copy nội dung file `database_setup.sql` và chạy

## 📊 Cấu trúc Database

### 2.1 Bảng chính

#### `inventory_categories` - Danh mục vật phẩm
```sql
- id (UUID, Primary Key)
- name (TEXT, UNIQUE) - Tên danh mục
- description (TEXT) - Mô tả
- color (TEXT) - Màu sắc hiển thị
- created_by (UUID) - Người tạo
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `class_inventory` - Vật phẩm lớp học
```sql
- id (UUID, Primary Key)
- title (TEXT) - Tên vật phẩm
- quantity (INTEGER) - Số lượng
- category_id (UUID, Foreign Key) - Danh mục
- description (TEXT) - Mô tả
- created_by (UUID) - Người tạo
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 2.2 Views
- `inventory_with_categories` - Join inventory với categories

### 2.3 Dữ liệu mẫu
- 8 danh mục cơ bản (Văn phòng phẩm, Đồ chơi giáo dục, v.v.)
- 5 vật phẩm mẫu

## 🔧 Bước 3: Kiểm tra kết nối

### 3.1 Test kết nối web
```bash
# Kiểm tra kết nối từ web application
node test-web-connection.js
```

### 3.2 Test thủ công
```bash
# Khởi động ứng dụng
npm run dev

# Truy cập: http://localhost:5173
# Vào mục "Quản lý vật phẩm lớp học"
```

## ✅ Bước 4: Xác minh hoạt động

### 4.1 Checklist
- [ ] Kết nối database thành công
- [ ] Hiển thị danh sách danh mục
- [ ] Hiển thị danh sách vật phẩm
- [ ] Thêm vật phẩm mới
- [ ] Sửa vật phẩm
- [ ] Xóa vật phẩm
- [ ] Thêm danh mục mới

### 4.2 Test CRUD operations
```javascript
// Test trong browser console
const testCreate = async () => {
  const response = await fetch('/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test Item',
      quantity: 1,
      category_id: 'category-uuid'
    })
  });
  return response.json();
};
```

## 🔒 Bước 5: Bảo mật

### 5.1 Row Level Security (RLS)
- ✅ Đã bật RLS cho tất cả bảng
- ✅ Policies cho phép CRUD operations
- ✅ Permissions cho authenticated/anon users

### 5.2 API Keys
- **Anon Key**: Dùng cho client-side
- **Service Key**: Dùng cho server-side (không expose)

## 🚨 Troubleshooting

### Lỗi thường gặp

#### 1. Connection refused
```
❌ Error: Connection refused
```
**Giải pháp**: Kiểm tra URL và API key trong file `.env`

#### 2. Table does not exist
```
❌ Error: relation "inventory_categories" does not exist
```
**Giải pháp**: Chạy `database_setup.sql` trong Supabase SQL Editor

#### 3. UUID format error
```
❌ Error: invalid input syntax for type uuid
```
**Giải pháp**: Đã fix trong code với sanitization

#### 4. Permission denied
```
❌ Error: permission denied for table
```
**Giải pháp**: Kiểm tra RLS policies và permissions

### Debug commands
```bash
# Kiểm tra kết nối
node init-database.js

# Test web connection
node test-web-connection.js

# Xem logs trong browser
# F12 > Console > Network tab
```

## 📞 Hỗ trợ

### Liên hệ
- 📧 Email: support@example.com
- 💬 Discord: #database-help
- 📖 Docs: [Supabase Documentation](https://supabase.com/docs)

### Tài nguyên
- [Supabase Dashboard](https://supabase.com/dashboard)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [SQL Tutorial](https://www.w3schools.com/sql/)

---

## 🎯 Kết luận

Database đã được cấu hình hoàn chỉnh với:
- ✅ **2 bảng chính** (categories, inventory)
- ✅ **Dữ liệu mẫu** sẵn sàng
- ✅ **RLS & Permissions** đã cấu hình
- ✅ **Auto-triggers** cho updated_at
- ✅ **Indexes** cho performance
- ✅ **Views** cho queries phức tạp

**🚀 Hệ thống sẵn sàng sử dụng!**
