'use client';

import { useEffect, useState } from 'react';

type DashboardStats = {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      
      {loading && (
        <div className="flex justify-center">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-500 rounded-lg">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-medium">Total Products</h2>
            <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-medium">Total Orders</h2>
            <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-medium">Total Revenue</h2>
            <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
      )}
      
    </div>
  );
}