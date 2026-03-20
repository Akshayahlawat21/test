import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  CurrencyDollarIcon,
  HeartIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../components/admin/StatCard';
import SimpleChart from '../../components/admin/SimpleChart';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { getReports } from '../../api/admin';

const fmt = (n) => {
  if (n === undefined || n === null) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
};

const fmtEur = (n) => {
  if (n === undefined || n === null) return '\u20AC0';
  return `\u20AC${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getReports();
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton variant="card" count={4} />
        </div>
        <LoadingSkeleton variant="card" count={2} />
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

  const { overview, financials, charityTotals, drawStats, userGrowth, revenueByMonth } = data || {};

  const stats = [
    { label: 'Total Users', value: fmt(overview?.totalUsers), icon: UsersIcon, color: 'blue' },
    { label: 'Active Subscribers', value: fmt(overview?.activeSubscribers), icon: UsersIcon, color: 'green' },
    { label: 'Monthly Subs', value: fmt(overview?.monthlySubscribers), icon: CurrencyDollarIcon, color: 'purple' },
    { label: 'Yearly Subs', value: fmt(overview?.yearlySubscribers), icon: CurrencyDollarIcon, color: 'indigo' },
  ];

  const growthChartData = (userGrowth || []).map(item => ({
    label: item._id,
    value: item.count,
  }));

  const revenueChartData = (revenueByMonth || []).map(item => ({
    label: item._id,
    value: item.total,
  }));

  const drawChartData = (drawStats || []).reverse().map(item => ({
    label: item.month,
    value: item.totalPool,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm">Data from the last 6 months</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} index={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart data={growthChartData} title="Monthly User Growth" color="#3b82f6" />
        <SimpleChart data={revenueChartData} title="Monthly Revenue" color="#8b5cf6" />
      </div>

      <SimpleChart data={drawChartData} title="Prize Pool by Draw" color="#f59e0b" height={220} />

      {/* Top Charities */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Charities by Total Received</h2>
        {(!charityTotals || charityTotals.length === 0) ? (
          <p className="text-sm text-gray-400">No charity data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">#</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Charity</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Total Received</th>
                </tr>
              </thead>
              <tbody>
                {charityTotals.map((c, i) => (
                  <tr key={c._id} className="border-b border-gray-50">
                    <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">{c.name}</td>
                    <td className="py-2 px-3 text-right text-gray-700">{fmtEur(c.totalReceived)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Draw History */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Draw History</h2>
        {(!drawStats || drawStats.length === 0) ? (
          <p className="text-sm text-gray-400">No draw data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Month</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Prize Pool</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Winners</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Jackpot Rolled Over</th>
                </tr>
              </thead>
              <tbody>
                {drawStats.map((d) => (
                  <tr key={d.month} className="border-b border-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-900">{d.month}</td>
                    <td className="py-2 px-3 text-right text-gray-700">{fmtEur(d.totalPool)}</td>
                    <td className="py-2 px-3 text-right text-gray-700">{d.winners}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        d.jackpotRolledOver ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {d.jackpotRolledOver ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Financial Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Subscription Revenue</p>
            <p className="text-xl font-bold text-gray-900">{fmtEur(financials?.totalSubscriptionRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Charity Donations</p>
            <p className="text-xl font-bold text-gray-900">{fmtEur(financials?.totalDonations)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Prize Payouts</p>
            <p className="text-xl font-bold text-gray-900">{fmtEur(financials?.totalPayouts)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Net Revenue</p>
            <p className={`text-xl font-bold ${(financials?.netRevenue || 0) >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
              {fmtEur(financials?.netRevenue)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
