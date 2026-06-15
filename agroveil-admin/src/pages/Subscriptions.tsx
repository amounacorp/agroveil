import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Camera, Clock, TrendingUp, Users, Star, Building2, Zap } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import PlanBadge from '../components/ui/PlanBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getSubscriptions, getPlans, getPayments } from '../api/subscriptions';
import { formatFCFA, formatDate } from '../utils/formatters';
import type { PlanConfig } from '../types';

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free:        <Star size={18} className="text-[#888888]" />,
  eleveur:     <Zap size={18} className="text-[#1E6B2E]" />,
  pro:         <TrendingUp size={18} className="text-[#EF9F27]" />,
  cooperative: <Building2 size={18} className="text-[#0C447C]" />,
};

const PLAN_COLORS: Record<string, { border: string; text: string }> = {
  free:        { border: '#E0E0E0', text: '#888888' },
  eleveur:     { border: '#1E6B2E', text: '#1E6B2E' },
  pro:         { border: '#EF9F27', text: '#633806' },
  cooperative: { border: '#0C447C', text: '#0C447C' },
};

function PlanCard({ plan, subscriberCount, mrr }: { plan: PlanConfig; subscriberCount: number; mrr: number }) {
  const colors = PLAN_COLORS[plan.slug] ?? PLAN_COLORS.free;
  return (
    <div
      className="bg-white rounded-card border-2 shadow-card p-5 flex flex-col gap-3"
      style={{ borderColor: colors.border }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {PLAN_ICONS[plan.slug]}
          <span className="font-extrabold text-base" style={{ color: colors.text }}>
            {plan.name}
          </span>
        </div>
        {plan.is_cooperative ? (
          <span className="text-xs font-bold text-[#0C447C] bg-[#E6F1FB] px-2 py-0.5 rounded-pill">Sur devis</span>
        ) : (
          <span className="text-sm font-bold" style={{ color: colors.text }}>
            {plan.price_fcfa === 0 ? 'Gratuit' : `${formatFCFA(plan.price_fcfa)}/mois`}
          </span>
        )}
      </div>

      <div className="flex gap-3 text-xs text-[#555555] flex-wrap">
        <span className="flex items-center gap-1">
          <Camera size={11} />
          {plan.max_cameras === -1 ? 'Illimitées' : `${plan.max_cameras} cam.`}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {plan.history_days === -1 ? 'Illimité' : `${plan.history_days}j`}
        </span>
        {plan.addon_price_fcfa && (
          <span>+{formatFCFA(plan.addon_price_fcfa)}/cam. sup.</span>
        )}
      </div>

      <ul className="space-y-1">
        {plan.features.slice(0, 3).map((f) => (
          <li key={f} className="flex items-center gap-1.5 text-xs text-[#555555]">
            <CheckCircle size={11} className="text-[#1E6B2E] flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <div className="border-t border-[#F0F0F0] pt-3 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Users size={13} className="text-[#888888]" />
          <span className="text-sm font-bold text-[#1A1A1A]">{subscriberCount}</span>
          <span className="text-xs text-[#888888]">abonnés</span>
        </div>
        {mrr > 0 && (
          <span className="text-sm font-bold text-[#1E6B2E]">MRR {formatFCFA(mrr)}</span>
        )}
      </div>
    </div>
  );
}

function BillingSimulator() {
  const [tab, setTab] = useState<'eleveur' | 'pro'>('eleveur');

  const ELEVEUR_ROWS = [
    { cams: 3, total: 5000 },
    { cams: 4, total: 6500 },
    { cams: 5, total: 8000 },
    { cams: 8, total: 12500 },
  ];

  const PRO_ROWS = [
    { cams: 10, total: 15000 },
    { cams: 15, total: 20000 },
    { cams: 20, total: 25000 },
    { cams: 30, total: 35000 },
    { cams: 50, total: 55000 },
  ];

  const rows = tab === 'eleveur' ? ELEVEUR_ROWS : PRO_ROWS;

  return (
    <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5 h-full">
      <h3 className="font-bold text-[#1A1A1A] mb-4">Simulateur de facturation</h3>
      <div className="flex gap-2 mb-4">
        {(['eleveur', 'pro'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setTab(p)}
            className={`px-4 py-1.5 rounded-btn text-sm font-bold transition-colors ${
              tab === p ? 'bg-[#1E6B2E] text-white' : 'bg-[#F2F2F2] text-[#555555] hover:bg-[#E8E8E8]'
            }`}
          >
            {p === 'eleveur' ? 'ÉLEVEUR' : 'PRO'}
          </button>
        ))}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-[#888888] uppercase font-bold bg-[#F8FAF8]">
            <th className="text-left px-3 py-2">Caméras</th>
            <th className="text-left px-3 py-2">Base</th>
            <th className="text-left px-3 py-2">Addon</th>
            <th className="text-right px-3 py-2 text-[#1E6B2E]">Total/mois</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const base = tab === 'eleveur' ? 5000 : 15000;
            const baseMax = tab === 'eleveur' ? 3 : 10;
            const addonPrice = tab === 'eleveur' ? 1500 : 1000;
            const addon = Math.max(0, r.cams - baseMax) * addonPrice;
            return (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAF8]'}>
                <td className="px-3 py-2 font-medium">{r.cams} cam.</td>
                <td className="px-3 py-2 text-[#888888]">{formatFCFA(base)}</td>
                <td className="px-3 py-2 text-[#888888]">{addon > 0 ? `+${formatFCFA(addon)}` : '—'}</td>
                <td className="px-3 py-2 text-right font-bold text-[#1E6B2E]">{formatFCFA(r.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Subscriptions() {
  const { data: subs, isLoading: subsLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
    staleTime: 60_000,
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
    staleTime: 300_000,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
    staleTime: 60_000,
  });

  const activeSubs = (subs ?? []).filter((s) => s.status === 'active');
  const MRR = activeSubs.reduce((sum, s) => sum + s.price_fcfa, 0);

  const planStats = (plans ?? []).map((p) => ({
    plan: p,
    count: activeSubs.filter((s) => s.plan === p.slug).length,
    mrr: activeSubs.filter((s) => s.plan === p.slug).reduce((sum, s) => sum + s.price_fcfa, 0),
  }));

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Abonnements</h2>
        <p className="text-sm text-[#888888] mt-0.5">Gestion des plans et des paiements</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'MRR Total', value: formatFCFA(MRR), bg: 'bg-[#EAF3DE]', color: 'text-[#1E6B2E]' },
          { label: 'Abonnements actifs', value: activeSubs.length.toString(), bg: 'bg-[#E6F1FB]', color: 'text-[#0C447C]' },
          { label: 'Expirés / Suspendus', value: ((subs ?? []).length - activeSubs.length).toString(), bg: 'bg-[#FCEBEB]', color: 'text-[#A32D2D]' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
            <p className="text-xs text-[#888888] uppercase font-bold mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Plan cards */}
      {plansLoading ? (
        <div className="py-8 flex justify-center"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {planStats.map(({ plan, count, mrr }) => (
            <PlanCard key={plan.slug} plan={plan} subscriberCount={count} mrr={mrr} />
          ))}
        </div>
      )}

      {/* Payment methods */}
      <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5 mb-6">
        <h3 className="font-bold text-[#1A1A1A] mb-3">Moyens de paiement acceptés</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'MTN Mobile Money', bg: '#FFCC00', text: '#1A1A1A', abbr: 'MTN' },
            { label: 'Orange Money', bg: '#FF6600', text: '#FFF', abbr: 'ORG' },
            { label: 'Airtel Money', bg: '#E40000', text: '#FFF', abbr: 'AIR' },
            { label: 'Stripe (carte)', bg: '#6772E5', text: '#FFF', abbr: 'STR' },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-2 px-3 py-2 rounded-btn border border-[#E8E8E8]">
              <div className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-black" style={{ background: m.bg, color: m.text }}>{m.abbr}</div>
              <span className="text-sm font-medium text-[#1A1A1A]">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions table + billing simulator */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-5">
        <div className="xl:col-span-8">
          <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8E8E8]">
              <h3 className="font-bold text-[#1A1A1A]">Abonnements</h3>
            </div>
            {subsLoading ? (
              <div className="py-16 flex justify-center"><LoadingSpinner /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAF8] border-b border-[#E8E8E8]">
                    <tr className="text-[10px] text-[#888888] uppercase font-bold tracking-wider">
                      <th className="px-5 py-3">Éleveur</th>
                      <th className="px-5 py-3">Plan</th>
                      <th className="px-5 py-3">Statut</th>
                      <th className="px-5 py-3">Caméras</th>
                      <th className="px-5 py-3">Prix</th>
                      <th className="px-5 py-3">Expiration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F2F2]">
                    {(subs ?? []).map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#F8FAF8] transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-[#1A1A1A]">{sub.farmer_name || sub.farmer_id}</p>
                          {sub.farmer_phone && <p className="text-xs text-[#888888]">{sub.farmer_phone}</p>}
                        </td>
                        <td className="px-5 py-3.5"><PlanBadge plan={sub.plan} /></td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-pill ${
                            sub.status === 'active' ? 'bg-[#EAF3DE] text-[#27500A]' : 'bg-[#FCEBEB] text-[#A32D2D]'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#555555]">
                          {sub.max_cameras < 0 ? '∞' : sub.max_cameras}
                          {sub.addon_cameras > 0 && (
                            <span className="text-xs text-[#888888] ml-1">(+{sub.addon_cameras})</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-[#1A1A1A]">
                          {sub.price_fcfa === 0 ? '—' : formatFCFA(sub.price_fcfa)}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#888888]">
                          {formatDate(sub.expires_at).split(' à')[0]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-4">
          <BillingSimulator />
        </div>
      </div>

      {/* Payments table */}
      <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8E8E8]">
          <h3 className="font-bold text-[#1A1A1A]">Derniers paiements</h3>
        </div>
        {paymentsLoading ? (
          <div className="py-16 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAF8] border-b border-[#E8E8E8]">
                <tr className="text-[10px] text-[#888888] uppercase font-bold tracking-wider">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Méthode</th>
                  <th className="px-5 py-3">Montant</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F2]">
                {(payments ?? []).map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAF8] transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-[#888888]">{p.id}</td>
                    <td className="px-5 py-3.5 text-sm text-[#555555] capitalize">{p.method.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-[#1A1A1A]">{formatFCFA(p.amount_fcfa)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-pill ${
                        p.status === 'completed' ? 'bg-[#EAF3DE] text-[#27500A]' : 'bg-[#FCEBEB] text-[#A32D2D]'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#888888]">
                      {formatDate(p.paid_at).split(' à')[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
