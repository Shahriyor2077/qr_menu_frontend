import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useParams } from 'react-router-dom';
import { restaurantsApi } from '../api/restaurants';
import type { RestaurantWithMenu, MenuItem } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const priceFmt = new Intl.NumberFormat('uz-UZ');

export default function MenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<RestaurantWithMenu | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    restaurantsApi.getBySlug(slug)
      .then((r) => { if (alive) setRestaurant(r); })
      .catch(() => { if (alive) setError('Restoran topilmadi yoki faol emas'); })
      .finally(() => { if (alive) setIsLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  const allItems = useMemo(
    () => restaurant?.categories.flatMap((c) => c.menuItems) ?? [],
    [restaurant],
  );

  const filteredItems = useMemo<MenuItem[]>(() => {
    if (!restaurant) return [];
    if (activeCategory === 'all') return allItems;
    return restaurant.categories.find((c) => c.id === activeCategory)?.menuItems ?? [];
  }, [restaurant, activeCategory, allItems]);

  const handleView = useCallback((item: MenuItem) => setSelected(item), []);
  const handleClose = useCallback(() => setSelected(null), []);

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size="md" />
    </div>
  );

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-700">Restoran topilmadi</h1>
          <p className="text-gray-500 mt-2">Bu sahifa mavjud emas yoki o'chirilgan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-linear-to-br from-orange-500 to-orange-600 pt-8 pb-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 w-56 h-56 bg-white rounded-full" />
          <div className="absolute -left-6 bottom-0 w-36 h-36 bg-white rounded-full" />
        </div>
        <div className="max-w-2xl mx-auto relative flex items-center gap-4">
          {restaurant.logo ? (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              loading="eager"
              decoding="async"
              className="w-16 h-16 rounded-2xl object-cover shadow-lg shadow-orange-700/30 shrink-0 border-2 border-white/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">{restaurant.name}</h1>
            {restaurant.address && (
              <p className="text-orange-100 text-sm flex items-center gap-1 mt-0.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {restaurant.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-10 -mt-6">
        <div className="bg-white mx-4 max-w-2xl lg:mx-auto rounded-2xl shadow-md shadow-gray-200/80 px-3 py-2.5 overflow-x-auto scrollbar-none">
          <div className="flex gap-1.5 w-max">
            <CategoryTab active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
              Barchasi ({allItems.length})
            </CategoryTab>
            {restaurant.categories.map((cat) => (
              <CategoryTab key={cat.id} active={activeCategory === cat.id} onClick={() => setActiveCategory(cat.id)}>
                {cat.name} ({cat.menuItems.length})
              </CategoryTab>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🍽️</div>
            <p>Bu kategoriyada taom yo'q</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onView={handleView} />
            ))}
          </div>
        )}
      </div>

      {selected && <DetailModal item={selected} onClose={handleClose} />}
    </div>
  );
}

const CategoryTab = memo(function CategoryTab({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
        active
          ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
});

const MenuItemCard = memo(function MenuItemCard({
  item, onView,
}: { item: MenuItem; onView: (item: MenuItem) => void }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden flex ${!item.isAvailable ? 'opacity-60' : ''}`}>
      {item.image && (
        <div className="w-28 h-28 shrink-0">
          <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <h3 className="font-semibold text-gray-800 leading-tight truncate">{item.name}</h3>
        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="text-lg font-bold text-orange-500 shrink-0">
            {priceFmt.format(Number(item.price))} so'm
          </span>
          <button
            onClick={() => onView(item)}
            className="text-xs font-semibold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-colors shrink-0"
          >
            Ko'rish
          </button>
        </div>
      </div>
    </div>
  );
});

function DetailModal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {item.image ? (
          <div className="w-full h-56 sm:h-64">
            <img src={item.image} alt={item.name} loading="eager" decoding="async" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{item.name}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {item.category && (
            <span className="inline-block text-xs text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-full font-medium mb-3">
              {item.category.name}
            </span>
          )}

          {item.description && (
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.description}</p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-2xl font-bold text-orange-500">
              {priceFmt.format(Number(item.price))}
              <span className="text-base font-normal text-gray-400 ml-1">so'm</span>
            </span>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              item.isAvailable
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {item.isAvailable ? 'Mavjud' : 'Mavjud emas'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
