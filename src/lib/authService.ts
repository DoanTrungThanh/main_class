import { supabase } from './supabase';
import { User } from '../types';

// 🔐 Secure Authentication Service
export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private sessionTimeout: NodeJS.Timeout | null = null;
  private readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // 🔒 Secure login with proper validation
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Input validation
      if (!this.validateEmail(email)) {
        return { success: false, error: 'Email không hợp lệ' };
      }

      if (!this.validatePassword(password)) {
        return { success: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' };
      }

      // Rate limiting check (simple implementation)
      if (this.isRateLimited(email)) {
        return { success: false, error: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.' };
      }

      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.recordFailedLogin(email);
        return { success: false, error: 'Email hoặc mật khẩu không đúng' };
      }

      if (!data.user) {
        return { success: false, error: 'Đăng nhập thất bại' };
      }

      // Get user profile from database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (profileError || !userProfile) {
        await supabase.auth.signOut();
        return { success: false, error: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa' };
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userProfile.id);

      // Set up session
      this.currentUser = userProfile;
      this.setupSessionTimeout();
      this.clearFailedLogins(email);

      // Store session securely (without sensitive data)
      const sessionData = {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        name: userProfile.name,
        loginTime: Date.now()
      };
      
      localStorage.setItem('user_session', JSON.stringify(sessionData));

      return { success: true, user: userProfile };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Lỗi hệ thống. Vui lòng thử lại sau.' };
    }
  }

  // 🚪 Secure logout
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.currentUser = null;
      this.clearSessionTimeout();
      localStorage.removeItem('user_session');
      sessionStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // 🔄 Session validation and refresh
  async validateSession(): Promise<User | null> {
    try {
      const sessionData = localStorage.getItem('user_session');
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      
      // Check session expiry
      if (Date.now() - session.loginTime > this.SESSION_DURATION) {
        await this.logout();
        return null;
      }

      // Validate with Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        await this.logout();
        return null;
      }

      // Get fresh user data
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.id)
        .eq('is_active', true)
        .single();

      if (!userProfile) {
        await this.logout();
        return null;
      }

      this.currentUser = userProfile;
      this.setupSessionTimeout();
      return userProfile;

    } catch (error) {
      console.error('Session validation error:', error);
      await this.logout();
      return null;
    }
  }

  // 🔐 Change password with validation
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      // Validate new password
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.message };
      }

      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: 'Không thể đổi mật khẩu. Vui lòng thử lại.' };
      }

      return { success: true };

    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Lỗi hệ thống' };
    }
  }

  // 📧 Email validation
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 🔒 Password validation
  private validatePassword(password: string): boolean {
    return password.length >= 8;
  }

  // 💪 Strong password validation
  private validatePasswordStrength(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
    }

    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
    }

    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ thường' };
    }

    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 số' };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt' };
    }

    return { isValid: true, message: 'Mật khẩu hợp lệ' };
  }

  // 🚫 Rate limiting (simple implementation)
  private isRateLimited(email: string): boolean {
    const key = `failed_login_${email}`;
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    const now = Date.now();
    const recentAttempts = attempts.filter((time: number) => now - time < 15 * 60 * 1000); // 15 minutes
    
    return recentAttempts.length >= 5;
  }

  private recordFailedLogin(email: string): void {
    const key = `failed_login_${email}`;
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    attempts.push(Date.now());
    localStorage.setItem(key, JSON.stringify(attempts));
  }

  private clearFailedLogins(email: string): void {
    const key = `failed_login_${email}`;
    localStorage.removeItem(key);
  }

  // ⏰ Session timeout management
  private setupSessionTimeout(): void {
    this.clearSessionTimeout();
    this.sessionTimeout = setTimeout(() => {
      this.logout();
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }, this.SESSION_DURATION);
  }

  private clearSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }

  // 👤 Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // 🔍 Check permission
  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'admin') return true;
    
    return this.currentUser.permissions?.includes(permission) || false;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
