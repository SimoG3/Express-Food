// ── Brand ─────────────────────────────────────────────────────────────────────
export const BRAND_NAME    = 'Express Food';
export const BRAND_TAGLINE = 'Livraison Express à domicile';

// ── Admin ─────────────────────────────────────────────────────────────────────
export const ADMIN_ROUTE     = '281938821';
export const ADMIN_PASSWORD  = 'ENSA_Grocery2024!';

// ── Shopify ───────────────────────────────────────────────────────────────────
export const SHOPIFY_STORE   = 'your-store-name';

// ── Palette ───────────────────────────────────────────────────────────────────
export const COLOR = {
  red:    '#E31E24',
  green:  '#2D8A2D',
  dark:   '#111111',
  navBg:  '#1a1a1a',
  darkBg: '#0d0d0d',
  grayBg: '#f6f6f6',
  border: '#e5e5e5',
  redDark:'#b91519',
} as const;

// ── LocalStorage / SessionStorage keys ───────────────────────────────────────
export const LS_PRODUCTS    = 'ef_products';
export const LS_CART        = 'ef_cart';
export const LS_PRO_CLIENTS = 'ef_pro_clients';
export const SS_ADMIN       = 'ef_admin';
export const SS_PRO_CLIENT  = 'ef_pro_session';

// ── Categories (real product database) ───────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  'Boissons',
  'Desserts',
  'Farines & Épices',
  'Fromages & Crèmes',
  'Frites & Snacks',
  'Fruits & Légumes',
  'Huiles & Condiments',
  'Packaging',
  'Pains & Riz',
  'Promotions',
  'Sauces',
  'Viandes',
] as const;

export const ALL_CATEGORIES = ['All', ...PRODUCT_CATEGORIES] as const;

export const CAT_ICON: Record<string, string> = {
  'Boissons':           '🥤',
  'Desserts':           '🍰',
  'Farines & Épices':   '🌾',
  'Fromages & Crèmes':  '🧀',
  'Frites & Snacks':    '🍟',
  'Fruits & Légumes':   '🥦',
  'Huiles & Condiments':'🫙',
  'Packaging':          '📦',
  'Pains & Riz':        '🍞',
  'Promotions':         '🏷️',
  'Sauces':             '🥫',
  'Viandes':            '🥩',
};

// ── TVA rates ─────────────────────────────────────────────────────────────────
export const TVA_RATES = {
  '5.5%': 0.055,
  '20%':  0.20,
} as const;

// ── Price-range presets ───────────────────────────────────────────────────────
export const PRICE_RANGES: { label: string; val: [number, number] }[] = [
  { label:'Tous les prix', val:[0,1000] },
  { label:'Moins de 5 €', val:[0,5]    },
  { label:'5 – 15 €',     val:[5,15]   },
  { label:'15 – 50 €',    val:[15,50]  },
  { label:'Plus de 50 €', val:[50,1000]},
];

// ── Delivery zones ────────────────────────────────────────────────────────────
export const DRIVE_STORES = [
  'Paris – 75001','Paris – 75008','Lyon – Centre',
  'Marseille – Centre','Bordeaux','Toulouse',
];