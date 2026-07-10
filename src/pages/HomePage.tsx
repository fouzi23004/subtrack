import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { MiniCalendarPanel } from '../components/MiniCalendarPanel';
import { FilterState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfDay, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, PieChart as PieChartIcon, BarChart2, Bell, ChevronRight, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function HomePage() {
  const { subscriptions } = useSubscriptions();
  const currentDate = new Date();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<FilterState>({ clientName: '', type: 'all' });

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(target => {
      if (!target.endDate) return false;
      const d = new Date(target.endDate);
      if (isNaN(d.getTime())) return false; // Fix Invalid Date issue

      const matchClient = target.clientName.toLowerCase().includes(filters.clientName.toLowerCase());
      const matchType = filters.type === 'all' || target.type === filters.type;
      return matchClient && matchType;
    });
  }, [subscriptions, filters]);

  // Upcoming Subscriptions
  const upcomingDates = useMemo(() => {
    const today = startOfDay(new Date());
    
    const occurrences = filteredSubscriptions
      .map(s => {
        const date = startOfDay(new Date(s.endDate));
        return {
          sub: s,
          date,
          dateStr: format(date, 'yyyy-MM-dd')
        };
      })
      .filter(occ => !isBefore(occ.date, today));
      
    const grouped = occurrences.reduce((acc, occ) => {
       if (!acc[occ.dateStr]) acc[occ.dateStr] = [];
       acc[occ.dateStr].push(occ.sub);
       return acc;
    }, {} as Record<string, typeof subscriptions>);
    
    return Object.entries(grouped).map(([dateStr, subs]) => ({
      date: new Date(dateStr),
      subs
    })).sort((a,b) => a.date.getTime() - b.date.getTime());
  }, [filteredSubscriptions]);

  // Chart data: Expiries per month for current year
  const expiriesPerMonth = useMemo(() => {
    const months = eachMonthOfInterval({ start: startOfYear(currentDate), end: endOfYear(currentDate) });
    return months.map(month => {
      const count = filteredSubscriptions.filter(s => {
        const subDate = startOfDay(new Date(s.endDate));
        return subDate.getMonth() === month.getMonth() && subDate.getFullYear() <= month.getFullYear();
      }).length;
      return {
        name: format(month, 'MMM', { locale: fr }),
        count
      };
    });
  }, [filteredSubscriptions, currentDate]);

  // Chart data: Distribution by type
  const distByType = useMemo(() => {
    const types = filteredSubscriptions.reduce((acc, sub) => {
      acc[sub.type] = (acc[sub.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(types).map(([name, value]) => ({ name: name === 'licence' ? 'Licence' : 'Puce orange', value }));
  }, [filteredSubscriptions]);

  const TYPE_COLORS: Record<string, string> = { 'Licence': '#2D5A4F', 'Puce orange': '#E8765E' };

  return (
    <div className="editorial-bg min-h-screen">
      {/* Hero Header with Editorial Typography */}
      <div className="animate-slide-up mb-8">
        <h1 className="editorial-heading text-5xl md:text-6xl text-text-primary mb-3">
          Tableau de bord
        </h1>
        <p className="text-text-secondary text-lg font-light">
          Aperçu de vos abonnements et renouvellements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left column: Upcoming Dates and Charts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Upcoming Renewals - Editorial Card with Accent Border */}
          <div className="editorial-card accent-border rounded-xl p-4 sm:p-8 animate-slide-up delay-100">
            <div className="flex items-baseline justify-between mb-6 border-b border-border pb-4">
              <h2 className="editorial-heading text-2xl text-text-primary">
                Prochains renouvellements
              </h2>
              <div className="flex items-center gap-2 text-text-muted">
                <Bell className="w-4 h-4" />
                <span className="stat-value text-sm">{upcomingDates.length}</span>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-[420px]">
              {upcomingDates.length === 0 ? (
                <div className="text-center py-16 text-text-muted flex flex-col items-center">
                  <Clock className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-lg">Aucun abonnement à venir</p>
                </div>
              ) : (
                upcomingDates.map((group, idx) => (
                  <div
                    key={group.date.toISOString()}
                    onClick={() => navigate('/calendrier', { state: { targetDate: group.date.toISOString(), viewMode: 'day' } })}
                    className="paper-texture border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:shadow-editorial-md hover:border-border-strong transition-editorial group/item animate-fade-in"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3 sm:gap-5">
                      {/* Date Badge - Mono Font */}
                      <div className="bg-[var(--accent-primary)] text-white font-mono font-semibold px-3 sm:px-4 py-3 rounded-md text-center min-w-[64px] sm:min-w-[80px] shadow-editorial-sm">
                        <div className="text-xs uppercase tracking-widest opacity-90">
                          {format(group.date, 'MMM', { locale: fr })}
                        </div>
                        <div className="text-3xl leading-none mt-1">
                          {format(group.date, 'dd')}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-text-primary font-serif font-semibold text-lg capitalize leading-tight">
                          {format(group.date, 'EEEE d MMMM', { locale: fr })}
                        </h3>
                        <p className="text-sm text-text-muted mt-1 font-mono">
                          {group.subs.length} renouvellement{group.subs.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {group.subs.slice(0, 3).map((sub, i) => (
                           <div
                             key={i}
                             className={cn(
                               "inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-surface text-xs font-bold shadow-editorial-sm transition-editorial",
                               sub.type === 'licence'
                                 ? 'bg-[var(--accent-secondary)] text-white'
                                 : 'bg-[var(--accent-primary)] text-white'
                             )}
                           >
                             {sub.type === 'licence' ? 'L' : 'P'}
                           </div>
                        ))}
                        {group.subs.length > 3 && (
                          <div className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-surface bg-text-muted text-white text-xs font-bold shadow-editorial-sm">
                            +{group.subs.length - 3}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-muted group-hover/item:text-[var(--accent-primary)] transition-editorial" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bar Chart - Editorial Style */}
            <div className="editorial-card rounded-xl p-6 animate-slide-up delay-200">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
                <div>
                  <h3 className="font-serif font-semibold text-lg text-text-primary">
                    Évolution annuelle
                  </h3>
                  <p className="text-xs text-text-muted mt-1 font-mono">
                    {currentDate.getFullYear()}
                  </p>
                </div>
                <BarChart2 className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expiriesPerMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      tickLine={false}
                      axisLine={false}
                      style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px' }}
                    />
                    <YAxis
                      stroke="var(--text-muted)"
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px' }}
                    />
                    <Tooltip
                      cursor={{fill: 'var(--surface-hover)'}}
                      contentStyle={{
                        backgroundColor: 'var(--surface-elevated)',
                        borderColor: 'var(--border-strong)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-family-mono)',
                        fontSize: '12px'
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--accent-primary)"
                      radius={[6, 6, 0, 0]}
                      name="Abonnements"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart - Editorial Style */}
            <div className="editorial-card rounded-xl p-6 animate-slide-up delay-300">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
                <div>
                  <h3 className="font-serif font-semibold text-lg text-text-primary">
                    Répartition
                  </h3>
                  <p className="text-xs text-text-muted mt-1 font-mono">
                    Par type
                  </p>
                </div>
                <PieChartIcon className="w-5 h-5 text-[var(--accent-secondary)]" />
              </div>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {distByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name] ?? '#E8765E'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--surface-elevated)',
                        borderColor: 'var(--border-strong)',
                        borderRadius: '8px',
                        fontFamily: 'var(--font-family-mono)',
                        fontSize: '12px'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      wrapperStyle={{
                        fontFamily: 'var(--font-family-mono)',
                        fontSize: '11px',
                        color: 'var(--text-secondary)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Mini Calendar of Current Month */}
        <div className="lg:col-span-4 animate-slide-in-right delay-100">
           <MiniCalendarPanel subscriptions={filteredSubscriptions} />
        </div>
      </div>
    </div>
  );
}
