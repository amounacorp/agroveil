import { MOBILE_MONEY_BRANDS } from '../../utils/constants';

interface MobileMoneyBtnProps {
  method: string;
  label?: string;
  onClick?: () => void;
  fullWidth?: boolean;
}

export function MobileMoneyBtn({ method, label, onClick, fullWidth = false }: MobileMoneyBtnProps) {
  const brand = MOBILE_MONEY_BRANDS[method] ?? { label: method, bg: '#888888', text: '#FFFFFF' };

  return (
    <button
      onClick={onClick}
      className={`h-12 px-6 rounded-btn font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 ${fullWidth ? 'w-full' : ''}`}
      style={{ backgroundColor: brand.bg, color: brand.text }}
    >
      {label ?? `Payer avec ${brand.label}`}
    </button>
  );
}
