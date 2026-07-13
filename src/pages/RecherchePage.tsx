import { useState, useMemo } from 'react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useEntreprises } from '../hooks/useEntreprises';
import { useRevendeurs } from '../hooks/useRevendeurs';
import { Subscription, Entreprise } from '../types';
import { Search, Phone, Building2, Package, Calendar as CalendarIcon, Mail, Hash, Handshake, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';

// Normalize a phone number for matching: keep digits only (drops spaces, dashes,
// parentheses, dots and a leading +), so "+216 21 234 567" matches "21234567".
function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

interface SearchResult {
  sub: Subscription;
  entreprise?: Entreprise;
  matchedNumbers: string[];
}

export default function RecherchePage() {
  const { subscriptions, loading: subsLoading } = useSubscriptions();
  const { entreprises, loading: entLoading } = useEntreprises();
  const { revendeurs } = useRevendeurs();

  const [query, setQuery] = useState('');

  const loading = subsLoading || entLoading;
  const normalizedQuery = normalizePhone(query);
  const hasQuery = normalizedQuery.length >= 2;

  const results = useMemo<SearchResult[]>(() => {
    if (!hasQuery) return [];
    const out: SearchResult[] = [];
    for (const sub of subscriptions) {
      if (sub.type !== 'licence_puce' || !sub.phoneNumbers?.length) continue;
      const matchedNumbers = sub.phoneNumbers.filter(n => normalizePhone(n).includes(normalizedQuery));
      if (matchedNumbers.length > 0) {
        const entreprise = entreprises.find(e => e.id === sub.entrepriseId);
        out.push({ sub, entreprise, matchedNumbers });
      }
    }
    return out;
  }, [hasQuery, normalizedQuery, subscriptions, entreprises]);

  const revendeurName = (entreprise?: Entreprise) => {
    if (!entreprise?.revendeurId) return null;
    return revendeurs.find(r => r.id === entreprise.revendeurId)?.name ?? null;
  };

  return (
    <div className="editorial-bg">
      {/* Hero Header */}
      <div className="animate-slide-up mb-8">
        <h1 className="editorial-heading text-5xl md:text-6xl text-text-primary mb-3">
          Recherche par numéro
        </h1>
        <p className="text-text-secondary text-lg font-light">
          Retrouvez l'abonnement et l'entreprise associés à un numéro de puce
        </p>
      </div>

      {/* Search Card */}
      <div className="editorial-card rounded-xl p-4 sm:p-8 animate-slide-up delay-100">
        <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-3">
          Numéro de téléphone
        </label>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            autoFocus
            type="tel"
            inputMode="tel"
            placeholder="Ex: 21 234 567"
            className="w-full bg-background border-2 border-border rounded-lg pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-[var(--accent-primary)] text-text-primary placeholder:text-text-muted transition-editorial font-mono tracking-wide"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Result meta */}
        {hasQuery && !loading && (
          <p className="text-xs text-text-muted font-mono mt-3">
            {results.length === 0
              ? 'Aucun résultat'
              : `${results.length} abonnement(s) trouvé(s)`}
          </p>
        )}
        {query.length > 0 && !hasQuery && (
          <p className="text-xs text-text-muted font-mono mt-3">
            Saisissez au moins 2 chiffres…
          </p>
        )}
      </div>

      {/* Results */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="editorial-card rounded-xl p-16 flex flex-col items-center gap-4 animate-fade-in">
            <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
            <p className="text-sm text-text-muted font-mono">Chargement des données…</p>
          </div>
        ) : !hasQuery ? (
          <div className="editorial-card rounded-xl p-16 flex flex-col items-center gap-4 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-surface-hover border-2 border-border flex items-center justify-center">
              <Phone className="w-10 h-10 text-text-muted opacity-30" />
            </div>
            <div>
              <p className="text-lg text-text-secondary font-serif">Recherchez un numéro de puce</p>
              <p className="text-sm text-text-muted mt-1">
                Tapez un numéro (même partiel) pour retrouver son abonnement et son entreprise
              </p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="editorial-card rounded-xl p-16 flex flex-col items-center gap-4 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-surface-hover border-2 border-border flex items-center justify-center">
              <Search className="w-10 h-10 text-text-muted opacity-30" />
            </div>
            <div>
              <p className="text-lg text-text-secondary font-serif">Aucun numéro correspondant</p>
              <p className="text-sm text-text-muted mt-1">
                Aucune puce ne correspond à « {query.trim()} »
              </p>
            </div>
          </div>
        ) : (
          results.map((result, idx) => (
            <ResultCard
              key={result.sub.id}
              result={result}
              revendeurName={revendeurName(result.entreprise)}
              index={idx}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ResultCard({ result, revendeurName, index }: { result: SearchResult; revendeurName: string | null; index: number }) {
  const { sub, entreprise, matchedNumbers } = result;
  const isActive = sub.isActive === 1;
  const isPaid = sub.isPaid === 1;

  return (
    <div
      className="editorial-card rounded-xl p-5 sm:p-6 animate-fade-in hover:shadow-editorial-md transition-editorial"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Matched numbers — the headline of the result */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {matchedNumbers.map((num, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-mono font-semibold text-sm shadow-editorial-sm"
          >
            <Phone className="w-4 h-4" />
            {num}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Entreprise */}
        <div className="paper-texture border border-border rounded-lg p-4">
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-3">Entreprise</p>
          {entreprise ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-editorial-sm shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-semibold text-text-primary text-lg leading-tight truncate">
                  {entreprise.name}
                </h3>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-muted font-mono">
                {entreprise.phone && (
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{entreprise.phone}</span>
                )}
                {entreprise.email && (
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{entreprise.email}</span>
                )}
                {entreprise.matriculeFiscale && (
                  <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />{entreprise.matriculeFiscale}</span>
                )}
                {revendeurName && (
                  <span className="flex items-center gap-1.5"><Handshake className="w-3.5 h-3.5" />{revendeurName}</span>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-text-muted font-serif italic">Entreprise introuvable ({sub.clientName})</p>
          )}
        </div>

        {/* Abonnement */}
        <div className="paper-texture border border-border rounded-lg p-4">
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-3">Abonnement</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-lg bg-[var(--accent-secondary)] text-white flex items-center justify-center shadow-editorial-sm shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif font-semibold text-text-primary text-base">Puce Orange</span>
              {sub.plan && (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold font-mono uppercase tracking-widest bg-surface-active text-[var(--accent-primary)]">
                  {sub.plan}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold font-mono uppercase tracking-widest bg-surface-active text-text-muted">
                Qté: {sub.quantity}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-text-muted">
              <CalendarIcon className="w-3.5 h-3.5" />
              Expire le {format(new Date(sub.endDate), 'dd/MM/yyyy', { locale: fr })}
            </span>
            <span className={cn(
              "flex items-center gap-1.5 font-semibold",
              isActive ? "text-green-500" : "text-text-muted"
            )}>
              {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {isActive ? 'Actif' : 'Expiré'}
            </span>
            <span className={cn(
              "flex items-center gap-1.5 font-semibold",
              isPaid ? "text-green-500" : "text-amber-500"
            )}>
              {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {isPaid ? 'Payé' : 'Impayé'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
