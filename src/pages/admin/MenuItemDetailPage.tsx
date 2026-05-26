import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuItemsApi } from '../../api/menuItems';
import { categoriesApi } from '../../api/categories';
import type { MenuItem, Category } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MenuItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', isAvailable: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([menuItemsApi.getOne(id), categoriesApi.getAll()])
      .then(([i, c]) => { setItem(i); setCategories(c); })
      .finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  const openEdit = () => {
    if (!item) return;
    setForm({
      name: item.name, description: item.description || '',
      price: String(item.price), categoryId: item.categoryId, isAvailable: item.isAvailable,
    });
    setImageFile(null); setImagePreview(item.image || ''); setShowEdit(true);
  };

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!item) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', form.price);
      fd.append('categoryId', form.categoryId);
      fd.append('isAvailable', String(form.isAvailable));
      if (form.description) fd.append('description', form.description);
      if (imageFile) fd.append('image', imageFile);
      await menuItemsApi.update(item.id, fd);
      setShowEdit(false); load();
    } catch { alert('Saqlashda xatolik'); }
    finally { setSaving(false); }
  };

  const handleToggle = async () => {
    if (!item) return;
    setToggling(true);
    const fd = new FormData();
    fd.append('isAvailable', String(!item.isAvailable));
    try { await menuItemsApi.update(item.id, fd); load(); }
    catch { alert('Xatolik'); }
    finally { setToggling(false); }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm(`"${item.name}" taomni o'chirishni tasdiqlaysizmi?`)) return;
    try { await menuItemsApi.delete(item.id); navigate('/admin/menu'); }
    catch { alert('O\'chirishda xatolik'); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f); setImagePreview(URL.createObjectURL(f));
  };

  if (isLoading) return <LoadingSpinner />;
  if (!item) return <div className="text-center py-20 text-gray-400">Taom topilmadi</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/menu')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Menuga qaytish
      </button>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Image */}
        <div className="relative w-full h-64 bg-gray-100">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
              <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-300">Rasm yuklanmagan</p>
            </div>
          )}
          {/* Status badge */}
          <div className="absolute top-4 right-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
              item.isAvailable
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800/70 text-white'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? 'bg-white' : 'bg-gray-400'}`} />
              {item.isAvailable ? 'Mavjud' : 'Yopiq'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {item.category && (
                <span className="inline-block text-xs text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-lg font-semibold mb-2">
                  {item.category.name}
                </span>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
              {item.description && (
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">{item.description}</p>
              )}
              <p className="text-2xl font-bold text-orange-500 mt-4">
                {Number(item.price).toLocaleString('uz-UZ')}
                <span className="text-base font-normal text-gray-400 ml-1">so'm</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                item.isAvailable
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {toggling ? '...' : item.isAvailable ? 'Sotuvdan olish' : 'Sotuvga qo\'yish'}
            </button>
            <button
              onClick={openEdit}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Tahrirlash
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="O'chirish"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Ma'lumotlar</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Kategoriya</p>
            <p className="text-sm font-semibold text-gray-800">{item.category?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Narx</p>
            <p className="text-sm font-semibold text-gray-800">{Number(item.price).toLocaleString('uz-UZ')} so'm</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Holat</p>
            <p className={`text-sm font-semibold ${item.isAvailable ? 'text-emerald-600' : 'text-gray-400'}`}>
              {item.isAvailable ? 'Sotuvda mavjud' : 'Sotuvda yo\'q'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Qo'shilgan sana</p>
            <p className="text-sm font-semibold text-gray-800">{new Date(item.createdAt).toLocaleDateString('uz-UZ')}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Taomni tahrirlash</h2>
              <button
                onClick={() => setShowEdit(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Image */}
              <div className="flex justify-center">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative w-28 h-28 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-orange-400 transition-colors bg-gray-50 group"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 group-hover:text-orange-400 transition-colors">
                      <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium">Rasm</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kategoriya *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-white transition-all"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nomi *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tavsif</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Narx (so'm) *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all pr-16"
                    required min="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">so'm</span>
                </div>
              </div>

              <label className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Sotuvda mavjud</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isAvailable ? 'bg-orange-500' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.isAvailable ? 'translate-x-5' : ''}`} />
                </button>
              </label>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowEdit(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50">
                  Bekor qilish
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-2.5 rounded-xl font-medium text-sm shadow-sm">
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
