# 🔒 Hướng dẫn Bảo mật - QL LHTTBB

## ⚠️ QUAN TRỌNG - ĐỌC TRƯỚC KHI TRIỂN KHAI

### 🚨 Các vấn đề bảo mật cần khắc phục ngay:

#### 1. **Environment Variables**
- ❌ **KHÔNG BAO GIỜ** commit file `.env` hoặc `.env.local` lên Git
- ✅ Chỉ sử dụng `.env.example` làm template
- ✅ Thiết lập environment variables trên hosting platform

#### 2. **Supabase Security**
- ✅ Bật Row Level Security (RLS) cho tất cả tables
- ✅ Cấu hình CORS chỉ cho phép domain của bạn
- ✅ Rotate API keys định kỳ (3-6 tháng)
- ✅ Sử dụng Service Role key chỉ cho server-side operations

#### 3. **Authentication**
- ❌ Thay đổi mật khẩu mặc định "password"
- ✅ Implement password hashing (bcrypt/scrypt)
- ✅ Thêm 2FA cho admin accounts
- ✅ Session timeout và refresh tokens

#### 4. **Database Security**
```sql
-- Bật RLS cho tất cả tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
-- ... cho tất cả tables khác

-- Tạo policies cho từng table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

#### 5. **Production Deployment**
- ✅ Sử dụng HTTPS/SSL
- ✅ Cấu hình CSP headers
- ✅ Implement rate limiting
- ✅ Error handling không lộ thông tin nhạy cảm
- ✅ Logging và monitoring

### 🛡️ Checklist Bảo mật

#### Trước khi deploy:
- [ ] Xóa tất cả hardcoded credentials từ source code
- [ ] Thiết lập environment variables trên hosting platform
- [ ] Chạy script `supabase_security_policies.sql` để bật RLS
- [ ] Chạy script `setup_admin_password.sql` để tạo admin an toàn
- [ ] Thay đổi mật khẩu mặc định của tất cả tài khoản
- [ ] Test authentication flows với AuthService mới
- [ ] Cấu hình CORS trong Supabase Dashboard
- [ ] Thiết lập monitoring và alerting
- [ ] Xóa file `.env.local` khỏi production
- [ ] Verify không có sensitive data trong Git history

#### Sau khi deploy:
- [ ] Kiểm tra không có credentials trong browser console
- [ ] Test các permission boundaries với từng role
- [ ] Verify RLS policies hoạt động đúng
- [ ] Test rate limiting và session timeout
- [ ] Kiểm tra password strength requirements
- [ ] Penetration testing cơ bản
- [ ] Backup và disaster recovery plan
- [ ] Monitor failed login attempts
- [ ] Setup security headers (CSP, HSTS, etc.)
- [ ] Regular security audit schedule

#### Bảo mật hàng ngày:
- [ ] Monitor user activity logs
- [ ] Review failed authentication attempts
- [ ] Check for suspicious database queries
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Review user permissions quarterly
- [ ] Backup verification weekly

### 📞 Báo cáo lỗ hổng bảo mật
Nếu phát hiện lỗ hổng bảo mật, vui lòng liên hệ:
- Email: security@yourproject.com
- Không public issue trên GitHub

### 🔄 Cập nhật bảo mật
- Review security monthly
- Update dependencies regularly
- Monitor Supabase security advisories
- Audit user permissions quarterly
