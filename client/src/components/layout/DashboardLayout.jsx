import { useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  TrophyIcon,
  BanknotesIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  ChevronRightIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../common/Toast';
import Navbar from './Navbar';

const userLinks = [
  { to: '/dashboard', icon: HomeIcon, label: 'Overview', end: true },
  { to: '/dashboard/scores', icon: ClipboardDocumentListIcon, label: 'My Scores' },
  { to: '/dashboard/charity', icon: HeartIcon, label: 'My Charity' },
  { to: '/dashboard/draws', icon: TrophyIcon, label: 'Draw Results' },
  { to: '/dashboard/winnings', icon: BanknotesIcon, label: 'Winnings' },
];

const adminLinks = [
  { to: '/admin', icon: ChartBarIcon, label: 'Overview', end: true },
  { to: '/admin/users', icon: UsersIcon, label: 'Users' },
  { to: '/admin/draws', icon: TicketIcon, label: 'Draws' },
  { to: '/admin/charities', icon: HeartIcon, label: 'Charities' },
  { to: '/admin/winners', icon: ShieldCheckIcon, label: 'Winner Verification' },
  { to: '/admin/reports', icon: ChartBarIcon, label: 'Reports' },
];

function SidebarLink({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
          isActive
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {label}
    </NavLink>
  );
}

function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  return (
    <div className="flex items-center gap-1 text-sm text-gray-400 mb-6">
      {parts.map((part, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRightIcon className="h-3 w-3" />}
          <span className={index === parts.length - 1 ? 'text-gray-700 font-medium' : ''}>
            {part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toast />
      <Navbar />

      <div className="flex-1 flex">
        {/* Mobile sidebar toggle */}
        <button
          className="lg:hidden fixed bottom-4 left-4 z-50 bg-primary-500 text-white p-3 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-5 w-5" />
          ) : (
            <Bars3BottomLeftIcon className="h-5 w-5" />
          )}
        </button>

        {/* Sidebar overlay for mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)]
            w-64 bg-white border-r border-gray-100
            transition-transform duration-300 lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            overflow-y-auto
          `}
        >
          <div className="p-4 space-y-1">
            <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {isAdmin ? 'Administration' : 'Dashboard'}
            </p>
            {links.map((link) => (
              <SidebarLink key={link.to} {...link} />
            ))}

            {/* Show admin links when on user dashboard if admin */}
            {!isAdmin && user?.role === 'admin' && (
              <>
                <hr className="my-3 border-gray-100" />
                <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Admin
                </p>
                {adminLinks.slice(0, 3).map((link) => (
                  <SidebarLink key={link.to} {...link} />
                ))}
                <Link
                  to="/admin"
                  className="block px-3 py-2 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                >
                  View all admin pages &rarr;
                </Link>
              </>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 max-w-6xl">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
