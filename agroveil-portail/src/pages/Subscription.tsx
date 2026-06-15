import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Camera, Clock, Zap, Star, TrendingUp, Building2, ExternalLink, Plus, Minus, CreditCard } from 'lucide-react';
import { FarmerLayout } from '../components/layout/FarmerLayout';
import { PlanBadge } from '../components/ui/PlanBadge';
import { useUIStore } from '../store/uiStore';
import { getMySubscription, getPlans, requestUpgrade } from '../api/subscriptions';
import { mockPayments } from '../api/mockData';
import { formatFCFA, formatDate } from '../utils/formatters';
import { MOBILE_MONEY_BRANDS } from '../utils/constants';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { PlanConfig } from '../types';

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free:        <Star size={20} />,
  eleveur:     <Zap size={20} />,
  pro:         <TrendingUp size={20} />,
  cooperative: <Building2 size={20} />,
};

const PLAN_ACCENT: Record<string, string> = {
  free:        '#888888',
  eleveur:     '#1E6B2E',
  pro:         '#EF9F27',
  cooperative: '#0C447C',
};

const PLAN_ORDER = ['free', 'eleveur', 'pro', 'cooperative'];

function formatExpiryDate(iso: string) {
  return format(parseISO(iso), "d MMMM yyyy", { locale: fr });
}

interface UpgradeModalProps {
  plan: PlanConfig;
  currentPlan: string;
  onClose: () => void;
}

function UpgradeModal({ plan, currentPlan, onClose }: UpgradeModalProps) {
  const { addToast } = useUIStore();
  const [addonCams, setAddonCams] = useState(0);
  const [payMethod, setPayMethod] = useState<string>('mtn_momo');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const addonCost = plan.addon_price_fcfa ? addonCams * plan.addon_price_fcfa : 0;
  const total = plan.price_fcfa + addonCost;
  const totalCams = plan.max_cameras > 0 ? plan.max_cameras + addonCams : -1;
  const accent = PLAN_ACCENT[plan.slug] ?? '#1E6B2E';

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await requestUpgrade({ plan: plan.slug, addon_cameras: addonCams, payment_method: payMethod });
      setResult(res.message);
      addToast(res.status === 'quote_requested' ? 'Demande de devis envoyée !' : 'Demande d\'upgrade soumise !', 'success');
    } catch {
      addToast('Erreur lors de la demande. Réessayez.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-card shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-[#E8E8E8] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: accent + '20', color: accent }}>
            {PLAN_ICONS[plan.slug]}
          </div>
          <div>
            <h3 className="font-bold text-[#1A1A1A]">Passer au Plan {plan.name}</h3>
            <p className="text-xs text-[#888888]">Actuel : {currentPlan.toUpperCase()}</p>
          </div>
        </div>

        {result ? (
          <div className="p-6">
            <div className="bg-[#EAF3DE] rounded-btn p-4 mb-4">
              <p className="text-sm text-[#1E6B2E] font-medium">{result}</p>
            </div>
            <button onClick={onClose} className="w-full h-11 bg-[#1E6B2E] text-white font-bold rounded-btn">Fermer</button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {!plan.is_cooperative && (
              <>
                {plan.addon_price_fcfa && (
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A] mb-2">
                      Caméras supplémentaires <span className="text-xs text-[#888888] font-normal">(+{formatFCFA(plan.addon_price_fcfa)}/cam.)</span>
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAddonCams(Math.max(0, addonCams - 1))}
                        className="w-9 h-9 rounded-full border border-[#E8E8E8] flex items-center justify-center text-[#555555] hover:border-[#1E6B2E] hover:text-[#1E6B2E] transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-12 text-center text-lg font-bold text-[#1A1A1A]">{addonCams}</span>
                      <button
                        onClick={() => setAddonCams(addonCams + 1)}
                        className="w-9 h-9 rounded-full border border-[#E8E8E8] flex items-center justify-center text-[#555555] hover:border-[#1E6B2E] hover:text-[#1E6B2E] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                      <span className="text-sm text-[#888888]">
                        = {totalCams} caméra{totalCams > 1 ? 's' : ''} au total
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-[#F8FAF8] rounded-btn p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Plan {plan.name}</span>
                    <span className="font-medium">{formatFCFA(plan.price_fcfa)}</span>
                  </div>
                  {addonCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#888888]">{addonCams} cam. × {formatFCFA(plan.addon_price_fcfa!)}</span>
                      <span className="font-medium">+{formatFCFA(addonCost)}</span>
                    </div>
                  )}
                  <div className="border-t border-[#E8E8E8] pt-2 flex justify-between font-bold" style={{ color: accent }}>
                    <span>Total / mois</span>
                    <span>{formatFCFA(total)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A] mb-2">Moyen de paiement</p>
                  <div className="space-y-2">
                    {Object.entries(MOBILE_MONEY_BRANDS).map(([key, brand]) => (
                      <label key={key} className={`flex items-center gap-3 p-3 rounded-btn border cursor-pointer transition-colors ${payMethod === key ? 'border-[#1E6B2E] bg-[#EAF3DE]/30' : 'border-[#E8E8E8] hover:border-[#CCCCCC]'}`}>
                        <input type="radio" name="payment" value={key} checked={payMethod === key} onChange={() => setPayMethod(key)} className="sr-only" />
                        <div className="w-10 h-10 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{ background: brand.bg, color: brand.text }}>
                          {key === 'mtn_momo' ? 'MTN' : key === 'orange_money' ? 'ORG' : key === 'airtel_money' ? 'AIR' : 'STR'}
                        </div>
                        <span className="text-sm font-medium text-[#1A1A1A]">{brand.label}</span>
                        {payMethod === key && <CheckCircle size={16} className="text-[#1E6B2E] ml-auto" />}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {plan.is_cooperative && (
              <div className="bg-[#E6F1FB] rounded-btn p-4">
                <p className="text-sm text-[#0C447C]">
                  Le plan Coopérative est sur devis. Notre équipe vous contactera pour établir une offre personnalisée.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 h-11 border border-[#E8E8E8] text-[#555555] font-medium rounded-btn hover:border-[#CCCCCC] transition-colors">
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 h-11 text-white font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                style={{ background: accent }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : plan.is_cooperative ? (
                  'Demander un devis'
                ) : (
                  <><CreditCard size={16} /> Confirmer</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Subscription() {
  const { addToast } = useUIStore();
  const [upgradePlan, setUpgradePlan] = useState<PlanConfig | null>(null);

  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: getMySubscription,
    staleTime: 60_000,
    retry: 1,
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
    staleTime: 300_000,
  });

  const payments = mockPayments;
  const currentPlanSlug = sub?.plan ?? 'free';
  const currentAccent = PLAN_ACCENT[currentPlanSlug] ?? '#1E6B2E';
  const currentPlanIndex = PLAN_ORDER.indexOf(currentPlanSlug);

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
          {subLoading ? (
            <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-6 animate-pulse h-48" />
          ) : sub ? (
            <section
              className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-6"
              style={{ borderLeft: `4px solid ${currentAccent}` }}
            >
              <PlanBadge plan={sub.plan} size="lg" />
              {sub.price_fcfa > 0 ? (
                <div className="mt-3 mb-1">
                  <span className="text-4xl font-bold" style={{ color: currentAccent }}>{formatFCFA(sub.price_fcfa)}</span>
                  <span className="text-base text-[#888888] ml-1">/ mois</span>
                </div>
              ) : (
                <p className="mt-3 text-2xl font-bold" style={{ color: currentAccent }}>
                  {sub.plan === 'free' ? 'Gratuit' : 'Sur devis'}
                </p>
              )}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full" style={{ background: currentAccent }} />
                <p className="text-sm font-medium" style={{ color: currentAccent }}>
                  {sub.status === 'active' ? `Actif jusqu'au ${formatExpiryDate(sub.expires_at)}` : `Statut : ${sub.status}`}
                </p>
              </div>
              <div className="flex gap-4 text-sm text-[#555555] flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Camera size={14} />
                  {sub.max_cameras < 0 ? 'Illimitées' : `${sub.max_cameras + sub.addon_cameras} caméra${sub.max_cameras + sub.addon_cameras > 1 ? 's' : ''}`}
                  {sub.addon_cameras > 0 && <span className="text-xs text-[#888888]">(+{sub.addon_cameras} addon)</span>}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {sub.history_days < 0 ? 'Historique illimité' : `Historique ${sub.history_days}j`}
                </span>
              </div>
            </section>
          ) : (
            <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-6 text-center text-[#888888]">
              Aucun abonnement trouvé.
            </div>
          )}

          {/* Payment methods */}
          <section className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-5">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">Moyens de paiement acceptés</h3>
            <div className="space-y-3">
              {Object.entries(MOBILE_MONEY_BRANDS).map(([key, brand]) => (
                <div key={key} className="flex items-center gap-3 p-3 rounded-btn border border-[#E8E8E8]">
                  <div className="w-11 h-11 rounded-btn flex items-center justify-center font-black text-xs" style={{ backgroundColor: brand.bg, color: brand.text }}>
                    {key === 'mtn_momo' ? 'MTN' : key === 'orange_money' ? 'ORG' : key === 'airtel_money' ? 'AIR' : 'STR'}
                  </div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{brand.label}</p>
                </div>
              ))}
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
                    const brand = MOBILE_MONEY_BRANDS[p.method] ?? MOBILE_MONEY_BRANDS.mtn_momo;
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
                          <button
                            className="text-[#1E6B2E] hover:underline flex items-center gap-1 mx-auto text-xs"
                            onClick={() => addToast('Fonctionnalité bientôt disponible', 'info')}
                          >
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

        {/* Right column — plan comparison */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-bold text-[#1A1A1A]">Tous les plans</h3>
          {plansLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-card border border-[#E8E8E8] p-4 animate-pulse h-32" />
              ))}
            </div>
          ) : (
            (plans ?? []).map((plan) => {
              const isCurrent = plan.slug === currentPlanSlug;
              const isUpgrade = PLAN_ORDER.indexOf(plan.slug) > currentPlanIndex;
              const accent = PLAN_ACCENT[plan.slug] ?? '#888888';

              return (
                <div
                  key={plan.slug}
                  className={`bg-white rounded-card p-4 transition-all border-2 ${isCurrent ? 'shadow-md' : 'border-[#E8E8E8]'}`}
                  style={isCurrent ? { borderColor: accent } : {}}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div style={{ color: accent }}>{PLAN_ICONS[plan.slug]}</div>
                      <span className="font-bold text-sm" style={{ color: accent }}>{plan.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-pill text-white" style={{ background: accent }}>
                          Actuel
                        </span>
                      )}
                    </div>
                    {plan.is_cooperative ? (
                      <span className="text-sm font-bold text-[#0C447C]">Sur devis</span>
                    ) : (
                      <span className="text-sm font-bold" style={{ color: plan.price_fcfa === 0 ? '#888888' : accent }}>
                        {plan.price_fcfa === 0 ? 'Gratuit' : `${formatFCFA(plan.price_fcfa)}/mois`}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3 text-xs text-[#888888] mb-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Camera size={11} />
                      {plan.max_cameras < 0 ? '∞' : plan.max_cameras} cam.
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {plan.history_days < 0 ? '∞' : plan.history_days}j
                    </span>
                    {plan.addon_price_fcfa && (
                      <span>+{formatFCFA(plan.addon_price_fcfa)}/cam. sup.</span>
                    )}
                  </div>

                  <ul className="space-y-1 mb-3">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-center gap-1.5 text-xs ${isUpgrade || isCurrent ? 'text-[#1A1A1A]' : 'text-[#AAAAAA]'}`}>
                        {isUpgrade || isCurrent ? (
                          <CheckCircle size={11} className="text-[#1E6B2E] flex-shrink-0" />
                        ) : (
                          <XCircle size={11} className="text-[#CCCCCC] flex-shrink-0" />
                        )}
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isUpgrade && (
                    <button
                      onClick={() => setUpgradePlan(plan)}
                      className="w-full h-9 text-white text-sm font-bold rounded-btn flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                      style={{ background: accent }}
                    >
                      <Zap size={14} /> Passer à {plan.name}
                    </button>
                  )}
                  {isCurrent && (
                    <div className="w-full h-9 bg-[#F8FAF8] rounded-btn flex items-center justify-center text-sm font-medium" style={{ color: accent }}>
                      ✓ Plan actif
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {upgradePlan && (
        <UpgradeModal
          plan={upgradePlan}
          currentPlan={currentPlanSlug}
          onClose={() => setUpgradePlan(null)}
        />
      )}
    </FarmerLayout>
  );
}
