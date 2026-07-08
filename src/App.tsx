import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon, LogOut, Loader2, LayoutDashboard, Building2, Database, Sun, Moon, Users, Shield } from 'lucide-react';
import { cn } from './lib/utils';
import { login, register, signOut, getCurrentUser, User } from './auth';
import { useSubscriptions } from './hooks/useSubscriptions';

import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import EntreprisesPage from './pages/EntreprisesPage';
import RevendeursPage from './pages/RevendeursPage';
import UtilisateursPage from './pages/UtilisateursPage';

function Navigation({ user }: { user: User | null }) {
  const location = useLocation();

  const navItems = [
    { name: 'Tableau de bord', path: '/', icon: LayoutDashboard },
    { name: 'Calendrier', path: '/calendrier', icon: CalendarIcon },
    { name: 'Entreprises', path: '/entreprises', icon: Building2 },
    { name: 'Revendeurs', path: '/revendeurs', icon: Users },
    ...(user?.role === 'admin' ? [{ name: 'Utilisateurs', path: '/admin/utilisateurs', icon: Shield }] : []),
  ];

  return (
    <>
      {/* Desktop / tablet nav */}
      <nav className="hidden md:flex items-center gap-2 bg-surface border border-border rounded-xl p-1.5 shadow-editorial-md">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-editorial relative overflow-hidden group",
              location.pathname === item.path
                ? "bg-[var(--accent-primary)] text-white shadow-editorial-sm"
                : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
            )}
          >
            <item.icon className="w-4 h-4 relative z-10" />
            <span className="hidden md:inline font-mono text-xs uppercase tracking-wider relative z-10">
              {item.name}
            </span>
            {location.pathname === item.path && (
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-90" />
            )}
          </Link>
        ))}
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-surface border-t border-border shadow-editorial-lg pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 py-2.5 min-h-[52px] text-xs font-medium transition-editorial relative",
              location.pathname === item.path
                ? "text-[var(--accent-primary)]"
                : "text-text-muted"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              {item.name}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}

function MainLayout({ children, user, isDark, setIsDark, onSignOut }: { children: React.ReactNode, user: User | null, isDark: boolean, setIsDark: (val: boolean) => void, onSignOut: () => void }) {
  const { subscriptions, loading: subsLoading } = useSubscriptions();

  return (
    <div className="min-h-screen editorial-bg text-text-secondary font-sans p-4 pb-24 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b-2 border-border">
          {/* Logo & Brand - Editorial Style */}
          <div className="flex items-center space-x-4">
            <img src="/logo.png" alt="SubTrack" className="h-16 w-auto object-contain" />
            <div>
              <h1 className="editorial-heading text-2xl text-text-primary leading-tight">
                SubTrack
              </h1>
              <p className="text-xs text-text-muted font-mono uppercase tracking-widest mt-0.5">
                Gestion d'abonnements
              </p>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <Navigation user={user} />
            <div className="w-px h-8 bg-border" />
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
        </header>

        {children}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
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
      if (isLogin) {
        const result = await login(email, password);
        setUser(result.user);
      } else {
        const result = await register(email, password);
        setUser(result.user);
      }
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
            {isLogin ? 'Connectez-vous' : 'Créez un compte'} pour gérer vos entreprises et abonnements.
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
                minLength={6}
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
                isLogin ? 'Se connecter' : 'S\'inscrire'
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="pt-4 border-t border-border">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-text-muted hover:text-[var(--accent-primary)] transition-editorial font-mono"
            >
              {isLogin ? 'Pas de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
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
          <Route path="/revendeurs" element={<RevendeursPage />} />
          {user?.role === 'admin' && (
            <Route path="/admin/utilisateurs" element={<UtilisateursPage />} />
          )}
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
