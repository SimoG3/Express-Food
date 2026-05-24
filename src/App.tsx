import { AppProvider, useApp } from './context/AppContext';
import Header            from './components/Header';
import CartSidebar       from './components/CartSidebar';
import CheckoutModal     from './components/CheckoutModal';
import ProLoginModal     from './components/ProLoginModal';
import ProWelcomeBanner  from './components/ProWelcomeBanner';
import Footer            from './components/Footer';
import HomePage          from './pages/HomePage';
import ProductsPage      from './pages/ProductsPage';
import AdminLogin        from './pages/AdminLogin';
import AdminDashboard    from './pages/AdminDashboard';

// ── Inner shell (needs context access) ───────────────────────────────────────
function AppContent() {
  const { page, adminAuth, loading } = useApp();

  // Loading screen while KV data is being fetched
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#111111' }}>
      <div className="text-center">
        <div style={{ fontSize: '64px' }}>🚗</div>
        <p className="font-black text-xl mt-3" style={{ color: '#E31E24' }}>
          EXPRESS FOOD
        </p>
        <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
          Chargement du catalogue…
        </p>
      </div>
    </div>
  );

  // Admin is a completely standalone route — no shared layout
  if (page === 'admin') {
    return adminAuth ? <AdminDashboard /> : <AdminLogin />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Global modals / drawers (always mounted) ───────────────── */}
      <ProLoginModal />
      <CheckoutModal />
      <CartSidebar />

      {/* ── Pro client welcome banner (renders only when logged in) ─── */}
      <ProWelcomeBanner />

      {/* ── Sticky site header ─────────────────────────────────────── */}
      <Header />

      {/* ── Page content ───────────────────────────────────────────── */}
      <main className="flex-1">
        {page === 'home'     && <HomePage />}
        {page === 'products' && <ProductsPage />}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}