import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useRevendeurs } from '../hooks/useRevendeurs';
import { useEntreprises } from '../hooks/useEntreprises';
import { YearView } from '../components/YearView';
import { MonthView } from '../components/MonthView';
import { WeekView } from '../components/WeekView';
import { DayView } from '../components/DayView';
import { FilterState, ViewMode } from '../types';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, addYears, subYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const viewLevels = { year: 1, month: 2, week: 3, day: 4 };

export default function CalendarPage() {
  const { subscriptions } = useSubscriptions();
  const { revendeurs } = useRevendeurs();
  const { entreprises } = useEntreprises();
  const location = useLocation();
  const initialState = location.state as { targetDate?: string, viewMode?: ViewMode } | null;

  const [currentDate, setCurrentDate] = useState(() => {
    if (initialState?.targetDate) return new Date(initialState.targetDate);
    return new Date();
  });
  const [viewMode, setViewModeState] = useState<ViewMode>(initialState?.viewMode || 'month');
  const [zoomDirection, setZoomDirection] = useState<'in' | 'out'>('in');

  const [filters, setFilters] = useState<FilterState>({ clientName: '', type: 'all' });
  const [filterRevendeurId, setFilterRevendeurId] = useState<string>(''); // '' means "All"

  // Sync if location state changes while already on this page
  useEffect(() => {
    if (location.state) {
      const state = location.state as { targetDate?: string, viewMode?: ViewMode };
      if (state.targetDate) setCurrentDate(new Date(state.targetDate));
      if (state.viewMode) setViewModeState(state.viewMode);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const setViewMode = (newMode: ViewMode) => {
    if (newMode === viewMode) return;
    setZoomDirection(viewLevels[newMode] > viewLevels[viewMode] ? 'in' : 'out');
    setViewModeState(newMode);
  };

  const handleDezoom = () => {
    if (viewMode === 'day') setViewMode('week');
    else if (viewMode === 'week') setViewMode('month');
    else if (viewMode === 'month') setViewMode('year');
  };

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(target => {
      if (!target.endDate) return false;
      const d = new Date(target.endDate);
      if (isNaN(d.getTime())) return false; // Fix Invalid Date issue

      const matchClient = target.clientName.toLowerCase().includes(filters.clientName.toLowerCase());
      const matchType = filters.type === 'all' || target.type === filters.type;

      // Filter by revendeur
      let matchRevendeur = true;
      if (filterRevendeurId !== '') {
        const entreprise = entreprises.find(e => e.id === target.entrepriseId);
        matchRevendeur = entreprise?.revendeurId === filterRevendeurId;
      }

      return matchClient && matchType && matchRevendeur;
    });
  }, [subscriptions, filters, filterRevendeurId, entreprises]);

  const handlePrev = () => {
    switch(viewMode) {
      case 'year': setCurrentDate(subYears(currentDate, 1)); break;
      case 'month': setCurrentDate(subMonths(currentDate, 1)); break;
      case 'week': setCurrentDate(subWeeks(currentDate, 1)); break;
      case 'day': setCurrentDate(subDays(currentDate, 1)); break;
    }
  };

  const handleNext = () => {
    switch(viewMode) {
      case 'year': setCurrentDate(addYears(currentDate, 1)); break;
      case 'month': setCurrentDate(addMonths(currentDate, 1)); break;
      case 'week': setCurrentDate(addWeeks(currentDate, 1)); break;
      case 'day': setCurrentDate(addDays(currentDate, 1)); break;
    }
  };

  const viewVariants = {
    initial: (direction: 'in' | 'out') => ({
      opacity: 0,
      scale: direction === 'in' ? 0.95 : 1.05,
      filter: 'blur(4px)'
    }),
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)'
    },
    exit: (direction: 'in' | 'out') => ({
      opacity: 0,
      scale: direction === 'in' ? 1.05 : 0.95,
      filter: 'blur(4px)'
    }),
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center gap-4 bg-surface p-3 rounded-2xl border border-border">
        <div className="flex flex-col md:flex-row md:flex-wrap md:items-center justify-between w-full h-full gap-4">
           {/* Date navigation */}
           <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 shrink-0">
             <button onClick={handlePrev} className="p-2 hover:bg-surface-active rounded-md transition-colors text-text-muted hover:text-text-primary">
               <ChevronLeft className="w-4 h-4" />
             </button>
             <div className="min-w-[110px] sm:w-40 text-center text-sm sm:text-base font-medium capitalize text-text-secondary truncate px-1">
               {viewMode === 'year' && format(currentDate, "yyyy")}
               {viewMode === 'month' && format(currentDate, "MMMM yyyy", { locale: fr })}
               {viewMode === 'week' && `Semaine ${format(currentDate, "w", { locale: fr })}`}
               {viewMode === 'day' && format(currentDate, "dd MMMM yyyy", { locale: fr })}
             </div>
             <button onClick={handleNext} className="p-2 hover:bg-surface-active rounded-md transition-colors text-text-muted hover:text-text-primary">
               <ChevronRight className="w-4 h-4" />
             </button>
             <button
               onClick={() => setCurrentDate(new Date())}
               className="px-2 sm:px-3 py-1.5 text-xs font-semibold bg-surface-hover hover:bg-surface-active text-text-muted rounded-md transition-colors border border-border mx-1 whitespace-nowrap shrink-0"
             >
                Aujourd'hui
             </button>
           </div>

           {/* Filters */}
           <div className="flex flex-1 gap-2 w-full md:max-w-2xl">
             <div className="relative flex-1">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
               <input
                 type="text"
                 placeholder="Chercher une entreprise..."
                 className="w-full bg-black/40 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-text-primary placeholder:text-slate-600 transition-all"
                 value={filters.clientName}
                 onChange={e => setFilters(f => ({ ...f, clientName: e.target.value }))}
               />
             </div>
             <select
               className="bg-black/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-text-muted transition-all appearance-none outline-none shrink-0"
               value={filters.type}
               onChange={e => setFilters(f => ({ ...f, type: e.target.value as any }))}
             >
               <option value="all">Tous types</option>
               <option value="licence">Licence</option>
               <option value="licence_puce">Puce orange</option>
             </select>
             <select
               className="bg-black/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-text-muted transition-all appearance-none outline-none shrink-0"
               value={filterRevendeurId}
               onChange={e => setFilterRevendeurId(e.target.value)}
             >
               <option value="">Tous revendeurs</option>
               {revendeurs.map(r => (
                 <option key={r.id} value={r.id}>{r.name}</option>
               ))}
             </select>
           </div>

           {/* View Modes */}
           <div className="flex items-center gap-2">
             <AnimatePresence>
               {viewMode !== 'year' && (
                 <motion.button
                   initial={{ opacity: 0, width: 0, x: 20 }}
                   animate={{ opacity: 1, width: 'auto', x: 0 }}
                   exit={{ opacity: 0, width: 0, x: 20 }}
                   onClick={handleDezoom}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-text-muted bg-surface-hover border border-border-strong hover:bg-surface-active hover:text-text-primary transition-colors mr-1 shrink-0"
                 >
                   <ArrowLeft className="w-3 h-3" />
                   Retour
                 </motion.button>
               )}
             </AnimatePresence>

             {/* Mobile view selector */}
             <select
               className="md:hidden bg-black/40 border border-border rounded-lg px-3 py-2 text-xs font-medium capitalize text-text-primary focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none shrink-0"
               value={viewMode}
               onChange={e => setViewMode(e.target.value as ViewMode)}
             >
               <option value="year">Année</option>
               <option value="month">Mois</option>
               <option value="week">Semaine</option>
               <option value="day">Jour</option>
             </select>

             <div className="hidden md:flex items-center gap-2 bg-black/40 rounded-full p-1 border border-border shrink-0">
               {(['year', 'month', 'week', 'day'] as ViewMode[]).map(mode => (
                 <button
                   key={mode}
                   onClick={() => setViewMode(mode)}
                   className={cn(
                     "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all",
                     viewMode === mode
                       ? "bg-surface-active text-text-primary shadow-sm"
                       : "text-text-muted hover:text-text-primary"
                   )}
                 >
                   {mode === 'year' ? 'Année' : mode === 'month' ? 'Mois' : mode === 'week' ? 'Semaine' : 'Jour'}
                 </button>
               ))}
             </div>
           </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border-strong shadow-xl overflow-hidden min-h-[600px] flex flex-col relative w-full">
        <div className="flex-1 w-full p-4 md:p-6">
          <AnimatePresence mode="wait" custom={zoomDirection}>
            <motion.div
              key={viewMode + currentDate.toISOString()}
              custom={zoomDirection}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full"
            >
              {viewMode === 'year' && (
                <YearView 
                  currentDate={currentDate} 
                  subscriptions={filteredSubscriptions} 
                  onSelectMonth={(date) => {
                    setCurrentDate(date);
                    setViewMode('month');
                  }}
                  onSelectDay={(date) => {
                    setCurrentDate(date);
                    setViewMode('day');
                  }}
                />
              )}
              {viewMode === 'month' && (
                <MonthView 
                  currentDate={currentDate} 
                  subscriptions={filteredSubscriptions} 
                  onSelectDay={(date) => {
                    setCurrentDate(date);
                    setViewMode('day');
                  }}
                  onSelectWeek={(date) => {
                    setCurrentDate(date);
                    setViewMode('week');
                  }}
                />
              )}
              {viewMode === 'week' && (
                <WeekView 
                  currentDate={currentDate} 
                  subscriptions={filteredSubscriptions} 
                  onSelectDay={(date) => {
                    setCurrentDate(date);
                    setViewMode('day');
                  }}
                />
              )}
              {viewMode === 'day' && (
                <DayView 
                  currentDate={currentDate} 
                  subscriptions={filteredSubscriptions} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
