import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { restaurantsApi } from '../../api/restaurants';
import type { Stats } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restaurantsApi.getStats().then(setStats).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="relative bg-linear-to-r from-slate-800 to-slate-900 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-orange-500 rounded-full" />
          <div className="absolute right-20 -bottom-8 w-24 h-24 bg-orange-400 rounded-full" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              SuperAdmin
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Platform boshqaruvi</h1>
          <p className="text-slate-400 text-sm mt-1">Barcha restoranlar va adminlarni boshqaring</p>
        </div>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Jami restoranlar"
              value={stats?.totalRestaurants ?? 0}
              gradient="from-blue-500 to-blue-600"
              shadow="shadow-blue-500/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </StatCard>
            <StatCard
              label="Faol restoranlar"
              value={stats?.activeRestaurants ?? 0}
              gradient="from-emerald-500 to-emerald-600"
              shadow="shadow-emerald-500/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </StatCard>
            <StatCard
              label="Adminlar"
              value={stats?.totalUsers ?? 0}
              gradient="from-violet-500 to-violet-600"
              shadow="shadow-violet-500/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </StatCard>
            <StatCard
              label="Menu elementlari"
              value={stats?.totalMenuItems ?? 0}
              gradient="from-orange-500 to-orange-600"
              shadow="shadow-orange-500/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </StatCard>
          </div>

          {/* Activity rate */}
          {stats && stats.totalRestaurants > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Faollik darajasi</p>
                <p className="text-sm font-bold text-emerald-600">
                  {Math.round((stats.activeRestaurants / stats.totalRestaurants) * 100)}%
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-linear-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.round((stats.activeRestaurants / stats.totalRestaurants) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {stats.activeRestaurants} ta faol / {stats.totalRestaurants} ta jami restoran
              </p>
            </div>
          )}

          {/* Quick links */}
          <div className="grid sm:grid-cols-2 gap-4">
            <QuickLink
              to="/superadmin/restaurants"
              title="Restoranlar"
              desc="Restoran qo'shish, tahrirlash, bloklash"
              badge={stats?.totalRestaurants ?? 0}
              color="blue"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </QuickLink>
            <QuickLink
              to="/superadmin/admins"
              title="Adminlar"
              desc="Yangi admin yaratish va boshqarish"
              badge={stats?.totalUsers ?? 0}
              color="purple"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </QuickLink>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label, value, gradient, shadow, children,
}: {
  label: string; value: number; gradient: string; shadow: string; children: React.ReactNode;
}) {
  return (
    <div className={`bg-linear-to-br ${gradient} rounded-2xl p-5 text-white shadow-lg ${shadow}`}>
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
        {children}
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-white/70 text-sm mt-1">{label}</p>
    </div>
  );
}

function QuickLink({
  to, title, desc, badge, color, children,
}: {
  to: string; title: string; desc: string; badge: number; color: 'blue' | 'purple'; children: React.ReactNode;
}) {
  const palette = {
    blue: { bg: 'bg-blue-50 text-blue-600', border: 'hover:border-blue-200' },
    purple: { bg: 'bg-violet-50 text-violet-600', border: 'hover:border-violet-200' },
  }[color];

  return (
    <Link
      to={to}
      className={`flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group ${palette.border}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${palette.bg}`}>
        {children}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-800 group-hover:text-gray-900">{title}</p>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{badge}</span>
        </div>
        <p className="text-sm text-gray-400 mt-0.5 truncate">{desc}</p>
      </div>
      <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
