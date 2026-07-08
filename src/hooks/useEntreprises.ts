import { useState, useEffect } from 'react';
import { Entreprise } from '../types';
import { api } from '../lib/api';
import { getCurrentUser } from '../auth';

export function useEntreprises() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntreprises = async () => {
    if (!getCurrentUser()) return;
    try {
      const data = await api.getEntreprises();
      setEntreprises(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getCurrentUser()) {
       setEntreprises([]);
       setLoading(false);
       return;
    }
    fetchEntreprises();
  }, []);

  const addEntreprise = async (name: string, revendeurId?: string | null, email?: string, phone?: string, matriculeFiscale?: string, rne?: string) => {
    if (!getCurrentUser()) return;
    try {
      await api.createEntreprise(name, revendeurId, email, phone, matriculeFiscale, rne);
      await fetchEntreprises();
    } catch (e) {
      console.error(e);
    }
  };

  const updateEntreprise = async (id: string | number, name: string, revendeurId?: string | null, email?: string, phone?: string, matriculeFiscale?: string, rne?: string) => {
    if (!getCurrentUser()) return;
    try {
      await api.updateEntreprise(id, name, revendeurId, email, phone, matriculeFiscale, rne);
      await fetchEntreprises();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteEntreprise = async (id: string | number) => {
    if (!getCurrentUser()) return;
    try {
      await api.deleteEntreprise(id);
      await fetchEntreprises();
    } catch (error) {
      console.error(error);
    }
  };

  return { entreprises, loading, addEntreprise, updateEntreprise, deleteEntreprise };
}

