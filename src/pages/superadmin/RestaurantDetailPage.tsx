import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsApi } from '../../api/restaurants';
import { plansApi } from '../../api/plans';
import type { RestaurantDetail, PlanConfig } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

function limitStr(val: number): string { return String(val); }

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState('');
  const [toggling, setToggling] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [plans, setPlans] = useState<PlanConfig[]>([]);

  const load = () => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([restaurantsApi.getOne(id), plansApi.getAll()])
      .then(([r, p]) => { setRestaurant(r); setPlans(p); })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (!id) return;
    restaurantsApi.getQRCode(id)
      .then((blob) => setQrUrl(URL.createObjectURL(blob)))
      .catch(() => {});
  }, [id]);

  const handleToggleActive = async () => {
    if (!restaurant) return;
    setToggling(true);
    const fd = new FormData();
    fd.append('isActive', String(!restaurant.isActive));
    try { await restaurantsApi.update(restaurant.id, fd); load(); }
    catch { alert('Holatni o\'zgartirishda xatolik'); }
    finally { setToggling(false); }
  };

  const handleChangePlan = async (plan: string) => {
    if (!restaurant || restaurant.plan === plan) return;
    setChangingPlan(true);
    const fd = new FormData();
    fd.append('plan', plan);
    try { await restaurantsApi.update(restaurant.id, fd); load(); }
    catch { alert('Tarifni o\'zgartirishda xatolik'); }
    finally { setChangingPlan(false); }
  };

  const handleDelete = async () => {
    if (!restaurant) return;
    if (!confirm(`"${restaurant.name}" restoranni o'chirishni tasdiqlaysizmi?`)) return;
    try { await restaurantsApi.delete(restaurant.id); navigate('/superadmin/restaurants'); }
    catch { alert('O\'chirishda xatolik yuz berdi'); }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!restaurant) return (
    <div className="text-center py-20 text-gray-400">Restoran topilmadi</div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Back */}
      <button
        onClick={() => navigate('/superadmin/restaurants')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Restoranlar ro'yxatiga qaytish
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-5">
          {/* Logo */}
          <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
            {restaurant.logo ? (
              <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-300">
                {restaurant.name.slice(0, 1)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                restaurant.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
              }`}>
                {restaurant.isActive ? 'Faol' : 'Bloklangan'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold border bg-orange-50 text-orange-600 border-orange-200">
                {restaurant.plan}
              </span>
            </div>
            <p className="text-sm text-orange-500 font-medium">/menu/{restaurant.slug}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
              {restaurant.phone && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {restaurant.phone}
                </span>
              )}
              {restaurant.address && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {restaurant.address}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(restaurant.createdAt).toLocaleDateString('uz-UZ')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleActive}
              disabled={toggling}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                restaurant.isActive
                  ? 'bg-red-50 text-red-500 hover:bg-red-100'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              {toggling ? '...' : restaurant.isActive ? 'Bloklash' : 'Faollashtirish'}
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="O'chirish"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {restaurant._count && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Kategoriya', value: restaurant._count.categories, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
            { label: 'Taom', value: restaurant._count.menuItems, gradient: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/20' },
            { label: 'Admin', value: restaurant._count.users, gradient: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
          ].map((s) => (
            <div key={s.label} className={`bg-linear-to-br ${s.gradient} rounded-2xl p-5 text-white shadow-lg ${s.shadow}`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-white/70 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Plan card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tarif rejasi</p>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold border bg-orange-50 text-orange-600 border-orange-200">
            {restaurant.plan}
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usage bars */}
          {restaurant._count && (() => {
            const currentPlan = plans.find((p) => p.name === restaurant.plan);
            const bars = [
              { label: 'Kategoriyalar', used: restaurant._count!.categories, limit: currentPlan?.maxCategories ?? 3, color: 'bg-blue-500', textColor: 'text-blue-600' },
              { label: 'Taomlar',       used: restaurant._count!.menuItems,  limit: currentPlan?.maxMenuItems  ?? 15, color: 'bg-orange-500', textColor: 'text-orange-600' },
              { label: 'Adminlar',      used: restaurant._count!.users,      limit: currentPlan?.maxAdmins     ?? 1, color: 'bg-violet-500', textColor: 'text-violet-600' },
            ];
            return (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-700">Foydalanish holati</p>
                {bars.map(({ label, used, limit, color, textColor }) => {
                  const pct = Math.min(100, Math.round((used / limit) * 100));
                  const isNearLimit = pct >= 80;
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-600">{label}</span>
                        <span className={`text-xs font-bold ${isNearLimit ? 'text-red-500' : textColor}`}>
                          {used} / {limitStr(limit)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${isNearLimit ? 'bg-red-500' : color}`} style={{ width: `${pct}%` }} />
                      </div>
                      {isNearLimit && <p className="text-[11px] text-red-400 mt-1">Limit tugayapti — tarifni yangilang</p>}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Plan upgrade */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Tarifni o'zgartirish</p>
            <div className="space-y-2">
              {plans.map((p) => {
                const isCurrent = restaurant.plan === p.name;
                return (
                  <button
                    key={p.id}
                    onClick={() => !isCurrent && handleChangePlan(p.name)}
                    disabled={changingPlan || isCurrent}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      isCurrent
                        ? 'bg-orange-50 border-orange-300 text-orange-700 cursor-default'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      isCurrent ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {p.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{p.name}</span>
                        {isCurrent && <span className="text-[10px] bg-gray-800 text-white px-1.5 py-0.5 rounded font-semibold">Joriy</span>}
                      </div>
                      <p className="text-xs text-gray-400">
                        {limitStr(p.maxCategories)} kat · {limitStr(p.maxMenuItems)} taom · {limitStr(p.maxAdmins)} admin
                      </p>
                    </div>
                    {!isCurrent && <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
                    {changingPlan && isCurrent && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* QR Code */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">QR Kod</p>
          {qrUrl ? (
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 border-2 border-gray-100 rounded-2xl">
                <img src={qrUrl} alt="QR Code" className="w-44 h-44" />
              </div>
              <a
                href={qrUrl}
                download={`${restaurant.slug}-qr.png`}
                className="flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                PNG yuklab olish
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-2" />
                Yuklanmoqda...
              </div>
            </div>
          )}
        </div>

        {/* Admins */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Adminlar</p>
          {restaurant.users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Admin biriktirilmagan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {restaurant.users.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 bg-linear-to-br from-violet-400 to-violet-500 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {u.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Kategoriyalar</p>
          {restaurant.categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">Kategoriyalar mavjud emas</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {restaurant.categories.map((cat, i) => (
                <div key={cat.id} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{cat.name}</p>
                  </div>
                  <span className="text-xs text-gray-400 bg-white border border-gray-100 px-2.5 py-1 rounded-lg shrink-0">
                    {cat._count.menuItems} taom
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
