import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../../api/categories';
import type { Category } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setIsLoading(true);
    categoriesApi.getAll().then(setCategories).finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setName(''); setError(''); setShowForm(true); };
  const openEdit = (c: Category) => { setEditing(c); setName(c.name); setError(''); setShowForm(true); };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true); setError('');
    try {
      editing
        ? await categoriesApi.update(editing.id, { name })
        : await categoriesApi.create({ name });
      setShowForm(false); load();
    } catch { setError('Xatolik yuz berdi'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Kategoriyani o\'chirishni tasdiqlaysizmi?')) return;
    try { await categoriesApi.delete(id); load(); }
    catch { alert('O\'chirishda xatolik yuz berdi'); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategoriyalar</h1>
          <p className="text-sm text-gray-400 mt-0.5">{categories.length} ta kategoriya</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-orange-500/30 hover:shadow-md hover:shadow-orange-500/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Kategoriya qo'shish
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  {editing ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kategoriya nomi</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  placeholder="Masalan: Fast Food, Ichimliklar..."
                  autoFocus
                  required
                />
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
                  {saving ? 'Saqlanmoqda...' : editing ? 'Saqlash' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <EmptyState onAdd={openCreate} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kategoriyalar ro'yxati</p>
          </div>
          <div className="divide-y divide-gray-50">
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-linear-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm shadow-orange-200">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {cat._count?.menuItems ?? 0} ta taom
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Tahrirlash
                  </button>
                  <Link
                    to={`/admin/categories/${cat.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    Ko'rish →
                  </Link>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="O'chirish"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
      <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </div>
      <p className="font-semibold text-gray-700 text-lg mb-1">Kategoriya yo'q</p>
      <p className="text-gray-400 text-sm mb-6">Menyuni tartiblashtirish uchun avval kategoriya yarating</p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Birinchi kategoriyani yaratish
      </button>
    </div>
  );
}
