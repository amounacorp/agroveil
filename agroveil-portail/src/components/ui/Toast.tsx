import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  const icons = {
    success: <CheckCircle size={16} className="text-[#27500A]" />,
    error: <AlertCircle size={16} className="text-[#A32D2D]" />,
    info: <Info size={16} className="text-[#0C447C]" />,
  };
  const colors = {
    success: 'border-[#639922] bg-[#EAF3DE]',
    error: 'border-[#E24B4A] bg-[#FCEBEB]',
    info: 'border-[#378ADD] bg-[#E6F1FB]',
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-3 rounded-card border shadow-card ${colors[toast.type]}`}
        >
          <span className="mt-0.5 flex-shrink-0">{icons[toast.type]}</span>
          <p className="text-sm text-[#1A1A1A] flex-1">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 text-[#888888] hover:text-[#1A1A1A]">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
