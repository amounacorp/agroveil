import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bell,
  CreditCard,
  BarChart3,
  Brain,
  Settings,
  LogOut,
  HelpCircle,
  Leaf,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Tableau de bord', badge: null, exact: true },
  { path: '/admin/farmers', icon: Users, label: 'Éleveurs', badge: '47', badgeColor: 'bg-[#EAF3DE] text-[#27500A]', exact: false },
  { path: '/admin/alerts', icon: Bell, label: 'Alertes', badge: '12', badgeColor: 'bg-[#FCEBEB] text-[#A32D2D]', exact: false },
  { path: '/admin/subscriptions', icon: CreditCard, label: 'Abonnements', badge: null, exact: false },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytiques', badge: null, exact: false },
  { path: '/admin/ai-models', icon: Brain, label: 'Modèles IA', badge: null, exact: false },
  { path: '/admin/settings', icon: Settings, label: 'Paramètres', badge: null, exact: false },
];

export default function Sidebar() {
  const { user, logout: logoutStore } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    logoutStore();
    navigate('/login');
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#0F3D1A] flex flex-col z-50 select-none">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1E6B2E] rounded-lg flex items-center justify-center">
            <Leaf size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none">AgroVeil</h1>
            <p className="text-[#8FBA8F] text-[10px] mt-0.5">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
              ${
                isActive
                  ? 'bg-[#1E6B2E] text-white border-l-[3px] border-[#8BD88E] pl-[9px]'
                  : 'text-[#8FBA8F] hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} className={isActive ? 'text-white' : 'text-[#8FBA8F] group-hover:text-white'} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-pill ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + logout */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#8FBA8F] hover:bg-white/10 hover:text-white text-sm font-medium transition-all"
        >
          <HelpCircle size={18} />
          <span>Support</span>
        </a>
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-8 h-8 bg-[#1E6B2E] rounded-full flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user.name}</p>
              <p className="text-[#8FBA8F] text-[10px] uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 text-sm font-medium transition-all"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
