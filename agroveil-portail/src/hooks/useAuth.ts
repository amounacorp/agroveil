import { useAuthStore } from '../store/authStore';
import { logout as apiLogout } from '../api/auth';
import { TOKEN_KEY } from '../utils/constants';

export function useAuth() {
  const { farmer, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const logoutFarmer = async () => {
    await apiLogout();
    clearAuth();
    localStorage.removeItem(TOKEN_KEY);
  };

  return { farmer, token, isAuthenticated, setAuth, logout: logoutFarmer };
}
