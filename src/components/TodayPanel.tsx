import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Subscription } from '../types';
import { cn, isSubscriptionOnDay } from '../lib/utils';
import { AlertCircle, Clock } from 'lucide-react';

interface TodayPanelProps {
  subscriptions: Subscription[];
}

export function TodayPanel({ subscriptions }: TodayPanelProps) {
  const today = new Date();
  const todaySubs = subscriptions.filter(s => isSubscriptionOnDay(s, today));

  return (
    <div className="editorial-card rounded-xl overflow-hidden flex flex-col sticky top-6 h-fit">
      {/* Editorial Header with Serif Typography */}
      <div className="px-6 py-5 border-b border-border bg-[var(--surface-elevated)]">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="text-[10px] uppercase tracking-widest text-text-muted font-bold font-mono">
            Aujourd'hui
          </h2>
        </div>
        <div className="editorial-heading text-2xl text-text-primary leading-tight">
          {format(today, 'd MMMM', { locale: fr })}
        </div>
        <div className="text-xs text-text-secondary font-mono mt-1 capitalize">
          {format(today, 'EEEE yyyy', { locale: fr })}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 overflow-y-auto custom-scrollbar max-h-[500px]">
        {todaySubs.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-surface-hover border-2 border-border flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-text-muted opacity-30" />
            </div>
            <p className="text-sm text-text-muted font-light leading-relaxed">
              Aucun renouvellement<br />aujourd'hui
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaySubs.map((sub, idx) => (
              <div
                key={sub.id}
                className="paper-texture border border-border rounded-lg p-4 hover:shadow-editorial-md hover:border-border-strong transition-editorial cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shadow-editorial-sm",
                      sub.type === 'licence'
                        ? "bg-[var(--accent-primary)]"
                        : "bg-[var(--accent-secondary)]"
                    )}>
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-serif font-semibold text-text-primary text-base leading-tight">
                        {sub.clientName}
                      </h4>
                      <p className="text-xs text-text-muted font-mono mt-1">
                        {sub.quantity}× {sub.type === 'licence' ? 'Licences' : 'Puces'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Type Badge - Editorial Style */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className={cn(
                    "inline-flex px-3 py-1 rounded-md text-[10px] font-bold font-mono uppercase tracking-widest",
                    sub.type === 'licence'
                      ? "bg-[var(--accent-primary)] bg-opacity-10 text-[var(--accent-primary)]"
                      : "bg-[var(--accent-secondary)] bg-opacity-10 text-[var(--accent-secondary)]"
                  )}>
                    {sub.type === 'licence' ? 'Licence' : 'Puce orange'}
                  </span>
                  <span className="text-xs text-text-muted font-mono">
                    Expire aujourd'hui
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {todaySubs.length > 0 && (
          <div className="mt-5 pt-5 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted font-mono">Total</span>
              <span className="stat-value text-lg text-[var(--accent-primary)]">
                {todaySubs.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
