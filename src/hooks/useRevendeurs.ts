import { useState, useEffect } from 'react';
import { Revendeur } from '../types';
import { getAuthToken } from '../auth';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error("User not authenticated");
  }

  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorMsg = "API Error";
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export function useRevendeurs() {
  const [revendeurs, setRevendeurs] = useState<Revendeur[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevendeurs = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/api/revendeurs');
      setRevendeurs(data);
    } catch (error) {
      console.error('Error fetching revendeurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevendeurs();
  }, []);

  const addRevendeur = async (name: string, email?: string, phone?: string) => {
    try {
      const data = await fetchWithAuth('/api/revendeurs', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone })
      });
      setRevendeurs([...revendeurs, data]);
      return data;
    } catch (error) {
      console.error('Error adding revendeur:', error);
      throw error;
    }
  };

  const updateRevendeur = async (id: string, name: string, email?: string, phone?: string) => {
    try {
      const data = await fetchWithAuth(`/api/revendeurs/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, email, phone })
      });
      setRevendeurs(revendeurs.map(r => r.id === id ? data : r));
      return data;
    } catch (error) {
      console.error('Error updating revendeur:', error);
      throw error;
    }
  };

  const deleteRevendeur = async (id: string) => {
    try {
      await fetchWithAuth(`/api/revendeurs/${id}`, { method: 'DELETE' });
      setRevendeurs(revendeurs.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting revendeur:', error);
      throw error;
    }
  };

  return {
    revendeurs,
    loading,
    addRevendeur,
    updateRevendeur,
    deleteRevendeur,
    refreshRevendeurs: fetchRevendeurs,
  };
}
