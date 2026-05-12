import { ShoppingCart, Minus, Plus, Tag, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SafeImage from './SafeImage';
import { COLOR } from '../data/constants';
import type { Product } from '../types';

export default function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart, updateQty, priceFor, effectivePrice, activeProClient } = useApp();
  const item = cart.find(i => i.id === product.id);
  const qty  = item?.quantity ?? 0;

  const finalPrice  = effectivePrice(product);
  const hasOverride = activeProClient && activeProClient.priceOverrides[product.id] !== undefined;
  const hasDiscount = !activeProClient && !!product.discount;
  const savings     = hasDiscount ? +(product.price - finalPrice).toFixed(2) : 0;

  return (
    <article className="bg-white border rounded-sm flex flex-col overflow-hidden"
      style={{ borderColor: COLOR.border }}>

      {/* Image */}
      <div className="relative" style={{ paddingTop: '72%', background: '#f8f9fa' }}>
        <SafeImage src={product.image} alt={product.name} fallbackText={product.name}
          className="absolute inset-0 w-full h-full object-cover" />

        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.isNew && (
            <span className="text-white font-black leading-none px-1.5 py-0.5 rounded-sm flex items-center gap-0.5"
              style={{ background: '#7c3aed', fontSize: '9px' }}>
              <Sparkles size={8} /> NOUVEAU
            </span>
          )}
          {hasDiscount && (
            <span className="text-white font-black leading-none px-1.5 py-0.5 rounded-sm"
              style={{ background: COLOR.red, fontSize: '9px' }}>
              -{product.discount}%
            </span>
          )}
          {hasOverride && (
            <span className="text-white font-black leading-none px-1.5 py-0.5 rounded-sm flex items-center gap-0.5"
              style={{ background: COLOR.green, fontSize: '9px' }}>
              <Tag size={8} /> PRO
            </span>
          )}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
            <span className="text-red-600 text-xs font-black border border-red-300 bg-white px-2 py-0.5">
              RUPTURE
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <p className="text-xs text-gray-400 leading-none">{product.category}</p>
        <p className="text-sm font-semibold text-gray-800 leading-snug flex-1 line-clamp-2"
          title={product.name}>{product.name}</p>
        <p className="text-xs text-gray-400">{product.unit}</p>

        {/* Price + action */}
        <div className="flex items-end justify-between gap-1 mt-auto">
          <div>
            {hasDiscount && (
              <div className="text-xs text-gray-400 line-through leading-none mb-0.5">
                {product.price.toFixed(2)} €
              </div>
            )}
            <div className="leading-none flex items-baseline gap-0.5">
              <span className="font-black text-xl"
                style={{ color: hasOverride ? COLOR.green : COLOR.red }}>
                {finalPrice.toFixed(2)}
              </span>
              <span className="font-black text-sm"
                style={{ color: hasOverride ? COLOR.green : COLOR.red }}>€</span>
            </div>
            {hasDiscount && savings > 0 && (
              <div className="text-xs font-semibold leading-none mt-0.5" style={{ color: COLOR.green }}>
                -{savings.toFixed(2)} €
              </div>
            )}
          </div>

          {product.inStock ? (
            qty > 0 ? (
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQty(product.id, qty - 1)}
                  className="w-7 h-7 border flex items-center justify-center rounded-sm"
                  style={{ borderColor: COLOR.border }}>
                  <Minus size={12} className="text-gray-600" />
                </button>
                <span className="text-sm font-black w-5 text-center tabular-nums"
                  style={{ color: COLOR.red }}>{qty}</span>
                <button onClick={() => updateQty(product.id, qty + 1)}
                  className="w-7 h-7 text-white flex items-center justify-center rounded-sm"
                  style={{ background: COLOR.red }}>
                  <Plus size={12} />
                </button>
              </div>
            ) : (
              <button onClick={() => addToCart(product)}
                className="flex items-center gap-1 text-white text-xs font-bold px-3 py-1.5 rounded-sm flex-shrink-0"
                style={{ background: COLOR.green }}>
                <ShoppingCart size={11} /> Ajouter
              </button>
            )
          ) : (
            <span className="text-xs font-semibold" style={{ color: COLOR.red }}>Indisponible</span>
          )}
        </div>
      </div>
    </article>
  );
}
