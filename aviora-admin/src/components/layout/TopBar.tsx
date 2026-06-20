import { useEffect, useRef, useState } from 'react';
import { Search, Bell, ChevronDown, Globe, Check } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useT } from '../../hooks/useT';
import { LANG_LABELS, CURRENCY_LABELS, type Lang, type Currency } from '../../i18n/translations';

interface Props {
  title?: string;
}

export default function TopBar({ title }: Props) {
  const { lang, currency, setLang, setCurrency } = useSettingsStore();
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const langs  = Object.entries(LANG_LABELS)  as [Lang,     string][];
  const currencies = Object.entries(CURRENCY_LABELS) as [Currency, string][];

  return (
    <header className="fixed top-0 left-60 right-0 z-40 h-16 bg-white border-b border-[#E8E8E8] flex items-center px-6 gap-4">
      {/* Left */}
      {title ? (
        <h2 className="font-bold text-[#1A1A1A] text-lg">{title}</h2>
      ) : (
        <div className="flex items-center gap-2 flex-shrink-0">
          <img src={`${import.meta.env.BASE_URL}logo_aviora.png`} alt="Aviora" className="h-7 w-auto" />
        </div>
      )}

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder={`${t.common.search}…`}
            className="w-full bg-[#F8FAF8] border border-[#E8E8E8] rounded-btn py-2 pl-9 pr-4 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#1E6B2E]/30 focus:border-[#1E6B2E] transition-colors"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Lang/Currency dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              open ? 'bg-[#EAF3DE] text-[#1E6B2E]' : 'hover:bg-[#F8FAF8] text-[#555555]'
            }`}
          >
            <Globe size={15} />
            <span className="hidden sm:inline uppercase">{lang}</span>
            <span className="hidden sm:inline text-[#BBBBBB]">·</span>
            <span className="hidden sm:inline">{currency}</span>
            <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-[#E8E8E8] rounded-card shadow-lg z-50 overflow-hidden">
              {/* Language */}
              <div className="px-3 pt-3 pb-1">
                <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-1.5">
                  {t.common.language}
                </p>
                {langs.map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => setLang(code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors ${
                      lang === code
                        ? 'bg-[#EAF3DE] text-[#1E6B2E] font-semibold'
                        : 'text-[#333333] hover:bg-[#F8FAF8]'
                    }`}
                  >
                    <span>{label}</span>
                    {lang === code && <Check size={13} className="text-[#1E6B2E]" />}
                  </button>
                ))}
              </div>

              <div className="mx-3 my-1 border-t border-[#F0F0F0]" />

              {/* Currency */}
              <div className="px-3 pb-3 pt-1">
                <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-1.5">
                  {t.common.currency}
                </p>
                {currencies.map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => setCurrency(code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors ${
                      currency === code
                        ? 'bg-[#EAF3DE] text-[#1E6B2E] font-semibold'
                        : 'text-[#333333] hover:bg-[#F8FAF8]'
                    }`}
                  >
                    <span>{label}</span>
                    {currency === code && <Check size={13} className="text-[#1E6B2E]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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
