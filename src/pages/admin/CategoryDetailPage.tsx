import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoriesApi } from '../../api/categories';
import { menuItemsApi } from '../../api/menuItems';
import type { Category, MenuItem } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

type CategoryDetail = Category & { menuItems: MenuItem[] };

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!id) return;
    setIsLoading(true);
    categoriesApi.getOne(id).then(setCategory).finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  const startEdit = () => { setName(category?.name ?? ''); setEditing(true); };

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!category || !name.trim()) return;
    setSaving(true);
    try {
      await categoriesApi.update(category.id, { name });
      setEditing(false); load();
    } catch { alert('Saqlashda xatolik'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!category) return;
    if (!confirm(`"${category.name}" kategoriyasini o'chirishni tasdiqlaysizmi?`)) return;
    try { await categoriesApi.delete(category.id); navigate('/admin/categories'); }
    catch { alert('O\'chirishda xatolik'); }
  };

  const handleToggleItem = async (item: MenuItem) => {
    const fd = new FormData();
    fd.append('isAvailable', String(!item.isAvailable));
    try { await menuItemsApi.update(item.id, fd); load(); }
    catch { alert('Xatolik'); }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!category) return <div className="text-center py-20 text-gray-400">Kategoriya topilmadi</div>;

  const available = category.menuItems.filter((i) => i.isAvailable).length;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/categories')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kategoriyalarga qaytish
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-linear-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-orange-200">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <form onSubmit={handleSave} className="flex items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 text-xl font-bold border-b-2 border-orange-500 focus:outline-none bg-transparent"
                  autoFocus
                  required
                />
                <button type="submit" disabled={saving} className="px-3 py-1.5 bg-orange-500 text-white text-sm font-semibold rounded-lg transition-colors hover:bg-orange-600 disabled:opacity-60">
                  {saving ? '...' : 'Saqlash'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50">
                  Bekor
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                <button
                  onClick={startEdit}
                  className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Nomni tahrirlash"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-sm text-gray-400 mt-1">
              {category.menuItems.length} ta taom · {available} ta mavjud
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
            title="O'chirish"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20">
          <p className="text-3xl font-bold">{category.menuItems.length}</p>
          <p className="text-white/70 text-sm mt-1">Jami taomlar</p>
        </div>
        <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
          <p className="text-3xl font-bold">{available}</p>
          <p className="text-white/70 text-sm mt-1">Mavjud taomlar</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Taomlar ro'yxati</p>
        </div>

        {category.menuItems.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">Bu kategoriyada hali taom yo'q</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {category.menuItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group cursor-pointer"
                onClick={() => navigate(`/admin/menu/${item.id}`)}
              >
                <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900 text-sm">
                    {Number(item.price).toLocaleString('uz-UZ')}
                    <span className="text-xs font-normal text-gray-400 ml-0.5">so'm</span>
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleItem(item); }}
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold mt-1 transition-colors ${
                      item.isAvailable
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {item.isAvailable ? 'Mavjud' : 'Yopiq'}
                  </button>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
