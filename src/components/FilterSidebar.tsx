import { useId } from 'react';
import { ALL_CATEGORIES, CAT_ICON, COLOR, PRODUCT_CATEGORIES } from '../data/constants';
import type { PriceRange, Product } from '../types';

interface Props {
  products:       Product[];
  selectedCat:    string;
  setSelectedCat: (c: string) => void;
  priceRange:     PriceRange;
  setPriceRange:  (r: PriceRange) => void;
  onSaleOnly:     boolean;
  setOnSaleOnly:  (v: boolean) => void;
  maxPrice:       number;
}

function SectionHead({ label }: { label: string }) {
  return (
    <div className="px-3 py-2.5 font-black text-white text-xs tracking-widest uppercase"
      style={{ background: COLOR.dark }}>
      {label}
    </div>
  );
}

function Toggle({ id, checked, onChange }: {
  id: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button id={id} role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="relative w-10 h-5 rounded-full border-2 flex-shrink-0"
      style={{
        background:  checked ? COLOR.red : '#d1d5db',
        borderColor: checked ? COLOR.red : '#d1d5db',
      }}>
      <span className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow"
        style={{ left: checked ? 'calc(100% - 16px)' : '1px' }} />
    </button>
  );
}

export default function FilterSidebar({
  products, selectedCat, setSelectedCat,
  priceRange, setPriceRange, onSaleOnly, setOnSaleOnly, maxPrice,
}: Props) {
  const uid = useId();

  const counts: Record<string, number> = {};
  ALL_CATEGORIES.forEach(c => {
    counts[c] = c === 'All' ? products.length : products.filter(p => p.category === c).length;
  });

  const presets: { label: string; val: PriceRange }[] = [
    { label: '< 2 €',    val: [0, 2]         },
    { label: '2–5 €',    val: [2, 5]         },
    { label: '5–10 €',   val: [5, 10]        },
    { label: '> 10 €',   val: [10, maxPrice] },
  ];

  const activePreset = presets.find(p => p.val[0] === priceRange[0] && p.val[1] === priceRange[1]);

  return (
    <aside className="w-52 flex-shrink-0 hidden md:flex flex-col gap-4">

      {/* ── Categories ───────────────────────────────────────────────── */}
      <div className="border rounded-sm overflow-hidden" style={{ borderColor: COLOR.border }}>
        <SectionHead label="Catégories" />

        {/* All */}
        <button onClick={() => setSelectedCat('All')}
          className="w-full text-left px-3 py-2.5 text-sm flex items-center justify-between border-b"
          style={{
            borderColor: '#f0f0f0',
            background:  selectedCat === 'All' ? '#fff0f0' : 'white',
            color:       selectedCat === 'All' ? COLOR.red  : '#444',
            fontWeight:  selectedCat === 'All' ? 700 : 400,
          }}>
          <span>Tous les produits</span>
          <span className="text-xs rounded-full px-1.5 py-0.5 leading-none font-semibold"
            style={{
              background: selectedCat === 'All' ? COLOR.red : '#ebebeb',
              color:      selectedCat === 'All' ? 'white'   : '#777',
            }}>
            {counts['All']}
          </span>
        </button>

        {/* Individual */}
        {PRODUCT_CATEGORIES.map((cat, idx) => (
          <button key={cat} onClick={() => setSelectedCat(cat)}
            className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between ${
              idx < PRODUCT_CATEGORIES.length - 1 ? 'border-b' : ''
            }`}
            style={{
              borderColor: '#f0f0f0',
              background:  selectedCat === cat ? '#fff0f0' : 'white',
              color:       selectedCat === cat ? COLOR.red  : '#444',
              fontWeight:  selectedCat === cat ? 700 : 400,
            }}>
            <span>{CAT_ICON[cat] ? `${CAT_ICON[cat]} ` : ''}{cat}</span>
            <span className="text-xs rounded-full px-1.5 py-0.5 leading-none font-semibold"
              style={{
                background: selectedCat === cat ? COLOR.red : '#ebebeb',
                color:      selectedCat === cat ? 'white'   : '#777',
              }}>
              {counts[cat] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* ── Price range ───────────────────────────────────────────────── */}
      <div className="border rounded-sm overflow-hidden" style={{ borderColor: COLOR.border }}>
        <SectionHead label="Prix" />
        <div className="p-4 bg-white flex flex-col gap-3">

          {/* Range display */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-black tabular-nums" style={{ color: COLOR.red }}>
              {priceRange[0].toFixed(2)} €
            </span>
            <div className="flex-1 h-px mx-2" style={{ background: COLOR.border }} />
            <span className="text-sm font-black tabular-nums" style={{ color: COLOR.red }}>
              {priceRange[1] >= maxPrice ? `${maxPrice.toFixed(2)} €+` : `${priceRange[1].toFixed(2)} €`}
            </span>
          </div>

          {/* Min slider */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <label htmlFor={`${uid}-min`}>Min</label>
              <span>{priceRange[0].toFixed(2)} €</span>
            </div>
            <input id={`${uid}-min`} type="range" min={0} max={maxPrice} step={0.5}
              value={priceRange[0]}
              onChange={e => {
                const v = Number(e.target.value);
                if (v < priceRange[1]) setPriceRange([v, priceRange[1]]);
              }}
              className="w-full h-1.5 cursor-pointer rounded-full appearance-none"
              style={{ accentColor: COLOR.red }}
            />
          </div>

          {/* Max slider */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <label htmlFor={`${uid}-max`}>Max</label>
              <span>{priceRange[1].toFixed(2)} €</span>
            </div>
            <input id={`${uid}-max`} type="range" min={0} max={maxPrice} step={0.5}
              value={priceRange[1]}
              onChange={e => {
                const v = Number(e.target.value);
                if (v > priceRange[0]) setPriceRange([priceRange[0], v]);
              }}
              className="w-full h-1.5 cursor-pointer rounded-full appearance-none"
              style={{ accentColor: COLOR.red }}
            />
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {presets.map(p => {
              const active = activePreset?.label === p.label;
              return (
                <button key={p.label} onClick={() => setPriceRange(p.val)}
                  className="text-xs py-1.5 rounded-sm border font-semibold"
                  style={{
                    borderColor: active ? COLOR.red   : COLOR.border,
                    background:  active ? COLOR.red   : 'white',
                    color:       active ? 'white' : '#555',
                  }}>
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Reset price */}
          {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <button onClick={() => setPriceRange([0, maxPrice])}
              className="text-xs text-center underline"
              style={{ color: COLOR.green }}>
              Réinitialiser le prix
            </button>
          )}
        </div>
      </div>

      {/* ── Availability ─────────────────────────────────────────────── */}
      <div className="border rounded-sm overflow-hidden" style={{ borderColor: COLOR.border }}>
        <SectionHead label="Filtres" />
        <div className="bg-white divide-y" style={{ borderColor: '#f0f0f0' }}>

          <div className="px-3 py-2.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLOR.green }} />
            <span className="text-sm text-gray-700 flex-1">En stock</span>
            <span className="text-xs font-semibold text-gray-500">
              {products.filter(p => p.inStock).length}
            </span>
          </div>

          <div className="px-3 py-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-700">Promotions uniquement</p>
              <p className="text-xs text-gray-400">
                {products.filter(p => !!p.discount).length} en promo
              </p>
            </div>
            <Toggle id={`${uid}-sale`} checked={onSaleOnly} onChange={setOnSaleOnly} />
          </div>

          <div className="px-3 py-2.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: '#7c3aed' }} />
            <span className="text-sm text-gray-700 flex-1">Nouveautés</span>
            <span className="text-xs font-semibold text-gray-500">
              {products.filter(p => p.isNew).length}
            </span>
          </div>
        </div>
      </div>

      {/* ── Reset all ─────────────────────────────────────────────────── */}
      <button
        onClick={() => { setSelectedCat('All'); setPriceRange([0, maxPrice]); setOnSaleOnly(false); }}
        className="text-xs font-semibold text-center py-2.5 rounded-sm border"
        style={{ borderColor: COLOR.border, color: COLOR.red, background: 'white' }}>
        ↺ Réinitialiser tous les filtres
      </button>
    </aside>
  );
}
