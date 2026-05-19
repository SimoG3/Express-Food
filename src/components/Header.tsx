import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, Menu, X, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COLOR, PRODUCT_CATEGORIES, CAT_ICON } from '../data/constants';
import Logo from './Logo';

export default function Header() {
  const { cartCount, setCartOpen, navigate, submitSearch, searchQuery,
          setProLoginOpen, activeProClient } = useApp();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => { setLocalSearch(searchQuery); }, [searchQuery]);

  const handleSearch = () => { if (localSearch.trim()) submitSearch(localSearch.trim()); };
  const clearSearch  = () => { setLocalSearch(''); submitSearch(''); };

  return (
    <header style={{ background: COLOR.dark }} className="sticky top-0 z-30">

      {/* ── Announcement ───────────────────────────────────────────── */}
      <div style={{ background: COLOR.darkBg, fontSize: '11px' }}
        className="text-gray-400 py-1 px-4 text-center hidden sm:block">
        🚗&nbsp;
        <span style={{ color: COLOR.red }}>Livraison Express</span>
        &nbsp;·&nbsp;
        <span style={{ color: COLOR.green }}>Fraîcheur garantie</span>
      </div>

      {/* ── Main row ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">

        {/* Logo */}
        <button onClick={() => navigate('home')} aria-label="Accueil" className="flex-shrink-0">
          <Logo size={38} />
        </button>

        {/* ── Search bar ─────────────────────────────────────────────── */}
        <div className="flex-1 flex min-w-0">
          <input
            type="text"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); if (e.key === 'Escape') clearSearch(); }}
            placeholder="Rechercher un produit, une catégorie…"
            className="flex-1 min-w-0 pl-4 pr-3 py-2.5 text-sm rounded-l-sm focus:outline-none border-0"
            style={{ color: '#111', background: 'white' }}
          />
          {localSearch && (
            <button onClick={clearSearch}
              className="px-2 py-2.5 bg-white text-gray-400 hover:text-gray-600 border-l"
              style={{ borderColor: '#e5e5e5' }}>
              <X size={14} />
            </button>
          )}
          <button onClick={handleSearch}
            className="flex-shrink-0 px-4 py-2.5 rounded-r-sm font-bold text-white text-sm"
            style={{ background: COLOR.red }}>
            <Search size={17} />
          </button>
        </div>

        {/* Pro Access */}
        <button
          onClick={() => setProLoginOpen(true)}
          className="hidden md:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-sm border flex-shrink-0"
          style={{
            background:  activeProClient ? COLOR.green : 'rgba(255,255,255,.08)',
            borderColor: activeProClient ? COLOR.green  : 'rgba(255,255,255,.15)',
            color:       'white',
          }}
          title={activeProClient ? activeProClient.name : 'Accès Professionnel'}
        >
          <Building2 size={14} />
          <span className="hidden lg:inline">{activeProClient ? '★ Espace Pro' : 'Accès Pro'}</span>
        </button>

        {/* Cart */}
        <button onClick={() => setCartOpen(true)}
          className="flex items-center gap-2 text-white flex-shrink-0 relative"
          aria-label="Panier">
          <div className="relative">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 rounded-full w-5 h-5 text-white font-black flex items-center justify-center"
                style={{ background: COLOR.red, fontSize: '10px' }}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="hidden sm:block text-sm font-semibold">Panier</span>
        </button>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(v => !v)} className="md:hidden text-white flex-shrink-0">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-3 flex flex-col gap-2"
          style={{ background: COLOR.dark, borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <button onClick={() => { setProLoginOpen(true); setMobileOpen(false); }}
            className="flex items-center justify-center gap-2 text-white text-sm font-bold py-2.5 rounded-sm"
            style={{ background: activeProClient ? COLOR.green : 'rgba(255,255,255,.12)' }}>
            <Building2 size={14} />
            {activeProClient ? `Pro : ${activeProClient.name}` : 'Accès Professionnel'}
          </button>
        </div>
      )}

      {/* ── Category nav ──────────────────────────────────────────────── */}
      <nav style={{ background: COLOR.navBg, borderTop: '1px solid rgba(255,255,255,.06)' }}
        aria-label="Catégories">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex">
            <button onClick={() => { submitSearch(''); navigate('products'); }}
              className="flex-shrink-0 text-gray-300 text-xs font-black px-4 py-2.5 whitespace-nowrap border-r border-white border-opacity-10"
              style={{ background: 'rgba(255,255,255,.06)' }}>
              Tous
            </button>
            {PRODUCT_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => navigate('products')}
                className="flex-shrink-0 text-gray-300 text-xs font-semibold px-4 py-2.5 whitespace-nowrap border-r border-white border-opacity-10 hover:text-white hover:bg-white hover:bg-opacity-10">
                {CAT_ICON[cat]}&nbsp;{cat}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
