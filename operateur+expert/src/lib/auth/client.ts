'use client';

import type { User } from '@/types/user';

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    try {
      const response = await fetch('http://localhost:8099/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
  
      const data = await response.json();
      console.log('🔍 Backend login response:', data);
  
      if (!response.ok) {
        return { error: data.message || 'Login failed' };
      }
  
      // 🧠 Extraire token
      const token = data.token;
  
      // 🧠 Extraire le rôle à partir du tableau `roles`
      const role = data.roles?.[0]?.replace('ROLE_', '').toLowerCase() || 'user';
  
      // 🧠 Reconstituer un objet user cohérent
      const user = {
        id: data.id,
        username: data.username,
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        wilaya: data.wilaya,
        role: role
      };
  
      // ✅ Stocker les infos en localStorage
      localStorage.setItem('custom-auth-token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);
  
      return {};
    } catch (error) {
      return { error: 'Something went wrong during login.' };
    }
  }
  
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    try {
      const response = await fetch('http://localhost:8099/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Sign up failed' };
      }

      return {};
    } catch (error) {
      return { error: 'Something went wrong during sign up.' };
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password update not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const userString = localStorage.getItem('user');
  
    if (!userString) {
      return { data: null };
    }
  
    try {
      return { data: JSON.parse(userString) };
    } catch (err) {
      console.error('❌ Failed to parse user from localStorage');
      localStorage.removeItem('user');
      return { data: null };
    }
  }
  

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    return {};
  }
}

export const authClient = new AuthClient();
