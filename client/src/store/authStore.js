import { create } from 'zustand';
import authApi from '../api/authApi';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('fyndry_token') || null,
  isAuthenticated: !!localStorage.getItem('fyndry_token'),
  isAdmin: false,
  loading: true,

  /**
   * Bootstrap auth state on application startup:
   * 1. Try with existing access token from localStorage -> GET /auth/me
   * 2. If token missing or expired, attempt silent token rotation via HttpOnly refresh cookie
   */
  bootstrap: async () => {
    set({ loading: true });
    const storedToken = localStorage.getItem('fyndry_token');
    const hasPreviousSession = localStorage.getItem('fyndry_logged_in') === 'true';

    if (storedToken) {
      try {
        const response = await authApi.getMe();
        const user = response.data?.user || response.data;
        set({
          user,
          accessToken: storedToken,
          isAuthenticated: true,
          isAdmin: user?.role === 'admin',
          loading: false,
        });
        return;
      } catch (err) {
        // Token might have expired, proceed to silent refresh
      }
    }

    // Only attempt silent refresh if the user previously had a session
    if (storedToken || hasPreviousSession) {
      try {
        const refreshRes = await authApi.refresh();
        const newAccessToken = refreshRes.data?.accessToken;
        const user = refreshRes.data?.user;

        if (newAccessToken) {
          localStorage.setItem('fyndry_token', newAccessToken);
          localStorage.setItem('fyndry_logged_in', 'true');
          set({
            user,
            accessToken: newAccessToken,
            isAuthenticated: true,
            isAdmin: user?.role === 'admin',
            loading: false,
          });
          return;
        }
      } catch (refreshErr) {
        // Not authenticated or refresh token expired
      }
    }

    localStorage.removeItem('fyndry_token');
    localStorage.removeItem('fyndry_logged_in');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });
  },

  // Alias for backward compatibility
  initAuth: async () => {
    return get().bootstrap();
  },

  /**
   * Customer / Admin login
   */
  login: async (credentials) => {
    set({ loading: true });
    try {
      const response = await authApi.login(credentials);
      const { user, accessToken } = response.data;

      localStorage.setItem('fyndry_token', accessToken);
      localStorage.setItem('fyndry_logged_in', 'true');
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isAdmin: user?.role === 'admin',
        loading: false,
      });

      toast.success(`Welcome back, ${user.name}!`);
      return { success: true, user };
    } catch (err) {
      set({ loading: false });
      const message = err.response?.data?.message || err.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  },

  /**
   * Customer registration
   */
  register: async (userData) => {
    set({ loading: true });
    try {
      const response = await authApi.register(userData);
      const { user, accessToken } = response.data;

      localStorage.setItem('fyndry_token', accessToken);
      localStorage.setItem('fyndry_logged_in', 'true');
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isAdmin: user?.role === 'admin',
        loading: false,
      });

      toast.success(`Welcome to FynDry, ${user.name}!`);
      return { success: true, user };
    } catch (err) {
      set({ loading: false });
      const message = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  },

  /**
   * Logout user, clear session cookie & token
   */
  logout: async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('fyndry_token');
      localStorage.removeItem('fyndry_logged_in');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
      });
      toast.success('Logged out successfully');
    }
  },

  /**
   * Update locally stored user profile details
   */
  setUser: (updatedUser) => {
    set((state) => ({
      user: { ...state.user, ...updatedUser },
      isAdmin: (updatedUser.role || state.user?.role) === 'admin',
    }));
  },
}));

export default useAuthStore;
