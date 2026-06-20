import { Video, Wifi, WifiOff } from 'lucide-react';
import type { Camera } from '../../types';

interface CameraCardProps {
  camera: Camera;
}

export function CameraCard({ camera }: CameraCardProps) {
  const isOnline = camera.status === 'online';

  return (
    <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] overflow-hidden">
      <div className="relative h-44 bg-[#F0F0F0]">
        {camera.snapshot_url ? (
          <img src={camera.snapshot_url} alt={camera.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video size={40} className="text-[#CCCCCC]" />
          </div>
        )}
        {isOnline && (
          <span className="absolute top-2 right-2 bg-[#A32D2D] text-white text-[10px] font-bold px-2 py-0.5 rounded">
            EN DIRECT
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {isOnline ? (
            <Wifi size={14} className="text-[#1E6B2E]" />
          ) : (
            <WifiOff size={14} className="text-[#A32D2D]" />
          )}
          <span className="text-xs font-semibold text-[#555555]">{camera.name}</span>
        </div>
        <p className="text-xs text-[#888888] mb-3">{camera.zone}</p>
        <button className="w-full h-10 bg-[#1E6B2E] text-white text-sm font-semibold rounded-btn hover:bg-[#0F3D1A] transition-colors">
          Voir en direct
        </button>
      </div>
    </div>
  );
}
