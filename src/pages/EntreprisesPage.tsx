import React, { useState, useMemo, useRef } from 'react';
import { useEntreprises } from '../hooks/useEntreprises';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useRevendeurs } from '../hooks/useRevendeurs';
import { usePucePlans } from '../hooks/usePucePlans';
import { Entreprise, Subscription, SubscriptionType } from '../types';
import { Building2, Plus, Edit2, Trash2, Search, Calendar as CalendarIcon, Package, AlertCircle, RefreshCw, Upload, FileText, Download, Phone, X } from 'lucide-react';
import { addMonths, addYears, format, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn, getNextOccurrence } from '../lib/utils';
import { getAuthToken } from '../auth';

export default function EntreprisesPage() {
  const { entreprises, addEntreprise, updateEntreprise, deleteEntreprise } = useEntreprises();
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, renewSubscription } = useSubscriptions();
  const { revendeurs } = useRevendeurs();
  const { pucePlans } = usePucePlans();
  
  const [selectedEntId, setSelectedEntId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRevendeurId, setFilterRevendeurId] = useState<string>(''); // '' means "All"

  const [isEntModalOpen, setIsEntModalOpen] = useState(false);
  const [entEditMode, setEntEditMode] = useState<{ id: string, name: string, revendeurId?: string, email?: string, phone?: string, matriculeFiscale?: string, rne?: string } | null>(null);
  const [entName, setEntName] = useState('');
  const [entRevendeurId, setEntRevendeurId] = useState<string>('');
  const [entEmail, setEntEmail] = useState('');
  const [entPhone, setEntPhone] = useState('');
  const [entMatriculeFiscale, setEntMatriculeFiscale] = useState('');
  const [entRne, setEntRne] = useState('');

  const [isDeleteEntModalOpen, setIsDeleteEntModalOpen] = useState(false);
  const [entToDelete, setEntToDelete] = useState<string | null>(null);

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subEditMode, setSubEditMode] = useState<Subscription | null>(null);
  const [subForm, setSubForm] = useState<{ quantity: number, type: SubscriptionType, endDate: string, plan: string, phoneNumbers: string[] }>({
    quantity: 1,
    type: 'licence',
    endDate: format(new Date(), 'yyyy-MM-dd'),
    plan: '',
    phoneNumbers: []
  });
  const [subFormError, setSubFormError] = useState('');

  const [isDeleteSubModalOpen, setIsDeleteSubModalOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState<string | null>(null);

  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [subToRenew, setSubToRenew] = useState<Subscription | null>(null);
  const [renewYears, setRenewYears] = useState(1);
  const [renewMonths, setRenewMonths] = useState(0);
  const [renewQuantity, setRenewQuantity] = useState(1);

  const rneFileInputRef = useRef<HTMLInputElement>(null);
  const patenteFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingRne, setUploadingRne] = useState(false);
  const [uploadingPatente, setUploadingPatente] = useState(false);
  const detailPanelRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'abonnements' | 'rne' | 'patente'>('abonnements');

  const selectEntreprise = (id: string) => {
    setSelectedEntId(id);
    setActiveTab('abonnements'); // Reset to abonnements tab when selecting new company
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }
  };

  const selectedEntreprise = useMemo(() => entreprises.find(e => e.id === selectedEntId), [entreprises, selectedEntId]);
  
  const selectedEntSubscriptions = useMemo(() => {
    if (!selectedEntId) return [];
    return subscriptions.filter(s => s.entrepriseId === selectedEntId);
  }, [subscriptions, selectedEntId]);

  const filteredEntreprises = useMemo(() => {
    return entreprises.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRevendeur = filterRevendeurId === '' || e.revendeurId === filterRevendeurId;
      return matchesSearch && matchesRevendeur;
    });
  }, [entreprises, searchTerm, filterRevendeurId]);

  const handleSaveEnt = async () => {
    if (!entName.trim()) return;
    const revendeurIdValue = entRevendeurId === '' ? null : entRevendeurId;
    if (entEditMode) {
      await updateEntreprise(entEditMode.id, entName, revendeurIdValue, entEmail, entPhone, entMatriculeFiscale, entRne);
    } else {
      await addEntreprise(entName, revendeurIdValue, entEmail, entPhone, entMatriculeFiscale, entRne);
    }
    closeEntModal();
  };

  const closeEntModal = () => {
    setIsEntModalOpen(false);
    setEntEditMode(null);
    setEntName('');
    setEntRevendeurId('');
    setEntEmail('');
    setEntPhone('');
    setEntMatriculeFiscale('');
    setEntRne('');
  };

  const openAddEnt = () => {
    setEntEditMode(null);
    setEntName('');
    setEntRevendeurId('');
    setEntEmail('');
    setEntPhone('');
    setEntMatriculeFiscale('');
    setEntRne('');
    setIsEntModalOpen(true);
  };

  const openEditEnt = (ent: Entreprise, e: React.MouseEvent) => {
    e.stopPropagation();
    setEntEditMode({
      id: ent.id,
      name: ent.name,
      revendeurId: ent.revendeurId,
      email: ent.email,
      phone: ent.phone,
      matriculeFiscale: ent.matriculeFiscale,
      rne: ent.rne
    });
    setEntName(ent.name);
    setEntRevendeurId(ent.revendeurId || '');
    setEntEmail(ent.email || '');
    setEntPhone(ent.phone || '');
    setEntMatriculeFiscale(ent.matriculeFiscale || '');
    setEntRne(ent.rne || '');
    setIsEntModalOpen(true);
  };

  const confirmDeleteEnt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEntToDelete(id);
    setIsDeleteEntModalOpen(true);
  };

  const executeDeleteEnt = async () => {
    if (entToDelete) {
      await deleteEntreprise(entToDelete);
      if (selectedEntId === entToDelete) setSelectedEntId(null);
      setIsDeleteEntModalOpen(false);
      setEntToDelete(null);
    }
  };

  const handleSaveSub = async () => {
    if (!selectedEntreprise) return;

    const isPuce = subForm.type === 'licence_puce';
    const cleanedNumbers = isPuce ? subForm.phoneNumbers.map(n => n.trim()).filter(Boolean) : [];
    if (isPuce) {
      if (!subForm.plan) {
        setSubFormError('Le forfait est requis pour une puce');
        return;
      }
      if (cleanedNumbers.length > subForm.quantity) {
        setSubFormError('Le nombre de numéros dépasse la quantité');
        return;
      }
    }
    const plan = isPuce ? subForm.plan : null;

    try {
      if (subEditMode) {
        await updateSubscription(subEditMode.id, {
          quantity: subForm.quantity,
          type: subForm.type,
          endDate: subForm.endDate,
          plan,
          phoneNumbers: cleanedNumbers
        });
      } else {
        await addSubscription(selectedEntreprise.id, selectedEntreprise.name, subForm.quantity, subForm.type, subForm.endDate, plan, cleanedNumbers);
      }
      closeSubModal();
    } catch (error: any) {
      setSubFormError(error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const closeSubModal = () => {
    setIsSubModalOpen(false);
    setSubEditMode(null);
    setSubFormError('');
    setSubForm({
      quantity: 1,
      type: 'licence',
      endDate: format(new Date(), 'yyyy-MM-dd'),
      plan: '',
      phoneNumbers: []
    });
  };

  const openAddSub = () => {
    setSubEditMode(null);
    setSubFormError('');
    setSubForm({
      quantity: 1,
      type: 'licence',
      endDate: format(new Date(), 'yyyy-MM-dd'),
      plan: '',
      phoneNumbers: []
    });
    setIsSubModalOpen(true);
  };

  const openEditSub = (sub: Subscription) => {
    setSubEditMode(sub);
    setSubFormError('');
    setSubForm({
      quantity: sub.quantity,
      type: sub.type,
      endDate: sub.endDate,
      plan: sub.plan ?? '',
      phoneNumbers: sub.phoneNumbers ?? []
    });
    setIsSubModalOpen(true);
  };

  const confirmDeleteSub = (id: string) => {
    setSubToDelete(id);
    setIsDeleteSubModalOpen(true);
  };

  const executeDeleteSub = async () => {
    if (subToDelete) {
      await deleteSubscription(subToDelete);
      setIsDeleteSubModalOpen(false);
      setSubToDelete(null);
    }
  };

  const openRenewModal = (sub: Subscription) => {
    setSubToRenew(sub);
    setRenewYears(1);
    setRenewMonths(0);
    setRenewQuantity(sub.quantity); // Initialize with current quantity
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

  const handleRneUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedEntreprise || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    if (file.type !== 'application/pdf') {
      alert('Veuillez sélectionner un fichier PDF');
      return;
    }

    setUploadingRne(true);
    const formData = new FormData();
    formData.append('rne', file);

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/entreprises/${selectedEntreprise.id}/upload-rne`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      // Refresh entreprises list
      window.location.reload();
    } catch (error) {
      console.error('Error uploading RNE PDF:', error);
      alert('Erreur lors du téléchargement du fichier');
    } finally {
      setUploadingRne(false);
      if (rneFileInputRef.current) rneFileInputRef.current.value = '';
    }
  };

  const handlePatenteUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedEntreprise || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    if (file.type !== 'application/pdf') {
      alert('Veuillez sélectionner un fichier PDF');
      return;
    }

    setUploadingPatente(true);
    const formData = new FormData();
    formData.append('patente', file);

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/entreprises/${selectedEntreprise.id}/upload-patente`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      // Refresh entreprises list
      window.location.reload();
    } catch (error) {
      console.error('Error uploading Patente PDF:', error);
      alert('Erreur lors du téléchargement du fichier');
    } finally {
      setUploadingPatente(false);
      if (patenteFileInputRef.current) patenteFileInputRef.current.value = '';
    }
  };

  return (
    <div className="editorial-bg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Companies List Panel - Editorial Card */}
      <div className="lg:col-span-1 editorial-card rounded-xl p-4 md:p-6 flex flex-col h-[60vh] min-h-[400px] lg:h-[calc(100vh-64px)] animate-slide-up delay-100">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div>
            <h2 className="editorial-heading text-xl text-text-primary flex items-center gap-3">
              <Building2 className="w-5 h-5 text-[var(--accent-primary)]" />
              Entreprises
            </h2>
            <p className="text-xs text-text-muted font-mono mt-1">{filteredEntreprises.length} total</p>
          </div>
          <button
            onClick={openAddEnt}
            className="p-2 bg-[var(--accent-primary)] text-white hover:shadow-editorial-md rounded-lg transition-editorial"
            title="Ajouter une entreprise"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input - Editorial Style */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full bg-background border-2 border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-primary)] text-text-primary placeholder:text-text-muted transition-editorial font-mono"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Revendeur Filter */}
        <div className="mb-4">
          <select
            value={filterRevendeurId}
            onChange={e => setFilterRevendeurId(e.target.value)}
            className="w-full bg-background border-2 border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-primary)] text-text-primary transition-editorial font-mono"
          >
            <option value="">Tous les revendeurs</option>
            {revendeurs.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Companies List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredEntreprises.length === 0 ? (
             <div className="text-center text-sm text-text-muted py-12 flex flex-col items-center">
               <Building2 className="w-10 h-10 mb-3 opacity-20" />
               <p>Aucune entreprise trouvée</p>
             </div>
          ) : (
            filteredEntreprises.map((ent, idx) => (
              <div
                key={ent.id}
                onClick={() => selectEntreprise(ent.id)}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-editorial flex items-center justify-between group animate-fade-in",
                  selectedEntId === ent.id
                    ? 'bg-[var(--accent-primary)] bg-opacity-10 border-[var(--accent-primary)] shadow-editorial-sm'
                    : 'paper-texture border-border hover:border-border-strong hover:shadow-editorial-sm'
                )}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-3 truncate flex-1">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-editorial-sm",
                    selectedEntId === ent.id
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-surface-hover text-text-muted'
                  )}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-sm font-serif font-semibold truncate",
                    selectedEntId === ent.id ? 'text-text-primary' : 'text-text-secondary'
                  )}>
                    {ent.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-editorial">
                  <button
                    onClick={(e) => openEditEnt(ent, e)}
                    className="p-2 text-text-muted hover:text-[var(--accent-primary)] hover:bg-surface-hover rounded-md transition-editorial"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4"/>
                  </button>
                  <button
                    onClick={(e) => confirmDeleteEnt(ent.id, e)}
                    className="p-2 text-text-muted hover:text-red-500 hover:bg-surface-hover rounded-md transition-editorial"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selected Company Details Panel - Editorial Card */}
      <div ref={detailPanelRef} className="md:col-span-2 editorial-card rounded-xl p-4 sm:p-8 h-[calc(100vh-64px)] flex flex-col animate-slide-up delay-200 overflow-hidden scroll-mt-4">
        {!selectedEntreprise ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-surface-hover border-2 border-border flex items-center justify-center">
              <Building2 className="w-10 h-10 text-text-muted opacity-30" />
            </div>
            <div>
              <p className="text-lg text-text-secondary font-serif">Sélectionnez une entreprise</p>
              <p className="text-sm text-text-muted mt-1">pour voir ses abonnements</p>
            </div>
          </div>
        ) : (
          <>
            {/* Company Header - Compact */}
            <div className="border-b border-border pb-3 mb-3 shrink-0">
              <div className="flex items-start justify-between mb-2">
                <h1 className="editorial-heading text-xl text-text-primary">{selectedEntreprise.name}</h1>
                {activeTab === 'abonnements' && (
                  <button
                    onClick={openAddSub}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:shadow-editorial-md text-white font-mono font-semibold rounded-lg transition-editorial text-[10px] uppercase tracking-wider shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                )}
              </div>

              {/* Company Details - Compact Inline */}
              <div className="flex flex-wrap gap-x-3 md:gap-x-6 gap-y-2 text-xs text-text-muted font-mono">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>{format(new Date(selectedEntreprise.createdAt), 'dd/MM/yyyy', { locale: fr })}</span>
                </div>
                {selectedEntreprise.email && (
                  <div className="flex items-center gap-1.5">
                    <span>📧</span>
                    <span>{selectedEntreprise.email}</span>
                  </div>
                )}
                {selectedEntreprise.phone && (
                  <div className="flex items-center gap-1.5">
                    <span>📞</span>
                    <span>{selectedEntreprise.phone}</span>
                  </div>
                )}
                {selectedEntreprise.revendeurId && revendeurs.find(r => r.id === selectedEntreprise.revendeurId) && (
                  <div className="flex items-center gap-1.5">
                    <span>🤝</span>
                    <span>{revendeurs.find(r => r.id === selectedEntreprise.revendeurId)?.name}</span>
                  </div>
                )}
                {selectedEntreprise.matriculeFiscale && (
                  <div className="flex items-center gap-1.5">
                    <span>🏛️</span>
                    <span>{selectedEntreprise.matriculeFiscale}</span>
                  </div>
                )}
                {selectedEntreprise.rne && (
                  <div className="flex items-center gap-1.5">
                    <span>📋</span>
                    <span>{selectedEntreprise.rne}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 mb-4 border-b border-border shrink-0">
              <button
                onClick={() => setActiveTab('abonnements')}
                className={cn(
                  "px-4 py-2 text-sm font-mono font-semibold transition-editorial relative",
                  activeTab === 'abonnements'
                    ? 'text-[var(--accent-primary)]'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Abonnements
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-active">
                    {selectedEntSubscriptions.length}
                  </span>
                </div>
                {activeTab === 'abonnements' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('rne')}
                className={cn(
                  "px-4 py-2 text-sm font-mono font-semibold transition-editorial relative",
                  activeTab === 'rne'
                    ? 'text-[var(--accent-primary)]'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  RNE
                </div>
                {activeTab === 'rne' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('patente')}
                className={cn(
                  "px-4 py-2 text-sm font-mono font-semibold transition-editorial relative",
                  activeTab === 'patente'
                    ? 'text-[var(--accent-primary)]'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Patente
                </div>
                {activeTab === 'patente' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"></div>
                )}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'abonnements' && (
              <>
                {/* Subscription Statistics - Inline Compact */}
                {selectedEntSubscriptions.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3 shrink-0">
                    <div className="flex-1 paper-texture border border-border rounded-lg px-2 py-1.5 text-center">
                      <p className="text-[9px] text-text-muted font-mono uppercase tracking-wider mb-0.5">Total</p>
                      <p className="text-lg font-bold text-text-primary">{selectedEntSubscriptions.length}</p>
                    </div>
                    <div className="flex-1 paper-texture border border-border rounded-lg px-2 py-1.5 text-center">
                      <p className="text-[9px] text-text-muted font-mono uppercase tracking-wider mb-0.5">Licences</p>
                      <p className="text-lg font-bold text-blue-400">
                        {selectedEntSubscriptions.filter(s => s.type === 'licence').reduce((acc, s) => acc + s.quantity, 0)}
                      </p>
                    </div>
                    <div className="flex-1 paper-texture border border-border rounded-lg px-2 py-1.5 text-center">
                      <p className="text-[9px] text-text-muted font-mono uppercase tracking-wider mb-0.5">Puces</p>
                      <p className="text-lg font-bold text-orange-400">
                        {selectedEntSubscriptions.filter(s => s.type === 'licence_puce').reduce((acc, s) => acc + s.quantity, 0)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Subscriptions List */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                   {selectedEntSubscriptions.length === 0 ? (
                     <div className="text-center py-16 flex flex-col items-center gap-4">
                       <div className="w-16 h-16 rounded-full bg-surface-hover border-2 border-border flex items-center justify-center">
                         <AlertCircle className="w-8 h-8 text-text-muted opacity-30" />
                       </div>
                       <p className="text-sm text-text-muted font-light">Aucun abonnement actif</p>
                     </div>
                   ) : (
                     selectedEntSubscriptions.map((sub, idx) => (
                       <div
                         key={sub.id}
                         className="paper-texture border border-border rounded-lg p-3 flex items-center justify-between hover:shadow-editorial-md hover:border-border-strong transition-editorial group animate-fade-in"
                         style={{ animationDelay: `${idx * 0.05}s` }}
                       >
                         <div className="flex items-center gap-3 flex-1">
                           <div className={cn(
                             "w-10 h-10 rounded-lg flex items-center justify-center shadow-editorial-sm shrink-0",
                             sub.type === 'licence'
                               ? 'bg-[var(--accent-secondary)]'
                               : 'bg-[var(--accent-primary)]'
                           )}>
                             <Package className="w-5 h-5 text-white" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="font-serif font-semibold text-text-primary text-sm">
                                  {sub.type === 'licence' ? 'Licence' : 'Puce Orange'}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold font-mono uppercase tracking-widest bg-surface-active text-text-muted">
                                  Qté: {sub.quantity}
                                </span>
                                {sub.type === 'licence_puce' && sub.plan && (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold font-mono uppercase tracking-widest bg-surface-active text-[var(--accent-primary)]">
                                    {sub.plan}
                                  </span>
                                )}
                             </div>
                             <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-mono">
                               <CalendarIcon className="w-3 h-3" />
                               {format(getNextOccurrence(sub), 'dd/MM/yyyy', { locale: fr })}
                             </div>
                             {sub.type === 'licence_puce' && (sub.phoneNumbers?.length ?? 0) > 0 && (
                               <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-mono mt-1">
                                 <Phone className="w-3 h-3 shrink-0" />
                                 <span>{sub.phoneNumbers!.length}/{sub.quantity} numéros</span>
                               </div>
                             )}
                           </div>
                         </div>
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-editorial shrink-0">
                            <button
                              onClick={() => openRenewModal(sub)}
                              className="p-1.5 text-text-muted hover:text-green-600 hover:bg-surface-hover rounded-md transition-editorial"
                              title="Renouveler"
                            >
                              <RefreshCw className="w-4 h-4"/>
                            </button>
                            <button
                              onClick={() => openEditSub(sub)}
                              className="p-1.5 text-text-muted hover:text-[var(--accent-primary)] hover:bg-surface-hover rounded-md transition-editorial"
                              title="Modifier"
                            >
                              <Edit2 className="w-4 h-4"/>
                            </button>
                            <button
                              onClick={() => confirmDeleteSub(sub.id)}
                              className="p-1.5 text-text-muted hover:text-red-500 hover:bg-surface-hover rounded-md transition-editorial"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4"/>
                            </button>
                         </div>
                       </div>
                     ))
                   )}
                </div>
              </>
            )}

            {activeTab === 'rne' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="text-sm font-serif font-semibold text-text-primary">Document RNE</h3>
                  <div className="flex gap-2">
                    <input
                      ref={rneFileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleRneUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => rneFileInputRef.current?.click()}
                      disabled={uploadingRne}
                      className="flex items-center gap-2 px-3 py-1.5 bg-surface-hover hover:bg-surface-active border border-border rounded-lg text-xs font-mono transition-editorial disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingRne ? 'Upload en cours...' : (selectedEntreprise.rnePdfPath ? 'Changer le PDF' : 'Upload PDF')}
                    </button>
                    {selectedEntreprise.rnePdfPath && (
                      <a
                        href={selectedEntreprise.rnePdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-primary)] hover:shadow-editorial-md text-white rounded-lg text-xs font-mono transition-editorial"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </a>
                    )}
                  </div>
                </div>
                {selectedEntreprise.rnePdfPath ? (
                  <div className="flex-1 border-2 border-border rounded-lg overflow-hidden bg-background">
                    <iframe
                      src={selectedEntreprise.rnePdfPath}
                      className="w-full h-full"
                      title="RNE PDF"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-lg">
                    <FileText className="w-16 h-16 text-text-muted opacity-30 mb-4" />
                    <p className="text-text-secondary font-serif mb-2">Aucun document RNE</p>
                    <p className="text-sm text-text-muted">Cliquez sur "Upload PDF" pour ajouter un document</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'patente' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="text-sm font-serif font-semibold text-text-primary">Document Patente</h3>
                  <div className="flex gap-2">
                    <input
                      ref={patenteFileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handlePatenteUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => patenteFileInputRef.current?.click()}
                      disabled={uploadingPatente}
                      className="flex items-center gap-2 px-3 py-1.5 bg-surface-hover hover:bg-surface-active border border-border rounded-lg text-xs font-mono transition-editorial disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingPatente ? 'Upload en cours...' : (selectedEntreprise.patentePdfPath ? 'Changer le PDF' : 'Upload PDF')}
                    </button>
                    {selectedEntreprise.patentePdfPath && (
                      <a
                        href={selectedEntreprise.patentePdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-primary)] hover:shadow-editorial-md text-white rounded-lg text-xs font-mono transition-editorial"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </a>
                    )}
                  </div>
                </div>
                {selectedEntreprise.patentePdfPath ? (
                  <div className="flex-1 border-2 border-border rounded-lg overflow-hidden bg-background">
                    <iframe
                      src={selectedEntreprise.patentePdfPath}
                      className="w-full h-full"
                      title="Patente PDF"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-lg">
                    <FileText className="w-16 h-16 text-text-muted opacity-30 mb-4" />
                    <p className="text-text-secondary font-serif mb-2">Aucun document Patente</p>
                    <p className="text-sm text-text-muted">Cliquez sur "Upload PDF" pour ajouter un document</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>

      {/* Entreprise Modal - Editorial Style */}
      {isEntModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="editorial-card rounded-xl w-full max-w-2xl p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
            <h3 className="editorial-heading text-2xl text-text-primary mb-6">
              {entEditMode ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  autoFocus
                  type="text"
                  value={entName}
                  onChange={e => setEntName(e.target.value)}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                  placeholder="Ex: ACME Corp"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    value={entEmail}
                    onChange={e => setEntEmail(e.target.value)}
                    className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                    placeholder="contact@entreprise.com"
                  />
                </div>

                <div>
                  <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    value={entPhone}
                    onChange={e => setEntPhone(e.target.value)}
                    className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                    Matricule fiscale (optionnel)
                  </label>
                  <input
                    type="text"
                    value={entMatriculeFiscale}
                    onChange={e => setEntMatriculeFiscale(e.target.value)}
                    className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                    placeholder="Ex: 1234567A"
                  />
                </div>

                <div>
                  <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                    RNE (optionnel)
                  </label>
                  <input
                    type="text"
                    value={entRne}
                    onChange={e => setEntRne(e.target.value)}
                    className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                    placeholder="Ex: B1234567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                  Revendeur (optionnel)
                </label>
                <select
                  value={entRevendeurId}
                  onChange={e => setEntRevendeurId(e.target.value)}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                >
                  <option value="">Aucun revendeur</option>
                  {revendeurs.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-8">
              <button
                onClick={closeEntModal}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary hover:bg-surface-hover transition-editorial"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEnt}
                disabled={!entName.trim()}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white hover:shadow-editorial-md transition-editorial disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal - Editorial Style */}
      {isSubModalOpen && selectedEntreprise && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="editorial-card rounded-xl w-full max-w-md p-8 animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="editorial-heading text-2xl text-text-primary mb-2">
              {subEditMode ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}
            </h3>
            <p className="text-sm text-text-muted mb-6 font-mono">
              Pour <span className="font-semibold text-[var(--accent-primary)]">{selectedEntreprise.name}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                  Type d'abonnement
                </label>
                <select
                  value={subForm.type}
                  onChange={e => setSubForm(f => ({ ...f, type: e.target.value as SubscriptionType }))}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                >
                  <option value="licence">Licence</option>
                  <option value="licence_puce">Puce orange</option>
                </select>
              </div>

              {subForm.type === 'licence_puce' && (
                <div>
                  <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                    Forfait *
                  </label>
                  <select
                    value={subForm.plan}
                    onChange={e => setSubForm(f => ({ ...f, plan: e.target.value }))}
                    className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                  >
                    <option value="" disabled>Sélectionner un forfait…</option>
                    {subForm.plan && !pucePlans.some(p => p.name === subForm.plan) && (
                      <option value={subForm.plan}>{subForm.plan} (supprimé de la liste)</option>
                    )}
                    {pucePlans.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                  Quantité
                </label>
                <input
                  type="number"
                  min="1"
                  value={subForm.quantity}
                  onChange={e => setSubForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                />
              </div>

              {subForm.type === 'licence_puce' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs text-text-muted font-mono uppercase tracking-wider">
                      Numéros de téléphone
                    </label>
                    <span className={cn(
                      "text-xs font-mono",
                      subForm.phoneNumbers.length > subForm.quantity ? "text-red-400 font-bold" : "text-text-muted"
                    )}>
                      {subForm.phoneNumbers.length}/{subForm.quantity}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                    {subForm.phoneNumbers.map((num, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="tel"
                          value={num}
                          autoFocus={idx === subForm.phoneNumbers.length - 1 && num === ''}
                          onChange={e => setSubForm(f => ({
                            ...f,
                            phoneNumbers: f.phoneNumbers.map((n, i) => i === idx ? e.target.value : n)
                          }))}
                          placeholder="Ex: 21 234 567"
                          className="flex-1 bg-background border-2 border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setSubForm(f => ({
                            ...f,
                            phoneNumbers: f.phoneNumbers.filter((_, i) => i !== idx)
                          }))}
                          className="p-2 text-text-muted hover:text-red-400 hover:bg-surface-hover rounded-lg transition-editorial shrink-0"
                          title="Retirer ce numéro"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubForm(f => ({ ...f, phoneNumbers: [...f.phoneNumbers, ''] }))}
                      disabled={subForm.phoneNumbers.length >= subForm.quantity}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-lg text-xs font-mono uppercase tracking-wider text-text-muted hover:text-text-primary hover:border-border-strong transition-editorial disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter un numéro
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                  Date d'abonnement
                </label>
                <input
                  type="date"
                  value={subForm.endDate}
                  onChange={e => setSubForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                />
              </div>
            </div>

            {subFormError && (
              <p className="text-xs font-mono text-red-400 mt-4">{subFormError}</p>
            )}

            <div className="flex gap-3 justify-end mt-8">
              <button
                onClick={closeSubModal}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary hover:bg-surface-hover transition-editorial"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveSub}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white hover:shadow-editorial-md transition-editorial"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Entreprise Confirm Modal - Editorial Style */}
      {isDeleteEntModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="editorial-card rounded-xl w-full max-w-md p-8 animate-scale-in border-l-4 border-red-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="editorial-heading text-xl text-text-primary">Supprimer l'entreprise</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-6 pl-16">
              Êtes-vous sûr de vouloir supprimer cette entreprise ? Tous ses abonnements seront également supprimés. <span className="font-semibold text-red-500">Cette action est irréversible.</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setIsDeleteEntModalOpen(false); setEntToDelete(null); }}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary hover:bg-surface-hover transition-editorial"
              >
                Annuler
              </button>
              <button
                onClick={executeDeleteEnt}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white hover:shadow-editorial-md transition-editorial"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subscription Confirm Modal - Editorial Style */}
      {isDeleteSubModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="editorial-card rounded-xl w-full max-w-md p-8 animate-scale-in border-l-4 border-red-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="editorial-heading text-xl text-text-primary">Supprimer l'abonnement</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-6 pl-16">
              Êtes-vous sûr de vouloir supprimer cet abonnement ? <span className="font-semibold text-red-500">Cette action est irréversible.</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setIsDeleteSubModalOpen(false); setSubToDelete(null); }}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary hover:bg-surface-hover transition-editorial"
              >
                Annuler
              </button>
              <button
                onClick={executeDeleteSub}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white hover:shadow-editorial-md transition-editorial"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Subscription Modal - Editorial Style */}
      {isRenewModalOpen && subToRenew && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="editorial-card rounded-xl w-full max-w-md p-8 animate-scale-in border-l-4 border-green-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <RefreshCw className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="editorial-heading text-xl text-text-primary">Renouveler l'abonnement</h3>
            </div>
            <div className="mb-6 pl-16">
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
