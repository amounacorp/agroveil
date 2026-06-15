import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bell, BarChart2, CreditCard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAlerts } from '../../hooks/useAlerts';
import { mockFarm } from '../../api/mockData';
import { API_URL } from '../../utils/constants';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', exact: true },
  { to: '/alertes', icon: Bell, label: 'Mes Alertes' },
  { to: '/rapports', icon: BarChart2, label: 'Mes Rapports' },
  { to: '/abonnement', icon: CreditCard, label: 'Mon Abonnement' },
  { to: '/parametres', icon: Settings, label: 'Paramètres' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { farmer, logout } = useAuth();
  const { data: alerts } = useAlerts(mockFarm.id);
  const unresolvedCount = alerts?.filter((a) => !a.is_resolved).length ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 w-60 bg-[#0F3D1A] shadow-lg z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1">
          <img
            src={`${import.meta.env.BASE_URL}logo_agroveil.png`}
            alt="AgroVeil"
            className="h-8 w-auto"
          />
        </div>
        <p className="text-xs text-white/50 uppercase tracking-widest">Portail Fermier</p>
      </div>

      {/* Nav */}
      <div className="flex-1 py-3 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-2 px-4 py-3 rounded-btn text-sm font-medium transition-colors relative ${
                isActive
                  ? 'bg-[#1E6B2E] text-white shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
            {label === 'Mes Alertes' && unresolvedCount > 0 && (
              <span className="ml-auto bg-[#A32D2D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-pill min-w-[18px] text-center">
                {unresolvedCount}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          {farmer?.photo_url ? (
            <img
              src={farmer.photo_url.startsWith('http') ? farmer.photo_url : `${API_URL}${farmer.photo_url}`}
              alt={farmer.full_name}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-white/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#1E6B2E] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {farmer?.first_name?.charAt(0) ?? 'M'}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{farmer?.full_name ?? 'Fermier'}</p>
            <p className="text-[10px] text-white/50 uppercase">Propriétaire</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-btn text-sm transition-colors"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
