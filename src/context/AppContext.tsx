import {
  createContext, useContext, useState, useEffect,
  useCallback, useMemo, type ReactNode,
} from 'react';
import type { Product, CartItem, AppContextType, PageKey, ProClient, OrderRecord } from '../types';
import { SEED_PRODUCTS, SEED_PRO_CLIENTS } from '../data/products';
import {
  ADMIN_ROUTE, ADMIN_PASSWORD, SHOPIFY_STORE,
  LS_PRODUCTS, LS_CART, LS_PRO_CLIENTS,
  SS_ADMIN, SS_PRO_CLIENT,
} from '../data/constants';

// ── Storage helpers ───────────────────────────────────────────────────────────
function readLS<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function writeLS(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function initialPage(): PageKey {
  const h = window.location.hash.replace(/^#\/?/, '');
  if (h === ADMIN_ROUTE) return 'admin';
  if (h === 'products')  return 'products';
  return 'home';
}

// ── alphanumerical code generator ────────────────────────────────────────────────────
const ALPHANUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion
function genAccessCode(existing: string[]): string {
  let code: string;
  do {
    code = Array.from({ length: 8 }, () =>
      ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)]
    ).join('');
  } while (existing.includes(code));
  return code;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {

  // ── Cache busting — bump version whenever SEED_PRODUCTS changes ──────────
  const CACHE_VERSION = 'v2';
  if (localStorage.getItem('ef_version') !== CACHE_VERSION) {
    localStorage.removeItem('ef_products');
    localStorage.setItem('ef_version', CACHE_VERSION);
  }

  const [products,  setProducts]  = useState<Product[]>   (() => readLS(LS_PRODUCTS,    SEED_PRODUCTS));
  const [cart,      setCart]      = useState<CartItem[]>   (() => readLS(LS_CART,        []));
  const [proClients,setProClients]= useState<ProClient[]>  (() => readLS(LS_PRO_CLIENTS, SEED_PRO_CLIENTS));
  const [cartOpen,  setCartOpen]  = useState(false);
  const [adminAuth, setAdminAuth] = useState(() => sessionStorage.getItem(SS_ADMIN) === 'yes');
  const [page,      setPage]      = useState<PageKey>(initialPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [proLoginOpen,  setProLoginOpen]  = useState(false);
  const [checkoutOpen,  setCheckoutOpen]  = useState(false);
  const [activeProClient, setActiveProClient] = useState<ProClient | null>(() => {
    try {
      const s = sessionStorage.getItem(SS_PRO_CLIENT);
      if (!s) return null;
      const saved = JSON.parse(s) as ProClient;
      // Refresh from proClients state in case overrides changed
      return saved;
    } catch { return null; }
  });

  useEffect(() => writeLS(LS_PRODUCTS,    products),   [products]);
  useEffect(() => writeLS(LS_CART,        cart),       [cart]);
  useEffect(() => writeLS(LS_PRO_CLIENTS, proClients), [proClients]);

  // Sync active pro client when proClients list changes
  useEffect(() => {
    if (activeProClient) {
      const refreshed = proClients.find(c => c.id === activeProClient.id);
      if (refreshed) {
        setActiveProClient(refreshed);
        sessionStorage.setItem(SS_PRO_CLIENT, JSON.stringify(refreshed));
      }
    }
  }, [proClients]); // eslint-disable-line

  // Hash router
  const navigate = useCallback((p: PageKey) => {
    setPage(p);
    window.location.hash = p === 'home' ? '' : p;
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onHash = () => setPage(initialPage());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Search
  const submitSearch = useCallback((q: string) => {
    setSearchQuery(q);
    navigate('products');
  }, [navigate]);

  // ── Pricing helpers ─────────────────────────────────────────────────────────
  const priceFor = useCallback((product: Product): number => {
    if (activeProClient) {
      const override = activeProClient.priceOverrides[product.id];
      if (override !== undefined && override !== null) return override;
    }
    return product.price;
  }, [activeProClient]);

  // Price after discount (for non-pro standard display)
  const effectivePrice = useCallback((product: Product): number => {
    const base = priceFor(product);
    if (!activeProClient && product.discount) {
      return parseFloat((base * (1 - product.discount / 100)).toFixed(2));
    }
    return base;
  }, [priceFor, activeProClient]);

  // ── Cart ────────────────────────────────────────────────────────────────────
  const addToCart = useCallback((product: Product) => {
    const ep = effectivePrice(product);
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      return ex
        ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...product, quantity: 1, effectivePrice: ep }];
    });
  }, [effectivePrice]);

  const removeFromCart  = useCallback((id: string) => setCart(p => p.filter(i => i.id !== id)), []);
  const updateQty       = useCallback((id: string, qty: number) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(p => p.map(i => i.id === id ? { ...i, quantity: qty } : i));
  }, [removeFromCart]);
  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.effectivePrice * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const login = useCallback((pw: string): boolean => {
    if (pw === ADMIN_PASSWORD) { sessionStorage.setItem(SS_ADMIN, 'yes'); setAdminAuth(true); return true; }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SS_ADMIN);
    setAdminAuth(false);
    navigate('home');
  }, [navigate]);

  // ── Pro client auth ─────────────────────────────────────────────────────────
  const loginProClient = useCallback((code: string): boolean => {
    const client = proClients.find(c => c.accessCode === code.trim());
    if (client) {
      sessionStorage.setItem(SS_PRO_CLIENT, JSON.stringify(client));
      setActiveProClient(client);
      setProLoginOpen(false);
      return true;
    }
    return false;
  }, [proClients]);

  const logoutProClient = useCallback(() => {
    sessionStorage.removeItem(SS_PRO_CLIENT);
    setActiveProClient(null);
  }, []);

  // ── Pro clients CRUD ────────────────────────────────────────────────────────
  const addProClient = useCallback((name: string, company?: string, email?: string): ProClient => {
    const existing = proClients.map(c => c.accessCode);
    const newClient: ProClient = {
      id: `pc${Date.now()}`,
      name,
      company,
      email,
      accessCode: genAccessCode(existing),
      priceOverrides: {},
      purchaseHistory: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProClients(prev => [...prev, newClient]);
    return newClient;
  }, [proClients]);

  const updateProClient = useCallback((c: ProClient) => {
    setProClients(prev => prev.map(x => x.id === c.id ? c : x));
  }, []);

  const deleteProClient = useCallback((id: string) => {
    setProClients(prev => prev.filter(x => x.id !== id));
    if (activeProClient?.id === id) logoutProClient();
  }, [activeProClient, logoutProClient]);

  const setPriceOverride = useCallback((clientId: string, productId: string, price: number | null) => {
    setProClients(prev => prev.map(c => {
      if (c.id !== clientId) return c;
      const overrides = { ...c.priceOverrides };
      if (price === null) delete overrides[productId];
      else overrides[productId] = price;
      return { ...c, priceOverrides: overrides };
    }));
  }, []);

  const recordOrder = useCallback((clientId: string, order: OrderRecord) => {
    setProClients(prev => prev.map(c =>
      c.id === clientId
        ? { ...c, purchaseHistory: [order, ...c.purchaseHistory] }
        : c
    ));
  }, []);

  // ── Product CRUD ────────────────────────────────────────────────────────────
  const addProduct    = useCallback((p: Omit<Product, 'id'>) =>
    setProducts(prev => [...prev, { ...p, id: `p${Date.now()}` }]), []);
  const updateProduct = useCallback((p: Product) =>
    setProducts(prev => prev.map(x => x.id === p.id ? p : x)), []);
  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(x => x.id !== id));
    setCart(prev => prev.filter(x => x.id !== id));
  }, []);

  // ── Shopify checkout (fallback) ─────────────────────────────────────────────
  const checkout = useCallback(() => {
    if (!cart.length) return;
    const str = cart.map(i => `${i.variantId}:${i.quantity}`).join(',');
    window.open(`https://${SHOPIFY_STORE}.myshopify.com/cart/${str}`, '_blank');
  }, [cart]);

  return (
    <AppContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct,
      cart, cartOpen, setCartOpen, addToCart, removeFromCart, updateQty,
      clearCart, cartTotal, cartCount,
      priceFor, effectivePrice,
      page, navigate,
      searchQuery, setSearchQuery, submitSearch,
      adminAuth, login, logout,
      proClients, addProClient, updateProClient, deleteProClient,
      setPriceOverride,
      activeProClient, loginProClient, logoutProClient, recordOrder,
      proLoginOpen, setProLoginOpen,
      checkoutOpen, setCheckoutOpen,
      checkout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
