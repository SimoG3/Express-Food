// ── Product ───────────────────────────────────────────────────────────────────

export type Category = string; // Now fully dynamic from database

export interface Product {
  id:           string;
  name:         string;
  category:     string;
  subcategory?: string;
  price:        number;   // Prix TTC (displayed to normal clients)
  prixHT?:      number;   // Prix HT (for admin reference)
  tva?:         string;   // '5.5%' | '20%'
  unit:         string;
  image:        string;
  variantId:    string;
  inStock:      boolean;
  description:  string;
  discount?:    number;   // percentage e.g. 15 = 15% off
  isNew?:       boolean;
  featured?:    boolean;
  tags?:        string[];
  createdAt?:   string;   // ISO date
}

// ── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem extends Product {
  quantity:       number;
  effectivePrice: number;
}

// ── Pro Client ────────────────────────────────────────────────────────────────

export interface PriceOverrides { [productId: string]: number; }

export interface OrderLineItem {
  productId: string; name: string; unit: string;
  quantity: number; unitPrice: number; total: number;
}

export interface OrderRecord {
  orderId: string; date: string; clientName: string;
  phone: string; email: string; items: OrderLineItem[]; subtotal: number;
}

export interface ProClient {
  id: string; name: string; company?: string;
  accessCode: string; priceOverrides: PriceOverrides;
  purchaseHistory: OrderRecord[]; createdAt: string;
  email?: string;
}

// ── Context ───────────────────────────────────────────────────────────────────

export interface AppContextType {
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  priceFor: (product: Product) => number;
  effectivePrice: (product: Product) => number;
  page: PageKey;
  navigate: (p: PageKey) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  submitSearch: (q: string) => void;
  adminAuth: boolean;
  login: (pw: string) => boolean;
  logout: () => void;
  proClients: ProClient[];
  addProClient: (name: string, company?: string, email?: string) => ProClient;
  updateProClient: (c: ProClient) => void;
  deleteProClient: (id: string) => void;
  setPriceOverride: (clientId: string, productId: string, price: number | null) => void;
  activeProClient: ProClient | null;
  loginProClient: (code: string) => boolean;
  logoutProClient: () => void;
  recordOrder: (clientId: string, order: OrderRecord) => void;
  proLoginOpen: boolean;
  setProLoginOpen: (v: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (v: boolean) => void;
  checkout: () => void;
}

export type PageKey = 'home' | 'products' | 'admin';
export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name';
export type PriceRange = [number, number];
export type ImageInputMode = 'url' | 'upload';

export interface ProductFormState {
  name: string; category: string; subcategory: string;
  price: string; prixHT: string; tva: string;
  unit: string; image: string; variantId: string;
  inStock: boolean; description: string;
  discount: string; isNew: boolean; featured: boolean;
}

export interface PdfOrderData {
  orderId: string; clientName: string; phone: string; email: string;
  date: string; items: OrderLineItem[]; subtotal: number;
  isProClient: boolean; proClientName?: string;
}