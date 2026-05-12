import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SafeImage from './SafeImage';
import { COLOR } from '../data/constants';

export default function CartSidebar() {
  const { cart, cartOpen, setCartOpen, cartTotal, updateQty,
          removeFromCart, clearCart, setCheckoutOpen } = useApp();

  if (!cartOpen) return null;
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const openCheckout = () => { setCartOpen(false); setCheckoutOpen(true); };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-60" onClick={() => setCartOpen(false)} />
      <aside className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 text-white flex-shrink-0"
          style={{ background: COLOR.dark, borderBottom: `3px solid ${COLOR.red}` }}>
          <div className="flex items-center gap-2 font-bold">
            <ShoppingCart size={18} />
            <span>Mon Panier</span>
            {totalItems > 0 && (
              <span className="text-xs rounded-full px-2 py-0.5 font-black"
                style={{ background: COLOR.red }}>{totalItems}</span>
            )}
          </div>
          <button onClick={() => setCartOpen(false)}><X size={20} /></button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart size={52} style={{ color: COLOR.border }} className="mb-4" />
              <p className="font-black text-gray-400 text-lg">Votre panier est vide</p>
              <button onClick={() => setCartOpen(false)}
                className="mt-5 text-sm font-bold px-5 py-2 rounded-sm text-white"
                style={{ background: COLOR.red }}>
                Continuer mes achats
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {cart.map(item => (
                <li key={item.id} className="flex gap-3 border rounded-sm p-3"
                  style={{ borderColor: COLOR.border }}>
                  <SafeImage src={item.image} alt={item.name} fallbackText={item.name}
                    className="w-16 h-16 object-cover rounded-sm border flex-shrink-0"
                    style={{ borderColor: COLOR.border }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-snug truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mb-2">{item.unit}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-6 h-6 border flex items-center justify-center rounded-sm"
                        style={{ borderColor: COLOR.border }}>
                        <Minus size={11} className="text-gray-600" />
                      </button>
                      <span className="text-sm font-black w-5 text-center tabular-nums"
                        style={{ color: COLOR.red }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-6 h-6 text-white flex items-center justify-center rounded-sm"
                        style={{ background: COLOR.red }}>
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
                    <span className="font-black text-sm" style={{ color: COLOR.red }}>
                      {(item.effectivePrice * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="flex-shrink-0 border-t p-4" style={{ borderColor: COLOR.border }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500">Total ({totalItems} art.)</span>
              <span className="font-black text-xl" style={{ color: COLOR.red }}>{cartTotal.toFixed(2)} €</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">Livraison calculée à l'étape suivante</p>
            <button onClick={openCheckout}
              className="w-full text-white font-black py-3 rounded-sm text-sm mb-2"
              style={{ background: COLOR.red }}>
              Valider la commande →
            </button>
            <button onClick={clearCart} className="w-full text-gray-400 text-xs py-1 hover:text-red-500">
              Vider le panier
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
