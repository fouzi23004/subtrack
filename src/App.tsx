import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon, LogOut, Loader2, LayoutDashboard, Building2, Sun, Moon, Users, Shield, Tag, Menu, X, ChevronLeft, ChevronRight, PhoneCall } from 'lucide-react';
import { cn } from './lib/utils';
import { login, signOut, getCurrentUser, User } from './auth';
import { useSubscriptions } from './hooks/useSubscriptions';

import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import EntreprisesPage from './pages/EntreprisesPage';
import RevendeursPage from './pages/RevendeursPage';
import UtilisateursPage from './pages/UtilisateursPage';
import ForfaitsPage from './pages/ForfaitsPage';
import RecherchePage from './pages/RecherchePage';

function getNavItems(user: User | null) {
  return [
    { name: 'Tableau de bord', path: '/', icon: LayoutDashboard },
    { name: 'Calendrier', path: '/calendrier', icon: CalendarIcon },
    { name: 'Entreprises', path: '/entreprises', icon: Building2 },
    { name: 'Recherche N°', path: '/recherche', icon: PhoneCall },
    { name: 'Revendeurs', path: '/revendeurs', icon: Users },
    { name: 'Forfaits', path: '/forfaits', icon: Tag },
    ...(user?.role === 'admin' ? [{ name: 'Utilisateurs', path: '/admin/utilisateurs', icon: Shield }] : []),
  ];
}

function SidebarContent({ user, collapsed, isDark, setIsDark, onSignOut, onNavigate }: {
  user: User | null,
  collapsed: boolean,
  isDark: boolean,
  setIsDark: (val: boolean) => void,
  onSignOut: () => void,
  onNavigate?: () => void
}) {
  const location = useLocation();
  const navItems = getNavItems(user);

  return (
    <div className="flex flex-col h-full">
      {/* Logo & Brand */}
      <div className={cn(
        "flex items-center gap-3 border-b border-border py-5",
        collapsed ? "justify-center px-2" : "px-4"
      )}>
        <img src="/logo.png" alt="SubTrack" className="h-10 w-auto object-contain shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="editorial-heading text-lg text-text-primary leading-tight">
              SubTrack
            </h1>
            <p className="text-[9px] text-text-muted font-mono uppercase tracking-widest mt-0.5 truncate">
              Gestion d'abonnements
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            title={collapsed ? item.name : undefined}
            className={cn(
              "flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-editorial relative overflow-hidden group",
              collapsed ? "justify-center px-2" : "px-3",
              location.pathname === item.path
                ? "text-white shadow-editorial-sm"
                : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
            )}
          >
            {location.pathname === item.path && (
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-90" />
            )}
            <item.icon className="w-4 h-4 relative z-10 shrink-0" />
            {!collapsed && (
              <span className="font-mono text-xs uppercase tracking-wider relative z-10 truncate">
                {item.name}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer actions */}
      <div className={cn(
        "border-t border-border p-3 flex gap-1.5",
        collapsed ? "flex-col items-center" : "items-center justify-center"
      )}>
        <button
           // eslint-disable-next-line
          onClick={() => setIsDark(!isDark)}
          className="p-2.5 text-text-muted hover:text-[var(--accent-primary)] hover:bg-surface-hover rounded-lg transition-editorial border border-transparent hover:border-border"
          title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={onSignOut}
          className="p-2.5 text-text-muted hover:text-[var(--accent-primary)] hover:bg-surface-hover rounded-lg transition-editorial border border-transparent hover:border-border"
          title="Se déconnecter"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function MainLayout({ children, user, isDark, setIsDark, onSignOut }: { children: React.ReactNode, user: User | null, isDark: boolean, setIsDark: (val: boolean) => void, onSignOut: () => void }) {
  const { subscriptions, loading: subsLoading } = useSubscriptions();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === '1');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(c => {
      localStorage.setItem('sidebarCollapsed', c ? '0' : '1');
      return !c;
    });
  };

  return (
    <div className="min-h-screen editorial-bg text-text-secondary font-sans flex">
      {/* Desktop sidebar - fixed so it never moves on scroll */}
      <aside className={cn(
        "hidden md:flex flex-col fixed left-0 top-0 h-screen z-30 bg-surface border-r border-border shadow-editorial-md transition-all duration-300",
        collapsed ? "w-20" : "w-60"
      )}>
        <SidebarContent
          user={user}
          collapsed={collapsed}
          isDark={isDark}
          setIsDark={setIsDark}
          onSignOut={onSignOut}
        />
        {/* Collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-surface border border-border shadow-editorial-sm flex items-center justify-center text-text-muted hover:text-[var(--accent-primary)] hover:border-border-strong transition-editorial"
          title={collapsed ? "Déplier le menu" : "Replier le menu"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-surface border-r border-border shadow-editorial-lg animate-slide-in-left flex flex-col">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-5 p-2 text-text-muted hover:text-text-primary rounded-lg transition-editorial"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent
              user={user}
              collapsed={false}
              isDark={isDark}
              setIsDark={setIsDark}
              onSignOut={onSignOut}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Content - offset by the fixed sidebar width on desktop */}
      <div className={cn(
        "flex-1 min-w-0 transition-all duration-300",
        collapsed ? "md:ml-20" : "md:ml-60"
      )}>
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 bg-surface border-b border-border shadow-editorial-sm">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SubTrack" className="h-9 w-auto object-contain" />
            <h1 className="editorial-heading text-lg text-text-primary leading-tight">
              SubTrack
            </h1>
          </div>
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-editorial"
            title="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Theme logic
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setAuthLoading(false);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      setUser(result.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen editorial-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen editorial-bg flex items-center justify-center p-4">
        <div className="editorial-card rounded-xl p-10 max-w-md w-full text-center space-y-6 relative animate-scale-in">
          {/* Theme Toggle */}
          <div className="absolute top-4 right-4">
            <button
               // eslint-disable-next-line
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-text-muted hover:text-[var(--accent-primary)] hover:bg-surface-hover rounded-lg transition-editorial"
              title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Logo */}
          <div className="w-20 h-20 rounded-xl overflow-hidden mx-auto mb-4 shadow-editorial-lg">
            <img src="/logo.png" alt="SubTrack" className="w-full h-full object-cover" />
          </div>

          {/* Branding */}
          <div className="space-y-2">
            <h1 className="editorial-heading text-4xl text-text-primary">SubTrack</h1>
            <p className="text-xs text-text-muted font-mono uppercase tracking-widest">
              Gestion d'abonnements
            </p>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed">
            Connectez-vous pour gérer vos entreprises et abonnements.
          </p>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4 text-left">
            <div>
              <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono text-sm"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm font-mono">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-mono font-semibold rounded-lg hover:shadow-editorial-lg transition-editorial flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <MainLayout user={user} isDark={isDark} setIsDark={setIsDark} onSignOut={handleSignOut}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendrier" element={<CalendarPage />} />
          <Route path="/entreprises" element={<EntreprisesPage />} />
          <Route path="/recherche" element={<RecherchePage />} />
          <Route path="/revendeurs" element={<RevendeursPage />} />
          <Route path="/forfaits" element={<ForfaitsPage />} />
          {user?.role === 'admin' && (
            <Route path="/admin/utilisateurs" element={<UtilisateursPage />} />
          )}
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
