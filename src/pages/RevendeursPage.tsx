import React, { useState } from 'react';
import { useRevendeurs } from '../hooks/useRevendeurs';
import { Revendeur } from '../types';
import { Users, Plus, Edit2, Trash2, Search, Mail, Phone } from 'lucide-react';
import { cn } from '../lib/utils';

export default function RevendeursPage() {
  const { revendeurs, addRevendeur, updateRevendeur, deleteRevendeur } = useRevendeurs();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<Revendeur | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [revendeurToDelete, setRevendeurToDelete] = useState<string | null>(null);

  const filteredRevendeurs = revendeurs.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.phone && r.phone.includes(searchTerm))
  );

  const openAddModal = () => {
    setEditMode(null);
    setFormData({ name: '', email: '', phone: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (revendeur: Revendeur) => {
    setEditMode(revendeur);
    setFormData({
      name: revendeur.name,
      email: revendeur.email || '',
      phone: revendeur.phone || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editMode) {
        await updateRevendeur(editMode.id, formData.name, formData.email, formData.phone);
      } else {
        await addRevendeur(formData.name, formData.email, formData.phone);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving revendeur:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(null);
    setFormData({ name: '', email: '', phone: '' });
  };

  const confirmDelete = (id: string) => {
    setRevendeurToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (revendeurToDelete) {
      await deleteRevendeur(revendeurToDelete);
      setIsDeleteModalOpen(false);
      setRevendeurToDelete(null);
    }
  };

  return (
    <div className="editorial-bg">
      {/* Hero Header */}
      <div className="animate-slide-up mb-8">
        <h1 className="editorial-heading text-5xl md:text-6xl text-text-primary mb-3">
          Revendeurs
        </h1>
        <p className="text-text-secondary text-lg font-light">
          Gérez vos revendeurs et leurs informations
        </p>
      </div>

      {/* Main Content */}
      <div className="editorial-card rounded-xl p-4 sm:p-8 animate-slide-up delay-100">
        {/* Header with search and add button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
          <div>
            <h2 className="editorial-heading text-2xl text-text-primary">
              Liste des revendeurs
            </h2>
            <p className="text-xs text-text-muted font-mono mt-1">{filteredRevendeurs.length} revendeur(s)</p>
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

        {/* Revendeurs Grid */}
        {filteredRevendeurs.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-surface-hover border-2 border-border flex items-center justify-center">
              <Users className="w-10 h-10 text-text-muted opacity-30" />
            </div>
            <div>
              <p className="text-lg text-text-secondary font-serif">Aucun revendeur trouvé</p>
              <p className="text-sm text-text-muted mt-1">Commencez par ajouter un revendeur</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRevendeurs.map((revendeur, idx) => (
              <div
                key={revendeur.id}
                className="paper-texture border border-border rounded-lg p-5 hover:shadow-editorial-md hover:border-border-strong transition-editorial group animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-[var(--accent-secondary)] flex items-center justify-center shadow-editorial-sm">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-text-primary text-lg leading-tight truncate">
                        {revendeur.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-editorial">
                    <button
                      onClick={() => openEditModal(revendeur)}
                      className="p-2 text-text-muted hover:text-[var(--accent-primary)] hover:bg-surface-hover rounded-lg transition-editorial"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4"/>
                    </button>
                    <button
                      onClick={() => confirmDelete(revendeur.id)}
                      className="p-2 text-text-muted hover:text-red-500 hover:bg-surface-hover rounded-lg transition-editorial"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 pt-3 border-t border-border">
                  {revendeur.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <span className="text-text-secondary font-mono text-xs truncate">{revendeur.email}</span>
                    </div>
                  )}
                  {revendeur.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <span className="text-text-secondary font-mono text-xs">{revendeur.phone}</span>
                    </div>
                  )}
                  {!revendeur.email && !revendeur.phone && (
                    <p className="text-xs text-text-muted italic">Aucune information de contact</p>
                  )}
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
            <h3 className="editorial-heading text-2xl text-text-primary mb-6">
              {editMode ? 'Modifier le revendeur' : 'Nouveau revendeur'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                  Nom du revendeur *
                </label>
                <input
                  autoFocus
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && formData.name.trim() && handleSave()}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                  placeholder="Ex: Distributeur XYZ"
                />
              </div>

              <div>
                <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                  placeholder="contact@revendeur.com"
                />
              </div>

              <div>
                <label className="block text-xs text-text-muted font-mono uppercase tracking-wider mb-2">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-background border-2 border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-[var(--accent-primary)] transition-editorial font-mono"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
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
                disabled={!formData.name.trim()}
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
              <h3 className="editorial-heading text-xl text-text-primary">Supprimer le revendeur</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-6 pl-16">
              Êtes-vous sûr de vouloir supprimer ce revendeur ? Les entreprises associées ne seront plus liées à ce revendeur. <span className="font-semibold text-red-500">Cette action est irréversible.</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setRevendeurToDelete(null); }}
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
