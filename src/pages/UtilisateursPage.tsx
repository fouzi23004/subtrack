import React, { useState, useEffect } from 'react';
import { User as UserIcon, Plus, Trash2, Shield, ShieldOff, Mail, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { getCurrentUser } from '../auth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdminUser {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<'user' | 'admin'>('user');
  const [createError, setCreateError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const currentUser = getCurrentUser();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!createEmail.trim() || !createPassword.trim()) {
      setCreateError('Email et mot de passe requis');
      return;
    }

    if (createPassword.length < 6) {
      setCreateError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await api.createUser(createEmail, createPassword, createRole);
      setIsCreateModalOpen(false);
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('user');
      setCreateError(null);
      fetchUsers();
    } catch (err: any) {
      setCreateError(err.message || 'Erreur lors de la création');
    }
  };

  const handleToggleRole = async (user: AdminUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'promouvoir' : 'rétrograder';

    if (!confirm(`Voulez-vous vraiment ${action} cet utilisateur ?`)) {
      return;
    }

    try {
      await api.changeUserRole(user.id, newRole);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Erreur lors du changement de rôle');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await api.deleteUser(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const openDeleteModal = (user: AdminUser) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <div className="editorial-bg min-h-screen flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="w-16 h-16 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-sm uppercase tracking-wider text-[var(--text-muted)]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editorial-bg min-h-screen">
      {/* Editorial Hero Header */}
      <div className="mb-12 animate-slide-up">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-editorial-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--accent-primary)]">Administration</div>
            </div>
            <h1 className="editorial-heading text-5xl md:text-6xl text-[var(--text-primary)] mb-4 leading-tight">
              Gestion des<br />Utilisateurs
            </h1>
            <div className="flex items-center gap-4 text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <UserIcon size={16} />
                <span className="font-mono text-sm">{users.length} utilisateur{users.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[var(--border-strong)]"></div>
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span className="font-mono text-sm">{users.filter(u => u.role === 'admin').length} admin{users.filter(u => u.role === 'admin').length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-xl shadow-editorial-md hover:shadow-editorial-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="relative z-10 flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
              <Plus size={20} strokeWidth={2.5} />
              <span className="hidden sm:inline">Nouvel Utilisateur</span>
              <span className="sm:hidden">Nouveau</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 editorial-card rounded-xl p-6 border-l-4 border-red-500 animate-slide-up delay-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-mono text-sm uppercase tracking-wider text-red-500 mb-1">Erreur</h3>
              <p className="text-[var(--text-secondary)]">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Grid - Editorial Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {users.map((user, index) => {
          const isCurrentUser = user.id === currentUser?.id;
          const isAdmin = user.role === 'admin';
          const isSuperAdmin = user.email === 'admin@subtrack.com';

          return (
            <div
              key={user.id}
              className={`editorial-card rounded-xl p-6 transition-all duration-300 hover:shadow-editorial-lg hover:-translate-y-1 animate-slide-up ${
                isAdmin ? 'accent-border' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isAdmin
                      ? 'bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]'
                      : 'bg-[var(--surface-hover)]'
                  }`}>
                    {isAdmin ? (
                      <Shield className="w-5 h-5 text-white" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-[var(--text-muted)]" />
                    )}
                  </div>
                  <div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider ${
                      isAdmin
                        ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                        : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                    }`}>
                      {isSuperAdmin ? 'Superadmin' : isAdmin ? 'Administrateur' : 'Utilisateur'}
                    </div>
                  </div>
                </div>

                {!isCurrentUser && !isSuperAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleRole(user)}
                      className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors group"
                      title={isAdmin ? 'Rétrograder en utilisateur' : 'Promouvoir administrateur'}
                    >
                      {isAdmin ? (
                        <ShieldOff size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors" />
                      ) : (
                        <Shield size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors" />
                      )}
                    </button>
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                      title="Supprimer l'utilisateur"
                    >
                      <Trash2 size={18} className="text-[var(--text-muted)] group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                )}
                {isSuperAdmin && (
                  <div className="px-3 py-1 bg-[var(--accent-tertiary)]/10 text-[var(--accent-tertiary)] rounded-lg">
                    <span className="font-mono text-xs uppercase tracking-wider">Protected</span>
                  </div>
                )}
              </div>

              {/* User Email */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-mono text-base mb-1">
                  <Mail size={14} className="text-[var(--text-muted)]" />
                  <span className="break-all">{user.email}</span>
                </div>
                {isCurrentUser && !isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-[var(--accent-primary)] uppercase tracking-wider">
                    Vous
                  </span>
                )}
                {isCurrentUser && isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-[var(--accent-tertiary)] uppercase tracking-wider">
                    Vous • Compte protégé
                  </span>
                )}
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono pt-3 border-t border-[var(--border)]">
                <CalendarIcon size={12} />
                <span>Créé le {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {users.length === 0 && !loading && !error && (
        <div className="editorial-card rounded-xl p-12 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-[var(--surface-hover)] flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="editorial-heading text-2xl text-[var(--text-primary)] mb-2">Aucun utilisateur</h3>
          <p className="text-[var(--text-muted)] mb-6">Commencez par créer votre premier utilisateur</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-lg font-mono text-sm uppercase tracking-wider shadow-editorial-md hover:shadow-editorial-lg transition-all"
          >
            <Plus size={18} />
            Créer un utilisateur
          </button>
        </div>
      )}

      {/* Create User Modal - Editorial Style */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="editorial-card rounded-2xl w-full max-w-lg shadow-editorial-xl animate-scale-in paper-texture overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] p-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Plus size={24} strokeWidth={2.5} />
                <h2 className="editorial-heading text-3xl">Nouvel Utilisateur</h2>
              </div>
              <p className="text-white/80 text-sm font-mono">Créer un nouveau compte d'accès</p>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {createError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-red-500 mb-1">Erreur</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{createError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                    placeholder="utilisateur@exemple.com"
                    autoFocus
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                    placeholder="Minimum 6 caractères"
                  />
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">
                    Rôle de l'utilisateur
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      createRole === 'user'
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="user"
                        checked={createRole === 'user'}
                        onChange={() => setCreateRole('user')}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <UserIcon className={`w-6 h-6 ${createRole === 'user' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                        <span className={`font-mono text-xs uppercase tracking-wider ${
                          createRole === 'user' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
                        }`}>
                          Utilisateur
                        </span>
                      </div>
                    </label>

                    <label className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      createRole === 'admin'
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={createRole === 'admin'}
                        onChange={() => setCreateRole('admin')}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <Shield className={`w-6 h-6 ${createRole === 'admin' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                        <span className={`font-mono text-xs uppercase tracking-wider ${
                          createRole === 'admin' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
                        }`}>
                          Admin
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-[var(--border)]">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setCreateEmail('');
                    setCreatePassword('');
                    setCreateRole('user');
                    setCreateError(null);
                  }}
                  className="flex-1 px-4 py-3 bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] text-[var(--text-primary)] rounded-lg font-mono text-sm uppercase tracking-wider transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateUser}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:shadow-editorial-lg text-white rounded-lg font-mono text-sm uppercase tracking-wider transition-all"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Editorial Style */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="editorial-card rounded-2xl w-full max-w-md shadow-editorial-xl animate-scale-in paper-texture overflow-hidden">
            {/* Warning Header */}
            <div className="bg-red-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h2 className="editorial-heading text-2xl">Attention</h2>
                  <p className="text-white/80 text-sm font-mono">Action irréversible</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-[var(--text-secondary)] mb-2">
                Êtes-vous sûr de vouloir supprimer l'utilisateur
              </p>
              <p className="font-mono text-lg text-[var(--accent-primary)] mb-4 break-all">
                {userToDelete.email}
              </p>
              <div className="p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)]">
                <p className="text-sm text-[var(--text-muted)]">
                  <strong className="text-[var(--text-primary)]">Toutes les données</strong> associées à cet utilisateur (entreprises, abonnements, revendeurs) seront <strong className="text-[var(--text-primary)]">définitivement supprimées</strong>.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] text-[var(--text-primary)] rounded-lg font-mono text-sm uppercase tracking-wider transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 hover:shadow-editorial-lg text-white rounded-lg font-mono text-sm uppercase tracking-wider transition-all"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
