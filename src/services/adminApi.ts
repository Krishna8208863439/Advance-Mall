const API_BASE = '';

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  email?: string;
  expires_at?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  reset_path?: string;
  expires_in_minutes?: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

const getStoredToken = (): string | null => localStorage.getItem('amanora_admin_token');

export const adminApi = {
  getToken: getStoredToken,

  setToken(token: string) {
    localStorage.setItem('amanora_admin_token', token);
  },

  clearToken() {
    localStorage.removeItem('amanora_admin_token');
    localStorage.removeItem('amanora_admin_email');
  },

  setEmail(email: string) {
    localStorage.setItem('amanora_admin_email', email);
  },

  getEmail(): string | null {
    return localStorage.getItem('amanora_admin_email');
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async verify(): Promise<{ success: boolean; email?: string; message?: string }> {
    const token = getStoredToken();
    if (!token) {
      return { success: false, message: 'No session found.' };
    }
    const response = await fetch(`${API_BASE}/api/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async logout(): Promise<ApiResponse> {
    const token = getStoredToken();
    if (!token) {
      return { success: true, message: 'Already logged out.' };
    }
    const response = await fetch(`${API_BASE}/api/admin/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await fetch(`${API_BASE}/api/admin/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE}/api/admin/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });
    return response.json();
  },
};
