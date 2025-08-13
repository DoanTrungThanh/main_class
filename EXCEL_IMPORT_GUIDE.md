# 📊 Hướng dẫn Import/Export Excel - Quản lý Kho

## 🎯 Tổng quan

Hệ thống hỗ trợ import và export dữ liệu kho từ/ra file Excel với encoding UTF-8, giúp quản lý dữ liệu một cách hiệu quả.

## 🚀 Tính năng

### ✅ Import từ Excel
- 📤 Upload file Excel (.xlsx, .xls)
- 🔍 Preview dữ liệu trước khi import
- ✔️ Validation dữ liệu tự động
- 🚨 Hiển thị lỗi chi tiết
- 📊 Thống kê import

### ✅ Export ra Excel
- 📥 Xuất dữ liệu hiện tại
- 📋 Tải file mẫu Excel
- 🌐 Hỗ trợ UTF-8 đầy đủ
- 📝 Bao gồm hướng dẫn

## 📋 Cách sử dụng

### 1. 📥 Tải file mẫu Excel

1. Vào **Quản lý kho lớp**
2. Nhấn nút **"Tải mẫu Excel"** (màu xanh lá)
3. File mẫu sẽ được tải xuống với:
   - ✅ Định dạng chuẩn
   - ✅ Dữ liệu mẫu
   - ✅ Hướng dẫn chi tiết

### 2. 📝 Chuẩn bị dữ liệu

#### Cấu trúc file Excel:
| Tên sản phẩm | Số lượng | Danh mục | Mô tả |
|--------------|----------|----------|-------|
| Bút chì 2B | 50 | Văn phòng phẩm | Bút chì chất lượng cao |
| Vở ô li | 25 | Văn phòng phẩm | Vở 200 trang |

#### Quy tắc dữ liệu:
- **Tên sản phẩm**: Bắt buộc, tối đa 255 ký tự
- **Số lượng**: Bắt buộc, số nguyên dương (1-999,999)
- **Danh mục**: Bắt buộc, phải tồn tại trong hệ thống
- **Mô tả**: Tùy chọn, tối đa 1000 ký tự

### 3. 📤 Import dữ liệu

1. Nhấn nút **"Import Excel"** (màu tím)
2. Chọn file Excel đã chuẩn bị
3. Xem preview dữ liệu:
   - ✅ Dòng hợp lệ (màu xanh)
   - ❌ Dòng lỗi (màu đỏ + chi tiết lỗi)
4. Nhấn **"Import"** để hoàn tất

### 4. 📊 Export dữ liệu

1. Nhấn nút **"Xuất Excel"** (màu cam)
2. File Excel sẽ được tải xuống với:
   - ✅ Toàn bộ dữ liệu hiện tại
   - ✅ Định dạng UTF-8
   - ✅ Tên file có ngày tháng

## ⚠️ Lưu ý quan trọng

### 📋 Chuẩn bị file Excel:
- ✅ Sử dụng file mẫu làm template
- ✅ Xóa dữ liệu mẫu trước khi nhập
- ✅ Đảm bảo encoding UTF-8
- ✅ Không thay đổi tên cột header

### 🔍 Validation:
- ❌ Tên sản phẩm không được trống
- ❌ Số lượng phải là số nguyên dương
- ❌ Danh mục phải tồn tại trong hệ thống
- ❌ Không vượt quá giới hạn ký tự

### 🚨 Xử lý lỗi:
- 📊 Hiển thị thống kê import
- 🔍 Chi tiết lỗi từng dòng
- ⚡ Import chỉ dữ liệu hợp lệ
- 📝 Log lỗi trong console

## 🛠️ Troubleshooting

### ❓ File không đọc được
**Nguyên nhân**: File bị lỗi hoặc không đúng định dạng
**Giải pháp**: 
- Sử dụng file mẫu
- Kiểm tra định dạng .xlsx/.xls
- Đảm bảo file không bị corrupt

### ❓ Danh mục không tồn tại
**Nguyên nhân**: Tên danh mục trong Excel không khớp với hệ thống
**Giải pháp**:
- Kiểm tra danh mục trong **Tab Danh mục**
- Sử dụng tên danh mục chính xác
- Tạo danh mục mới nếu cần

### ❓ Số lượng không hợp lệ
**Nguyên nhân**: Số lượng không phải số nguyên dương
**Giải pháp**:
- Chỉ nhập số nguyên (1, 2, 3...)
- Không nhập số thập phân (1.5, 2.7...)
- Không nhập số âm hoặc 0

### ❓ Import thành công một phần
**Nguyên nhân**: Một số dòng có lỗi
**Giải pháp**:
- Kiểm tra preview trước import
- Sửa lỗi trong file Excel
- Import lại file đã sửa

## 📞 Hỗ trợ

### 🔧 Debug:
- Mở **Developer Tools** (F12)
- Xem **Console** tab để debug
- Kiểm tra **Network** tab cho API calls

### 📋 Báo lỗi:
- Screenshot màn hình lỗi
- Copy thông báo lỗi từ console
- Gửi file Excel mẫu gây lỗi

---

## 🎉 Kết luận

Chức năng Import/Export Excel giúp:
- ⚡ Nhập dữ liệu hàng loạt nhanh chóng
- 🔍 Validation tự động đảm bảo chất lượng
- 📊 Xuất báo cáo dễ dàng
- 🌐 Hỗ trợ tiếng Việt đầy đủ

**🚀 Hệ thống sẵn sàng sử dụng!**
