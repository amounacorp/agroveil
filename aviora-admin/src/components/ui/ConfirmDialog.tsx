import Modal from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  danger = false,
  loading = false,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-[#555555] mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium border border-[#E8E8E8] rounded-btn hover:bg-[#F8FAF8] transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-bold rounded-btn text-white transition-colors disabled:opacity-60 ${
            danger ? 'bg-[#A32D2D] hover:bg-[#7A1F1F]' : 'bg-[#1E6B2E] hover:bg-[#17521F]'
          }`}
        >
          {loading ? 'Chargement...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
