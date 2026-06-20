import { X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export function Modal() {
  const { isModalOpen, modalContent, closeModal } = useUIStore();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
      <div className="relative bg-white rounded-card shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 p-1 text-[#888888] hover:text-[#1A1A1A] transition-colors z-10"
        >
          <X size={20} />
        </button>
        <div className="p-6">{modalContent}</div>
      </div>
    </div>
  );
}
