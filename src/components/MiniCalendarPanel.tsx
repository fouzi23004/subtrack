import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Subscription } from '../types';
import { cn, isSubscriptionOnDay, isSubscriptionInMonth } from '../lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';

interface MiniCalendarPanelProps {
  subscriptions: Subscription[];
}

export function MiniCalendarPanel({ subscriptions }: MiniCalendarPanelProps) {
  const navigate = useNavigate();
  const today = new Date();
  const monthStart = startOfMonth(today);

  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
  });

  const monthSubs = subscriptions.filter(s => isSubscriptionInMonth(s, today));
  const monthLicences = monthSubs.filter(s => s.type === 'licence').reduce((acc, s) => acc + s.quantity, 0);
  const monthPuces = monthSubs.filter(s => s.type === 'licence_puce').reduce((acc, s) => acc + s.quantity, 0);

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const openDay = (day: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/calendrier', { state: { targetDate: day.toISOString(), viewMode: 'day' } });
  };
  const openMonth = () => {
    navigate('/calendrier', { state: { targetDate: today.toISOString(), viewMode: 'month' } });
  };

  return (
    <div className="editorial-card rounded-xl overflow-hidden flex flex-col sticky top-6 h-fit">
      {/* Editorial Header with Serif Typography */}
      <div
        className="px-6 py-5 border-b border-border bg-[var(--surface-elevated)] cursor-pointer hover:bg-surface-hover transition-editorial group"
        onClick={openMonth}
      >
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="text-[10px] uppercase tracking-widest text-text-muted font-bold font-mono">
            Ce mois-ci
          </h2>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div className="editorial-heading text-2xl text-text-primary leading-tight capitalize group-hover:text-[var(--accent-primary)] transition-editorial">
            {format(today, 'MMMM yyyy', { locale: fr })}
          </div>
          <div className="flex flex-col items-end gap-1">
            {monthLicences > 0 && (
              <span
                className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--accent-secondary)] px-2 py-0.5 rounded-md whitespace-nowrap"
                style={{ backgroundColor: 'color-mix(in srgb, var(--accent-secondary) 12%, transparent)' }}
              >
                {monthLicences} Licences
              </span>
            )}
            {monthPuces > 0 && (
              <span
                className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--accent-primary)] px-2 py-0.5 rounded-md whitespace-nowrap"
                style={{ backgroundColor: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)' }}
              >
                {monthPuces} Puces orange
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-5">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d, i) => (
            <div key={i} className="text-center text-[9px] font-bold font-mono text-text-muted uppercase tracking-widest py-1">
              {d}
            </div>
          ))}
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, today);
            const daySubs = subscriptions.filter(s => isSubscriptionOnDay(s, day));
            const hasLicence = daySubs.some(s => s.type === 'licence');
            const hasPuce = daySubs.some(s => s.type === 'licence_puce');

            return (
              <div
                key={day.toISOString()}
                onClick={(e) => openDay(day, e)}
                className={cn(
                  "aspect-square flex items-center justify-center text-xs font-mono rounded-md cursor-pointer hover:bg-surface-hover transition-editorial relative",
                  !isCurrentMonth && "text-text-muted opacity-40",
                  isCurrentMonth && "text-text-primary",
                  isToday(day) && "bg-[var(--accent-primary)] text-white font-bold shadow-editorial-sm hover:bg-[var(--accent-primary)]"
                )}
              >
                <span>{format(day, 'd')}</span>
                {(hasLicence || hasPuce) && (
                  <div className="absolute bottom-1 w-full flex justify-center gap-0.5">
                    {hasLicence && (
                      <span className={cn("w-1 h-1 rounded-full", isToday(day) ? "bg-white" : "bg-[var(--accent-secondary)]")} />
                    )}
                    {hasPuce && (
                      <span className={cn("w-1 h-1 rounded-full", isToday(day) ? "bg-white" : "bg-[var(--accent-primary)]")} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-5 text-[10px] font-mono text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-secondary)]" />
            Licences
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
            Puces orange
          </div>
        </div>
      </div>
    </div>
  );
}
