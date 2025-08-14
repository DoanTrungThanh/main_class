import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import {
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,

} from 'lucide-react';


interface LoginPageProps {
  onBackClick?: () => void;
}

export default function LoginPageFixed({ onBackClick }: LoginPageProps) {
  const { login } = useAuth();
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Đăng nhập thành công!');
      } else {
        toast.error(result.error || 'Email hoặc mật khẩu không đúng!');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Có lỗi xảy ra khi đăng nhập!');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Quay lại trang chính</span>
          </button>
        )}

        {/* Login Form */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
              <p className="text-gray-600">Vui lòng đăng nhập để tiếp tục</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nhập email của bạn"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Đăng nhập
                  </>
                )}
              </button>


          </form>
        </div>
      </div>
    </div>
  );
}
