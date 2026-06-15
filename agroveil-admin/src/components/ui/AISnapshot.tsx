interface Props {
  imageUrl?: string;
  confidence?: number;
  alertType?: string;
}

export default function AISnapshot({ imageUrl, confidence, alertType }: Props) {
  return (
    <div className="rounded-card overflow-hidden border border-[#E8E8E8]">
      <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt="Capture IA" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm">Capture caméra</p>
            </div>
          </div>
        )}

        {/* Bounding box simulation */}
        <div className="absolute top-[35%] left-[25%] w-24 h-24 border-2 border-red-500 rounded-sm">
          <span className="absolute -top-6 left-0 bg-red-500 text-white px-2 py-0.5 text-[10px] font-bold rounded-sm whitespace-nowrap">
            🔴 {alertType ?? 'Oiseau immobile'}
          </span>
        </div>
        <div className="absolute top-[55%] left-[55%] w-20 h-16 border-2 border-green-400 rounded-sm">
          <span className="absolute -top-5 left-0 bg-green-500 text-white px-2 py-0.5 text-[10px] font-bold rounded-sm">
            🟢 Normal
          </span>
        </div>

        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white text-[10px] font-mono tracking-widest">LIVE · CAM_04</span>
        </div>
      </div>

      {confidence !== undefined && (
        <div className="p-4 bg-[#F8FAF8] border-t border-[#E8E8E8]">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-[#555555]">Confiance IA</span>
            <span className="text-sm font-bold text-[#1E6B2E]">{confidence.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-[#E8E8E8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1E6B2E] rounded-full transition-all duration-700"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
