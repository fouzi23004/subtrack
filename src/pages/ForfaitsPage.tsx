import { useState } from 'react';
import { usePucePlans } from '../hooks/usePucePlans';
import { PucePlan } from '../types';
import { Tag, Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function ForfaitsPage() {
  const { pucePlans, addPlan, updatePlan, deletePlan } = usePucePlans();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<PucePlan | null>(null);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const filteredPlans = pucePlans.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditMode(null);
    setName('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (plan: PucePlan) => {
    setEditMode(plan);
    setName(plan.name);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      if (editMode) {
        await updatePlan(editMode.id, name.trim());
      } else {
        await addPlan(name.trim());
      }
      closeModal();
    } catch (error: any) {
      setFormError(error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(null);
    setName('');
    setFormError('');
  };

  const confirmDelete = (id: string) => {
    setPlanToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (planToDelete) {
      await deletePlan(planToDelete);
      setIsDeleteModalOpen(false);
      setPlanToDelete(null);
    }
  };

  return (
    <div className="editorial-bg">
      {/* Hero Header */}
      <div className="animate-slide-up mb-8">
        <h1 className="editorial-heading text-5xl md:text-6xl text-text-primary mb-3">
          Forfaits
        </h1>
        <p className="text-text-secondary text-lg font-light">
          Gérez les forfaits disponibles pour les puces
        </p>
      </div>

      {/* Main Content */}
      <div className="editorial-card rounded-xl p-4 sm:p-8 animate-slide-up delay-100">
        {/* Header with search and add button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
          <div>
            <h2 className="editorial-heading text-2xl text-text-primary">
              Liste des forfaits
            </h2>
            <p className="text-xs text-text-muted font-mono mt-1">{filteredPlans.length} forfait(s)</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-background border-2 border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-primary)] text-text-primary placeholder:text-text-muted transition-editorial font-mono"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Add button */}
            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:shadow-editorial-md text-white font-mono font-semibold rounded-lg transition-editorial text-xs uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        {filteredPlans.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-surface-hover border-2 border-border flex items-center justify-center">
              <Tag className="w-10 h-10 text-text-muted opacity-30" />
            </div>
            <div>
              <p className="text-lg text-text-secondary font-serif">Aucun forfait trouvé</p>
              <p className="text-sm text-text-muted mt-1">Commencez par ajouter un forfait</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan, idx) => (
              <div
                key={plan.id}
                className="paper-texture border border-border rounded-lg p-5 flex items-center justify-between hover:shadow-editorial-md hover:border-border-strong transition-editorial group animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] flex items-center justify-center shadow-editorial-sm shrink-0">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-serif font-semibold text-text-primary text-lg leading-tight truncate capitalize">
                    {plan.name}
                  </h3>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-editorial shrink-0">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="p-2 text-text-muted hover:text-[var(--accent-primary)] hover:bg-surface-hover rounded-lg transition-editorial"
                    title="Renommer"
                  >
                    <Edit2 className="w-4 h-4"/>
                  </button>
                  <button
                    onClick={() => confirmDelete(plan.id)}
                    className="p-2 text-text-muted hover:text-red-500 hover:bg-surface-hover rounded-lg transition-editorial"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="editorial-card rounded-xl w-full max-w-md p-8 animate-scale-in">
            <h3 className="editorial-heading text-2xl text-text-primary mb-2">
              {editMode ? 'Renommer le forfait' : 'Nouveau forfait'}
            </h3>
            {editMode && (
              <p className="text-xs text-text-muted mb-4 font-mono">
                Les abonnements utilisant ce forfait seront mis à jour avec le nouveau nom.
              </p>
            )}

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                  Nom du forfait *
                </label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && name.trim() && handleSave()}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                  placeholder="Ex: gold"
                />
              </div>

              {formError && (
                <p className="text-xs font-mono text-red-400">{formError}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-8">
              <button
                onClick={closeModal}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary hover:bg-surface-hover transition-editorial"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white hover:shadow-editorial-md transition-editorial disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="editorial-card rounded-xl w-full max-w-md p-8 animate-scale-in border-l-4 border-red-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="editorial-heading text-xl text-text-primary">Supprimer le forfait</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-6 pl-16">
              Êtes-vous sûr de vouloir supprimer ce forfait ? Il ne sera plus proposé pour les nouveaux abonnements ; les abonnements existants conservent leur forfait actuel. <span className="font-semibold text-red-500">Cette action est irréversible.</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setPlanToDelete(null); }}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary hover:bg-surface-hover transition-editorial"
              >
                Annuler
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white hover:shadow-editorial-md transition-editorial"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
