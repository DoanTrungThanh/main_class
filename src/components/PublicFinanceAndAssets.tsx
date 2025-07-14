import React, { useState } from 'react';
import { DollarSign, Package } from 'lucide-react';
import FinancePublicView from './FinancePublicView';
import PublicAssetStats from './PublicAssetStats';

export default function PublicFinanceAndAssets() {
  const [activeTab, setActiveTab] = useState<'finance' | 'assets'>('finance');

  const tabs = [
    {
      id: 'finance' as const,
      label: 'Thu chi',
      icon: DollarSign,
      description: 'Báo cáo tài chính'
    },
    {
      id: 'assets' as const,
      label: 'Tài sản',
      icon: Package,
      description: 'Thống kê tài sản'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'finance' && <FinancePublicView />}
        {activeTab === 'assets' && <PublicAssetStats />}
      </div>
    </div>
  );
}
