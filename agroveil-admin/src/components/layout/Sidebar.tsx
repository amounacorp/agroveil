import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  MessageCircle,
  Mail,
  ExternalLink,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../api/auth';

const navItems = [
  { path: '/admin',               icon: LayoutDashboard, label: 'Tableau de bord', badge: null,  badgeColor: '',                              exact: true  },
  { path: '/admin/farmers',       icon: Users,           label: 'Éleveurs',        badge: '47',  badgeColor: 'bg-[#EAF3DE] text-[#27500A]',   exact: false },
  { path: '/admin/alerts',        icon: Bell,            label: 'Alertes',         badge: '12',  badgeColor: 'bg-[#FCEBEB] text-[#A32D2D]',   exact: false },
  { path: '/admin/subscriptions', icon: CreditCard,      label: 'Abonnements',     badge: null,  badgeColor: '',                              exact: false },
  { path: '/admin/analytics',     icon: BarChart3,       label: 'Analytiques',     badge: null,  badgeColor: '',                              exact: false },
  { path: '/admin/ai-models',     icon: Brain,           label: 'Modèles IA',      badge: null,  badgeColor: '',                              exact: false },
  { path: '/admin/settings',      icon: Settings,        label: 'Paramètres',      badge: null,  badgeColor: '',                              exact: false },
];

export default function Sidebar() {
  const { user, logout: logoutStore } = useAuthStore();
  const navigate = useNavigate();
  const [showSupport, setShowSupport] = useState(false);

  async function handleLogout() {
    await logout();
    logoutStore();
    navigate('/login');
  }

  return (
    <>
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-[#0F3D1A] flex flex-col z-50 select-none">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}logo_agroveil.png`} alt="AgroVeil" className="h-8 w-auto" />
            <p className="text-[#8FBA8F] text-[10px] font-medium tracking-wider uppercase">Admin Console</p>
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
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
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
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: support + user + logout */}
        <div className="border-t border-white/10 p-3 space-y-1">
          <button
            onClick={() => setShowSupport(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#8FBA8F] hover:bg-white/10 hover:text-white text-sm font-medium transition-all"
          >
            <HelpCircle size={18} />
            <span>Support</span>
          </button>

          {user && (
            <div className="flex items-center gap-3 px-3 py-2 mt-1">
              <div className="w-8 h-8 bg-[#1E6B2E] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
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

      {/* ── Modal Support ──────────────────────────────────────────────────────── */}
      {showSupport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSupport(false)}
          />
          <div className="relative bg-white rounded-card shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Support AgroVeil</h3>
              <button
                onClick={() => setShowSupport(false)}
                className="p-1.5 rounded-lg hover:bg-[#F2F2F2] text-[#888888] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-[#555555] mb-5">
              Notre équipe est disponible du lundi au vendredi, 8h – 18h (WAT).
            </p>

            <div className="space-y-3">
              <a
                href="mailto:support@agroveil.com"
                className="flex items-center gap-4 p-4 border border-[#E8E8E8] rounded-card hover:border-[#1E6B2E] hover:bg-[#F8FAF8] transition-colors group"
              >
                <div className="w-10 h-10 bg-[#EAF3DE] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-[#1E6B2E]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1A1A1A]">Email</p>
                  <p className="text-xs text-[#888888]">support@agroveil.com</p>
                </div>
                <ExternalLink size={14} className="text-[#888888] group-hover:text-[#1E6B2E]" />
              </a>

              <a
                href="https://wa.me/242000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 border border-[#E8E8E8] rounded-card hover:border-[#25D366] hover:bg-[#F0FDF4] transition-colors group"
              >
                <div className="w-10 h-10 bg-[#DCFCE7] rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={20} className="text-[#16A34A]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1A1A1A]">WhatsApp</p>
                  <p className="text-xs text-[#888888]">Réponse sous 2h en journée</p>
                </div>
                <ExternalLink size={14} className="text-[#888888] group-hover:text-[#16A34A]" />
              </a>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E8E8E8]">
              <p className="text-xs text-[#888888] text-center">
                Version 1.0.0 · AgroVeil Admin Console
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
