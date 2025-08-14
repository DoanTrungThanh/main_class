import React from 'react';
import { User, Lock, Shield, GraduationCap } from 'lucide-react';

export default function DemoLoginInfo() {
  const demoAccounts = [
    {
      role: 'Admin',
      email: 'admin@school.com',
      password: 'password',
      icon: Shield,
      color: 'text-red-600 bg-red-50 border-red-200',
      description: 'Toàn quyền quản trị hệ thống'
    },
    {
      role: 'Manager',
      email: 'manager@school.com',
      password: 'password',
      icon: User,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      description: 'Quản lý theo nhóm quyền'
    },
    {
      role: 'Teacher',
      email: 'teacher@school.com',
      password: 'password',
      icon: GraduationCap,
      color: 'text-green-600 bg-green-50 border-green-200',
      description: 'Giảng dạy và chấm điểm'
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Lock className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          🚀 Demo Accounts - Tài khoản thử nghiệm
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demoAccounts.map((account, index) => {
          const IconComponent = account.icon;
          return (
            <div
              key={index}
              className={`border rounded-lg p-4 ${account.color} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center mb-2">
                <IconComponent className="w-5 h-5 mr-2" />
                <h4 className="font-semibold">{account.role}</h4>
              </div>
              
              <p className="text-sm mb-3 opacity-80">{account.description}</p>
              
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium opacity-70">Email:</label>
                  <div 
                    className="text-sm font-mono bg-white bg-opacity-50 px-2 py-1 rounded cursor-pointer hover:bg-opacity-70 transition-colors"
                    onClick={() => copyToClipboard(account.email)}
                    title="Click để copy"
                  >
                    {account.email}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium opacity-70">Password:</label>
                  <div 
                    className="text-sm font-mono bg-white bg-opacity-50 px-2 py-1 rounded cursor-pointer hover:bg-opacity-70 transition-colors"
                    onClick={() => copyToClipboard(account.password)}
                    title="Click để copy"
                  >
                    {account.password}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs opacity-60">
                💡 Click để copy thông tin
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <div className="text-yellow-600 mr-2">⚠️</div>
          <div className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Đây là tài khoản demo cho môi trường phát triển. 
            Trong production, hãy sử dụng mật khẩu mạnh và thiết lập Supabase authentication.
          </div>
        </div>
      </div>
    </div>
  );
}
