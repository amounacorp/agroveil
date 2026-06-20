import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Globe, Key, Save, Eye, EyeOff, CreditCard, CheckCircle, XCircle, Check } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { useUIStore } from '../store/uiStore';
import { useSettingsStore } from '../store/settingsStore';
import { useT } from '../hooks/useT';
import { LANG_LABELS, CURRENCY_LABELS, type Lang, type Currency } from '../i18n/translations';

type Tab = 'general' | 'notifications' | 'whatsapp' | 'security' | 'api' | 'payments';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const { addToast } = useUIStore();
  const t = useT();

  const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'general',       icon: SettingsIcon, label: t.settings.tabs.general },
    { id: 'notifications', icon: Bell,         label: t.settings.tabs.notifications },
    { id: 'whatsapp',      icon: Globe,        label: t.settings.tabs.whatsapp },
    { id: 'payments',      icon: CreditCard,   label: t.settings.tabs.payments },
    { id: 'security',      icon: Shield,       label: t.settings.tabs.security },
    { id: 'api',           icon: Key,          label: t.settings.tabs.api },
  ];

  function saved() {
    addToast(t.settings.saved, 'success');
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Paramètres</h2>
        <p className="text-sm text-[#888888] mt-0.5">Configuration de la plateforme Aviora</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Nav */}
        <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-4 h-fit">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === id
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
          {activeTab === 'general'       && <TabGeneral onSave={saved} />}
          {activeTab === 'notifications' && <TabNotifications onSave={saved} />}
          {activeTab === 'whatsapp'      && <TabWhatsApp onSave={saved} />}
          {activeTab === 'payments'      && <TabPayments onSave={saved} />}
          {activeTab === 'security'      && <TabSecurity onSave={saved} />}
          {activeTab === 'api'           && <TabAPI onSave={saved} />}
        </div>
      </div>
    </AdminLayout>
  );
}

// ── Onglet Général ─────────────────────────────────────────────────────────────

function TabGeneral({ onSave }: { onSave: () => void }) {
  const t = useT();
  const { lang, currency, setLang, setCurrency } = useSettingsStore();
  const langs      = Object.entries(LANG_LABELS)      as [Lang,     string][];
  const currencies = Object.entries(CURRENCY_LABELS)  as [Currency, string][];

  return (
    <>
      <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-6">
        <h3 className="font-bold text-[#1A1A1A] mb-5">{t.settings.general.title}</h3>
        <div className="space-y-4">
          {[
            { label: t.settings.general.platformName, value: 'Aviora',              placeholder: 'Aviora'      },
            { label: t.settings.general.supportEmail,  value: 'support@Aviora.com',  placeholder: 'support@...'   },
            { label: t.settings.general.region,        value: 'Afrique Centrale',      placeholder: ''              },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-xs font-semibold text-[#555555] mb-1.5">{field.label}</label>
              <input
                type="text"
                defaultValue={field.value}
                placeholder={field.placeholder}
                className={inp}
              />
            </div>
          ))}

          {/* Language selector */}
          <div>
            <label className="block text-xs font-semibold text-[#555555] mb-0.5">{t.settings.general.language}</label>
            <p className="text-[11px] text-[#888888] mb-2">{t.settings.general.languageSub}</p>
            <div className="flex gap-2 flex-wrap">
              {langs.map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-btn text-sm font-medium border transition-colors ${
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

          {/* Currency selector */}
          <div>
            <label className="block text-xs font-semibold text-[#555555] mb-0.5">{t.settings.general.currency}</label>
            <p className="text-[11px] text-[#888888] mb-2">{t.settings.general.currencySub}</p>
            <div className="flex gap-2 flex-wrap">
              {currencies.map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-btn text-sm font-medium border transition-colors ${
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
        <div className="mt-5 flex justify-end">
          <SaveBtn onClick={onSave} label={t.common.save} />
        </div>
      </div>

      <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-6">
        <h3 className="font-bold text-[#1A1A1A] mb-5">{t.settings.ai.title}</h3>
        <div className="space-y-4">
          <ToggleRow
            label={t.settings.ai.confidenceThreshold}
            sub={t.settings.ai.confidenceSub}
            right={
              <div className="flex items-center gap-2">
                <input type="range" min={50} max={99} defaultValue={75} className="accent-[#1E6B2E]" />
                <span className="text-sm font-bold text-[#1E6B2E] w-10">75%</span>
              </div>
            }
          />
          <ToggleRow
            label={t.settings.ai.autoWhatsApp}
            sub={t.settings.ai.autoWhatsAppSub}
            right={<Toggle defaultChecked />}
          />
        </div>
      </div>

      <div className="bg-[#FCEBEB] border border-[#E24B4A] rounded-card p-5">
        <h3 className="font-bold text-[#A32D2D] mb-2">{t.settings.danger.title}</h3>
        <p className="text-sm text-[#A32D2D] mb-4">{t.settings.danger.subtitle}</p>
        <button className="px-4 py-2 border border-[#A32D2D] text-[#A32D2D] text-sm font-bold rounded-btn hover:bg-[#A32D2D] hover:text-white transition-colors">
          {t.settings.danger.resetDemo}
        </button>
      </div>
    </>
  );
}

// ── Onglet Notifications ───────────────────────────────────────────────────────

function TabNotifications({ onSave }: { onSave: () => void }) {
  return (
    <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-6">
      <h3 className="font-bold text-[#1A1A1A] mb-5">Préférences de notification</h3>
      <div className="space-y-4">
        <ToggleRow label="Alertes critiques par email"     sub="Recevoir un email pour chaque alerte critique"       right={<Toggle defaultChecked />} />
        <ToggleRow label="Résumé journalier"               sub="Récapitulatif quotidien des éleveurs et alertes"     right={<Toggle defaultChecked />} />
        <ToggleRow label="Nouveaux éleveurs"               sub="Notifier lors de l'inscription d'un nouvel éleveur"  right={<Toggle />} />
        <ToggleRow label="Expiration d'abonnement"         sub="Alerte 7 jours avant l'expiration d'un abonnement"  right={<Toggle defaultChecked />} />
        <ToggleRow label="Rapport hebdomadaire"            sub="Rapport de performance chaque lundi matin"          right={<Toggle />} />
      </div>
      <div className="mt-6 border-t border-[#E8E8E8] pt-5">
        <h4 className="text-sm font-semibold text-[#1A1A1A] mb-3">Email de notification</h4>
        <input
          type="email"
          defaultValue="admin@Aviora.com"
          className="w-full border border-[#E8E8E8] rounded-btn px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1E6B2E]/30 focus:border-[#1E6B2E]"
        />
      </div>
      <div className="mt-5 flex justify-end">
        <SaveBtn onClick={onSave} />
      </div>
    </div>
  );
}

// ── Onglet WhatsApp & SMS ──────────────────────────────────────────────────────

function TabWhatsApp({ onSave }: { onSave: () => void }) {
  return (
    <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-6">
      <h3 className="font-bold text-[#1A1A1A] mb-1">Intégration WhatsApp Business</h3>
      <p className="text-xs text-[#888888] mb-5">Configurez l'API WhatsApp Business pour envoyer des alertes aux éleveurs.</p>
      <div className="space-y-4">
        <Field label="WhatsApp API Token">
          <input type="password" defaultValue="" placeholder="EAAxxxxxx..." className={inp} />
        </Field>
        <Field label="Numéro d'envoi">
          <input type="tel" defaultValue="+242 XXXXXXXXX" className={inp} />
        </Field>
        <Field label="Template ID (alertes critiques)">
          <input type="text" defaultValue="Aviora_critical_alert" className={inp} />
        </Field>
      </div>

      <div className="mt-6 border-t border-[#E8E8E8] pt-5">
        <h4 className="text-sm font-semibold text-[#1A1A1A] mb-3">Intégration Twilio SMS</h4>
        <div className="space-y-4">
          <Field label="Account SID">
            <input type="text" defaultValue="" placeholder="ACxxxxxxxxxxxxxx" className={inp} />
          </Field>
          <Field label="Auth Token">
            <input type="password" defaultValue="" placeholder="••••••••••••••••" className={inp} />
          </Field>
          <Field label="Numéro Twilio">
            <input type="tel" defaultValue="" placeholder="+1XXXXXXXXXX" className={inp} />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button className="px-4 py-2.5 text-sm text-[#1E6B2E] border border-[#1E6B2E] rounded-btn hover:bg-[#EAF3DE] transition-colors font-semibold">
          Tester la connexion
        </button>
        <SaveBtn onClick={onSave} />
      </div>
    </div>
  );
}

// ── Onglet Paiements ──────────────────────────────────────────────────────────

interface PaymentProvider {
  id: string;
  name: string;
  logo: string;
  logoBg: string;
  logoText: string;
  description: string;
  fields: { key: string; label: string; placeholder: string; type?: string }[];
}

const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money',
    logo: 'MTN',
    logoBg: '#FFCC00',
    logoText: '#1A1A1A',
    description: 'API MTN MoMo pour collecter les paiements via Mobile Money.',
    fields: [
      { key: 'api_user',       label: 'API User (UUID)',   placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
      { key: 'api_key',        label: 'API Key',           placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password' },
      { key: 'subscription',   label: 'Subscription Key',  placeholder: 'Ocp-Apim-Subscription-Key', type: 'password' },
      { key: 'callback_url',   label: 'Callback URL',      placeholder: 'https://api.Aviora.com/webhooks/mtn' },
      { key: 'environment',    label: 'Environnement',     placeholder: 'sandbox / production' },
    ],
  },
  {
    id: 'orange_money',
    name: 'Orange Money',
    logo: 'ORG',
    logoBg: '#FF6600',
    logoText: '#FFFFFF',
    description: 'API Orange Money pour les paiements marchands en Afrique Centrale.',
    fields: [
      { key: 'client_id',      label: 'Client ID',         placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'client_secret',  label: 'Client Secret',     placeholder: '••••••••••••••••', type: 'password' },
      { key: 'merchant_key',   label: 'Merchant Key',      placeholder: 'MK_xxxxxxxxxxxxxxxxxxxx', type: 'password' },
      { key: 'callback_url',   label: 'Callback URL',      placeholder: 'https://api.Aviora.com/webhooks/orange' },
    ],
  },
  {
    id: 'airtel_money',
    name: 'Airtel Money',
    logo: 'AIR',
    logoBg: '#E40000',
    logoText: '#FFFFFF',
    description: "API Airtel Money pour les marchands en Afrique de l'Ouest et Centrale.",
    fields: [
      { key: 'client_id',      label: 'Client ID',         placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'client_secret',  label: 'Client Secret',     placeholder: '••••••••••••••••', type: 'password' },
      { key: 'country',        label: 'Code pays',         placeholder: 'CG / CD / CI ...' },
      { key: 'currency',       label: 'Devise',            placeholder: 'XAF / XOF' },
      { key: 'callback_url',   label: 'Callback URL',      placeholder: 'https://api.Aviora.com/webhooks/airtel' },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    logo: 'STR',
    logoBg: '#6772E5',
    logoText: '#FFFFFF',
    description: 'Stripe pour les paiements par carte bancaire internationale.',
    fields: [
      { key: 'publishable_key', label: 'Publishable Key',  placeholder: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'secret_key',      label: 'Secret Key',       placeholder: '••••••••••••••••••••••••', type: 'password' },
      { key: 'webhook_secret',  label: 'Webhook Secret',   placeholder: 'whsec_xxxxxxxxxxxxxxxxxxxxxxxx', type: 'password' },
    ],
  },
];

function PaymentProviderCard({ provider, onSave }: { provider: PaymentProvider; onSave: () => void }) {
  const [enabled, setEnabled] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);
  const { addToast } = useUIStore();

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    setTestResult('ok');
    setTesting(false);
    addToast(`Connexion ${provider.name} vérifiée ✓`, 'success');
  }

  return (
    <div className={`bg-white rounded-card border-2 shadow-card transition-all ${enabled ? 'border-[#1E6B2E]' : 'border-[#E8E8E8]'}`}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-[#E8E8E8]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-btn flex items-center justify-center font-black text-xs flex-shrink-0" style={{ background: provider.logoBg, color: provider.logoText }}>
            {provider.logo}
          </div>
          <div>
            <p className="font-bold text-[#1A1A1A] text-sm">{provider.name}</p>
            <p className="text-xs text-[#888888]">{provider.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {testResult === 'ok' && <CheckCircle size={16} className="text-[#1E6B2E]" />}
          {testResult === 'fail' && <XCircle size={16} className="text-[#A32D2D]" />}
          <button
            type="button"
            onClick={() => setEnabled((v) => !v)}
            className="relative inline-flex items-center flex-shrink-0"
          >
            <div className={`w-10 h-5 rounded-full transition-colors ${enabled ? 'bg-[#1E6B2E]' : 'bg-[#E8E8E8]'}`} />
            <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Fields — only shown when enabled */}
      {enabled && (
        <div className="px-5 py-4 space-y-3">
          {provider.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-[#555555] mb-1.5">{f.label}</label>
              <input
                type={f.type ?? 'text'}
                placeholder={f.placeholder}
                className="w-full border border-[#E8E8E8] rounded-btn px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1E6B2E]/30 focus:border-[#1E6B2E] font-mono placeholder:font-sans"
              />
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-[#1E6B2E] text-[#1E6B2E] rounded-btn hover:bg-[#EAF3DE] transition-colors disabled:opacity-50"
            >
              {testing ? (
                <div className="w-3 h-3 border-2 border-[#1E6B2E] border-t-transparent rounded-full animate-spin" />
              ) : null}
              Tester la connexion
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E6B2E] text-white text-xs font-bold rounded-btn hover:bg-[#17521F] transition-colors"
            >
              <Save size={12} />
              Sauvegarder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TabPayments({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-[#E6F1FB] border border-[#0C447C]/20 rounded-card px-5 py-3">
        <p className="text-xs text-[#0C447C]">
          <strong>Mode simulation</strong> — Les paiements ne sont pas encore intégrés. Configurez vos clés API ici pour activation future. Les clés sont chiffrées avant stockage.
        </p>
      </div>
      {PAYMENT_PROVIDERS.map((p) => (
        <PaymentProviderCard key={p.id} provider={p} onSave={onSave} />
      ))}
    </div>
  );
}

// ── Onglet Sécurité ────────────────────────────────────────────────────────────

function TabSecurity({ onSave }: { onSave: () => void }) {
  const [show, setShow] = useState(false);

  return (
    <>
      <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-6">
        <h3 className="font-bold text-[#1A1A1A] mb-5">Changer le mot de passe</h3>
        <div className="space-y-4">
          <Field label="Mot de passe actuel">
            <div className="relative">
              <input type={show ? 'text' : 'password'} placeholder="••••••••" className={`${inp} pr-10`} />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888]">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <Field label="Nouveau mot de passe">
            <input type="password" placeholder="Minimum 8 caractères" className={inp} />
          </Field>
          <Field label="Confirmer le nouveau mot de passe">
            <input type="password" placeholder="••••••••" className={inp} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end">
          <SaveBtn onClick={onSave} label="Changer le mot de passe" />
        </div>
      </div>

      <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-6">
        <h3 className="font-bold text-[#1A1A1A] mb-5">Sessions et accès</h3>
        <div className="space-y-4">
          <ToggleRow label="Authentification 2FA"         sub="Ajouter un second facteur via application mobile"  right={<Toggle />} />
          <ToggleRow label="Expiration de session courte" sub="Déconnexion automatique après 4h d'inactivité"     right={<Toggle defaultChecked />} />
        </div>
        <div className="mt-5 flex justify-end">
          <SaveBtn onClick={onSave} />
        </div>
      </div>
    </>
  );
}

// ── Onglet API ─────────────────────────────────────────────────────────────────

function TabAPI({ onSave }: { onSave: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const fakeKey = 'av_live_' + 'sk_9fGh3Kz8mNpQrT2xVwYcBuEjLd7aOs5i';

  return (
    <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-6">
      <h3 className="font-bold text-[#1A1A1A] mb-1">Clés API & Webhooks</h3>
      <p className="text-xs text-[#888888] mb-5">Utilisez ces clés pour connecter des services tiers à Aviora.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#555555] mb-1.5">Clé API principale</label>
          <div className="flex gap-2">
            <input
              readOnly
              value={revealed ? fakeKey : fakeKey.replace(/./g, '•').slice(0, 32) + '••••'}
              className={`${inp} font-mono text-xs flex-1`}
            />
            <button
              onClick={() => setRevealed((v) => !v)}
              className="px-3 py-2 border border-[#E8E8E8] rounded-btn text-xs text-[#555555] hover:bg-[#F8FAF8] transition-colors whitespace-nowrap"
            >
              {revealed ? 'Masquer' : 'Révéler'}
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(fakeKey); }}
              className="px-3 py-2 border border-[#E8E8E8] rounded-btn text-xs text-[#555555] hover:bg-[#F8FAF8] transition-colors"
            >
              Copier
            </button>
          </div>
        </div>

        <div className="border-t border-[#E8E8E8] pt-4">
          <label className="block text-xs font-semibold text-[#555555] mb-1.5">URL Webhook (alertes)</label>
          <input type="url" placeholder="https://votre-serveur.com/webhook/Aviora" className={inp} />
          <p className="text-[11px] text-[#888888] mt-1.5">
            Aviora enverra un POST JSON à cette URL pour chaque nouvelle alerte.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#555555] mb-1.5">Secret Webhook</label>
          <input type="password" placeholder="Utilisé pour valider la signature HMAC-SHA256" className={inp} />
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button className="px-4 py-2.5 text-sm text-[#1E6B2E] border border-[#1E6B2E] rounded-btn hover:bg-[#EAF3DE] transition-colors font-semibold">
          Regénérer la clé
        </button>
        <SaveBtn onClick={onSave} />
      </div>
    </div>
  );
}

// ── Composants partagés ────────────────────────────────────────────────────────

const inp = 'w-full border border-[#E8E8E8] rounded-btn px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1E6B2E]/30 focus:border-[#1E6B2E] transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#555555] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({ label, sub, right }: { label: string; sub: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[#1A1A1A]">{label}</p>
        <p className="text-xs text-[#888888]">{sub}</p>
      </div>
      {right}
    </div>
  );
}

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className="relative inline-flex items-center flex-shrink-0"
    >
      <div className={`w-10 h-5 rounded-full transition-colors ${on ? 'bg-[#1E6B2E]' : 'bg-[#E8E8E8]'}`} />
      <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function SaveBtn({ onClick, label = 'Sauvegarder' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#1E6B2E] text-white text-sm font-bold rounded-btn hover:bg-[#17521F] transition-colors"
    >
      <Save size={14} />
      {label}
    </button>
  );
}
