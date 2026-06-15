import { FarmerLayout } from '../components/layout/FarmerLayout';
import { useAuth } from '../hooks/useAuth';

export function Settings() {
  const { farmer } = useAuth();

  return (
    <FarmerLayout>
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Paramètres</h1>
      <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-6">
        <h3 className="font-semibold text-[#1A1A1A] mb-4">Mon profil</h3>
        <div className="space-y-3">
          {[
            { label: 'Nom complet', value: farmer?.full_name ?? '—' },
            { label: 'Téléphone', value: farmer?.phone ?? '—' },
            { label: 'WhatsApp', value: farmer?.whatsapp_number ?? '—' },
            { label: 'Ville', value: farmer?.city ?? '—' },
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
