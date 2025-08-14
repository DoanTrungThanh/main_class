import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { hasPermission } from '../constants/permissions';
import { Plus, Search, Edit, Trash2, Mail, User, Shield, Key, Eye, EyeOff, X, Save, UserCheck, UserX, Clock, Calendar, Scale as Male, Scale as Female, Download, Settings } from 'lucide-react';
import { User as UserType } from '../types';
import { exportUsers } from '../lib/excelExport';
import PermissionManager from './PermissionManager';
import TestVolunteerAccount from './TestVolunteerAccount';


export default function UserManager() {
  const { user: currentUser, users, addUser, updateUser, deleteUser, changePassword } = useAuth();
  const toast = useToastContext();
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [passwordUserId, setPasswordUserId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'manager' | 'teacher' | 'volunteer'>('all');
  const [showPassword, setShowPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showPermissionManager, setShowPermissionManager] = useState(false);
  const [permissionUser, setPermissionUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'teacher' as 'admin' | 'manager' | 'teacher',
    password: '',
    isActive: true,
    gender: 'male' as 'male' | 'female' | 'other',
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Kiểm tra quyền dựa trên permissions
  const userPermissions = currentUser?.permissions || [];
  const userRole = currentUser?.role;
  const canViewUsers = hasPermission(userPermissions, 'users.view', userRole);
  const canCreateUsers = hasPermission(userPermissions, 'users.create', userRole);
  const canEditUsers = hasPermission(userPermissions, 'users.edit', userRole);
  const canDeleteUsers = hasPermission(userPermissions, 'users.delete', userRole);
  const canManageUsers = canEditUsers || canDeleteUsers;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'teacher',
      password: '',
      isActive: true,
      gender: 'male',
    });
    setEditingUser(null);
  };

  const resetPasswordForm = () => {
    setPasswordData({
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordUserId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Cập nhật user (không thay đổi mật khẩu ở đây)
        const { password, ...updateData } = formData;
        updateUser(editingUser.id, updateData);
        toast.success('Cập nhật người dùng thành công!');
      } else {
        // Thêm user mới
        if (!formData.password) {
          toast.error('Vui lòng nhập mật khẩu!');
          return;
        }
        
        // Kiểm tra email đã tồn tại
        if (users.some(u => u.email === formData.email)) {
          toast.error('Email đã tồn tại!');
          return;
        }
        
        addUser(formData);
        toast.success('Thêm người dùng thành công!');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Có lỗi xảy ra khi lưu thông tin người dùng!');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    
    try {
      changePassword(passwordUserId, passwordData.newPassword);
      toast.success('Đổi mật khẩu thành công!');
      setShowPasswordModal(false);
      resetPasswordForm();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Có lỗi xảy ra khi đổi mật khẩu!');
    }
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '', // Không hiển thị mật khẩu cũ
      isActive: user.isActive ?? true,
      gender: user.gender || 'male',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string, userName: string) => {
    if (id === currentUser?.id) {
      toast.error('Không thể xóa tài khoản của chính mình!');
      return;
    }
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userName}" không?`)) {
      try {
        deleteUser(id);
        toast.success('Xóa người dùng thành công!');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Có lỗi xảy ra khi xóa người dùng!');
      }
    }
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    if (id === currentUser?.id) {
      toast.error('Không thể vô hiệu hóa tài khoản của chính mình!');
      return;
    }
    
    updateUser(id, { isActive: !currentStatus });
    toast.success(`${!currentStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản thành công!`);
  };

  const openPasswordModal = (userId: string) => {
    setPasswordUserId(userId);
    setShowPasswordModal(true);
  };

  const openPermissionManager = (user: UserType) => {
    setPermissionUser(user);
    setShowPermissionManager(true);
  };

  const handleUpdatePermissions = (userId: string, permissions: string[]) => {
    updateUser(userId, { permissions });
    toast.success('Cập nhật quyền truy cập thành công!');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'teacher':
        return 'bg-green-100 text-green-800';
      case 'volunteer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'manager':
        return 'Quản sinh';
      case 'teacher':
        return 'Giáo viên';
      case 'volunteer':
        return 'Tình nguyện viên';
      default:
        return role;
    }
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male': return <Male size={16} className="text-blue-500" />;
      case 'female': return <Female size={16} className="text-pink-500" />;
      default: return <User size={16} className="text-purple-500" />;
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      default: return 'Khác';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male': return 'bg-blue-100 text-blue-800';
      case 'female': return 'bg-pink-100 text-pink-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportUsers(filteredUsers);
      toast.success('Xuất dữ liệu thành công!');
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  if (!canViewUsers) {
    return (
      <div className="text-center py-8">
        <Shield className="mx-auto mb-4 text-gray-300" size={48} />
        <p className="text-gray-500">Bạn không có quyền truy cập chức năng này</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tài khoản</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tài khoản đăng nhập của tất cả người dùng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <Download size={20} />
            {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
          {canCreateUsers && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Thêm tài khoản
            </button>
          )}
        </div>
      </div>





      {/* Thống kê tổng quan - Mobile Optimized */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-gray-100">
              <User size={16} className="text-gray-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Tổng tài khoản</p>
            <p className="text-lg font-bold text-gray-900">{users.length}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-green-100">
              <UserCheck size={16} className="text-green-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Đang hoạt động</p>
            <p className="text-lg font-bold text-green-600">
              {users.filter(u => u.isActive).length}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-red-100">
              <UserX size={16} className="text-red-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Bị khóa</p>
            <p className="text-lg font-bold text-red-600">
              {users.filter(u => !u.isActive).length}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-purple-100">
              <Shield size={16} className="text-purple-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Quản trị viên</p>
            <p className="text-lg font-bold text-purple-600">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="manager">Quản sinh</option>
            <option value="teacher">Giáo viên</option>
            <option value="volunteer">Tình nguyện viên</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Người dùng</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Vai trò</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Giới tính</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Đăng nhập cuối</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-gray-700">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                      {(user.role === 'volunteer' || user.role === 'manager') && (
                        <span className="text-xs text-gray-500">
                          {user.permissions?.length || 0} quyền
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getGenderColor(user.gender || 'other')}`}>
                      {getGenderIcon(user.gender || 'other')}
                      {getGenderLabel(user.gender || 'other')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {user.isActive ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-700 text-sm">Hoạt động</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-700 text-sm">Bị khóa</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={14} />
                      <span className="text-sm">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString('vi-VN')
                          : 'Chưa đăng nhập'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-100"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openPasswordModal(user.id)}
                        className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-100"
                        title="Đổi mật khẩu"
                      >
                        <Key size={16} />
                      </button>
                      {(user.role === 'volunteer' || user.role === 'manager') && (
                        <button
                          onClick={() => openPermissionManager(user)}
                          className="text-purple-600 hover:text-purple-700 p-1 rounded hover:bg-purple-100"
                          title="Quản lý quyền truy cập"
                        >
                          <Settings size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleActive(user.id, user.isActive ?? true)}
                        className={`p-1 rounded ${
                          user.isActive 
                            ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-100' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-100'
                        }`}
                        title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        disabled={user.id === currentUser?.id}
                      >
                        {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100"
                          title="Xóa tài khoản"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <User className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-500">
              {searchTerm || filterRole !== 'all' 
                ? 'Không tìm thấy người dùng nào' 
                : 'Chưa có người dùng nào'}
            </p>
          </div>
        )}
      </div>

      {/* Modal thêm/sửa người dùng */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!!editingUser} // Không cho sửa email
                />
                {editingUser && (
                  <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="teacher">Giáo viên</option>
                    <option value="manager">Quản sinh</option>
                    <option value="admin">Quản trị viên</option>
                    <option value="volunteer">Tình nguyện viên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Tài khoản hoạt động
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingUser ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal đổi mật khẩu */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Key size={20} className="text-blue-600" />
                Đổi mật khẩu
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  resetPasswordForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu mới *
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    resetPasswordForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Key size={16} />
                  Đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Manager Modal */}
      {showPermissionManager && permissionUser && (
        <PermissionManager
          user={permissionUser}
          onUpdatePermissions={handleUpdatePermissions}
          onClose={() => {
            setShowPermissionManager(false);
            setPermissionUser(null);
          }}
        />
      )}
    </div>
  );
}