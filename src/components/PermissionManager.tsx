import React, { useState } from 'react';
import { User } from '../types';
import { PERMISSION_GROUPS, PERMISSIONS, hasPermission } from '../constants/permissions';
import { 
  Shield, 
  Check, 
  X, 
  Users, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Info
} from 'lucide-react';

interface PermissionManagerProps {
  user: User;
  onUpdatePermissions: (userId: string, permissions: string[]) => void;
  onClose: () => void;
}

export default function PermissionManager({ user, onUpdatePermissions, onClose }: PermissionManagerProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(user.permissions || []);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleGroupPermissions = (groupId: string, checked: boolean) => {
    const group = PERMISSION_GROUPS.find(g => g.id === groupId);
    if (!group) return;

    let newPermissions = [...selectedPermissions];
    
    if (checked) {
      // Thêm tất cả quyền trong nhóm
      group.permissions.forEach(permission => {
        if (!newPermissions.includes(permission)) {
          newPermissions.push(permission);
        }
      });
    } else {
      // Xóa tất cả quyền trong nhóm
      newPermissions = newPermissions.filter(p => !group.permissions.includes(p));
    }
    
    setSelectedPermissions(newPermissions);
  };

  const togglePermission = (permissionId: string) => {
    const newPermissions = [...selectedPermissions];
    const index = newPermissions.indexOf(permissionId);
    
    if (index > -1) {
      newPermissions.splice(index, 1);
    } else {
      newPermissions.push(permissionId);
    }
    
    setSelectedPermissions(newPermissions);
  };

  const isGroupFullySelected = (groupId: string): boolean => {
    const group = PERMISSION_GROUPS.find(g => g.id === groupId);
    if (!group) return false;
    
    return group.permissions.every(permission => selectedPermissions.includes(permission));
  };

  const isGroupPartiallySelected = (groupId: string): boolean => {
    const group = PERMISSION_GROUPS.find(g => g.id === groupId);
    if (!group) return false;
    
    return group.permissions.some(permission => selectedPermissions.includes(permission)) && 
           !isGroupFullySelected(groupId);
  };

  const handleSave = () => {
    onUpdatePermissions(user.id, selectedPermissions);
    onClose();
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(PERMISSIONS.map(p => p.id));
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={24} />
              <div>
                <h2 className="text-xl font-bold">Quản lý quyền truy cập</h2>
                <p className="text-blue-100 text-sm">
                  Cấp quyền cho {user.role === 'manager' ? 'quản sinh' : 'tình nguyện viên'}: <span className="font-semibold">{user.name}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(90vh-140px)]">
          {/* Controls */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-600" />
                <span className="text-sm text-gray-600">
                  Đã chọn: <span className="font-semibold text-blue-600">{selectedPermissions.length}</span> quyền
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAllPermissions}
                  className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                >
                  Chọn tất cả
                </button>
                <button
                  onClick={clearAllPermissions}
                  className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>
          </div>

          {/* Permission Groups */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {PERMISSION_GROUPS.map((group) => {
                const isExpanded = expandedGroups.has(group.id);
                const isFullySelected = isGroupFullySelected(group.id);
                const isPartiallySelected = isGroupPartiallySelected(group.id);

                return (
                  <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Group Header */}
                    <div className="bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className="text-gray-500 hover:text-gray-700 transition-all"
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isFullySelected}
                              ref={(el) => {
                                if (el) el.indeterminate = isPartiallySelected;
                              }}
                              onChange={(e) => toggleGroupPermissions(group.id, e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">{group.name}</h3>
                              <p className="text-sm text-gray-600">{group.description}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {group.permissions.filter(p => selectedPermissions.includes(p)).length}/{group.permissions.length}
                          </span>
                          <Info size={14} className="text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Group Permissions */}
                    {isExpanded && (
                      <div className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.permissions.map((permissionId) => {
                            const permission = PERMISSIONS.find(p => p.id === permissionId);
                            if (!permission) return null;

                            const isSelected = selectedPermissions.includes(permissionId);

                            return (
                              <div
                                key={permissionId}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'border-blue-200 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                                onClick={() => togglePermission(permissionId)}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => togglePermission(permissionId)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">{permission.name}</p>
                                  <p className="text-xs text-gray-600">{permission.description}</p>
                                </div>
                                {isSelected && (
                                  <Check size={16} className="text-blue-600" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <Info size={14} className="inline mr-1" />
                Quyền được cấp sẽ có hiệu lực ngay lập tức
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  Lưu quyền
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
