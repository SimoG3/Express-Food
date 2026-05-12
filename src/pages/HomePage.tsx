import { useMemo } from 'react';
import { Tag, Sparkles, Star, TrendingUp, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRODUCT_CATEGORIES, CAT_ICON, COLOR, BRAND_NAME } from '../data/constants';
import ProductCard  from '../components/ProductCard';
import TrustBanner  from '../components/TrustBanner';
import type { Product } from '../types';

// ── Reusable section heading ──────────────────────────────────────────────────
function SectionHeader({
  icon: Icon, label, sub, accent, onViewAll,
}: {
  icon: React.ElementType; label: string; sub?: string; accent: string; onViewAll?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 pl-3 border-l-4" style={{ borderColor: accent }}>
        <Icon size={18} style={{ color: accent }} />
        <div>
          <h2 className="font-black text-gray-800 text-lg leading-none">{label}</h2>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      {onViewAll && (
        <button onClick={onViewAll} className="text-sm font-semibold" style={{ color: COLOR.red }}>
          Voir tout →
        </button>
      )}
    </div>
  );
}

// ── Catalogue section with coloured header bar ────────────────────────────────
function CatalogueSection({
  icon: Icon, title, sub, accent, badge, items, onViewAll,
}: {
  icon: React.ElementType; title: string; sub: string; accent: string;
  badge?: string; items: Product[]; onViewAll: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 pb-8">
      <div className="rounded-sm overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-3" style={{ background: accent }}>
          <div className="flex items-center gap-2 text-white">
            <Icon size={18} />
            <div>
              <div className="font-black text-base leading-none">{title}</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }} className="mt-0.5">{sub}</div>
            </div>
          </div>
          {badge && (
            <span className="bg-white text-xs font-black px-2 py-1 rounded-sm"
              style={{ color: accent }}>
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {items.map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      <div className="text-right mt-3">
        <button onClick={onViewAll} className="text-sm font-semibold" style={{ color: COLOR.red }}>
          Voir toutes les offres →
        </button>
      </div>
    </section>
  );
}

// ── Pro sections ──────────────────────────────────────────────────────────────
function ProSection({
  title, items, icon: Icon,
}: {
  title: string; items: Product[]; icon: React.ElementType;
}) {
  if (items.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 pb-6">
      <div className="rounded-sm overflow-hidden border mb-4"
        style={{ borderColor: COLOR.green }}>
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: '#f0faf0' }}>
          <Icon size={16} style={{ color: COLOR.green }} />
          <span className="font-black text-sm" style={{ color: COLOR.green }}>{title}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-sm font-bold text-white ml-1"
            style={{ background: COLOR.green }}>★ PRO</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {items.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { products, navigate, activeProClient } = useApp();

  // Catalogues
  const promos      = useMemo(() =>
    products.filter(p => p.inStock && p.discount && p.discount > 0).slice(0, 10), [products]);
  const nouveautes  = useMemo(() =>
    products.filter(p => p.inStock && p.isNew)
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')).slice(0, 10),
    [products]);
  const selection   = useMemo(() =>
    products.filter(p => p.inStock && p.featured).slice(0, 10), [products]);

  // Pro sections
  const frequentlyBought = useMemo(() => {
    if (!activeProClient) return [];
    const hist = activeProClient.purchaseHistory;
    if (hist.length > 0) {
      const counts: Record<string, number> = {};
      hist.forEach(o => o.items.forEach(i => {
        counts[i.productId] = (counts[i.productId] || 0) + i.quantity;
      }));
      return products
        .filter(p => counts[p.id] && p.inStock)
        .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
        .slice(0, 5);
    }
    // Fallback: products with overrides
    const ids = Object.keys(activeProClient.priceOverrides);
    return products.filter(p => ids.includes(p.id) && p.inStock).slice(0, 5);
  }, [activeProClient, products]);

  const recommended = useMemo(() => {
    if (!activeProClient) return [];
    return [...products].filter(p => p.inStock).sort(() => Math.random() - 0.5).slice(0, 5);
  }, [activeProClient]); // eslint-disable-line

  // Per-category rows
  const catSections = useMemo(() =>
    PRODUCT_CATEGORIES.map(cat => ({
      cat,
      items: products.filter(p => p.category === cat && p.inStock).slice(0, 5),
    })).filter(s => s.items.length > 0),
    [products],
  );

  return (
    <div style={{ background: COLOR.grayBg, minHeight: 'calc(100vh - 120px)' }}>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="ef-hero-gradient">
        <div className="max-w-7xl mx-auto px-4 py-14 flex items-center justify-between gap-6">
          <div className="text-white max-w-lg">

            {/* Badge */}
            <div className="text-xs font-black mb-3 px-3 py-1 inline-flex items-center gap-1.5 rounded-sm tracking-wide"
              style={{ background: COLOR.red }}>
              <Zap size={12} /> LIVRAISON EN 30 MIN
            </div>

            <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">
              Vos courses livrées
              <br />
              <span style={{ color: COLOR.red }}>express</span>
              <span className="text-white"> à domicile.</span>
            </h1>

            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              <span style={{ color: COLOR.green }}>Fraîcheur garantie</span> · Produits frais sélectionnés
              <br />Commandez avant 14h → livré aujourd'hui
            </p>

            <div className="flex gap-3 flex-wrap">
              <button onClick={() => navigate('products')}
                className="text-white font-black px-6 py-3 rounded-sm text-sm"
                style={{ background: COLOR.red }}>
                Commander maintenant →
              </button>
              <button onClick={() => navigate('products')}
                className="font-bold px-6 py-3 rounded-sm text-sm text-white"
                style={{ background: 'rgba(255,255,255,.10)', border: '1px solid rgba(255,255,255,.2)' }}>
                Voir nos promotions
              </button>
            </div>
          </div>

          {/* Decorative */}
          <div className="hidden lg:flex flex-col items-center gap-1 opacity-15 select-none">
            <div style={{ fontSize: '90px' }}>🚗</div>
            <div className="flex gap-2" style={{ fontSize: '40px' }}>🍎 🥦 🥛</div>
          </div>
        </div>
      </div>

      {/* ── Trust banner ───────────────────────────────────────────────── */}
      <TrustBanner />

      {/* ── Category quick links ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-4 md:grid-cols-9 gap-2">
          {PRODUCT_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => navigate('products')}
              className="bg-white border rounded-sm p-3 flex flex-col items-center gap-1.5 hover:shadow-sm"
              style={{ borderColor: COLOR.border }}>
              <span className="text-2xl" aria-hidden="true">{CAT_ICON[cat]}</span>
              <span className="text-xs font-semibold text-gray-700 leading-tight text-center">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── PRO SECTIONS ───────────────────────────────────────────────── */}
      {activeProClient && (
        <>
          <ProSection
            title="Ce que vous achetez fréquemment"
            items={frequentlyBought}
            icon={TrendingUp}
          />
          <ProSection
            title="Recommandé pour votre activité"
            items={recommended}
            icon={Star}
          />
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* CATALOGUE SECTIONS                                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* Promotions */}
      <CatalogueSection
        icon={Tag}      accent={COLOR.red}
        title="🔥 Nos Promotions"
        sub="Économisez sur une sélection de produits"
        badge={`${promos.length} offres`}
        items={promos}
        onViewAll={() => navigate('products')}
      />

      {/* Nouveautés */}
      <CatalogueSection
        icon={Sparkles} accent="#7c3aed"
        title="✨ Nouveautés"
        sub="Les dernières arrivées chez Express Food"
        badge="Vient d'arriver"
        items={nouveautes}
        onViewAll={() => navigate('products')}
      />

      {/* Sélection du moment */}
      <CatalogueSection
        icon={Star}     accent={COLOR.green}
        title="⭐ Sélection du Moment"
        sub="Notre coup de cœur de la semaine"
        badge={`Choix ${BRAND_NAME}`}
        items={selection}
        onViewAll={() => navigate('products')}
      />

      {/* ── Per-category rows ──────────────────────────────────────────── */}
      {catSections.map(({ cat, items }) => (
        <section key={cat} className="max-w-7xl mx-auto px-4 pb-8">
          <SectionHeader
            icon={() => <span className="text-xl">{CAT_ICON[cat]}</span>}
            label={cat}
            accent={COLOR.red}
            onViewAll={() => navigate('products')}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      ))}

      {/* ── Bottom CTA strip ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="rounded-sm overflow-hidden flex flex-col md:flex-row"
          style={{ background: COLOR.dark }}>
          <div className="flex-1 p-6 text-white">
            <div className="text-xs font-black mb-2 px-2 py-0.5 inline-block rounded-sm"
              style={{ background: COLOR.red }}>NOUVEAU CLIENT</div>
            <h3 className="font-black text-xl mb-1">
              -10 € sur votre <span style={{ color: COLOR.red }}>première commande</span>
            </h3>
            <p className="text-gray-400 text-sm">Inscrivez-vous à notre newsletter et recevez votre coupon.</p>
          </div>
          <div className="flex items-center px-6 py-4 border-t md:border-t-0 md:border-l"
            style={{ borderColor: 'rgba(255,255,255,.08)' }}>
            <button onClick={() => navigate('products')}
              className="text-white font-black px-6 py-2.5 rounded-sm text-sm whitespace-nowrap"
              style={{ background: COLOR.green }}>
              Commander maintenant →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
