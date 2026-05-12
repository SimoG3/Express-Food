// ── Brand ─────────────────────────────────────────────────────────────────────
export const BRAND_NAME    = 'Express Food';
export const BRAND_TAGLINE = 'Livraison Express à domicile';

// ── Admin ─────────────────────────────────────────────────────────────────────
export const ADMIN_ROUTE     = '281938821';
export const ADMIN_PASSWORD  = 'ENSA_Grocery2024!';

// ── Shopify ───────────────────────────────────────────────────────────────────
export const SHOPIFY_STORE   = 'your-store-name';

// ── WhatsApp (no +, no spaces) ────────────────────────────────────────────────
export const WHATSAPP_ADMIN  = '33745461870';

// ── Palette ───────────────────────────────────────────────────────────────────
export const COLOR = {
  red:    '#E31E24',   // primary   (was blue)
  green:  '#2D8A2D',   // secondary (was orange)
  dark:   '#111111',   // header / footer background
  navBg:  '#1a1a1a',   // category nav bar
  darkBg: '#0d0d0d',   // deepest dark (announcement strip)
  grayBg: '#f6f6f6',   // page background
  border: '#e5e5e5',   // card / input borders
  redDark:'#b91519',   // hover / accent red
} as const;

// ── LocalStorage / SessionStorage keys ───────────────────────────────────────
export const LS_PRODUCTS    = 'ef_products';
export const LS_CART        = 'ef_cart';
export const LS_PRO_CLIENTS = 'ef_pro_clients';
export const SS_ADMIN       = 'ef_admin';
export const SS_PRO_CLIENT  = 'ef_pro_session';

// ── Categories ────────────────────────────────────────────────────────────────
export const ALL_CATEGORIES = [
  'All','Fruits','Vegetables','Dairy','Bakery',
  'Meat','Beverages','Frozen','Pantry','Snacks',
] as const;

export const PRODUCT_CATEGORIES = ALL_CATEGORIES.filter((c) => c !== 'All');

export const CAT_ICON: Record<string, string> = {
  Fruits:'🍎', Vegetables:'🥦', Dairy:'🥛', Bakery:'🥖',
  Meat:'🥩',  Beverages:'🥤', Frozen:'🧊', Pantry:'🫙', Snacks:'🍿',
};

// ── Price-range presets ───────────────────────────────────────────────────────
export const PRICE_RANGES: { label: string; val: [number, number] }[] = [
  { label:'Tous les prix', val:[0,1000] },
  { label:'Moins de 2 €', val:[0,2]    },
  { label:'2 € – 5 €',    val:[2,5]    },
  { label:'5 – 10 €',     val:[5,10]   },
  { label:'Plus de 10 €', val:[10,1000]},
];

// ── Delivery zones ────────────────────────────────────────────────────────────
export const DRIVE_STORES = [
  'Paris – 75001','Paris – 75008','Lyon – Centre',
  'Marseille – Centre','Bordeaux','Toulouse',
];
