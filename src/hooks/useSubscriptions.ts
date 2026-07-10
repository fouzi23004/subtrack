import { useState, useEffect } from 'react';
import { Subscription } from '../types';
import { api } from '../lib/api';
import { getCurrentUser, getAuthToken } from '../auth';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    if (!getCurrentUser()) return;
    try {
      const data = await api.getSubscriptions();
      const mapped = data.map((item: any) => ({
        ...item,
        clientName: item.entrepriseName,
        isPaid: item.isPaid !== undefined ? item.isPaid : (item.is_paid !== undefined ? item.is_paid : 0),
        isActive: item.isActive !== undefined ? item.isActive : (item.is_active !== undefined ? item.is_active : 1)
      }));
      setSubscriptions(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getCurrentUser()) {
       setSubscriptions([]);
       setLoading(false);
       return;
    }
    fetchSubscriptions();
  }, []);

  const addSubscription = async (entrepriseId: string | number, entrepriseName: string, quantity: number, type: string, endDate: string, plan?: string | null, phoneNumbers?: string[]) => {
    if (!getCurrentUser()) return;
    try {
      await api.createSubscription({ entrepriseId: parseInt(entrepriseId.toString()), entrepriseName, quantity, type, endDate, plan: plan ?? null, phoneNumbers: phoneNumbers ?? [] });
      await fetchSubscriptions();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateSubscription = async (id: string | number, updates: { entrepriseId?: string | number, entrepriseName?: string, quantity?: number, type?: string, endDate?: string, plan?: string | null, phoneNumbers?: string[] }) => {
    if (!getCurrentUser()) return;
    try {
      if (updates.entrepriseId) updates.entrepriseId = parseInt(updates.entrepriseId.toString());
      await api.updateSubscription(id, updates);
      await fetchSubscriptions();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deleteSubscription = async (id: string | number) => {
    if (!getCurrentUser()) return;
    try {
      await api.deleteSubscription(id);
      await fetchSubscriptions();
    } catch (error) {
      console.error(error);
    }
  };

  const renewSubscription = async (id: string | number, newEndDate: string, newQuantity?: number) => {
    if (!getCurrentUser()) return;
    try {
      const token = getAuthToken();

      const body: any = { newEndDate };
      if (newQuantity !== undefined) {
        body.newQuantity = newQuantity;
      }

      const response = await fetch(`/api/subscriptions/${id}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to renew subscription');
      }

      await fetchSubscriptions();
    } catch (error) {
      console.error('Renewal exception:', error);
      throw error;
    }
  };

  return { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription, renewSubscription };
}
