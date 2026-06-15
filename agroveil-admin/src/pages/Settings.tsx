import AdminLayout from '../components/layout/AdminLayout';
import { Settings as SettingsIcon, Bell, Shield, Globe, Key } from 'lucide-react';

export default function Settings() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Paramètres</h2>
        <p className="text-sm text-[#888888] mt-0.5">Configuration de la plateforme AgroVeil</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Nav */}
        <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-4 h-fit">
          {[
            { icon: SettingsIcon, label: 'Général' },
            { icon: Bell, label: 'Notifications' },
            { icon: Globe, label: 'WhatsApp & SMS' },
            { icon: Shield, label: 'Sécurité' },
            { icon: Key, label: 'API & Webhooks' },
          ].map(({ icon: Icon, label }, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                i === 0
                  ? 'bg-[#EAF3DE] text-[#1E6B2E]'
                  : 'text-[#555555] hover:bg-[#F8FAF8]'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-6">
            <h3 className="font-bold text-[#1A1A1A] mb-5">Informations générales</h3>
            <div className="space-y-4">
              {[
                { label: 'Nom de la plateforme', value: 'AgroVeil', placeholder: 'AgroVeil' },
                { label: 'Email support', value: 'support@agroveil.com', placeholder: 'support@...' },
                { label: 'Région principale', value: 'Afrique Centrale', placeholder: '' },
              ].map((field, i) => (
                <div key={i}>
                  <label className="block text-xs font-semibold text-[#555555] mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    defaultValue={field.value}
                    placeholder={field.placeholder}
                    className="w-full border border-[#E8E8E8] rounded-btn px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1E6B2E]/30 focus:border-[#1E6B2E]"
                  />
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button className="px-5 py-2.5 bg-[#1E6B2E] text-white text-sm font-bold rounded-btn hover:bg-[#17521F] transition-colors">
                Sauvegarder
              </button>
            </div>
          </div>

          <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-6">
            <h3 className="font-bold text-[#1A1A1A] mb-5">Paramètres IA</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">Seuil de confiance minimum</p>
                  <p className="text-xs text-[#888888]">En dessous de ce seuil, l'alerte est ignorée</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="range" min={50} max={99} defaultValue={75} className="accent-[#1E6B2E]" />
                  <span className="text-sm font-bold text-[#1E6B2E] w-10">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">Alertes automatiques WhatsApp</p>
                  <p className="text-xs text-[#888888]">Envoyer automatiquement pour les alertes critiques</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-5 bg-[#E8E8E8] peer-checked:bg-[#1E6B2E] rounded-full transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-[#FCEBEB] border border-[#E24B4A] rounded-card p-5">
            <h3 className="font-bold text-[#A32D2D] mb-2">Zone dangereuse</h3>
            <p className="text-sm text-[#A32D2D] mb-4">Ces actions sont irréversibles. Procédez avec précaution.</p>
            <button className="px-4 py-2 border border-[#A32D2D] text-[#A32D2D] text-sm font-bold rounded-btn hover:bg-[#A32D2D] hover:text-white transition-colors">
              Réinitialiser les données démo
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
