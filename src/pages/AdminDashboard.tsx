import { useState, useRef, useMemo, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Check, Upload, LogOut, Package, Users,
  RefreshCw, Key, ClipboardList, Search, X, ChevronDown, ChevronUp,
  TrendingUp, ShoppingBag, Euro, Calendar, Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import SafeImage from '../components/SafeImage';
import { COLOR, PRODUCT_CATEGORIES, ALL_CATEGORIES, BRAND_NAME, CAT_ICON } from '../data/constants';
import { LogoLight } from '../components/Logo';
import type { Product, ProClient, ProductFormState, ImageInputMode } from '../types';
import { uploadImage } from '../utils/uploadImage';
 
// ── Shared toggle ──────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="relative w-10 h-5 rounded-full border-2 flex-shrink-0"
      style={{ background: checked ? COLOR.red : '#d1d5db', borderColor: checked ? COLOR.red : '#d1d5db' }}>
      <span className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow"
        style={{ left: checked ? 'calc(100% - 16px)' : '1px' }} />
    </button>
  );
}
 
function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-2.5 text-xs font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
 
const EMPTY_FORM: ProductFormState = {
  name: '', category: 'Boissons', subcategory: '', price: '', prixHT: '', tva: '5.5%',
  unit: 'kg', image: '', variantId: '', inStock: true, description: '',
  discount: '', isNew: false, featured: false,
};
 
// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ProductsTab() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [view,      setView]      = useState<'table' | 'form'>('table');
  const [editing,   setEditing]   = useState<Product | null>(null);
  const [form,      setForm]      = useState<ProductFormState>(EMPTY_FORM);
  const [imgMode,   setImgMode]   = useState<ImageInputMode>('url');
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [errors,    setErrors]    = useState<Partial<Record<keyof ProductFormState, string>>>({});
  const fileRef = useRef<HTMLInputElement>(null);
 
  const rows = products
    .filter(p => catFilter === 'All' || p.category === catFilter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
 
  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setImgMode('url'); setView('form'); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      ...p,
      subcategory: p.subcategory ?? '',
      price:       String(p.price),
      prixHT:      p.prixHT !== undefined ? String(p.prixHT) : '',
      tva:         p.tva ?? '5.5%',
      discount:    String(p.discount ?? ''),
      isNew:       !!p.isNew,
      featured:    !!p.featured,
    });
    setErrors({}); setImgMode('url'); setView('form');
  };
 
  const set = <K extends keyof ProductFormState>(k: K, v: ProductFormState[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };
 
  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim())                        e.name      = 'Requis';
    if (!form.price || isNaN(Number(form.price))) e.price     = 'Invalide';
    if (!form.variantId.trim())                   e.variantId = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
 
  const handleSave = () => {
    if (!validate()) return;
    const p = {
      ...form,
      price:    parseFloat(form.price),
      prixHT:   form.prixHT !== '' ? parseFloat(form.prixHT) : undefined,
      discount: form.discount ? Number(form.discount) : undefined,
    } as Omit<Product, 'id'>;
    if (editing) updateProduct({ ...p, id: editing.id });
    else addProduct(p);
    setView('table');
  };
 
  const handleDelete = (id: string) => {
    if (window.confirm('Supprimer définitivement ?')) deleteProduct(id);
  };
 
  const [uploadError,   setUploadError]   = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
 
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploadLoading(true);
    try {
      const url = await uploadImage(file);
      set('image', url);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };
 
  if (view === 'form') return (
    <div className="max-w-xl mx-auto">
      <h2 className="font-black text-xl text-gray-800 mb-4">
        {editing ? '✏️ Modifier' : '➕ Ajouter'} un produit
      </h2>
      <div className="bg-white border rounded-sm" style={{ borderColor: '#e5e5e5', borderTop: `3px solid ${COLOR.red}` }}>
        <div className="p-5 flex flex-col gap-4">
          {/* Image section */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wide block mb-2">Image du produit</label>
            <div className="flex gap-2 mb-2">
              {(['url', 'upload'] as const).map(m => (
                <button key={m} onClick={() => setImgMode(m)}
                  className="text-xs px-3 py-1.5 rounded-sm border font-bold"
                  style={{ background: imgMode === m ? COLOR.red : 'white', color: imgMode === m ? 'white' : '#555', borderColor: '#e5e5e5' }}>
                  {m === 'url' ? '🔗 URL' : '📤 Upload'}
                </button>
              ))}
            </div>
            {imgMode === 'url' ? (
              <input
                type="text"
                value={form.image}
                onChange={e => set('image', e.target.value)}
                placeholder="https://images.unsplash.com/…"
                className="w-full border px-3 py-2 text-sm rounded-sm focus:outline-none"
                style={{ borderColor: '#e5e5e5' }}
              />
            ) : (
              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadLoading}
                  className="flex items-center justify-center gap-2 border px-4 py-3 text-sm rounded-sm w-full"
                  style={{ borderColor: '#e5e5e5', borderStyle: 'dashed', opacity: uploadLoading ? 0.6 : 1 }}>
                  <Upload size={15} style={{ color: COLOR.red }} />
                  {uploadLoading ? 'Envoi en cours…' : 'Choisir une image (max 500KB)'}
                </button>
                {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
                {form.image && !form.image.startsWith('data:') && (
                  <p className="text-xs mt-1" style={{ color: COLOR.green }}>✓ Image uploadée</p>
                )}
              </div>
            )}
            {form.image && (
              <SafeImage src={form.image} alt="Aperçu"
                className="mt-2 h-20 w-20 object-cover rounded-sm border"
                style={{ borderColor: '#e5e5e5' }} />
            )}
          </div>
 
          {([
            { label: 'Nom du produit *',     key: 'name',        type: 'text',   ph: 'Ex: Pommes Bio Gala' },
            { label: 'Prix TTC (€) *',       key: 'price',       type: 'number', ph: '0.00' },
            { label: 'Prix HT (€)',          key: 'prixHT',      type: 'number', ph: '0.00' },
            { label: 'Unité',                key: 'unit',        type: 'text',   ph: 'kg, pièce, L…' },
            { label: 'Variant ID *',         key: 'variantId',   type: 'text',   ph: '1234567890' },
            { label: 'Description',          key: 'description', type: 'text',   ph: 'Courte description…' },
            { label: 'Remise (%)',           key: 'discount',    type: 'number', ph: '0' },
          ] as { label: string; key: keyof ProductFormState; type: string; ph: string }[]).map(f => (
            <div key={f.key}>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wide block mb-1.5">{f.label}</label>
              <input type={f.type} value={form[f.key] as string}
                onChange={e => set(f.key, e.target.value)} placeholder={f.ph}
                className="w-full border px-3 py-2 text-sm rounded-sm focus:outline-none"
                style={{ borderColor: errors[f.key] ? '#ef4444' : '#e5e5e5' }} />
              {errors[f.key] && <p className="text-red-500 text-xs mt-1">{errors[f.key]}</p>}
            </div>
          ))}
 
          {/* TVA selector */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wide block mb-1.5">TVA</label>
            <select value={form.tva} onChange={e => set('tva', e.target.value)}
              className="w-full border px-3 py-2 text-sm rounded-sm focus:outline-none bg-white"
              style={{ borderColor: '#e5e5e5' }}>
              <option value="5.5%">5.5%</option>
              <option value="20%">20%</option>
            </select>
          </div>
 
          {/* Category */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wide block mb-1.5">Catégorie</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full border px-3 py-2 text-sm rounded-sm focus:outline-none bg-white"
              style={{ borderColor: '#e5e5e5' }}>
              {PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
 
          {/* Toggles */}
          <div className="grid grid-cols-3 gap-3">
            {([
              { key: 'inStock',  label: 'En stock'  },
              { key: 'isNew',    label: 'Nouveauté' },
              { key: 'featured', label: 'Sélection' },
            ] as { key: 'inStock' | 'isNew' | 'featured'; label: string }[]).map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2 p-2.5 border rounded-sm" style={{ borderColor: '#f0f0f0' }}>
                <Toggle checked={form[key] as boolean} onChange={v => set(key, v)} />
                <span className="text-xs font-medium text-gray-600">{label}</span>
              </div>
            ))}
          </div>
 
          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap pt-2 border-t" style={{ borderColor: '#f0f0f0' }}>
            <button onClick={handleSave}
              className="flex items-center gap-2 text-white font-black px-6 py-2.5 rounded-sm text-sm"
              style={{ background: COLOR.red }}>
              <Check size={14} /> Enregistrer
            </button>
            <button onClick={() => setView('table')} className="border px-5 py-2.5 text-sm rounded-sm text-gray-600" style={{ borderColor: '#e5e5e5' }}>
              Annuler
            </button>
            {editing && (
              <button onClick={() => { handleDelete(editing.id); setView('table'); }}
                className="ml-auto flex items-center gap-1.5 text-sm font-medium hover:text-red-600" style={{ color: '#f87171' }}>
                <Trash2 size={13} /> Supprimer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
 
  // ── TABLE VIEW ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total produits', value: products.length,                        icon: '📦', color: COLOR.red   },
          { label: 'En stock',       value: products.filter(p => p.inStock).length,  icon: '✅', color: COLOR.green },
          { label: 'Promotions',     value: products.filter(p => p.discount).length, icon: '🏷️', color: '#ef4444'  },
          { label: 'Nouveautés',     value: products.filter(p => p.isNew).length,    icon: '✨', color: '#7c3aed'  },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-sm p-4" style={{ borderColor: '#e5e5e5' }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
 
      <div className="bg-white border rounded-sm overflow-hidden" style={{ borderColor: '#e5e5e5' }}>
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b" style={{ borderColor: '#e5e5e5' }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            className="border px-3 py-1.5 text-sm rounded-sm w-48 focus:outline-none"
            style={{ borderColor: '#e5e5e5' }} />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="border px-3 py-1.5 text-sm rounded-sm bg-white focus:outline-none"
            style={{ borderColor: '#e5e5e5' }}>
            {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <span className="text-xs text-gray-400">{rows.length} produit{rows.length !== 1 ? 's' : ''}</span>
          <button onClick={openAdd}
            className="ml-auto flex items-center gap-2 text-white font-bold px-4 py-2 rounded-sm text-sm"
            style={{ background: COLOR.red }}>
            <Plus size={14} /> Ajouter un produit
          </button>
        </div>
 
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead style={{ background: '#f6f6f6' }}>
              <tr>
                <TableHead>Image</TableHead><TableHead>Nom</TableHead><TableHead>Catégorie</TableHead>
                <TableHead>Prix TTC</TableHead><TableHead>Remise</TableHead><TableHead>Flags</TableHead>
                <TableHead>Stock</TableHead><TableHead>Actions</TableHead>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr key={p.id} className="border-t"
                  style={{ borderColor: '#f0f0f0', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td className="px-4 py-3">
                    <SafeImage src={p.image} alt={p.name} fallbackText={p.name}
                      className="w-11 h-11 object-cover rounded-sm border" style={{ borderColor: '#e5e5e5' }} />
                  </td>
                  <td className="px-4 py-3 max-w-48">
                    <div className="font-semibold text-gray-800 truncate">{p.name}</div>
                    <div className="text-xs text-gray-400 truncate">{p.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-sm text-white" style={{ background: COLOR.dark }}>{p.category}</span>
                  </td>
                  <td className="px-4 py-3 font-black whitespace-nowrap" style={{ color: COLOR.red }}>{p.price.toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    {p.discount ? <span className="text-red-500 font-bold text-xs">-{p.discount}%</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.isNew    && <span className="text-xs px-1 py-0.5 rounded-sm text-white font-bold" style={{ background: '#7c3aed' }}>NEW</span>}
                      {p.featured && <span className="text-xs px-1 py-0.5 rounded-sm text-white font-bold" style={{ background: COLOR.green }}>⭐</span>}
                      {p.sortOrder !== undefined && <span className="text-xs px-1 py-0.5 rounded-sm text-white font-bold" style={{ background: '#f97316' }}>#{p.sortOrder}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {p.inStock ? 'En stock' : 'Rupture'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-sm hover:bg-red-50" style={{ color: COLOR.red }}><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-sm hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-14 text-gray-400">
                  <Package size={36} className="mx-auto mb-2" style={{ color: '#e5e5e5' }} />
                  <p>Aucun produit trouvé</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
 
// ═══════════════════════════════════════════════════════════════════════════════
// PRO CLIENTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ProClientsTab() {
  const { proClients, products, addProClient, deleteProClient, setPriceOverride } = useApp();
  const [view,           setView]           = useState<'list' | 'overrides'>('list');
  const [selectedClient, setSelectedClient] = useState<ProClient | null>(null);
  const [newName,        setNewName]        = useState('');
  const [newCompany,     setNewCompany]     = useState('');
  const [newEmail,       setNewEmail]       = useState('');
  const [addErr,         setAddErr]         = useState('');
  const [lastAdded,      setLastAdded]      = useState<ProClient | null>(null);
  const [catFilter,      setCatFilter]      = useState('All');
  const [overrideInputs, setOverrideInputs] = useState<Record<string, string>>({});
  const [overrideSearch, setOverrideSearch] = useState('');
 
  const handleAddClient = () => {
    if (!newName.trim()) { setAddErr('Le nom est requis.'); return; }
    const client = addProClient(newName.trim(), newCompany.trim() || undefined, newEmail.trim() || undefined);
    setLastAdded(client);
    setNewName(''); setNewCompany(''); setNewEmail(''); setAddErr('');
  };
 
  const openOverrides = (c: ProClient) => {
    setSelectedClient(c);
    const inputs: Record<string, string> = {};
    products.forEach(p => { if (c.priceOverrides[p.id] !== undefined) inputs[p.id] = String(c.priceOverrides[p.id]); });
    setOverrideInputs(inputs);
    setCatFilter('All'); setOverrideSearch(''); setView('overrides');
  };
 
  const saveOverride = (clientId: string, productId: string, val: string) => {
    const num = parseFloat(val);
    setPriceOverride(clientId, productId, val === '' || isNaN(num) ? null : num);
  };
 
  if (view === 'overrides' && selectedClient) {
    const fresh = proClients.find(c => c.id === selectedClient.id) ?? selectedClient;
    const filteredProducts = products
      .filter(p => catFilter === 'All' || p.category === catFilter)
      .filter(p => !overrideSearch || p.name.toLowerCase().includes(overrideSearch.toLowerCase()));
 
    return (
      <div>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <button onClick={() => setView('list')} className="text-sm font-bold px-3 py-2 rounded-sm border" style={{ borderColor: '#e5e5e5', color: COLOR.red }}>
            ← Retour aux clients
          </button>
          <div>
            <h3 className="font-black text-gray-800">Tarifs Pro — {fresh.name}</h3>
            <p className="text-xs text-gray-400">
              Code: <strong style={{ color: COLOR.red }}>{fresh.accessCode}</strong>
              &nbsp;·&nbsp;{Object.keys(fresh.priceOverrides).length} tarif(s) configuré(s)
            </p>
          </div>
        </div>
 
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <input type="text" value={overrideSearch} onChange={e => setOverrideSearch(e.target.value)}
            placeholder="Filtrer les produits…" className="border px-3 py-1.5 text-sm rounded-sm w-44 focus:outline-none" style={{ borderColor: '#e5e5e5' }} />
          <div className="flex gap-1.5 flex-wrap">
            {ALL_CATEGORIES.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className="text-xs px-2.5 py-1.5 rounded-sm border font-semibold"
                style={{ background: catFilter === c ? COLOR.red : 'white', color: catFilter === c ? 'white' : '#555', borderColor: '#e5e5e5' }}>
                {c}
              </button>
            ))}
          </div>
        </div>
 
        <div className="bg-white border rounded-sm overflow-hidden" style={{ borderColor: '#e5e5e5' }}>
          <div className="px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider" style={{ background: COLOR.dark }}>
            Matrice des prix — saisissez pour écraser le prix standard
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-max">
              <thead style={{ background: '#f6f6f6' }}>
                <tr>
                  <TableHead>Produit</TableHead><TableHead>Catégorie</TableHead>
                  <TableHead>Prix standard</TableHead><TableHead>Tarif Pro (€)</TableHead>
                  <TableHead>Économie</TableHead><TableHead>Action</TableHead>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, i) => {
                  const override = fresh.priceOverrides[p.id];
                  const inputVal = overrideInputs[p.id] ?? '';
                  const savings  = override !== undefined ? +(p.price - override).toFixed(2) : 0;
                  return (
                    <tr key={p.id} className="border-t" style={{ borderColor: '#f0f0f0', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <SafeImage src={p.image} alt={p.name} fallbackText={p.name}
                            className="w-9 h-9 object-cover rounded-sm border flex-shrink-0" style={{ borderColor: '#e5e5e5' }} />
                          <span className="font-medium text-gray-800 text-xs max-w-36 truncate">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-sm text-white" style={{ background: COLOR.dark }}>{p.category}</span>
                      </td>
                      <td className="px-4 py-3 font-black whitespace-nowrap" style={{ color: COLOR.red }}>{p.price.toFixed(2)} €</td>
                      <td className="px-4 py-3">
                        <input type="number" min="0" step="0.01" value={inputVal}
                          onChange={e => setOverrideInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                          onBlur={e => saveOverride(fresh.id, p.id, e.target.value)}
                          placeholder={p.price.toFixed(2)}
                          className="border px-2 py-1.5 text-sm rounded-sm w-24 focus:outline-none font-bold"
                          style={{ borderColor: override !== undefined ? COLOR.green : '#e5e5e5', color: override !== undefined ? COLOR.green : '#888' }} />
                      </td>
                      <td className="px-4 py-3">
                        {override !== undefined && savings > 0
                          ? <span className="font-bold text-xs" style={{ color: COLOR.green }}>-{savings.toFixed(2)} €</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {override !== undefined && (
                          <button onClick={() => {
                            setPriceOverride(fresh.id, p.id, null);
                            setOverrideInputs(prev => { const n = { ...prev }; delete n[p.id]; return n; });
                          }} className="text-xs font-medium hover:text-red-600" style={{ color: '#f87171' }}>Effacer</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <>
      <div className="bg-white border rounded-sm p-5 mb-5" style={{ borderColor: '#e5e5e5', borderLeft: `4px solid ${COLOR.red}` }}>
        <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
          <RefreshCw size={16} style={{ color: COLOR.red }} /> Créer un nouveau client Pro
        </h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-40">
            <label className="text-xs font-black text-gray-500 uppercase block mb-1">Nom du client *</label>
            <input type="text" value={newName} onChange={e => { setNewName(e.target.value); setAddErr(''); }}
              placeholder="Restaurant Le Marrakchi"
              className="w-full border px-3 py-2 text-sm rounded-sm focus:outline-none"
              style={{ borderColor: addErr ? '#ef4444' : '#e5e5e5' }} />
          </div>
          <div className="flex-1 min-w-40">
            <label className="text-xs font-black text-gray-500 uppercase block mb-1">Société (optionnel)</label>
            <input type="text" value={newCompany} onChange={e => setNewCompany(e.target.value)}
              placeholder="SARL Le Marrakchi"
              className="w-full border px-3 py-2 text-sm rounded-sm focus:outline-none"
              style={{ borderColor: '#e5e5e5' }} />
          </div>
          <div className="flex-1 min-w-40">
            <label className="text-xs font-black text-gray-500 uppercase block mb-1">Email Pro (optionnel)</label>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
              placeholder="client@restaurant.com"
              className="w-full border px-3 py-2 text-sm rounded-sm focus:outline-none"
              style={{ borderColor: '#e5e5e5' }} />
          </div>
          <div className="flex items-end">
            <button onClick={handleAddClient}
              className="flex items-center gap-2 text-white font-black px-5 py-2 rounded-sm text-sm"
              style={{ background: COLOR.red }}>
              <Key size={14} /> Générer le code
            </button>
          </div>
        </div>
        {addErr && <p className="text-red-500 text-xs mt-2">{addErr}</p>}
        {lastAdded && (
          <div className="mt-3 p-3 rounded-sm border flex items-center gap-3" style={{ background: '#fff8f8', borderColor: `${COLOR.red}40` }}>
            <Key size={16} style={{ color: COLOR.red }} />
            <div className="text-sm">
              Client <strong>{lastAdded.name}</strong> créé — Code :
              <strong className="font-black text-lg tracking-widest ml-1" style={{ color: COLOR.red }}>{lastAdded.accessCode}</strong>
            </div>
            <button onClick={() => setLastAdded(null)} className="ml-auto text-gray-400 text-xs hover:text-gray-600">✕</button>
          </div>
        )}
      </div>
 
      <div className="bg-white border rounded-sm overflow-hidden" style={{ borderColor: '#e5e5e5' }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#e5e5e5' }}>
          <span className="font-black text-gray-800">{proClients.length} client{proClients.length !== 1 ? 's' : ''} Pro</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead style={{ background: '#f6f6f6' }}>
              <tr>
                <TableHead>Client</TableHead><TableHead>Société</TableHead><TableHead>Code Accès</TableHead>
                <TableHead>Tarifs</TableHead><TableHead>Commandes</TableHead><TableHead>Créé le</TableHead><TableHead>Actions</TableHead>
              </tr>
            </thead>
            <tbody>
              {proClients.map((c, i) => (
                <tr key={c.id} className="border-t" style={{ borderColor: '#f0f0f0', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td className="px-4 py-3 font-semibold text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.company ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="font-black tracking-widest text-base" style={{ color: COLOR.red }}>{c.accessCode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-sm" style={{ background: '#fff8f8', color: COLOR.red }}>
                      {Object.keys(c.priceOverrides).length} tarif{Object.keys(c.priceOverrides).length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.purchaseHistory.length}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openOverrides(c)} className="p-1.5 rounded-sm hover:bg-red-50" style={{ color: COLOR.red }}><Edit2 size={14} /></button>
                      <button onClick={() => { if (window.confirm(`Supprimer ${c.name} ?`)) deleteProClient(c.id); }}
                        className="p-1.5 rounded-sm hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {proClients.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                  <Users size={36} className="mx-auto mb-2" style={{ color: '#e5e5e5' }} />
                  <p>Aucun client Pro. Créez-en un ci-dessus.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
 
// ═══════════════════════════════════════════════════════════════════════════════
// PRIORITIES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function PrioritiesTab() {
  const { products, updateProduct } = useApp();
  const [selectedCat, setSelectedCat] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [saved,       setSaved]       = useState(false);
 
  const catProducts = useMemo(() =>
    [...products.filter(p => p.category === selectedCat)]
      .sort((a, b) => (a.sortOrder ?? 99999) - (b.sortOrder ?? 99999)),
    [products, selectedCat],
  );
 
  const [ordered, setOrdered] = useState<Product[]>(catProducts);
 
  const dragItem     = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
 
  // Sync when category changes
  useEffect(() => {
    setOrdered(
      [...products.filter(p => p.category === selectedCat)]
        .sort((a, b) => (a.sortOrder ?? 99999) - (b.sortOrder ?? 99999))
    );
    setSaved(false);
  }, [selectedCat, products]);
 
  const handleDragStart = (index: number) => { dragItem.current = index; };
 
  const handleDragEnter = (index: number) => {
    if (dragItem.current === null || dragItem.current === index) return;
    const newList = [...ordered];
    const dragged = newList.splice(dragItem.current, 1)[0];
    newList.splice(index, 0, dragged);
    dragItem.current = index;
    setOrdered(newList);
  };
 
  const handleDragEnd = () => {
    dragItem.current     = null;
    dragOverItem.current = null;
  };
 
  const handleSave = () => {
    ordered.forEach((product, index) => {
      updateProduct({ ...product, sortOrder: index + 1 });
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
 
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...ordered];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setOrdered(newList);
    setSaved(false);
  };
 
  const handleMoveDown = (index: number) => {
    if (index === ordered.length - 1) return;
    const newList = [...ordered];
    [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
    setOrdered(newList);
    setSaved(false);
  };
 
  const handleResetCategory = () => {
    if (!window.confirm(`Réinitialiser l'ordre de la catégorie "${selectedCat}" ?`)) return;
    ordered.forEach(product => updateProduct({ ...product, sortOrder: undefined }));
    setSaved(false);
  };
 
  // Badge color for position
  const posBadgeColor = (i: number) => {
    if (i === 0) return COLOR.red;
    if (i === 1) return '#f97316';
    if (i === 2) return '#eab308';
    return '#94a3b8';
  };
 
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-black text-xl text-gray-800">⭐ Priorités d'affichage</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Glissez-déposez ou utilisez les flèches pour définir l'ordre par catégorie.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleResetCategory}
            className="px-4 py-2 text-sm border rounded-sm font-semibold"
            style={{ borderColor: COLOR.border, color: '#888', background: 'white' }}>
            ↺ Réinitialiser
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 text-sm text-white font-black rounded-sm"
            style={{ background: saved ? COLOR.green : COLOR.red }}>
            {saved ? '✓ Enregistré !' : 'Enregistrer l\'ordre'}
          </button>
        </div>
      </div>
 
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PRODUCT_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setSelectedCat(cat)}
            className="px-3 py-1.5 text-xs font-bold rounded-sm border"
            style={{
              background:  selectedCat === cat ? COLOR.red : 'white',
              color:       selectedCat === cat ? 'white'   : '#555',
              borderColor: selectedCat === cat ? COLOR.red : COLOR.border,
            }}>
            {CAT_ICON[cat]} {cat}
          </button>
        ))}
      </div>
 
      {/* Info strip */}
      <div className="mb-4 px-4 py-3 rounded-sm text-xs font-semibold flex items-center gap-2"
        style={{ background: '#fff8f8', border: `1px solid ${COLOR.red}30`, color: COLOR.red }}>
        📋 {ordered.length} produits dans <strong>{selectedCat}</strong> —
        utilisez les flèches ▲▼ ou glissez-déposez pour réordonner,
        puis cliquez <strong>Enregistrer l'ordre</strong>
      </div>
 
      {/* Drag-and-drop list */}
      <div className="bg-white border rounded-sm overflow-hidden" style={{ borderColor: COLOR.border }}>
        <div className="px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider"
          style={{ background: COLOR.dark }}>
          Ordre d'affichage — {selectedCat}
        </div>
 
        <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>
          {ordered.map((product, index) => (
            <div
              key={product.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              className="flex items-center gap-3 px-4 py-3 select-none"
              style={{
                background: index % 2 === 0 ? 'white' : '#fafafa',
                cursor: 'grab',
              }}>
 
              {/* Drag handle */}
              <span className="text-gray-300 text-lg leading-none flex-shrink-0" title="Glisser pour réordonner">⠿</span>
 
              {/* Position badge */}
              <div className="w-7 h-7 rounded-sm flex items-center justify-center font-black text-xs text-white flex-shrink-0"
                style={{ background: posBadgeColor(index) }}>
                {index + 1}
              </div>
 
              {/* Image */}
              <SafeImage src={product.image} alt={product.name} fallbackText={product.name}
                className="w-10 h-10 object-cover rounded-sm border flex-shrink-0"
                style={{ borderColor: COLOR.border }} />
 
              {/* Name + info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                <p className="text-xs text-gray-400">{product.unit} · {product.price.toFixed(2)} € TTC</p>
              </div>
 
              {/* Stock badge */}
              <span className={`text-xs font-bold px-2 py-0.5 rounded-sm flex-shrink-0 hidden sm:inline ${
                product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                {product.inStock ? 'En stock' : 'Rupture'}
              </span>
 
              {/* Arrow controls */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button onClick={() => handleMoveUp(index)} disabled={index === 0}
                  className="w-6 h-6 flex items-center justify-center rounded-sm border text-xs font-bold disabled:opacity-20 hover:bg-gray-50"
                  style={{ borderColor: COLOR.border }}>
                  ▲
                </button>
                <button onClick={() => handleMoveDown(index)} disabled={index === ordered.length - 1}
                  className="w-6 h-6 flex items-center justify-center rounded-sm border text-xs font-bold disabled:opacity-20 hover:bg-gray-50"
                  style={{ borderColor: COLOR.border }}>
                  ▼
                </button>
              </div>
            </div>
          ))}
 
          {ordered.length === 0 && (
            <div className="text-center py-14 text-gray-400">
              <Package size={36} className="mx-auto mb-2" style={{ color: '#e5e5e5' }} />
              <p>Aucun produit dans cette catégorie</p>
            </div>
          )}
        </div>
      </div>
 
      <p className="text-xs text-gray-400 mt-3 text-center">
        L'ordre est sauvegardé globalement et visible immédiatement par tous les visiteurs.
      </p>
    </div>
  );
}
 
// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD SHELL
// ═══════════════════════════════════════════════════════════════════════════════
type Tab = 'products' | 'pro-clients' | 'priorities';
 
export default function AdminDashboard() {
  const { logout } = useApp();
  const [tab, setTab] = useState<Tab>('products');
 
  return (
    <div style={{ background: '#f6f6f6', minHeight: '100vh' }}>
      {/* Admin header */}
      <div className="text-white px-4 py-3 sticky top-0 z-20"
        style={{ background: COLOR.dark, borderBottom: `3px solid ${COLOR.red}` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoLight size={34} />
            <div className="h-5 w-px mx-1 opacity-20 bg-white" />
            <span className="text-gray-400 text-sm font-semibold">Administration</span>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-sm"
            style={{ background: 'rgba(255,255,255,.10)', border: '1px solid rgba(255,255,255,.15)' }}>
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </div>
 
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tab nav */}
        <div className="flex gap-2 mb-6 border-b" style={{ borderColor: '#e5e5e5' }}>
          {([
            { id: 'products',    label: '📦 Produits'   },
            { id: 'pro-clients', label: '🏢 Clients Pro' },
            { id: 'priorities',  label: '⭐ Priorités'   },
          ] as { id: Tab; label: string }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-5 py-2.5 text-sm font-bold border-b-2 -mb-px"
              style={{
                borderColor: tab === t.id ? COLOR.red : 'transparent',
                color:       tab === t.id ? COLOR.red : '#888',
              }}>
              {t.label}
            </button>
          ))}
        </div>
 
        {tab === 'products'    && <ProductsTab />}
        {tab === 'pro-clients' && <ProClientsTab />}
        {tab === 'priorities'  && <PrioritiesTab />}
 
        <div className="pb-10" />
      </div>
    </div>
  );
}