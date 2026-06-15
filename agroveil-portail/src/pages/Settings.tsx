import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { FarmerLayout } from '../components/layout/FarmerLayout';
import { useAuth } from '../hooks/useAuth';
import { uploadMyPhoto } from '../api/auth';
import { API_URL } from '../utils/constants';

export function Settings() {
  const { farmer, setAuth } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const photoSrc = farmer?.photo_url
    ? (farmer.photo_url.startsWith('http') ? farmer.photo_url : `${API_URL}${farmer.photo_url}`)
    : null;

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { photo_url } = await uploadMyPhoto(file);
      if (farmer) {
        // update store with new photo_url
        const token = localStorage.getItem('agroveil_farmer_token') ?? '';
        setAuth({ ...farmer, photo_url }, token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <FarmerLayout>
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Paramètres</h1>

      {/* ── Photo de profil ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-6 mb-4">
        <h3 className="font-semibold text-[#1A1A1A] mb-4">Photo de profil</h3>
        <div className="flex items-center gap-5">
          {/* Avatar with hover overlay */}
          <div className="relative group flex-shrink-0">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={farmer?.full_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#E8E8E8]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#1E6B2E] flex items-center justify-center text-white text-2xl font-bold border-2 border-[#E8E8E8]">
                {farmer?.first_name?.charAt(0)?.toUpperCase() ?? 'M'}
              </div>
            )}
            {/* Hover overlay */}
            <label className={`absolute inset-0 rounded-full bg-black/50 flex items-center justify-center cursor-pointer transition-opacity ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
                disabled={uploading}
              />
            </label>
          </div>

          <div>
            <p className="font-semibold text-[#1A1A1A]">{farmer?.full_name ?? '—'}</p>
            <p className="text-sm text-[#888888] mt-0.5">
              {uploading ? 'Téléchargement...' : 'Survolez la photo pour la modifier'}
            </p>
            <p className="text-xs text-[#AAAAAA] mt-1">JPEG, PNG ou WebP · max 5 Mo</p>
            {error && <p className="text-xs text-[#A32D2D] mt-1">{error}</p>}
          </div>
        </div>
      </div>

      {/* ── Informations personnelles ──────────────────────────────────────── */}
      <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-6">
        <h3 className="font-semibold text-[#1A1A1A] mb-4">Mes informations</h3>
        <div className="space-y-3">
          {[
            { label: 'Nom complet',   value: farmer?.full_name ?? '—' },
            { label: 'Téléphone',     value: farmer?.phone || '—' },
            { label: 'Email',         value: farmer?.email || '—' },
            { label: 'WhatsApp',      value: farmer?.whatsapp_number || '—' },
            { label: 'Ville',         value: farmer?.city || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-[#F0F0F0] last:border-0">
              <span className="text-sm text-[#888888]">{label}</span>
              <span className="text-sm font-medium text-[#1A1A1A]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </FarmerLayout>
  );
}
