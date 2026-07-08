export type SubscriptionType = 'licence' | 'licence_puce';

export interface Revendeur {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: number;
}

export interface Entreprise {
  id: string;
  name: string;
  revendeurId?: string;
  email?: string;
  phone?: string;
  matriculeFiscale?: string;
  rne?: string;
  rnePdfPath?: string;
  patentePdfPath?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Subscription {
  id: string;
  entrepriseId: string;
  clientName: string;
  type: SubscriptionType;
  quantity: number;
  endDate: string; // ISO format: YYYY-MM-DD
  isActive: number; // 1 = active, 0 = expired/inactive
  isPaid: number; // 1 = paid, 0 = unpaid
}

export interface FilterState {
  clientName: string;
  type: SubscriptionType | 'all';
}

export type ViewMode = 'year' | 'month' | 'week' | 'day';
