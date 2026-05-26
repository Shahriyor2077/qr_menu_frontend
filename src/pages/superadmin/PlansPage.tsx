import { useState, useEffect } from 'react';
import { Flame, Zap, Briefcase, Crown, LayoutGrid, UtensilsCrossed, UserRound } from 'lucide-react';
import { plansApi, type PlanPayload } from '../../api/plans';
import type { PlanConfig } from '../../types';

const emptyForm: PlanPayload = {
  name: '',
  maxCategories: 5,
  maxMenuItems: 30,
  maxAdmins: 2,
  price: 0,
  description: '',
};

function limitLabel(val: number) {
  return String(val);
}

const PLAN_ORDER = ['DEMO', 'STARTER', 'BUSINESS', 'PREMIUM'];

const PLAN_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  DEMO:     { icon: Flame,    color: 'text-gray-500',   bg: 'bg-gray-100'   },
  STARTER:  { icon: Zap,      color: 'text-blue-500',   bg: 'bg-blue-50'    },
  BUSINESS: { icon: Briefcase,color: 'text-orange-500', bg: 'bg-orange-50'  },
  PREMIUM:  { icon: Crown,    color: 'text-violet-500', bg: 'bg-violet-50'  },
};

function PlanIcon({ name }: { name: string }) {
  const meta = PLAN_ICONS[name.toUpperCase()] ?? { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' };
  const Icon = meta.icon;
  return (
    <div className={`w-9 h-9 ${meta.bg} rounded-xl flex items-center justify-center shrink-0`}>
      <Icon className={`w-5 h-5 ${meta.color}`} />
    </div>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PlanConfig | null>(null);
  const [form, setForm] = useState<PlanPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    plansApi.getAll()
      .then((data) => {
        data.sort((a, b) => {
          const ai = PLAN_ORDER.indexOf(a.name.toUpperCase());
          const bi = PLAN_ORDER.indexOf(b.name.toUpperCase());
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
        setPlans(data);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEdit = (p: PlanConfig) => {
    setEditing(p);
    setForm({
      name: p.name,
      maxCategories: p.maxCategories,
      maxMenuItems: p.maxMenuItems,
      maxAdmins: p.maxAdmins,
      price: p.price,
      description: p.description ?? '',
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: PlanPayload = {
        ...form,
        name: form.name.toUpperCase().trim(),
        maxCategories: Number(form.maxCategories),
        maxMenuItems: Number(form.maxMenuItems),
        maxAdmins: Number(form.maxAdmins),
        price: Number(form.price ?? 0),
      };
      editing ? await plansApi.update(editing.id, payload) : await plansApi.create(payload);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: PlanConfig) => {
    if (!confirm(`"${p.name}" tarifini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await plansApi.remove(p.id);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'O\'chirishda xatolik');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarif rejalari</h1>
          <p className="text-sm text-gray-400 mt-0.5">{plans.length} ta tarif</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-orange-500/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yangi tarif
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h2 className="font-bold text-gray-900">{editing ? 'Tarifni tahrirlash' : 'Yangi tarif'}</h2>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tarif nomi *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    placeholder="STARTUP"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Katta harflarda saqlanadi</p>
                </div>

                {/* Limits */}
                {[
                  { field: 'maxCategories' as const, label: 'Max kategoriya', hint: '' },
                  { field: 'maxMenuItems' as const, label: 'Max taom', hint: '' },
                  { field: 'maxAdmins' as const, label: 'Max admin', hint: '' },
                ].map(({ field, label, hint }) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                    <input
                      type="number"
                      min={1}
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: Math.max(1, Number(e.target.value)) })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">{hint}</p>
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Narxi (so'm)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price ?? 0}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    placeholder="0"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tavsif</label>
                  <textarea
                    value={form.description ?? ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    placeholder="Tarif haqida qisqacha..."
                  />
                </div>
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

      {/* Plans grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 mb-1">Tariflar mavjud emas</p>
          <p className="text-gray-400 text-sm mb-5">Birinchi tarifni yarating</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tarif yaratish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group flex flex-col">
              {/* Card top */}
              <div className="p-5 border-b border-gray-50 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PlanIcon name={p.name} />
                  <div>
                    <h3 className="font-black text-gray-900 text-base">{p.name}</h3>
                    {p.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {p.price === 0 ? (
                    <span className="text-sm font-bold text-emerald-600">Bepul</span>
                  ) : (
                    <span className="text-sm font-bold text-gray-900">
                      {p.price.toLocaleString('uz-UZ')} so'm
                    </span>
                  )}
                  <p className="text-[10px] text-gray-400">/ oy</p>
                </div>
              </div>

              {/* Limits */}
              <div className="px-5 py-4 flex-1">
                <div className="space-y-2.5">
                  {[
                    { Icon: LayoutGrid,      label: 'Kategoriya', val: p.maxCategories },
                    { Icon: UtensilsCrossed, label: 'Taom',       val: p.maxMenuItems  },
                    { Icon: UserRound,       label: 'Admin',      val: p.maxAdmins     },
                  ].map(({ Icon, label, val }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                        {label}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {limitLabel(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={() => openEdit(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-xl text-xs font-semibold transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Tahrirlash
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
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
      )}
    </div>
  );
}
