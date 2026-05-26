import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { categoriesApi } from '../../api/categories';
import { menuItemsApi } from '../../api/menuItems';
import type { Category, MenuItem } from '../../types';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoriesApi.getAll().catch(() => [] as Category[]),
      menuItemsApi.getAll().catch(() => [] as MenuItem[]),
    ]).then(([c, m]) => { setCategories(c); setMenuItems(m); setLoading(false); });
  }, []);

  const available = menuItems.filter((i) => i.isAvailable).length;
  const unavailable = menuItems.length - available;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="relative bg-linear-to-r from-slate-800 to-slate-900 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-orange-500 rounded-full" />
          <div className="absolute -right-4 -bottom-12 w-32 h-32 bg-orange-400 rounded-full" />
        </div>
        <div className="relative">
          <p className="text-slate-400 text-sm font-medium mb-1">Xush kelibsiz 👋</p>
          <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
          {user?.restaurant && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-orange-400 text-sm font-medium">{user.restaurant.name}</span>
              <span className="text-slate-600">·</span>
              <Link
                to={`/menu/${user.restaurant.slug}`}
                className="text-slate-400 hover:text-orange-400 text-sm transition-colors flex items-center gap-1"
              >
                /menu/{user.restaurant.slug}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Kategoriyalar"
          value={loading ? '—' : categories.length}
          sub={loading ? '' : `${categories.length} ta faol`}
          gradient="from-blue-500 to-blue-600"
          shadow="shadow-blue-500/20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </StatCard>
        <StatCard
          label="Menu elementlari"
          value={loading ? '—' : menuItems.length}
          sub={loading ? '' : `${unavailable} ta yopiq`}
          gradient="from-orange-500 to-orange-600"
          shadow="shadow-orange-500/20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </StatCard>
        <StatCard
          label="Mavjud taomlar"
          value={loading ? '—' : available}
          sub={loading ? '' : menuItems.length > 0 ? `${Math.round((available / menuItems.length) * 100)}% faol` : 'hech narsa yo\'q'}
          gradient="from-emerald-500 to-emerald-600"
          shadow="shadow-emerald-500/20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </StatCard>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Tezkor harakatlar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction to="/admin/categories" label="Kategoriya" sub="qo'shish" color="blue">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </QuickAction>
          <QuickAction to="/admin/menu" label="Taom" sub="qo'shish" color="orange">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </QuickAction>
          <QuickAction to="/admin/qrcode" label="QR Code" sub="yuklab olish" color="purple">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </QuickAction>
          {user?.restaurant && (
            <Link
              to={`/menu/${user.restaurant.slug}`}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <div className="text-center">
                <p className="text-xs font-semibold">Menyu</p>
                <p className="text-xs opacity-60">ko'rish</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Recent items */}
      {!loading && menuItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">So'nggi taomlar</h2>
            <Link to="/admin/menu" className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
              Barchasini ko'rish →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {menuItems.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                  {item.category && (
                    <span className="inline-block text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md font-medium mt-0.5">
                      {item.category.name}
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">
                    {Number(item.price).toLocaleString('uz-UZ')} <span className="font-normal text-gray-400 text-xs">so'm</span>
                  </p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${
                    item.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.isAvailable ? 'Mavjud' : 'Yopiq'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && menuItems.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 mb-1">Menyu bo'sh</p>
          <p className="text-sm text-gray-400 mb-5">Birinchi taomingizni qo'shish bilan boshlang</p>
          <Link
            to="/admin/menu"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Taom qo'shish
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label, value, sub, gradient, shadow, children,
}: {
  label: string; value: string | number; sub: string;
  gradient: string; shadow: string; children: React.ReactNode;
}) {
  return (
    <div className={`bg-linear-to-br ${gradient} rounded-2xl p-5 text-white shadow-lg ${shadow}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
          {children}
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-white/70 text-sm mt-1">{label}</p>
      {sub && <p className="text-white/50 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

function QuickAction({
  to, label, sub, color, children,
}: {
  to: string; label: string; sub: string; color: 'blue' | 'orange' | 'purple'; children: React.ReactNode;
}) {
  const palette = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600',
    orange: 'bg-orange-50 hover:bg-orange-100 text-orange-600',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600',
  }[color];
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] ${palette}`}
    >
      {children}
      <div className="text-center">
        <p className="text-xs font-semibold">{label}</p>
        <p className="text-xs opacity-60">{sub}</p>
      </div>
    </Link>
  );
}
