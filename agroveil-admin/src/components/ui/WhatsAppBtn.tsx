import { MessageCircle } from 'lucide-react';

interface Props {
  onClick?: () => void;
  label?: string;
  loading?: boolean;
}

export default function WhatsAppBtn({ onClick, label = 'WhatsApp', loading = false }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white text-sm font-bold rounded-btn hover:bg-[#1EAF55] transition-colors disabled:opacity-60"
    >
      <MessageCircle size={16} />
      {loading ? 'Envoi...' : label}
    </button>
  );
}
