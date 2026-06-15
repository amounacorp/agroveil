import { Search, Bell, ChevronDown, Globe } from 'lucide-react';
import { Leaf } from 'lucide-react';

interface Props {
  title?: string;
}

export default function TopBar({ title }: Props) {
  return (
    <header className="fixed top-0 left-60 right-0 z-40 h-16 bg-white border-b border-[#E8E8E8] flex items-center px-6 gap-4">
      {/* Left: logo text or title */}
      {title ? (
        <h2 className="font-bold text-[#1A1A1A] text-lg">{title}</h2>
      ) : (
        <div className="flex items-center gap-2 flex-shrink-0">
          <Leaf size={20} className="text-[#1E6B2E]" />
          <span className="font-bold text-[#1E6B2E] text-base">AgroVeil</span>
          <span className="text-[#888888] text-sm">Admin Console</span>
        </div>
      )}

      {/* Center: search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Rechercher un éleveur, une alerte..."
            className="w-full bg-[#F8FAF8] border border-[#E8E8E8] rounded-btn py-2 pl-9 pr-4 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#1E6B2E]/30 focus:border-[#1E6B2E] transition-colors"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button className="p-2 rounded-lg hover:bg-[#F8FAF8] text-[#888888] hover:text-[#1A1A1A] transition-colors">
          <Globe size={20} />
        </button>

        <button className="p-2 rounded-lg hover:bg-[#F8FAF8] relative text-[#888888] hover:text-[#1A1A1A] transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A32D2D] rounded-full" />
        </button>

        <div className="w-px h-6 bg-[#E8E8E8]" />

        <button className="flex items-center gap-2 hover:bg-[#F8FAF8] rounded-lg px-2 py-1.5 transition-colors">
          <div className="w-8 h-8 bg-[#1E6B2E] rounded-full flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-[#1A1A1A] leading-none">Admin</p>
            <p className="text-[10px] text-[#888888] uppercase tracking-wide">Global Access</p>
          </div>
          <ChevronDown size={14} className="text-[#888888]" />
        </button>
      </div>
    </header>
  );
}
