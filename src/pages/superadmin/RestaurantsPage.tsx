import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { restaurantsApi } from '../../api/restaurants';
import { plansApi } from '../../api/plans';
import type { Restaurant, PlanConfig } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = { name: '', slug: '', phone: '', address: '', plan: 'STARTER' };

const PLAN_META: Record<string, { bg: string; color: string; border: string }> = {
  DEMO:     { bg: 'bg-gray-100',    color: 'text-gray-600',    border: 'border-gray-200'   },
  STARTER:  { bg: 'bg-blue-50',     color: 'text-blue-700',    border: 'border-blue-200'   },
  BUSINESS: { bg: 'bg-orange-50',   color: 'text-orange-700',  border: 'border-orange-200' },
  PREMIUM:  { bg: 'bg-violet-50',   color: 'text-violet-700',  border: 'border-violet-200' },
};

function getPlanMeta(plan: string) {
  return PLAN_META[plan.toUpperCase()] ?? { bg: 'bg-gray-100', color: 'text-gray-600', border: 'border-gray-200' };
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setIsLoading(true);
    Promise.all([restaurantsApi.getAll(), plansApi.getAll()])
      .then(([r, p]) => { setRestaurants(r); setPlans(p); })
      .finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const slugify = (t: string) =>
    t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const openCreate = () => {
    setEditing(null); setForm(emptyForm);
    setLogoFile(null); setLogoPreview('');
    setError(''); setShowForm(true);
  };

  const openEdit = (r: Restaurant) => {
    setEditing(r);
    setForm({ name: r.name, slug: r.slug, phone: r.phone || '', address: r.address || '', plan: r.plan });
    setLogoFile(null); setLogoPreview(r.logo || '');
    setError(''); setShowForm(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('slug', form.slug);
      if (form.phone) fd.append('phone', form.phone);
      if (form.address) fd.append('address', form.address);
      if (form.plan) fd.append('plan', form.plan);
      if (logoFile) fd.append('logo', logoFile);
      editing ? await restaurantsApi.update(editing.id, fd) : await restaurantsApi.create(fd);
      setShowForm(false); load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (r: Restaurant) => {
    const fd = new FormData();
    fd.append('isActive', String(!r.isActive));
    try { await restaurantsApi.update(r.id, fd); load(); }
    catch { alert('Holatni o\'zgartirishda xatolik'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Restoranni o\'chirishni tasdiqlaysizmi?')) return;
    try { await restaurantsApi.delete(id); load(); }
    catch { alert('O\'chirishda xatolik yuz berdi'); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restoranlar</h1>
          <p className="text-sm text-gray-400 mt-0.5">{restaurants.length} ta restoran</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-orange-500/30 hover:shadow-md hover:shadow-orange-500/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yangi restoran
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  {editing ? 'Restoranni tahrirlash' : 'Yangi restoran'}
                </h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Logo */}
              <div className="flex justify-center">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative w-20 h-20 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-orange-400 transition-colors bg-gray-50 group"
                >
                  {logoPreview ? (
                    <>
                      <img src={logoPreview} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 group-hover:text-orange-400 transition-colors">
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium">Logo</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Restoran nomi *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  placeholder="Masalan: Burger House"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug (URL) *</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/50 focus-within:border-orange-500 transition-all">
                  <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 whitespace-nowrap font-mono">/menu/</span>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none font-mono"
                    required
                    placeholder="burger-house"
                  />
                </div>
              </div>

              {/* Plan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tarif rejasi</label>
                <div className="grid grid-cols-4 gap-2">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setForm({ ...form, plan: p.name })}
                      className={`flex flex-col items-center py-2.5 px-2 rounded-xl border-2 transition-all ${
                        form.plan === p.name
                          ? 'bg-orange-50 border-orange-300 text-orange-600'
                          : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-xs font-bold">{p.name}</span>
                      <span className={`text-[10px] font-normal mt-0.5 ${form.plan === p.name ? 'text-orange-400' : 'text-gray-300'}`}>
                        {p.maxCategories} kat
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefon</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Manzil</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    placeholder="Toshkent, ..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
                >
                  {saving ? 'Saqlanmoqda...' : editing ? 'Saqlash' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : restaurants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 text-lg mb-1">Restoranlar mavjud emas</p>
          <p className="text-gray-400 text-sm mb-6">Birinchi restoranni yarating</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Restoran yaratish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {restaurants.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden group flex flex-col"
            >
              {/* Card top — logo banner */}
              <div className="relative h-28 bg-linear-to-br from-orange-50 to-amber-50 flex items-center justify-center shrink-0">
                {r.logo ? (
                  <img src={r.logo} alt={r.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-5xl font-black text-orange-200 select-none">
                    {r.name.slice(0, 1)}
                  </span>
                )}
                {/* Plan badge */}
                <span className={`absolute top-3 left-3 text-[11px] px-2 py-0.5 rounded-lg font-bold border ${getPlanMeta(r.plan).bg} ${getPlanMeta(r.plan).color} ${getPlanMeta(r.plan).border}`}>
                  {r.plan}
                </span>
                {/* Status badge */}
                <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm ${
                  r.isActive
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-400 text-white'
                }`}>
                  {r.isActive ? 'Faol' : 'Bloklangan'}
                </span>
              </div>

              {/* Card body */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{r.name}</h3>
                <a
                  href={`/menu/${r.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-orange-500 font-medium mt-0.5 hover:underline truncate"
                >
                  /menu/{r.slug}
                </a>

                {/* Stats */}
                {r._count && (
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      {r._count.categories} kat.
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {r._count.menuItems} taom
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {r._count.users} admin
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-gray-50">
                  <Link
                    to={`/superadmin/restaurants/${r.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Ko'rish
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => openEdit(r)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Tahrirlash"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggleActive(r)}
                    className={`p-2 rounded-xl transition-colors ${
                      r.isActive
                        ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={r.isActive ? 'Bloklash' : 'Faollashtirish'}
                  >
                    {r.isActive ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="O'chirish"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
