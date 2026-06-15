import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../components/layout/AdminLayout';
import PlanBadge from '../components/ui/PlanBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getSubscriptions, getPayments } from '../api/subscriptions';
import { formatFCFA, formatDate } from '../utils/formatters';

export default function Subscriptions() {
  const { data: subs, isLoading: subsLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
    staleTime: 60_000,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
    staleTime: 60_000,
  });

  const MRR = (subs ?? []).reduce((sum, s) => sum + (s.status === 'active' ? s.price_fcfa : 0), 0);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Abonnements</h2>
        <p className="text-sm text-[#888888] mt-0.5">Gestion des plans et des paiements</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'MRR Total', value: formatFCFA(MRR), bg: 'bg-[#EAF3DE]', color: 'text-[#1E6B2E]' },
          { label: 'Abonnements actifs', value: (subs ?? []).filter((s) => s.status === 'active').length.toString(), bg: 'bg-[#E6F1FB]', color: 'text-[#0C447C]' },
          { label: 'Expirés / Suspendus', value: (subs ?? []).filter((s) => s.status !== 'active').length.toString(), bg: 'bg-[#FCEBEB]', color: 'text-[#A32D2D]' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
            <p className="text-xs text-[#888888] uppercase font-bold mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Subscriptions table */}
      <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-[#E8E8E8]">
          <h3 className="font-bold text-[#1A1A1A]">Abonnements actifs</h3>
        </div>
        {subsLoading ? (
          <div className="py-16 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAF8] border-b border-[#E8E8E8]">
                <tr className="text-[10px] text-[#888888] uppercase font-bold tracking-wider">
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Caméras max</th>
                  <th className="px-5 py-3">Prix FCFA</th>
                  <th className="px-5 py-3">Expiration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F2]">
                {(subs ?? []).map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#F8FAF8] transition-colors">
                    <td className="px-5 py-3.5"><PlanBadge plan={sub.plan} /></td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-pill ${
                        sub.status === 'active' ? 'bg-[#EAF3DE] text-[#27500A]' : 'bg-[#FCEBEB] text-[#A32D2D]'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#555555]">{sub.max_cameras}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[#1A1A1A]">
                      {formatFCFA(sub.price_fcfa)}
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
                    <td className="px-5 py-3.5 text-sm text-[#555555] capitalize">{p.method.replace('_', ' ')}</td>
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
