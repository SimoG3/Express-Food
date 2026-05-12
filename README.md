# Express Food — B2B Professional Grocery Portal

**Stack:** React 18 · TypeScript · Vite 5 · Tailwind CSS 3  
**Brand:** Red `#E31E24` · Green `#2D8A2D` · Dark `#111111`

---

## Setup

```bash
npm install     # installs all deps incl. jspdf + jspdf-autotable
npm run dev     # http://localhost:5173
npm run build   # production bundle → dist/
```

---

## Configuration (`src/data/constants.ts`)

| Key | Default | Purpose |
|---|---|---|
| `WHATSAPP_ADMIN` | `33745461870` | WhatsApp number for order alerts |
| `SHOPIFY_STORE`  | `your-store-name` | Shopify sub-domain |
| `ADMIN_PASSWORD` | `ENSA_Grocery2024!` | Admin dashboard password |

Change the WhatsApp number → **`+33 7 45 46 18 70`** is pre-configured.

---

## Routes

| URL | Page |
|---|---|
| `/` or `/#` | Home page |
| `/#products` | Product catalogue with filters |
| `/#281938821` | Admin dashboard (password protected) |

---

## Demo Pro Clients

| Name | Code |
|---|---|
| Restaurant Le Marrakchi | `123456` |
| Hôtel Atlas Asni | `654321` |

---

## Feature Map

```
src/
├── context/AppContext.tsx      Global state: products, cart, pro clients, search, modals
│
├── components/
│   ├── Header.tsx              Dark sticky header · functional search · zone selector · Pro button
│   ├── Logo.tsx                SVG Express Food logo (dark + light variants)
│   ├── ProductCard.tsx         Inline qty stepper · pro price badge · discount badge
│   ├── FilterSidebar.tsx       Category filter · dual price sliders · on-sale toggle
│   ├── CartSidebar.tsx         Slide-in cart drawer → opens CheckoutModal
│   ├── CheckoutModal.tsx       Name/Phone/Email form → PDF download + WhatsApp notify
│   ├── ProLoginModal.tsx       6-digit access code gate for pro clients
│   ├── ProWelcomeBanner.tsx    Dark welcome strip shown when pro is active
│   ├── TrustBanner.tsx         4-column logistics strip (Express 30min, Delivery, Secure, Fresh)
│   ├── NewsletterSection.tsx   Email capture with validation + success state
│   └── Footer.tsx              Dark footer · pro access shortcut · WhatsApp link
│
├── pages/
│   ├── HomePage.tsx            Dark hero · TrustBanner · Pro sections · 3 Catalogues · Category rows
│   ├── ProductsPage.tsx        Sidebar + product grid · real-time search/sort/filter
│   ├── AdminLogin.tsx          Password gate with show/hide toggle
│   └── AdminDashboard.tsx      Products CRUD · Pro Clients tab · Price Override matrix
│
└── utils/pdfGenerator.ts       jsPDF receipt with Express Food branding (red/green/dark)
```

---

## PDF Order Receipt

Generated on every checkout:
- Express Food header (red/green stripes)
- Order reference box with `#EF-XXXXX` ID
- Client details + optional Pro badge
- Itemised table with pro-overridden prices
- Red total footer row
- Green divider + contact footer
- Auto-downloaded as `commande_EF-XXXXX.pdf`

---

## WhatsApp Integration

After PDF download, a pre-filled WhatsApp message opens to **+33 7 45 46 18 70** containing:
- Order reference
- Client name + pro account
- Itemised product list
- Total amount

---

## Reset Seed Data

```js
// Browser console
localStorage.clear();
location.reload();
```
