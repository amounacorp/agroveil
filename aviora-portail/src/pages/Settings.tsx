import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Check, Lock, Plus, Video, Wifi, WifiOff } from 'lucide-react';
import { FarmerLayout } from '../components/layout/FarmerLayout';
import { useAuth } from '../hooks/useAuth';
import { uploadMyPhoto } from '../api/auth';
import { API_URL } from '../utils/constants';
import { useT } from '../hooks/useT';
import { useSettingsStore } from '../store/settingsStore';
import { useUIStore } from '../store/uiStore';
import { LANG_LABELS, CURRENCY_LABELS, type Lang, type Currency } from '../i18n/translations';
import { useFarms, useCameras, useSubscription, useCreateCamera, useCreateFarm } from '../hooks/useFarm';

export function Settings() {
  const { farmer, setAuth } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const t = useT();
  const { lang, currency, setLang, setCurrency } = useSettingsStore();
  const { addToast } = useUIStore();

  // Camera management state
  const [addingCamera, setAddingCamera] = useState(false);
  const [newCamName, setNewCamName] = useState('');
  const [newCamZone, setNewCamZone] = useState('');

  const langs      = Object.entries(LANG_LABELS)     as [Lang,     string][];
  const currencies = Object.entries(CURRENCY_LABELS) as [Currency, string][];

  // Farm + camera data
  const { data: farms } = useFarms();
  const farm = farms?.[0];
  const { data: cameras = [] } = useCameras(farm?.id ?? '');
  const { data: subscription }  = useSubscription(farmer?.id ?? '');
  const createCam = useCreateCamera();
  const createFarmMut = useCreateFarm();

  const maxCameras   = (subscription?.max_cameras ?? 1) + (subscription?.addon_cameras ?? 0);
  const cameraCount  = cameras.length;
  const atLimit      = cameraCount >= maxCameras;

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
        const token = localStorage.getItem('Aviora_farmer_token') ?? '';
        setAuth({ ...farmer, photo_url }, token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleSetLang(l: Lang) {
    setLang(l);
    addToast(t.settings.saved, 'success');
  }

  function handleSetCurrency(c: Currency) {
    setCurrency(c);
    addToast(t.settings.saved, 'success');
  }

  async function handleAddCamera() {
    if (!newCamName.trim()) return;
    try {
      let farmId = farm?.id;
      if (!farmId) {
        const newFarm = await createFarmMut.mutateAsync({
          farmerName: farmer?.first_name ?? farmer?.full_name ?? 'Éleveur',
          city: farmer?.city ?? '',
        });
        farmId = newFarm.id;
      }
      await createCam.mutateAsync({
        farmId: farmId!,
        name: newCamName.trim(),
        zone: newCamZone.trim() || 'Bâtiment principal',
        maxAllowed: maxCameras,
        currentCount: cameraCount,
      });
      addToast('Caméra ajoutée avec succès ✓', 'success');
      setNewCamName('');
      setNewCamZone('');
      setAddingCamera(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[handleAddCamera]', msg);
      if (msg.startsWith('LIMIT_REACHED')) {
        addToast(`Limite de ${maxCameras} caméras atteinte`, 'error');
      } else {
        addToast('Impossible d\'ajouter la caméra', 'error');
      }
    }
  }

  return (
    <FarmerLayout>
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">{t.settings.title}</h1>

      {/* Photo de profil */}
      <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-6 mb-4">
        <h3 className="font-semibold text-[#1A1A1A] mb-4">{t.settings.profilePhoto}</h3>
        <div className="flex items-center gap-5">
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
              {uploading ? t.settings.uploading : t.settings.hover}
            </p>
            <p className="text-xs text-[#AAAAAA] mt-1">{t.settings.photoHint}</p>
            {error && <p className="text-xs text-[#A32D2D] mt-1">{error}</p>}
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-6 mb-4">
        <h3 className="font-semibold text-[#1A1A1A] mb-4">{t.settings.personalInfo}</h3>
        <div className="space-y-3">
          {[
            { label: t.settings.fullName,  value: farmer?.full_name ?? '—' },
            { label: t.settings.phone,     value: farmer?.phone || '—' },
            { label: t.settings.email,     value: farmer?.email || '—' },
            { label: t.settings.whatsapp,  value: farmer?.whatsapp_number || '—' },
            { label: t.settings.city,      value: farmer?.city || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-[#F0F0F0] last:border-0">
              <span className="text-sm text-[#888888]">{label}</span>
              <span className="text-sm font-medium text-[#1A1A1A]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Préférences langue / devise */}
      <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-6 mb-4">
        <h3 className="font-semibold text-[#1A1A1A] mb-5">{t.settings.preferencesTitle}</h3>

        {/* Langue */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-[#555555] mb-0.5">{t.settings.language}</p>
          <p className="text-[11px] text-[#888888] mb-3">{t.settings.languageSub}</p>
          <div className="flex gap-2 flex-wrap">
            {langs.map(([code, label]) => (
              <button
                key={code}
                type="button"
                onClick={() => handleSetLang(code)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-btn text-sm font-medium border transition-colors ${
                  lang === code
                    ? 'border-[#1E6B2E] bg-[#EAF3DE] text-[#1E6B2E]'
                    : 'border-[#E8E8E8] text-[#555555] hover:border-[#1E6B2E]/40 hover:bg-[#F8FAF8]'
                }`}
              >
                {lang === code && <Check size={13} />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Devise */}
        <div>
          <p className="text-xs font-semibold text-[#555555] mb-0.5">{t.settings.currency}</p>
          <p className="text-[11px] text-[#888888] mb-3">{t.settings.currencySub}</p>
          <div className="flex gap-2 flex-wrap">
            {currencies.map(([code, label]) => (
              <button
                key={code}
                type="button"
                onClick={() => handleSetCurrency(code)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-btn text-sm font-medium border transition-colors ${
                  currency === code
                    ? 'border-[#1E6B2E] bg-[#EAF3DE] text-[#1E6B2E]'
                    : 'border-[#E8E8E8] text-[#555555] hover:border-[#1E6B2E]/40 hover:bg-[#F8FAF8]'
                }`}
              >
                {currency === code && <Check size={13} />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gestion des caméras */}
      <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[#1A1A1A]">Gestion des caméras</h3>
            <p className="text-xs text-[#888888] mt-0.5">
              {cameraCount} / {maxCameras} caméra{maxCameras > 1 ? 's' : ''} utilisée{cameraCount > 1 ? 's' : ''}
            </p>
          </div>
          {/* Progress bar */}
          <div className="text-right">
            <div className="w-24 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (cameraCount / maxCameras) * 100)}%`,
                  backgroundColor: atLimit ? '#A32D2D' : '#1E6B2E',
                }}
              />
            </div>
          </div>
        </div>

        {/* Camera list */}
        {cameras.length > 0 ? (
          <div className="space-y-2 mb-4">
            {cameras.map((cam) => (
              <div
                key={cam.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAF8] border border-[#E8E8E8]"
              >
                <div className="flex items-center gap-3">
                  <Video size={16} className="text-[#888888] flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">{cam.name}</p>
                    <p className="text-xs text-[#888888]">{cam.zone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {cam.status === 'online' ? (
                    <Wifi size={13} className="text-[#1E6B2E]" />
                  ) : (
                    <WifiOff size={13} className="text-[#A32D2D]" />
                  )}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      cam.status === 'online'
                        ? 'bg-[#EAF3DE] text-[#1E6B2E]'
                        : 'bg-[#FCEBEB] text-[#A32D2D]'
                    }`}
                  >
                    {cam.status === 'online' ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#888888] text-center py-6 mb-4">
            Aucune caméra configurée
          </p>
        )}

        {/* Limit reached */}
        {atLimit ? (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[#FAEEDA] border border-[#EF9F27]/30">
            <Lock size={16} className="text-[#854F0B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#854F0B]">
                Limite de {maxCameras} caméra{maxCameras > 1 ? 's' : ''} atteinte
              </p>
              <p className="text-xs text-[#854F0B]/80 mt-0.5">
                Mettez à niveau votre abonnement pour ajouter plus de caméras.
              </p>
              <Link
                to="/abonnement"
                className="inline-block mt-2 text-xs font-semibold text-[#1E6B2E] underline"
              >
                Voir les offres d'abonnement →
              </Link>
            </div>
          </div>
        ) : addingCamera ? (
          <div className="space-y-3 p-4 rounded-lg border border-[#E8E8E8] bg-[#F8FAF8]">
            <p className="text-sm font-semibold text-[#1A1A1A]">Nouvelle caméra</p>
            <input
              type="text"
              placeholder="Nom (ex: Caméra 03)"
              value={newCamName}
              onChange={(e) => setNewCamName(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-[#E8E8E8] rounded-btn focus:outline-none focus:border-[#1E6B2E] bg-white"
            />
            <input
              type="text"
              placeholder="Zone (ex: Bâtiment A — Vue nord)"
              value={newCamZone}
              onChange={(e) => setNewCamZone(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-[#E8E8E8] rounded-btn focus:outline-none focus:border-[#1E6B2E] bg-white"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCamera}
                disabled={!newCamName.trim() || createCam.isPending}
                className="flex-1 h-10 bg-[#1E6B2E] text-white text-sm font-semibold rounded-btn hover:bg-[#0F3D1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createCam.isPending ? 'Ajout…' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={() => { setAddingCamera(false); setNewCamName(''); setNewCamZone(''); }}
                className="px-4 h-10 border border-[#E8E8E8] text-sm text-[#555555] rounded-btn hover:bg-[#F0F0F0] transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingCamera(true)}
            className="flex items-center gap-2 w-full h-10 border border-dashed border-[#1E6B2E]/40 text-[#1E6B2E] text-sm font-medium rounded-btn hover:bg-[#EAF3DE] transition-colors justify-center"
          >
            <Plus size={15} />
            Ajouter une caméra
          </button>
        )}
      </div>
    </FarmerLayout>
  );
}
