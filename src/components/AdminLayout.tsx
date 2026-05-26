import { useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const adminNav = [
  {
    label: 'Bosh sahifa',
    path: '/admin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Kategoriyalar',
    path: '/admin/categories',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    label: 'Menu',
    path: '/admin/menu',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'QR Code',
    path: '/admin/qrcode',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
];

const superadminNav = [
  {
    label: 'Bosh sahifa',
    path: '/superadmin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Restoranlar',
    path: '/superadmin/restaurants',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    label: 'Adminlar',
    path: '/superadmin/admins',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: 'Tariflar',
    path: '/superadmin/plans',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const nav = user?.role === 'SUPERADMIN' ? superadminNav : adminNav;
  const initials = useMemo(() => user?.name?.slice(0, 2).toUpperCase() ?? 'AD', [user?.name]);

  const currentPage = useMemo(
    () => nav.find((n) =>
      n.path === '/superadmin/restaurants'
        ? location.pathname.startsWith('/superadmin/restaurants')
        : location.pathname === n.path,
    ),
    [nav, location.pathname],
  );

  const handleLogout = useCallback(() => { logout(); navigate('/login'); }, [logout, navigate]);
  const closeSidebar = useCallback(() => setOpen(false), []);
  const openSidebar = useCallback(() => setOpen(true), []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col
          w-64 bg-white border-r border-gray-100 shadow-xl shadow-gray-200/50
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:shrink-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100 shrink-0">
          <div className="w-9 h-9 bg-linear-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 font-bold text-sm leading-tight">QR Menu</p>
            <p className="text-gray-400 text-[11px] leading-tight">
              {user?.role === 'SUPERADMIN' ? 'Super Admin' : 'Admin Panel'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {nav.map((item) => {
            const active = item.path === '/superadmin/restaurants'
              ? location.pathname.startsWith('/superadmin/restaurants')
              : location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-orange-50 text-orange-600 border border-orange-100'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
              >
                <span className={`shrink-0 ${active ? 'text-orange-500' : ''}`}>{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t border-gray-100" />

        {/* User block */}
        <div className="px-3 py-4 shrink-0 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 shadow-sm shadow-orange-400/30">
              <span className="text-white font-bold text-xs">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-800 text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-gray-400 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Chiqish
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 shrink-0 bg-white border-b border-gray-100 px-4 lg:px-6 flex items-center gap-4">
          <button
            className="lg:hidden p-2 -ml-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            onClick={openSidebar}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            {currentPage && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm hidden sm:block">
                  {user?.role === 'SUPERADMIN' ? 'Super Admin' : user?.restaurant?.name}
                </span>
                <span className="text-gray-300 hidden sm:block">/</span>
                <span className="font-semibold text-gray-800 text-sm">{currentPage.label}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'SUPERADMIN' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-full font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                SuperAdmin
              </span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
