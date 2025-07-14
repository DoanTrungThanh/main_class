import React from 'react';
import { Package, TrendingUp, Users, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function PublicAssetStats() {
  const { assets, assetDistributions, loading } = useData();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalAssets = assets.reduce((sum, asset) => sum + asset.quantity, 0);
  const availableAssets = assets
    .filter(asset => asset.status === 'available')
    .reduce((sum, asset) => sum + asset.quantity, 0);
  const distributedAssets = assets
    .filter(asset => asset.status === 'distributed')
    .reduce((sum, asset) => sum + asset.quantity, 0);
  const totalDistributions = assetDistributions.filter(d => d.status === 'active').length;

  // Recent distributions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentDistributions = assetDistributions.filter(d => 
    new Date(d.distributedDate) >= thirtyDaysAgo && d.status === 'active'
  ).length;

  const stats = [
    {
      title: 'Tổng tài sản',
      value: totalAssets,
      icon: Package,
      color: 'bg-blue-500',
      description: 'Tổng số tài sản hiện có'
    },
    {
      title: 'Có sẵn',
      value: availableAssets,
      icon: TrendingUp,
      color: 'bg-green-500',
      description: 'Tài sản sẵn sàng sử dụng'
    },
    {
      title: 'Đã phân phối',
      value: distributedAssets,
      icon: Users,
      color: 'bg-orange-500',
      description: 'Tài sản đang được sử dụng'
    },
    {
      title: 'Phân phối gần đây',
      value: recentDistributions,
      icon: Calendar,
      color: 'bg-purple-500',
      description: 'Trong 30 ngày qua'
    }
  ];

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.color} text-white mb-3`}>
                <Icon size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                {stat.title}
              </div>
              <div className="text-xs text-gray-500">
                {stat.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Assets */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tài sản mới nhận</h3>
        <div className="space-y-3">
          {assets
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((asset) => (
              <div key={asset.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{asset.name}</div>
                    <div className="text-sm text-gray-500">{asset.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {asset.quantity} {asset.quantity > 1 ? 'cái' : 'cái'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {asset.receivedDate ? new Date(asset.receivedDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'Chưa có ngày'}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Distributions */}
      {assetDistributions.length > 0 && (
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân phối gần đây</h3>
          <div className="space-y-3">
            {assetDistributions
              .filter(d => d.status === 'active')
              .sort((a, b) => new Date(b.distributedDate).getTime() - new Date(a.distributedDate).getTime())
              .slice(0, 5)
              .map((distribution) => (
                <div key={distribution.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{distribution.assetName}</div>
                      <div className="text-sm text-gray-500">Giao cho: {distribution.assignedTo}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {distribution.quantity} {distribution.quantity > 1 ? 'cái' : 'cái'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(distribution.distributedDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
