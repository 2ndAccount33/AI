import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authService } from '@/services/api';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; name: string }) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.login({ email, password });
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Login failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.register(data);
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Registration failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                });
            },

            refreshUser: async () => {
                const { token } = get();
                if (!token) {
                    set({ isLoading: false });
                    return;
                }

                try {
                    const user = await authService.getProfile();
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch {
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },

            clearError: () => set({ error: null }),
            setLoading: (loading: boolean) => set({ isLoading: loading }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ token: state.token }),
            onRehydrateStorage: () => (state) => {
                if (state?.token) {
                    state.refreshUser();
                } else {
                    state?.setLoading(false);
                }
            },
        }
    )
);
