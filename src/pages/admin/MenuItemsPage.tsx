import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { menuItemsApi } from '../../api/menuItems';
import { categoriesApi } from '../../api/categories';
import type { MenuItem, Category } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = { name: '', description: '', price: '', categoryId: '', isAvailable: true };
const PAGE_SIZE = 10;
const priceFmt = new Intl.NumberFormat('uz-UZ');

export default function MenuItemsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string>('');

  const load = useCallback(() => {
    setIsLoading(true);
    Promise.all([menuItemsApi.getAll(), categoriesApi.getAll()])
      .then(([i, c]) => { setItems(i); setCategories(c); })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const changeFilter = useCallback((cat: string) => { setFilterCat(cat); setPage(1); }, []);

  const openCreate = useCallback(() => {
    if (categories.length === 0) { navigate('/admin/categories'); return; }
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
    setImageFile(null); setImagePreview(''); setError(''); setShowForm(true);
  }, [categories, navigate]);

  const openEdit = useCallback((item: MenuItem) => {
    setEditing(item);
    setForm({
      name: item.name, description: item.description || '',
      price: String(item.price), categoryId: item.categoryId, isAvailable: item.isAvailable,
    });
    setImageFile(null); setImagePreview(item.image || ''); setError(''); setShowForm(true);
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(f);
    objectUrlRef.current = url;
    setImageFile(f); setImagePreview(url);
  }, []);

  const handleSubmit = useCallback(async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', form.price);
      fd.append('categoryId', form.categoryId);
      fd.append('isAvailable', String(form.isAvailable));
      if (form.description) fd.append('description', form.description);
      if (imageFile) fd.append('image', imageFile);
      if (editing) await menuItemsApi.update(editing.id, fd);
      else await menuItemsApi.create(fd);
      setShowForm(false); load();
    } catch { setError('Xatolik yuz berdi'); }
    finally { setSaving(false); }
  }, [form, imageFile, editing, load]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Taomni o\'chirishni tasdiqlaysizmi?')) return;
    try { await menuItemsApi.delete(id); load(); }
    catch { alert('O\'chirishda xatolik yuz berdi'); }
  }, [load]);

  const toggleAvailable = useCallback(async (item: MenuItem) => {
    const fd = new FormData();
    fd.append('isAvailable', String(!item.isAvailable));
    try { await menuItemsApi.update(item.id, fd); load(); }
    catch { alert('Holatni o\'zgartirishda xatolik'); }
  }, [load]);

  const closeForm = useCallback(() => setShowForm(false), []);

  const filtered = useMemo(
    () => filterCat ? items.filter((i) => i.categoryId === filterCat) : items,
    [items, filterCat],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const it of items) counts[it.categoryId] = (counts[it.categoryId] || 0) + 1;
    return counts;
  }, [items]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(1);
  }, [page, totalPages]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
          <p className="text-sm text-gray-400 mt-0.5">{items.length} ta taom</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-orange-500/30 hover:shadow-md hover:shadow-orange-500/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Taom qo'shish
        </button>
      </div>

      {/* No categories warning */}
      {!isLoading && categories.length === 0 && (
        <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800">Kategoriya yo'q</p>
            <p className="text-sm text-amber-700">Taom qo'shish uchun avval kategoriya yaratishingiz kerak.</p>
          </div>
          <Link
            to="/admin/categories"
            className="shrink-0 text-sm font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl transition-colors"
          >
            Yaratish →
          </Link>
        </div>
      )}

      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
          <FilterTab active={!filterCat} onClick={() => changeFilter('')}>
            Barchasi
            <span className="ml-1.5 text-xs bg-white/20 px-1.5 py-0.5 rounded-md">{items.length}</span>
          </FilterTab>
          {categories.map((c) => {
            const count = categoryCounts[c.id] || 0;
            return (
              <FilterTab key={c.id} active={filterCat === c.id} onClick={() => changeFilter(c.id)}>
                {c.name}
                {count > 0 && (
                  <span className="ml-1.5 text-xs bg-white/20 px-1.5 py-0.5 rounded-md">{count}</span>
                )}
              </FilterTab>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl my-4">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  {editing ? 'Taomni tahrirlash' : 'Yangi taom qo\'shish'}
                </h2>
              </div>
              <button
                onClick={closeForm}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Image */}
              <div className="flex justify-center">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-orange-400 transition-colors bg-gray-50 group"
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

              {/* Kategoriya */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kategoriya *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-white transition-all"
                  required
                >
                  <option value="">— Kategoriya tanlang —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nomi *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  placeholder="Taom nomi"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tavsif</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none transition-all"
                  placeholder="Qisqacha tavsif..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Narx (so'm) *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all pr-16"
                    placeholder="25000"
                    required
                    min="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">so'm</span>
                </div>
              </div>

              {/* Toggle */}
              <label className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Sotuvda mavjud</p>
                  <p className="text-xs text-gray-400 mt-0.5">Mijozlar ko'rishi uchun faol</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.isAvailable ? 'bg-orange-500' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.isAvailable ? 'translate-x-5' : ''}`} />
                </button>
              </label>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-2 rounded-xl font-medium text-sm transition-colors shadow-sm"
                >
                  {saving ? 'Saqlanmoqda...' : editing ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : filtered.length === 0 ? (
        <EmptyState hasCategories={categories.length > 0} filtered={!!filterCat} onAdd={openCreate} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {filterCat ? `${filtered.length} ta taom` : 'Barcha taomlar'}
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {paginated.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                onToggle={toggleAvailable}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
              <p className="text-xs text-gray-400">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} ta
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      p === page
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const FilterTab = memo(function FilterTab({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
        active
          ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
});

const MenuItemRow = memo(function MenuItemRow({
  item, onToggle, onEdit, onDelete,
}: {
  item: MenuItem;
  onToggle: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
      <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
        {item.category && (
          <span className="inline-block text-xs text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md font-medium mt-1">
            {item.category.name}
          </span>
        )}
        {item.description && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
        )}
      </div>

      <div className="text-right shrink-0">
        <p className="font-bold text-gray-900">
          {priceFmt.format(Number(item.price))}
          <span className="text-xs font-normal text-gray-400 ml-0.5">so'm</span>
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onToggle(item)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            item.isAvailable
              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          {item.isAvailable ? 'Mavjud' : 'Yopiq'}
        </button>
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Tahrirlash"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(item.id)}
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
});

function EmptyState({ hasCategories, filtered, onAdd }: { hasCategories: boolean; filtered: boolean; onAdd: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
      <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="font-semibold text-gray-700 text-lg mb-1">
        {filtered ? 'Bu kategoriyada taom yo\'q' : 'Menu bo\'sh'}
      </p>
      <p className="text-gray-400 text-sm mb-6">
        {filtered ? 'Boshqa kategoriyani tanlang yoki taom qo\'shing' : 'Birinchi taomingizni qo\'shish bilan boshlang'}
      </p>
      {hasCategories && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Taom qo'shish
        </button>
      )}
    </div>
  );
}
