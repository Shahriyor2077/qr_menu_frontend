import { useState, useEffect } from 'react';
import { authApi } from '../../api/auth';
import { restaurantsApi } from '../../api/restaurants';
import type { User, Restaurant } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', restaurantId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setIsLoading(true);
    Promise.all([authApi.getAdmins(), restaurantsApi.getAll()])
      .then(([a, r]) => { setAdmins(a); setRestaurants(r); })
      .finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: '', email: '', password: '', restaurantId: '' });
    setError(''); setSuccess(''); setShowForm(true);
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await authApi.register({
        name: form.name, email: form.email, password: form.password,
        restaurantId: form.restaurantId || undefined,
      });
      setSuccess(`${form.name} uchun admin muvaffaqiyatli yaratildi`);
      setShowForm(false); load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" adminini o'chirishni tasdiqlaysizmi?`)) return;
    await authApi.deleteUser(id);
    load();
  };

  const getRestaurantName = (admin: User) =>
    admin.restaurant?.name ?? restaurants.find((r) => r.id === admin.restaurantId)?.name;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Adminlar</h1>
          <p className="text-sm text-gray-400 mt-0.5">{admins.length} ta admin</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-orange-500/30 hover:shadow-md hover:shadow-orange-500/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Admin yaratish
        </button>
      </div>

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3.5 rounded-2xl mb-5 text-sm shadow-sm">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-medium">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-gray-900">Yangi admin yaratish</h2>
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ism *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  placeholder="Ism Familiya"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Parol *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  placeholder="Kamida 6 ta belgi"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Restoran</label>
                <select
                  value={form.restaurantId}
                  onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-white transition-all"
                >
                  <option value="">Restoran biriktirilmagan</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Admin faqat biriktirilgan restoranini boshqaradi
                </p>
              </div>

              <div className="flex gap-3 pt-1">
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
                  {saving ? 'Yaratilmoqda...' : 'Admin yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : admins.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 text-lg mb-1">Adminlar mavjud emas</p>
          <p className="text-gray-400 text-sm mb-6">Birinchi adminni yarating</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Admin yaratish
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Adminlar ro'yxati</p>
          </div>
          <div className="divide-y divide-gray-50">
            {admins.map((admin) => {
              const restaurantName = getRestaurantName(admin);
              const initials = admin.name.slice(0, 2).toUpperCase();
              return (
                <div key={admin.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-400 to-violet-500 flex items-center justify-center shrink-0 shadow-sm shadow-violet-200">
                    <span className="text-white font-bold text-sm">{initials}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{admin.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{admin.email}</p>
                    {restaurantName ? (
                      <span className="inline-block text-xs text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md font-medium mt-1">
                        {restaurantName}
                      </span>
                    ) : (
                      <span className="inline-block text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md font-medium mt-1">
                        Restoran biriktirilmagan
                      </span>
                    )}
                  </div>

                  {/* Date & delete */}
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-xs text-gray-400 hidden sm:block">
                      {new Date(admin.createdAt).toLocaleDateString('uz-UZ')}
                    </p>
                    <button
                      onClick={() => handleDelete(admin.id, admin.name)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="O'chirish"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
