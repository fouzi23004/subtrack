import { useState } from 'react';
import { addMonths, addYears, format, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Subscription } from '../types';
import { isSubscriptionOnDay } from '../lib/utils';
import { cn } from '../lib/utils';
import { Calendar, Hash, Layers, RefreshCw } from 'lucide-react';
import { useSubscriptions } from '../hooks/useSubscriptions';

interface DayViewProps {
  currentDate: Date;
  subscriptions: Subscription[];
}

export function DayView({ currentDate, subscriptions }: DayViewProps) {
  const { renewSubscription } = useSubscriptions();
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [subToRenew, setSubToRenew] = useState<Subscription | null>(null);
  const [renewYears, setRenewYears] = useState(1);
  const [renewMonths, setRenewMonths] = useState(0);
  const [renewQuantity, setRenewQuantity] = useState(1);

  const daySubs = subscriptions.filter(s => isSubscriptionOnDay(s, currentDate));

  const licences = daySubs.filter(s => s.type === 'licence');
  const puces = daySubs.filter(s => s.type === 'licence_puce');

  const openRenewModal = (sub: Subscription) => {
    setSubToRenew(sub);
    setRenewYears(1);
    setRenewMonths(0);
    setRenewQuantity(sub.quantity);
    setIsRenewModalOpen(true);
  };

  const computedRenewDate = subToRenew
    ? addMonths(addYears(startOfDay(new Date(subToRenew.endDate)), renewYears), renewMonths)
    : null;

  const executeRenew = async () => {
    if (subToRenew && computedRenewDate && (renewYears > 0 || renewMonths > 0) && renewQuantity > 0) {
      try {
        await renewSubscription(subToRenew.id, format(computedRenewDate, 'yyyy-MM-dd'), renewQuantity);
        setIsRenewModalOpen(false);
        setSubToRenew(null);
        setRenewYears(1);
        setRenewMonths(0);
        setRenewQuantity(1);
      } catch (error) {
        console.error('Error renewing subscription:', error);
      }
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm h-full flex flex-col min-h-[600px]">
      <div className="p-4 sm:p-6 border-b border-border-strong bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-none">
        <div>
          <h2 className="text-xl sm:text-2xl font-light text-text-primary capitalize">
            {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </h2>
          <p className="text-text-muted mt-1">
            {daySubs.length} expiration{daySubs.length > 1 ? 's' : ''} prévue{daySubs.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-3xl font-bold text-text-primary">{licences.reduce((acc, sub) => acc + sub.quantity, 0)}</span>
            <span className="text-xs font-medium text-blue-400 uppercase">Licences</span>
          </div>
          <div className="w-px bg-surface-active"></div>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-bold text-text-primary">{puces.reduce((acc, sub) => acc + sub.quantity, 0)}</span>
            <span className="text-xs font-medium text-orange-400 uppercase">Puces</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {daySubs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-muted pb-12">
            <Calendar className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Aucune expiration pour cette date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daySubs.map(sub => (
              <div
                key={sub.id}
                className={cn(
                  "p-4 rounded-xl border flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group",
                  sub.type === 'licence'
                    ? "bg-surface-hover border-border hover:bg-surface-hover"
                    : "bg-surface-hover border-border hover:bg-surface-hover"
                )}
              >
                <div className={cn(
                  "absolute top-0 left-0 w-1 h-full",
                  sub.type === 'licence' ? "bg-blue-500" : "bg-orange-500"
                )} />
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-text-primary text-lg truncate pr-4">{sub.clientName}</h3>
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                    sub.type === 'licence'
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  )}>
                    {sub.type === 'licence' ? 'Licence' : `Puce orange${sub.plan ? ` · ${sub.plan}` : ''}`}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-4 h-4 opacity-50" />
                    <span className="font-semibold text-text-primary">{sub.quantity}</span>
                    <span className="text-sm">unités</span>
                  </div>
                  <button
                    onClick={() => openRenewModal(sub)}
                    className="p-2 text-text-muted hover:text-green-600 hover:bg-surface-hover rounded-lg transition-editorial opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    title="Renouveler"
                  >
                    <RefreshCw className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Renew Subscription Modal - Editorial Style */}
      {isRenewModalOpen && subToRenew && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="editorial-card rounded-xl w-full max-w-md p-4 sm:p-8 animate-scale-in border-l-4 border-green-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <RefreshCw className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="editorial-heading text-xl text-text-primary">Renouveler l'abonnement</h3>
            </div>
            <div className="mb-6 sm:pl-16">
              <p className="text-sm text-text-secondary mb-4">
                Renouvelez l'abonnement <span className="font-semibold text-[var(--accent-primary)]">{subToRenew.type.replace('_', ' ')}</span> pour <span className="font-semibold">{subToRenew.clientName}</span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                    Nouvelle quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={renewQuantity}
                    onChange={e => setRenewQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                  />
                  <p className="text-xs text-text-muted mt-2 font-mono">
                    Quantité actuelle: {subToRenew.quantity}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                    Durée du renouvellement
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        min="0"
                        value={renewYears}
                        onChange={e => setRenewYears(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                      />
                      <p className="text-xs text-text-muted mt-1 font-mono">Année{renewYears > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        value={renewMonths}
                        onChange={e => setRenewMonths(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                      />
                      <p className="text-xs text-text-muted mt-1 font-mono">Mois</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted mt-2 font-mono">
                    Expire le {format(startOfDay(new Date(subToRenew.endDate)), 'dd/MM/yyyy')}
                    {computedRenewDate && (renewYears > 0 || renewMonths > 0) && (
                      <> → nouvelle expiration le <span className="text-[var(--accent-primary)] font-semibold">{format(computedRenewDate, 'dd/MM/yyyy')}</span></>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setIsRenewModalOpen(false); setSubToRenew(null); setRenewYears(1); setRenewMonths(0); setRenewQuantity(1); }}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary hover:bg-surface-hover transition-editorial"
              >
                Annuler
              </button>
              <button
                onClick={executeRenew}
                disabled={(renewYears <= 0 && renewMonths <= 0) || renewQuantity < 1}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider bg-green-600 hover:bg-green-700 text-white hover:shadow-editorial-md transition-editorial disabled:opacity-50"
              >
                Renouveler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
