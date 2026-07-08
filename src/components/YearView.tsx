import React, { useMemo } from 'react';
import { format, startOfYear, addMonths, eachDayOfInterval, endOfMonth, startOfMonth, isSameDay, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Subscription } from '../types';
import { cn, isSubscriptionInMonth, isSubscriptionOnDay } from '../lib/utils';

interface YearViewProps {
  currentDate: Date;
  subscriptions: Subscription[];
  onSelectMonth: (date: Date, e: React.MouseEvent) => void;
  onSelectDay: (date: Date, e: React.MouseEvent) => void;
}

export function YearView({ currentDate, subscriptions, onSelectMonth, onSelectDay }: YearViewProps) {
  const yearStart = startOfYear(currentDate);

  const months = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => addMonths(yearStart, i));
  }, [yearStart]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {months.map((month) => (
        <MiniMonth 
          key={month.toISOString()} 
          month={month} 
          subscriptions={subscriptions} 
          onSelectMonth={(e) => onSelectMonth(month, e)}
          onSelectDay={onSelectDay}
        />
      ))}
    </div>
  );
}

function MiniMonth({ month, subscriptions, onSelectMonth, onSelectDay }: { 
  month: Date; 
  subscriptions: Subscription[];
  onSelectMonth: (e: React.MouseEvent) => void;
  onSelectDay: (d: Date, e: React.MouseEvent) => void;
  key?: string;
}) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const monthSubs = subscriptions.filter(s => isSubscriptionInMonth(s, month));
  const monthLicences = monthSubs.filter(s => s.type === 'licence').reduce((acc, curr) => acc + curr.quantity, 0);
  const monthPuces = monthSubs.filter(s => s.type === 'licence_puce').reduce((acc, curr) => acc + curr.quantity, 0);

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div 
      className="bg-surface border border-border rounded-xl p-3 flex flex-col shadow-sm cursor-pointer hover:bg-surface-hover hover:border-blue-500/30 transition-colors"
      onClick={onSelectMonth}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="text-base font-medium capitalize text-text-primary">
          {format(month, 'MMMM yyyy', { locale: fr })}
        </div>
        <div className="flex flex-col items-end gap-1">
          {monthLicences > 0 && <span className="text-[11px] font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded-md whitespace-nowrap">{monthLicences} Licences</span>}
          {monthPuces > 0 && <span className="text-[11px] font-bold text-orange-300 bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 rounded-md whitespace-nowrap">{monthPuces} Puces orange</span>}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {weekDays.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-bold text-text-muted uppercase tracking-widest py-1">
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, month);
          const daySubs = subscriptions.filter(s => isSubscriptionOnDay(s, day));
          const hasLicence = daySubs.some(s => s.type === 'licence');
          const hasPuce = daySubs.some(s => s.type === 'licence_puce');

          return (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDay(day, e);
              }}
              className={cn(
                "py-1 md:py-1.5 flex items-center justify-center text-[10px] rounded hover:bg-surface-active relative",
                !isCurrentMonth && "text-slate-600",
                isCurrentMonth && "text-text-muted font-medium"
              )}
            >
              <span>{format(day, 'd')}</span>
              {(hasLicence || hasPuce) && (
                <div className="absolute bottom-0 w-full flex justify-center gap-0.5">
                  {hasLicence && <span className="w-1 h-1 rounded-full bg-blue-500" />}
                  {hasPuce && <span className="w-1 h-1 rounded-full bg-orange-500" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
