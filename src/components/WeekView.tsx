import React from 'react';
import { format, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Subscription } from '../types';
import { cn, isSubscriptionOnDay } from '../lib/utils';
import { Calendar, Layers } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  subscriptions: Subscription[];
  onSelectDay: (date: Date, e: React.MouseEvent) => void;
}

export function WeekView({ currentDate, subscriptions, onSelectDay }: WeekViewProps) {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col h-full min-h-[600px]">
      {/* Mobile: vertical list grouped by day */}
      <div className="md:hidden flex-1 overflow-y-auto divide-y divide-border custom-scrollbar">
        {days.map((day, i) => {
          const daySubs = subscriptions.filter(s => isSubscriptionOnDay(s, day));

          return (
            <div key={i} className="p-4">
              <div
                className="flex items-center gap-3 mb-3 cursor-pointer"
                onClick={(e) => onSelectDay(day, e)}
              >
                <div className={cn(
                  "text-lg font-light w-10 h-10 shrink-0 flex items-center justify-center rounded-full",
                  isSameDay(day, new Date()) ? "bg-blue-600 text-text-primary font-bold" : "bg-surface-hover text-text-muted"
                )}>
                  {format(day, 'd')}
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary capitalize">
                    {format(day, 'EEEE d MMMM', { locale: fr })}
                  </div>
                  <div className="text-[10px] text-text-muted font-mono">
                    {daySubs.length} abonnement{daySubs.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {daySubs.length === 0 ? (
                  <div className="text-xs text-text-muted py-2">Aucun abonnement</div>
                ) : (
                  daySubs.map(sub => (
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
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tablet / Desktop: 7-column grid */}
      <div className="hidden md:flex md:flex-col flex-1">
        <div className="grid grid-cols-7 border-b border-border-strong bg-surface flex-none">
          {days.map((day, i) => (
            <div key={i} className={cn("p-4 text-center border-r border-border last:border-r-0")}>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
                {format(day, 'EEEE', { locale: fr })}
              </div>
              <div className={cn(
                "text-2xl font-light w-10 h-10 mx-auto flex items-center justify-center rounded-full",
                isSameDay(day, new Date()) ? "bg-blue-600 text-text-primary font-bold" : "text-text-muted"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1">
          {days.map((day, i) => {
            const daySubs = subscriptions.filter(s => isSubscriptionOnDay(s, day));

            return (
              <div
                key={i}
                className={cn(
                  "p-2 border-r border-border last:border-r-0 hover:bg-surface-hover transition-colors flex flex-col gap-2 cursor-pointer",
                )}
                onClick={(e) => onSelectDay(day, e)}
              >
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {daySubs.length === 0 && (
                    <div className="text-sm text-text-muted text-center py-6">
                      Aucun abonnement
                    </div>
                  )}
                  {daySubs.map(sub => (
                    <div
                      key={sub.id}
                      className={cn(
                        "p-2 rounded-lg border text-xs text-left shadow-sm transition-all",
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
