import { CheckCircle, XCircle, Zap, ExternalLink } from 'lucide-react';
import { FarmerLayout } from '../components/layout/FarmerLayout';
import { PlanBadge } from '../components/ui/PlanBadge';
import { useUIStore } from '../store/uiStore';
import { mockSubscription, mockPayments } from '../api/mockData';
import { formatFCFA, formatDate } from '../utils/formatters';
import { MOBILE_MONEY_BRANDS } from '../utils/constants';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const ELEVEUR_FEATURES = [
  { label: '3 caméras maximum', included: true },
  { label: 'Alertes WhatsApp illimitées', included: true },
  { label: 'Historique 90 jours', included: true },
  { label: 'Rapports PDF automatiques', included: true },
  { label: 'Multi-bâtiments (Plan Pro)', included: false },
  { label: 'API publique (Plan Pro)', included: false },
];

function formatExpiryDate(iso: string) {
  return format(parseISO(iso), "d MMMM yyyy", { locale: fr });
}

export function Subscription() {
  const { addToast } = useUIStore();
  const sub = mockSubscription;
  const payments = mockPayments;

  const handleUpgrade = () => {
    addToast('Redirection vers le paiement...', 'info');
  };

  return (
    <FarmerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Mon Abonnement</h1>
        <p className="text-sm text-[#888888] mt-0.5">Gérez vos forfaits et paiements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Current plan */}
          <section
            className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-6 relative overflow-hidden"
            style={{ borderLeft: '4px solid #1E6B2E' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none">
              <div className="w-full h-full bg-[#1E6B2E] rounded-full translate-x-8 -translate-y-8" />
            </div>
            <PlanBadge plan={sub.plan} size="lg" />
            <div className="mt-3 mb-1">
              <span className="text-4xl font-bold text-[#1E6B2E]">{formatFCFA(sub.price_fcfa)}</span>
              <span className="text-base text-[#888888] ml-1">/ mois</span>
            </div>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 bg-[#27500A] rounded-full" />
              <p className="text-sm font-medium text-[#27500A]">
                Actif jusqu'au {formatExpiryDate(sub.expires_at)}
              </p>
            </div>
            <div className="border-t border-[#E8E8E8] pt-4 mb-5 space-y-2">
              {ELEVEUR_FEATURES.map(({ label, included }) => (
                <div key={label} className="flex items-center gap-2">
                  {included ? (
                    <CheckCircle size={16} className="text-[#1E6B2E] flex-shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-[#CCCCCC] flex-shrink-0" />
                  )}
                  <span className={`text-sm ${included ? 'text-[#1A1A1A]' : 'text-[#AAAAAA]'}`}>{label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleUpgrade}
              className="w-full h-12 bg-[#EF9F27] text-[#1A1A1A] font-bold rounded-btn flex items-center justify-center gap-2 hover:bg-[#d88f1a] transition-colors"
            >
              <Zap size={16} /> Passer au Plan Pro
            </button>
          </section>

          {/* Payment methods */}
          <section className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-5">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">Mes moyens de paiement</h3>
            <div className="space-y-3">
              {Object.entries(MOBILE_MONEY_BRANDS).map(([key, brand]) => {
                const isActive = key === 'mtn_momo';
                return (
                  <div key={key} className={`flex items-center gap-3 p-3 rounded-btn border ${isActive ? 'border-[#1E6B2E] bg-[#EAF3DE]/30' : 'border-[#E8E8E8]'}`}>
                    <div className="w-11 h-11 rounded-btn flex items-center justify-center font-black text-xs" style={{ backgroundColor: brand.bg, color: brand.text }}>
                      {key === 'mtn_momo' ? 'MTN' : key === 'orange_money' ? 'ORG' : 'AIR'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{brand.label}</p>
                      {isActive && <p className="text-xs text-[#1E6B2E]">Actif par défaut</p>}
                    </div>
                    {isActive ? (
                      <CheckCircle size={18} className="text-[#1E6B2E]" />
                    ) : (
                      <button className="text-xs border border-[#E8E8E8] px-3 py-1.5 rounded-btn text-[#555555] hover:border-[#1E6B2E] hover:text-[#1E6B2E] transition-colors">
                        Ajouter
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Payment history */}
          <section className="bg-white rounded-card shadow-card border border-[#E8E8E8] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8E8E8]">
              <h3 className="font-semibold text-[#1A1A1A]">Historique des paiements</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8FAF8] text-[#888888] text-xs uppercase">
                    <th className="text-left px-5 py-3 font-medium">Date</th>
                    <th className="text-right px-5 py-3 font-medium">Montant</th>
                    <th className="text-center px-5 py-3 font-medium">Méthode</th>
                    <th className="text-center px-5 py-3 font-medium">Statut</th>
                    <th className="text-center px-5 py-3 font-medium">Reçu</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => {
                    const brand = MOBILE_MONEY_BRANDS[p.method];
                    return (
                      <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAF8]'}>
                        <td className="px-5 py-3 text-[#555555]">{formatDate(p.paid_at)}</td>
                        <td className="px-5 py-3 text-right font-medium text-[#1A1A1A]">{formatFCFA(p.amount_fcfa)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: brand.bg, color: brand.text }}>
                            {brand.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="text-xs font-medium text-[#27500A] bg-[#EAF3DE] px-2 py-0.5 rounded-pill">
                            Payé ✓
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button className="text-[#1E6B2E] hover:underline flex items-center gap-1 mx-auto text-xs">
                            PDF <ExternalLink size={10} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right column — upgrade card */}
        <div className="lg:col-span-5">
          <section className="bg-[#FAEEDA] rounded-card p-6 text-center sticky top-24">
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="text-xl font-extrabold text-[#633806] mb-1">Plan Pro</h3>
            <p className="text-sm text-[#854F0B] mb-4">
              IA prédictive · Multi-bâtiments · Support vétérinaire 24/7
            </p>
            <p className="text-4xl font-bold text-[#854F0B] mb-1">{formatFCFA(15000)}</p>
            <p className="text-sm text-[#854F0B] mb-6">/ mois</p>
            <div className="space-y-3">
              <button
                onClick={handleUpgrade}
                className="w-full h-12 bg-[#EF9F27] text-[#1A1A1A] font-bold rounded-btn flex items-center justify-center gap-2 hover:bg-[#d88f1a] transition-colors"
              >
                Upgrader avec MTN MoMo
              </button>
              <p className="text-xs text-[#888888]">ou Orange Money · Airtel Money</p>
            </div>
          </section>
        </div>
      </div>
    </FarmerLayout>
  );
}
