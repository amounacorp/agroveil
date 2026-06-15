import { MessageCircle, Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useAlerts } from '../../hooks/useAlerts';
import { mockFarm } from '../../api/mockData';

interface FarmerLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function FarmerLayout({ children, title }: FarmerLayoutProps) {
  const { farmer } = useAuth();
  const { data: alerts } = useAlerts(mockFarm.id);
  const unresolvedCount = alerts?.filter((a) => !a.is_resolved).length ?? 0;

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      <Sidebar />

      {/* Top header */}
      <header className="fixed top-0 left-0 md:left-60 right-0 h-16 bg-white border-b border-[#E8E8E8] z-40 flex items-center justify-between px-4 md:px-6 shadow-sm">
        {/* Left: logo (mobile) or title (desktop) */}
        <div className="md:hidden flex items-center gap-2">
          <span className="text-[#1E6B2E] font-bold text-lg">AgroVeil</span>
        </div>
        <div className="hidden md:block">
          {title && <span className="text-[#1E6B2E] font-bold text-base">{title}</span>}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button className="p-2 text-[#555555] hover:text-[#1E6B2E] transition-colors rounded-btn hover:bg-[#EAF3DE]">
            <MessageCircle size={20} />
          </button>
          <button className="p-2 text-[#555555] hover:text-[#1E6B2E] transition-colors rounded-btn hover:bg-[#EAF3DE] relative">
            <Bell size={20} />
            {unresolvedCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A32D2D] rounded-full" />
            )}
          </button>
          <div className="ml-2 pl-3 border-l border-[#E8E8E8] flex items-center gap-2">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">{farmer?.full_name ?? 'Fermier'}</p>
              <p className="text-[10px] text-[#888888] uppercase">Propriétaire</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#1E6B2E] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {farmer?.first_name?.charAt(0) ?? 'M'}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16 pb-20 md:pb-6 md:ml-60">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6">
          {children}
        </div>
      </main>

      <BottomNav />
      <ToastContainer />
      <Modal />
    </div>
  );
}
