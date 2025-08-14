-- 🔐 Script thiết lập mật khẩu admin mạnh
-- Chạy script này trong Supabase SQL Editor để tạo admin account an toàn

-- Tạo extension để hash password (nếu chưa có)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function để tạo mật khẩu mạnh ngẫu nhiên
CREATE OR REPLACE FUNCTION generate_strong_password(length INTEGER DEFAULT 16)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Tạo admin user với mật khẩu mạnh
DO $$
DECLARE
    admin_password TEXT;
    admin_email TEXT := 'admin@qlhttbb.com';
    admin_id UUID;
BEGIN
    -- Tạo mật khẩu mạnh ngẫu nhiên
    admin_password := generate_strong_password(20);
    
    -- Tạo user trong Supabase Auth (cần thực hiện qua API hoặc dashboard)
    -- Đây chỉ là placeholder - bạn cần tạo user qua Supabase Dashboard
    
    -- Tạo hoặc cập nhật user trong bảng users
    INSERT INTO users (
        id,
        name,
        email,
        role,
        password, -- Sẽ được thay thế bằng Supabase Auth
        is_active,
        gender,
        permissions,
        created_at
    ) VALUES (
        gen_random_uuid(),
        'System Administrator',
        admin_email,
        'admin',
        crypt(admin_password, gen_salt('bf')), -- Hash password với bcrypt
        true,
        'other',
        '[]'::jsonb, -- Admin không cần permissions cụ thể
        NOW()
    )
    ON CONFLICT (email) 
    DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    
    -- In ra mật khẩu (chỉ lần đầu setup)
    RAISE NOTICE '=== THÔNG TIN ADMIN ACCOUNT ===';
    RAISE NOTICE 'Email: %', admin_email;
    RAISE NOTICE 'Password: %', admin_password;
    RAISE NOTICE '=== LƯU Ý QUAN TRỌNG ===';
    RAISE NOTICE '1. Lưu mật khẩu này ở nơi an toàn';
    RAISE NOTICE '2. Đổi mật khẩu ngay sau lần đăng nhập đầu tiên';
    RAISE NOTICE '3. Xóa script này sau khi setup xong';
    RAISE NOTICE '4. Tạo user trong Supabase Auth Dashboard với email và password trên';
END $$;

-- Tạo function để verify password (cho authentication)
CREATE OR REPLACE FUNCTION verify_password(email_input TEXT, password_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    stored_password TEXT;
BEGIN
    SELECT password INTO stored_password 
    FROM users 
    WHERE email = email_input AND is_active = true;
    
    IF stored_password IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN crypt(password_input, stored_password) = stored_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo function để hash password khi tạo user mới
CREATE OR REPLACE FUNCTION hash_password(password_input TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(password_input, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger để tự động hash password khi insert/update
CREATE OR REPLACE FUNCTION hash_password_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Chỉ hash nếu password thay đổi và không phải là hash
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.password != OLD.password) THEN
        -- Kiểm tra xem password đã được hash chưa (bcrypt hash bắt đầu bằng $2)
        IF NEW.password IS NOT NULL AND NOT (NEW.password LIKE '$2%') THEN
            NEW.password := crypt(NEW.password, gen_salt('bf'));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger cho bảng users
DROP TRIGGER IF EXISTS hash_password_trigger ON users;
CREATE TRIGGER hash_password_trigger
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION hash_password_trigger();

-- Tạo function để đổi mật khẩu an toàn
CREATE OR REPLACE FUNCTION change_user_password(
    user_id_input UUID,
    old_password TEXT,
    new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_password TEXT;
    user_email TEXT;
BEGIN
    -- Lấy thông tin user
    SELECT password, email INTO current_password, user_email
    FROM users 
    WHERE id = user_id_input AND is_active = true;
    
    IF current_password IS NULL THEN
        RAISE EXCEPTION 'User not found or inactive';
    END IF;
    
    -- Verify old password
    IF NOT (crypt(old_password, current_password) = current_password) THEN
        RAISE EXCEPTION 'Current password is incorrect';
    END IF;
    
    -- Validate new password strength
    IF LENGTH(new_password) < 8 THEN
        RAISE EXCEPTION 'New password must be at least 8 characters long';
    END IF;
    
    -- Update password
    UPDATE users 
    SET password = crypt(new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = user_id_input;
    
    -- Log password change
    INSERT INTO user_activity_log (user_id, action, details, created_at)
    VALUES (user_id_input, 'password_changed', 
            jsonb_build_object('email', user_email, 'timestamp', NOW()),
            NOW());
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo bảng log hoạt động user (nếu chưa có)
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index cho performance
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);

-- Grant permissions
GRANT EXECUTE ON FUNCTION verify_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION hash_password(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION change_user_password(UUID, TEXT, TEXT) TO authenticated;

-- Cleanup function (xóa sau khi setup)
DROP FUNCTION IF EXISTS generate_strong_password(INTEGER);

RAISE NOTICE '=== SETUP HOÀN TẤT ===';
RAISE NOTICE 'Các function bảo mật đã được tạo thành công';
RAISE NOTICE 'Hãy tạo user trong Supabase Auth Dashboard với thông tin admin ở trên';
