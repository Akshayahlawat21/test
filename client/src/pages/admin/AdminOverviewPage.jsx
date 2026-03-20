import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CurrencyDollarIcon,
  HeartIcon,
  TrophyIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../components/admin/StatCard';
import SimpleChart from '../../components/admin/SimpleChart';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { getReports } from '../../api/admin';

const quickLinks = [
  { label: 'User Management', to: '/admin/users', icon: UsersIcon, color: 'blue' },
  { label: 'Charity Management', to: '/admin/charities', icon: HeartIcon, color: 'green' },
  { label: 'Draw Management', to: '/admin/draws', icon: TrophyIcon, color: 'purple' },
  { label: 'Reports', to: '/admin/reports', icon: ChartBarIcon, color: 'amber' },
];

const fmt = (n) => {
  if (n === undefined || n === null) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
};

const fmtEur = (n) => {
  if (n === undefined || n === null) return '\u20AC0';
  return `\u20AC${fmt(n)}`;
};

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getReports();
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton variant="card" count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700">
        {error}
      </div>
    );
  }

  const { overview, financials, userGrowth, revenueByMonth } = data || {};

  const stats = [
    { label: 'Total Users', value: fmt(overview?.totalUsers), icon: UsersIcon, color: 'blue' },
    { label: 'Active Subscribers', value: fmt(overview?.activeSubscribers), icon: ClipboardDocumentListIcon, color: 'green' },
    { label: 'Subscription Revenue', value: fmtEur(financials?.totalSubscriptionRevenue), icon: CurrencyDollarIcon, color: 'purple' },
    { label: 'Total Donated', value: fmtEur(financials?.totalDonations), icon: HeartIcon, color: 'rose' },
    { label: 'Published Draws', value: fmt(overview?.publishedDraws), icon: TrophyIcon, color: 'amber' },
    { label: 'Active Charities', value: fmt(overview?.activeCharities), icon: HeartIcon, color: 'teal' },
  ];

  const growthChartData = (userGrowth || []).map(item => ({
    label: item._id,
    value: item.count,
  }));

  const revenueChartData = (revenueByMonth || []).map(item => ({
    label: item._id,
    value: item.total,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Platform overview and key metrics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} index={i} />
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
            >
              <link.icon className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart data={growthChartData} title="Monthly User Growth (Last 6 Months)" color="#3b82f6" />
        <SimpleChart data={revenueChartData} title="Monthly Revenue (Last 6 Months)" color="#8b5cf6" />
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Financial Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400">Subscription Revenue</p>
            <p className="text-lg font-bold text-gray-900">{fmtEur(financials?.totalSubscriptionRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Donations</p>
            <p className="text-lg font-bold text-gray-900">{fmtEur(financials?.totalDonations)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Payouts</p>
            <p className="text-lg font-bold text-gray-900">{fmtEur(financials?.totalPayouts)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Net Revenue</p>
            <p className="text-lg font-bold text-green-600">{fmtEur(financials?.netRevenue)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
