import { useState, useMemo, useEffect } from 'react';
import { Package, ChevronDown, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard   from '../components/ProductCard';
import { COLOR, ALL_CATEGORIES } from '../data/constants';
import type { PriceRange, SortOption } from '../types';

export default function ProductsPage() {
  const { products, navigate, searchQuery, setSearchQuery, activeProClient } = useApp();

  const maxPrice = useMemo(
    () => Math.ceil(Math.max(...products.map(p => p.price), 20)),
    [products],
  );

  const [selectedCat,    setSelectedCat]    = useState('All');
  const [priceRange,     setPriceRange]     = useState<PriceRange>([0, maxPrice]);
  const [onSaleOnly,     setOnSaleOnly]     = useState(false);
  const [localSearch,    setLocalSearch]    = useState(searchQuery);
  const [sort,           setSort]           = useState<SortOption>('default');
  const [mobileCatOpen,  setMobileCatOpen]  = useState(false);

  useEffect(() => { setLocalSearch(searchQuery); }, [searchQuery]);

  const clearSearch = () => { setLocalSearch(''); setSearchQuery(''); };

  const filtered = useMemo(() => {
    const q = localSearch.toLowerCase().trim();
    let list = products
      .filter(p => selectedCat === 'All' || p.category === selectedCat)
      .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
      .filter(p => !onSaleOnly || (p.discount && p.discount > 0))
      .filter(p =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags ?? []).some(t => t.toLowerCase().includes(q))
      );

    if (sort === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name')       list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, selectedCat, priceRange, onSaleOnly, localSearch, sort]);

  const resetAll = () => {
    setSelectedCat('All');
    setPriceRange([0, maxPrice]);
    setOnSaleOnly(false);
    setLocalSearch('');
    setSearchQuery('');
  };

  const hasFilter = selectedCat !== 'All' || priceRange[0] > 0 ||
    priceRange[1] < maxPrice || onSaleOnly || localSearch.trim().length > 0;

  return (
    <div style={{ background: COLOR.grayBg, minHeight: 'calc(100vh - 120px)' }}>
      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* ── Breadcrumb ────────────────────────────────────────────── */}
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5 flex-wrap">
          <button onClick={() => navigate('home')} className="hover:underline"
            style={{ color: COLOR.red }}>Accueil</button>
          <span>/</span>
          <span className="text-gray-600">Tous les produits</span>
          {selectedCat !== 'All' && (
            <><span>/</span>
            <span className="font-medium" style={{ color: COLOR.red }}>{selectedCat}</span></>
          )}
          {localSearch && (
            <><span>/</span>
            <span className="font-medium text-gray-600">"{localSearch}"</span></>
          )}
        </nav>

        {/* ── Search chip ───────────────────────────────────────────── */}
        {localSearch && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-sm text-gray-600">Résultats pour :</span>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-sm text-sm font-semibold text-white"
              style={{ background: COLOR.red }}>
              "{localSearch}"
              <button onClick={clearSearch} className="ml-1.5 opacity-80 hover:opacity-100">
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ── Pro pricing notice ────────────────────────────────────── */}
        {activeProClient && (
          <div className="mb-3 px-3 py-2 rounded-sm text-xs font-semibold flex items-center gap-2"
            style={{ background: '#f0faf0', border: `1px solid ${COLOR.green}40`, color: COLOR.green }}>
            ★ Tarifs professionnels actifs — {activeProClient.name}
          </div>
        )}

        {/* ── Mobile category drawer ────────────────────────────────── */}
        <div className="md:hidden mb-3">
          <button onClick={() => setMobileCatOpen(v => !v)}
            className="flex items-center justify-between w-full text-white text-sm font-bold px-4 py-2.5 rounded-sm"
            style={{ background: COLOR.dark }}>
            <span>📂 {selectedCat === 'All' ? 'Toutes les catégories' : selectedCat}</span>
            <ChevronDown size={14} />
          </button>
          {mobileCatOpen && (
            <div className="bg-white border rounded-sm mt-1" style={{ borderColor: '#e5e5e5' }}>
              {ALL_CATEGORIES.map(c => (
                <button key={c}
                  onClick={() => { setSelectedCat(c); setMobileCatOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 text-sm border-b last:border-0"
                  style={{
                    borderColor: '#f0f0f0',
                    color:       selectedCat === c ? COLOR.red : '#444',
                    fontWeight:  selectedCat === c ? 700 : 400,
                  }}>
                  {c === 'All' ? 'Tous les produits' : c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-5">
          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <FilterSidebar
            products={products}
            selectedCat={selectedCat}   setSelectedCat={setSelectedCat}
            priceRange={priceRange}     setPriceRange={setPriceRange}
            onSaleOnly={onSaleOnly}     setOnSaleOnly={setOnSaleOnly}
            maxPrice={maxPrice}
          />

          {/* ── Main ──────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="bg-white border rounded-sm px-3 py-2.5 flex flex-wrap
                            items-center justify-between gap-2 mb-3"
              style={{ borderColor: '#e5e5e5' }}>

              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-gray-500">
                  <span className="font-black text-gray-800 text-base">{filtered.length}</span>
                  {' '}produit{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
                  {selectedCat !== 'All' && (
                    <span className="font-medium" style={{ color: COLOR.red }}>
                      &nbsp;· {selectedCat}
                    </span>
                  )}
                </p>
                {hasFilter && (
                  <button onClick={resetAll}
                    className="text-xs px-2 py-1 rounded-sm border font-medium"
                    style={{ borderColor:'#fca5a5', color:'#ef4444', background:'#fef2f2' }}>
                    Réinitialiser
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Inline search */}
                <div className="relative">
                  <input type="text" value={localSearch}
                    onChange={e => setLocalSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && clearSearch()}
                    placeholder="Filtrer les résultats…"
                    className="border pl-3 pr-7 py-1.5 text-sm rounded-sm w-44 focus:outline-none"
                    style={{ borderColor: '#e5e5e5' }} />
                  {localSearch && (
                    <button onClick={clearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Sort */}
                <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
                  className="border px-3 py-1.5 text-sm rounded-sm focus:outline-none bg-white"
                  style={{ borderColor: '#e5e5e5' }}>
                  <option value="default">Tri par défaut</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="name">Nom A–Z</option>
                </select>
              </div>
            </div>

            {/* Grid / empty */}
            {filtered.length === 0 ? (
              <div className="bg-white border rounded-sm p-16 text-center"
                style={{ borderColor: '#e5e5e5' }}>
                <Package size={48} className="mx-auto mb-4" style={{ color: '#e5e5e5' }} />
                <p className="font-black text-gray-400 text-lg mb-1">Aucun produit trouvé</p>
                {localSearch && (
                  <p className="text-sm text-gray-400 mb-3">
                    Aucun résultat pour "{localSearch}"
                  </p>
                )}
                <button onClick={resetAll}
                  className="text-sm font-bold px-5 py-2 rounded-sm text-white"
                  style={{ background: COLOR.red }}>
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
