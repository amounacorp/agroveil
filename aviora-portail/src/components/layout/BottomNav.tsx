import { NavLink } from 'react-router-dom';
import { Home, Bell, BarChart2, User } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';
import { mockFarm } from '../../api/mockData';

const navItems = [
  { to: '/', icon: Home, label: 'Accueil', exact: true },
  { to: '/alertes', icon: Bell, label: 'Alertes' },
  { to: '/rapports', icon: BarChart2, label: 'Rapports' },
  { to: '/abonnement', icon: User, label: 'Compte' },
];

export function BottomNav() {
  const { data: alerts } = useAlerts(mockFarm.id);
  const unresolvedCount = alerts?.filter((a) => !a.is_resolved).length ?? 0;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 bg-white border-t border-[#E8E8E8] shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      {navItems.map(({ to, icon: Icon, label, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-btn transition-colors min-w-[64px] ${
              isActive ? 'text-[#1E6B2E]' : 'text-[#888888]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {label === 'Alertes' && unresolvedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#A32D2D] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unresolvedCount > 9 ? '9+' : unresolvedCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
