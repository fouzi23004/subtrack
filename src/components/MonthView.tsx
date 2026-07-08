import React from 'react';
import { format, eachDayOfInterval, endOfMonth, startOfMonth, isSameDay, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Subscription } from '../types';
import { cn, isSubscriptionOnDay } from '../lib/utils';
import { Search, Calendar, Layers } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  subscriptions: Subscription[];
  onSelectWeek?: (date: Date, e: React.MouseEvent) => void;
  onSelectDay: (date: Date, e: React.MouseEvent) => void;
}

export function MonthView({ currentDate, subscriptions, onSelectWeek, onSelectDay }: MonthViewProps) {
  const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Split days into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Mobile list: only current-month days that have at least one subscription
  const monthDaysWithSubs = days
    .filter(d => isSameMonth(d, currentDate))
    .map(d => ({ date: d, subs: subscriptions.filter(s => isSubscriptionOnDay(s, d)) }))
    .filter(d => d.subs.length > 0);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col h-full min-h-[600px]">
      {/* Mobile: vertical list of days with subscriptions */}
      <div className="md:hidden flex-1 overflow-y-auto divide-y divide-border custom-scrollbar">
        {monthDaysWithSubs.length === 0 ? (
          <div className="text-sm text-text-muted text-center py-16">
            Aucun abonnement ce mois-ci
          </div>
        ) : (
          monthDaysWithSubs.map(({ date, subs }, i) => (
            <div key={i} className="p-4">
              <div
                className="flex items-center justify-between mb-3 cursor-pointer"
                onClick={(e) => onSelectDay(date, e)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "text-lg font-light w-10 h-10 shrink-0 flex items-center justify-center rounded-full",
                    isSameDay(date, new Date()) ? "bg-blue-600 text-text-primary font-bold" : "bg-surface-hover text-text-muted"
                  )}>
                    {format(date, 'd')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary capitalize">
                      {format(date, 'EEEE d MMMM', { locale: fr })}
                    </div>
                    <div className="text-[10px] text-text-muted font-mono">
                      {subs.length} abonnement{subs.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                {onSelectWeek && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectWeek(date, e); }}
                    className="p-2 text-text-muted hover:text-blue-400 transition-colors"
                    title="Voir la semaine"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {subs.map(sub => (
                  <div
                    key={sub.id}
                    className={cn(
                      "p-3 rounded-lg border text-xs text-left shadow-sm transition-all",
                      sub.type === 'licence'
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                    )}
                  >
                    <div className="font-semibold mb-1 truncate">{sub.clientName}</div>
                    <div className="flex items-center gap-1.5 opacity-80 text-[10px]">
                      {sub.type === 'licence' ? <Calendar className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                      {sub.quantity} {sub.type === 'licence' ? 'Licences' : 'Puces orange'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tablet / Desktop: 8-column grid (week controller + 7 days) */}
      <div className="hidden md:grid grid-cols-8 border-b border-border-strong bg-surface">
        <div className="p-3 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest border-r border-border">
          Semaine
        </div>
        {weekDays.map((d, i) => (
          <div key={d} className={cn("p-3 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest", i < 6 && "border-r border-border")}>
            {d}
          </div>
        ))}
      </div>

      <div className="hidden md:flex flex-1 flex-col">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-8 flex-1 border-b border-border last:border-b-0 min-h-[120px]">
            {/* Week Controller Column */}
            <div 
              className="border-r border-border bg-surface/50 flex items-center justify-center p-2 cursor-pointer hover:bg-surface-hover transition-colors group"
              onClick={(e) => onSelectWeek?.(week[0], e)}
            >
              <div className="text-xs font-medium text-text-muted group-hover:text-blue-400 flex items-center gap-1">
                <Search className="w-3 h-3" />
                <span>Zoom</span>
              </div>
            </div>

            {/* Days Columns */}
            {week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const daySubs = subscriptions.filter(s => isSubscriptionOnDay(s, day));
              
              const licences = daySubs.filter(s => s.type === 'licence');
              const puces = daySubs.filter(s => s.type === 'licence_puce');

              return (
                <div 
                  key={dayIndex} 
                  className={cn(
                    "p-2 border-r border-border last:border-r-0 cursor-pointer hover:bg-surface-hover transition-colors flex flex-col gap-1",
                    !isCurrentMonth && "bg-surface/30 opacity-60"
                  )}
                  onClick={(e) => onSelectDay(day, e)}
                >
                  <div className={cn(
                    "text-sm font-medium p-1 w-7 h-7 flex items-center justify-center rounded-full mb-1",
                    isSameDay(day, new Date()) ? "bg-blue-600 text-text-primary" : "text-text-muted"
                  )}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {daySubs.map(sub => (
                      <div
                        key={sub.id}
                        className={cn(
                          "text-[9px] text-text-primary px-1.5 py-0.5 rounded truncate font-bold shadow-sm",
                          sub.type === 'licence' ? "bg-blue-600" : "bg-orange-600"
                        )}
                      >
                        {sub.clientName} ({sub.quantity})
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
