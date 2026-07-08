import { getAuthToken } from "../auth";

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

export const api = {
  getEntreprises: () => fetchWithAuth('/api/entreprises'),
  createEntreprise: (name: string, revendeurId?: string | null, email?: string, phone?: string, matriculeFiscale?: string, rne?: string) =>
    fetchWithAuth('/api/entreprises', { method: 'POST', body: JSON.stringify({ name, revendeurId, email, phone, matriculeFiscale, rne }) }),
  updateEntreprise: (id: string | number, name: string, revendeurId?: string | null, email?: string, phone?: string, matriculeFiscale?: string, rne?: string) =>
    fetchWithAuth(`/api/entreprises/${id}`, { method: 'PUT', body: JSON.stringify({ name, revendeurId, email, phone, matriculeFiscale, rne }) }),
  deleteEntreprise: (id: string | number) => fetchWithAuth(`/api/entreprises/${id}`, { method: 'DELETE' }),

  getSubscriptions: () => fetchWithAuth('/api/subscriptions'),
  createSubscription: (data: any) => fetchWithAuth('/api/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
  updateSubscription: (id: string | number, data: any) => fetchWithAuth(`/api/subscriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubscription: (id: string | number) => fetchWithAuth(`/api/subscriptions/${id}`, { method: 'DELETE' }),

  // Admin user management
  getAllUsers: () => fetchWithAuth('/api/admin/users'),
  createUser: (email: string, password: string, role: string) =>
    fetchWithAuth('/api/admin/users', { method: 'POST', body: JSON.stringify({ email, password, role }) }),
  changeUserRole: (id: number, role: string) =>
    fetchWithAuth(`/api/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  deleteUser: (id: number) => fetchWithAuth(`/api/admin/users/${id}`, { method: 'DELETE' }),
};
