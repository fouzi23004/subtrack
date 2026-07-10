import { useState, useEffect } from 'react';
import { PucePlan } from '../types';
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

export function usePucePlans() {
  const [pucePlans, setPucePlans] = useState<PucePlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPucePlans = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/api/puce-plans');
      setPucePlans(data);
    } catch (error) {
      console.error('Error fetching puce plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPucePlans();
  }, []);

  const addPlan = async (name: string) => {
    try {
      const data = await fetchWithAuth('/api/puce-plans', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      setPucePlans([...pucePlans, data]);
      return data;
    } catch (error) {
      console.error('Error adding puce plan:', error);
      throw error;
    }
  };

  const updatePlan = async (id: string, name: string) => {
    try {
      const data = await fetchWithAuth(`/api/puce-plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name })
      });
      setPucePlans(pucePlans.map(p => p.id === id ? data : p));
      return data;
    } catch (error) {
      console.error('Error updating puce plan:', error);
      throw error;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await fetchWithAuth(`/api/puce-plans/${id}`, { method: 'DELETE' });
      setPucePlans(pucePlans.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting puce plan:', error);
      throw error;
    }
  };

  return {
    pucePlans,
    loading,
    addPlan,
    updatePlan,
    deletePlan,
    refreshPucePlans: fetchPucePlans,
  };
}
