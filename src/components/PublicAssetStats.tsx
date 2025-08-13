import React, { useState, useMemo } from 'react';
import { Package, TrendingUp, Users, Calendar, BarChart3, Search, X } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function PublicAssetStats() {
  const { assets, assetDistributions, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTab, setActiveSearchTab] = useState<'assets' | 'distributions'>('assets');

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

  // Filter assets and distributions based on search term
  const filteredAssets = useMemo(() => {
    if (!searchTerm) return assets;
    const searchLower = searchTerm.toLowerCase();
    return assets.filter(asset =>
      asset.name.toLowerCase().includes(searchLower) ||
      (asset.category && asset.category.toLowerCase().includes(searchLower)) ||
      (asset.description && asset.description.toLowerCase().includes(searchLower)) ||
      (asset.donor && asset.donor.toLowerCase().includes(searchLower))
    );
  }, [assets, searchTerm]);

  const filteredDistributions = useMemo(() => {
    if (!searchTerm) return assetDistributions;
    const searchLower = searchTerm.toLowerCase();
    return assetDistributions.filter(dist =>
      dist.assetName.toLowerCase().includes(searchLower) ||
      dist.assignedTo.toLowerCase().includes(searchLower) ||
      (dist.purpose && dist.purpose.toLowerCase().includes(searchLower))
    );
  }, [assetDistributions, searchTerm]);

  // Calculate category statistics
  const categoryStats = assets.reduce((acc, asset) => {
    const category = asset.category || 'Khác';
    if (!acc[category]) {
      acc[category] = { total: 0, available: 0, distributed: 0 };
    }
    acc[category].total += asset.quantity;
    if (asset.status === 'available') {
      acc[category].available += asset.quantity;
    } else if (asset.status === 'distributed') {
      acc[category].distributed += asset.quantity;
    }
    return acc;
  }, {} as Record<string, { total: number; available: number; distributed: number }>);

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Search size={20} className="text-blue-600" />
          Tìm kiếm tài sản
        </h4>

        {/* Search Input */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, danh mục, mô tả, người tặng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X size={16} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Search Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveSearchTab('assets')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeSearchTab === 'assets'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Tài sản nhận ({filteredAssets.length})
          </button>
          <button
            onClick={() => setActiveSearchTab('distributions')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeSearchTab === 'distributions'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Phân phối ({filteredDistributions.filter(d => d.status === 'active').length})
          </button>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className="bg-white rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
            {activeSearchTab === 'assets' ? (
              <div className="divide-y divide-gray-100">
                {filteredAssets.length > 0 ? (
                  filteredAssets.slice(0, 10).map((asset) => (
                    <div key={asset.id} className="p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Package size={14} className="text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{asset.name}</div>
                            <div className="text-sm text-gray-500">
                              {asset.category} • {asset.quantity} cái
                              {asset.donor && ` • Từ: ${asset.donor}`}
                            </div>
                            {asset.description && (
                              <div className="text-xs text-gray-400 mt-1 truncate">{asset.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {asset.receivedDate ? new Date(asset.receivedDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Không tìm thấy tài sản nào phù hợp
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredDistributions.filter(d => d.status === 'active').length > 0 ? (
                  filteredDistributions
                    .filter(d => d.status === 'active')
                    .slice(0, 10)
                    .map((distribution) => (
                      <div key={distribution.id} className="p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <Users size={14} className="text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{distribution.assetName}</div>
                              <div className="text-sm text-gray-500">
                                Giao cho: {distribution.assignedTo} • {distribution.quantity} cái
                              </div>
                              {distribution.purpose && (
                                <div className="text-xs text-gray-400 mt-1 truncate">Mục đích: {distribution.purpose}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(distribution.distributedDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Không tìm thấy phân phối nào phù hợp
                  </div>
                )}
              </div>
            )}
            {((activeSearchTab === 'assets' && filteredAssets.length > 10) ||
              (activeSearchTab === 'distributions' && filteredDistributions.filter(d => d.status === 'active').length > 10)) && (
              <div className="p-2 text-center text-xs text-gray-500 bg-gray-50 border-t">
                Chỉ hiển thị 10 kết quả đầu tiên
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-center border border-gray-200 hover:shadow-md transition-shadow">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.color} text-white mb-3 shadow-sm`}>
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

      {/* Category Breakdown */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" />
            Phân loại theo danh mục
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="bg-white rounded-lg p-3 border border-indigo-100">
                <div className="font-medium text-gray-900 mb-2 truncate">{category}</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng:</span>
                    <span className="font-medium text-gray-900">{stats.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Có sẵn:</span>
                    <span className="font-medium text-green-700">{stats.available}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-600">Đã phân phối:</span>
                    <span className="font-medium text-orange-700">{stats.distributed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Assets */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={20} className="text-blue-600" />
          Tài sản mới nhận
          {searchTerm && (
            <span className="text-sm font-normal text-gray-500">
              ({filteredAssets.length} kết quả)
            </span>
          )}
        </h3>
        <div className="space-y-3">
          {(searchTerm ? filteredAssets : assets)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, searchTerm ? 10 : 5)
            .map((asset) => (
              <div key={asset.id} className="bg-gradient-to-r from-blue-50 to-blue-25 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{asset.name}</div>
                      <div className="text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          📦 {asset.category}
                        </span>
                        {asset.description && (
                          <span className="block text-xs text-gray-500 mt-1 truncate">
                            {asset.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                      {asset.quantity} cái
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {asset.receivedDate ? new Date(asset.receivedDate).toLocaleDateString('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : 'Chưa có ngày'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {asset.donor && `Từ: ${asset.donor}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {(searchTerm ? filteredAssets : assets).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package size={48} className="mx-auto mb-3 text-gray-300" />
            <p>{searchTerm ? 'Không tìm thấy tài sản nào phù hợp' : 'Chưa có tài sản nào được nhận'}</p>
          </div>
        )}
      </div>

      {/* Recent Distributions */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={20} className="text-orange-600" />
          Phân phối gần đây
          {searchTerm && (
            <span className="text-sm font-normal text-gray-500">
              ({filteredDistributions.filter(d => d.status === 'active').length} kết quả)
            </span>
          )}
        </h3>
        <div className="space-y-3">
          {(searchTerm ? filteredDistributions : assetDistributions).filter(d => d.status === 'active').length > 0 ? (
            (searchTerm ? filteredDistributions : assetDistributions)
              .filter(d => d.status === 'active')
              .sort((a, b) => new Date(b.distributedDate).getTime() - new Date(a.distributedDate).getTime())
              .slice(0, searchTerm ? 10 : 5)
              .map((distribution) => (
                <div key={distribution.id} className="bg-gradient-to-r from-orange-50 to-orange-25 rounded-lg p-3 border border-orange-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Users size={18} className="text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{distribution.assetName}</div>
                        <div className="text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            👤 Giao cho: <span className="font-medium">{distribution.assignedTo}</span>
                          </span>
                        </div>
                        {distribution.purpose && (
                          <div className="text-xs text-gray-500 mt-1">
                            🎯 Mục đích: {distribution.purpose}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-sm font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded">
                        {distribution.quantity} cái
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(distribution.distributedDate).toLocaleDateString('vi-VN', {
                          timeZone: 'Asia/Ho_Chi_Minh',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                      {distribution.expectedReturnDate && (
                        <div className="text-xs text-gray-400">
                          📅 Dự kiến trả: {new Date(distribution.expectedReturnDate).toLocaleDateString('vi-VN', {
                            timeZone: 'Asia/Ho_Chi_Minh',
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-3 text-gray-300" />
              <p>{searchTerm ? 'Không tìm thấy phân phối nào phù hợp' : 'Chưa có phân phối tài sản nào'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Activity Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-green-600" />
          Hoạt động trong tháng
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 text-center border border-green-100">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {assets.filter(asset => {
                const assetDate = new Date(asset.createdAt);
                const now = new Date();
                return assetDate.getMonth() === now.getMonth() && assetDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <div className="text-sm text-green-600">Tài sản mới nhận</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-green-100">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {assetDistributions.filter(dist => {
                const distDate = new Date(dist.distributedDate);
                const now = new Date();
                return distDate.getMonth() === now.getMonth() && distDate.getFullYear() === now.getFullYear() && dist.status === 'active';
              }).length}
            </div>
            <div className="text-sm text-green-600">Lần phân phối</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-green-100">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {assetDistributions.filter(dist => {
                const returnDate = dist.returnedDate ? new Date(dist.returnedDate) : null;
                const now = new Date();
                return returnDate && returnDate.getMonth() === now.getMonth() && returnDate.getFullYear() === now.getFullYear() && dist.status === 'returned';
              }).length}
            </div>
            <div className="text-sm text-green-600">Tài sản đã trả</div>
          </div>
        </div>
      </div>
    </div>
  );
}
