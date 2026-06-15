import { useUIStore } from '../../store/uiStore';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { Toast as ToastType } from '../../types';

const icons = {
  success: <CheckCircle size={18} className="text-[#27500A]" />,
  error: <AlertCircle size={18} className="text-[#A32D2D]" />,
  warning: <AlertTriangle size={18} className="text-[#854F0B]" />,
  info: <Info size={18} className="text-[#0C447C]" />,
};

const styles: Record<ToastType['type'], string> = {
  success: 'bg-[#EAF3DE] border-[#639922]',
  error: 'bg-[#FCEBEB] border-[#E24B4A]',
  warning: 'bg-[#FAEEDA] border-[#EF9F27]',
  info: 'bg-[#E6F1FB] border-[#378ADD]',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-card border shadow-card ${styles[t.type]} animate-in slide-in-from-right-4`}
        >
          <span className="mt-0.5 flex-shrink-0">{icons[t.type]}</span>
          <p className="text-sm font-medium text-[#1A1A1A] flex-1">{t.message}</p>
          <button onClick={() => removeToast(t.id)} className="text-[#888888] hover:text-[#1A1A1A] flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
