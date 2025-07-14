import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Edit, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function FinancePublicView() {
  const { finances } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterDate, setFilterDate] = useState('');

  // Calculate totals
  const totals = useMemo(() => {
    const income = finances
      .filter(f => f.type === 'income')
      .reduce((sum, f) => sum + f.amount, 0);
    
    const expense = finances
      .filter(f => f.type === 'expense')
      .reduce((sum, f) => sum + f.amount, 0);
    
    const balance = income - expense;
    
    return { income, expense, balance };
  }, [finances]);

  // Filter finances
  const filteredFinances = useMemo(() => {
    return finances.filter(finance => {
      const matchesSearch = finance.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           finance.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || finance.type === filterType;
      
      const matchesDate = !filterDate || finance.date === filterDate;
      
      return matchesSearch && matchesType && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [finances, searchTerm, filterType, filterDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getTypeLabel = (type: string) => {
    return type === 'income' ? 'Thu' : 'Chi';
  };

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const getAmountDisplay = (finance: any) => {
    const sign = finance.type === 'income' ? '+' : '-';
    const color = finance.type === 'income' ? 'text-green-600' : 'text-red-600';
    return (
      <span className={`font-semibold ${color}`}>
        {sign}{formatCurrency(finance.amount).replace('₫', ' VND')}
      </span>
    );
  };

  return (
    <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Income */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng thu</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.income).replace('₫', ' VND')}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng chi</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.expense).replace('₫', ' VND')}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Số dư</p>
              <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(totals.balance).replace('₫', ' VND')}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="income">Thu</option>
            <option value="expense">Chi</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Finance Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFinances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Không có giao dịch nào
                  </td>
                </tr>
              ) : (
                filteredFinances.map((finance) => (
                  <tr key={finance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(finance.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        finance.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {getTypeLabel(finance.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {finance.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {finance.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {getAmountDisplay(finance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-gray-500">
        Hiển thị {filteredFinances.length} giao dịch trong tổng số {finances.length} giao dịch
      </div>
    </div>
  );
}
