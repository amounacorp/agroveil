import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Eye, EyeOff, AlertCircle, Mail, Phone, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';
import { requestOTP, verifyOTP, loginWithEmail, loginWithGoogle, registerFarmer } from '../api/auth';
import type { RegisterRequest } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { COUNTRY_CODES } from '../utils/constants';

// ── Schemas ────────────────────────────────────────────────────────────────────
const phoneSchema = z.object({ phone: z.string().min(6, 'Numéro invalide').max(15, 'Numéro trop long') });
const emailSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
const registerSchema = z.object({
  full_name: z.string().min(2, 'Minimum 2 caractères'),
  country: z.string().min(2, 'Pays requis'),
  phone: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(6, 'Minimum 6 caractères'),
}).refine(
  (d) => {
    const hasPhone = (d.phone?.trim().replace(/\D/g, '').length ?? 0) > 4;
    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email?.trim() ?? '');
    return hasPhone || hasEmail;
  },
  { message: 'Entrez votre téléphone ou votre email', path: ['phone'] },
).refine(
  (d) => !d.email?.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()),
  { message: 'Format email invalide', path: ['email'] },
);

type PhoneForm = z.infer<typeof phoneSchema>;
type EmailForm = z.infer<typeof emailSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type Method = 'phone' | 'email';
type Mode = 'login' | 'register';

export function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [method, setMethod] = useState<Method>('phone');
  const [phoneStep, setPhoneStep] = useState<'phone' | 'otp'>('phone');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountry, setShowCountry] = useState(false);
  const [regCountry, setRegCountry] = useState(COUNTRY_CODES[0]);
  const [showRegCountry, setShowRegCountry] = useState(false);
  const [fullPhone, setFullPhone] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { country: COUNTRY_CODES[0].iso },
  });

  useEffect(() => {
    registerForm.setValue('country', regCountry.iso);
  }, [regCountry, registerForm]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function switchMethod(m: Method) {
    setMethod(m);
    setError('');
    setPhoneStep('phone');
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError('');
    setPhoneStep('phone');
    setOtpDigits(['', '', '', '', '', '']);
  }

  async function finishAuth(token: string, farmer: Parameters<typeof setAuth>[0]) {
    setAuth(farmer, token);
    navigate('/');
  }

  // ── Phone / OTP ────────────────────────────────────────────────────────────
  const onPhoneSubmit = async ({ phone }: PhoneForm) => {
    setLoading(true);
    setError('');
    try {
      const full = `${selectedCountry.code}${phone.replace(/\s/g, '')}`;
      setFullPhone(full);
      await requestOTP(full);
      setPhoneStep('otp');
      setCountdown(60);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const onOtpSubmit = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const { farmer, token } = await verifyOTP(fullPhone, code);
      await finishAuth(token, farmer);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await requestOTP(fullPhone);
      setCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  // ── Email / Password ───────────────────────────────────────────────────────
  const onEmailSubmit = async ({ email, password }: EmailForm) => {
    setLoading(true);
    setError('');
    try {
      const { farmer, token } = await loginWithEmail(email, password);
      await finishAuth(token, farmer);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // ── Google ─────────────────────────────────────────────────────────────────
  const onGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    setError('');
    try {
      const { farmer, token } = await loginWithGoogle(credentialResponse.credential);
      await finishAuth(token, farmer);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur Google');
    } finally {
      setLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const onRegisterSubmit = async (values: RegisterForm) => {
    setLoading(true);
    setError('');
    try {
      const phone = (values.phone?.trim().replace(/\D/g, '').length ?? 0) > 4
        ? `${regCountry.code}${values.phone!.replace(/\s/g, '')}`
        : undefined;
      const req: RegisterRequest = {
        full_name: values.full_name.trim(),
        country: values.country,
        password: values.password,
      };
      if (phone) req.phone = phone;
      if (values.email?.trim()) req.email = values.email.trim();
      const { farmer, token } = await registerFarmer(req);
      await finishAuth(token, farmer);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-8">

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <img
              src={`${import.meta.env.BASE_URL}logo_aviora.png`}
              alt="Aviora"
              className="h-14 w-auto mb-3"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              {mode === 'register' ? 'Créer un compte' : 'Bienvenue'}
            </h2>
            <p className="text-sm text-[#888888] mt-0.5 text-center">
              {mode === 'register'
                ? 'Rejoignez Aviora gratuitement'
                : 'Connectez-vous à votre espace éleveur'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-[#FCEBEB] border border-[#E24B4A] text-[#A32D2D] text-sm px-3 py-2.5 rounded-btn">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── LOGIN MODE ─────────────────────────────────────────────────── */}
          {mode === 'login' && (
            <>
              {/* Google button */}
              <div className="mb-5">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => setError('Connexion Google annulée ou échouée')}
                  width="100%"
                  text="continue_with"
                  shape="rectangular"
                  logo_alignment="center"
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[#E8E8E8]" />
                <span className="text-xs text-[#888888] font-medium">ou</span>
                <div className="flex-1 h-px bg-[#E8E8E8]" />
              </div>

              {/* Method tabs */}
              <div className="flex bg-[#F8FAF8] border border-[#E8E8E8] rounded-btn p-1 mb-5">
                <button
                  onClick={() => switchMethod('phone')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-all ${
                    method === 'phone'
                      ? 'bg-white shadow-sm text-[#1E6B2E] font-bold'
                      : 'text-[#888888] hover:text-[#555555]'
                  }`}
                >
                  <Phone size={14} /> Téléphone
                </button>
                <button
                  onClick={() => switchMethod('email')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-all ${
                    method === 'email'
                      ? 'bg-white shadow-sm text-[#1E6B2E] font-bold'
                      : 'text-[#888888] hover:text-[#555555]'
                  }`}
                >
                  <Mail size={14} /> Email
                </button>
              </div>

              {/* Phone method */}
              {method === 'phone' && phoneStep === 'phone' && (
                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Numéro de téléphone</label>
                  <div className="flex gap-2 mb-5">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountry(!showCountry)}
                        className="h-12 px-3 border border-[#E8E8E8] rounded-btn flex items-center gap-1 text-sm font-medium bg-white hover:border-[#1E6B2E] transition-colors"
                      >
                        <span className="text-base">{selectedCountry.flag}</span>
                        <span className="text-xs font-semibold text-[#555555]">{selectedCountry.code}</span>
                        <ChevronDown size={13} className="text-[#888888]" />
                      </button>
                      {showCountry && (
                        <div className="absolute top-14 left-0 z-50 bg-white border border-[#E8E8E8] rounded-card shadow-card w-52 max-h-60 overflow-y-auto">
                          {COUNTRY_CODES.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => { setSelectedCountry(c); setShowCountry(false); }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#EAF3DE] flex items-center gap-2"
                            >
                              <span>{c.flag}</span>
                              <span className="flex-1">{c.name}</span>
                              <span className="text-[#888888] text-xs">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      {...phoneForm.register('phone')}
                      type="tel"
                      placeholder="06 XXX XXXX"
                      className="flex-1 h-12 px-4 border border-[#E8E8E8] rounded-btn text-sm focus:outline-none focus:border-[#1E6B2E] transition-colors"
                    />
                  </div>
                  {phoneForm.formState.errors.phone && (
                    <p className="text-xs text-[#A32D2D] -mt-3 mb-4">{phoneForm.formState.errors.phone.message}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#1E6B2E] text-white font-semibold rounded-btn hover:bg-[#0F3D1A] transition-colors disabled:opacity-60"
                  >
                    {loading ? 'Envoi...' : 'Recevoir mon code'}
                  </button>
                </form>
              )}

              {/* OTP step */}
              {method === 'phone' && phoneStep === 'otp' && (
                <div>
                  <p className="text-sm text-[#555555] text-center mb-4">
                    Code envoyé au <span className="font-semibold text-[#1A1A1A]">{fullPhone}</span>
                  </p>
                  <div className="flex justify-center gap-2 mb-6" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-11 h-12 border-2 border-[#E8E8E8] rounded-btn text-center text-lg font-bold focus:outline-none focus:border-[#1E6B2E] transition-colors"
                      />
                    ))}
                  </div>
                  <button
                    onClick={onOtpSubmit}
                    disabled={loading || otpDigits.join('').length !== 6}
                    className="w-full h-12 bg-[#1E6B2E] text-white font-semibold rounded-btn hover:bg-[#0F3D1A] transition-colors disabled:opacity-60 mb-3"
                  >
                    {loading ? 'Vérification...' : 'Valider le code'}
                  </button>
                  <button
                    onClick={resendOTP}
                    disabled={countdown > 0 || loading}
                    className="w-full text-sm text-center text-[#1E6B2E] disabled:text-[#888888] transition-colors mb-2"
                  >
                    {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer le code'}
                  </button>
                  <button
                    onClick={() => { setPhoneStep('phone'); setError(''); setOtpDigits(['', '', '', '', '', '']); }}
                    className="w-full text-sm text-center text-[#888888] hover:text-[#1A1A1A]"
                  >
                    ← Modifier le numéro
                  </button>
                </div>
              )}

              {/* Email method */}
              {method === 'email' && (
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Adresse email</label>
                    <input
                      {...emailForm.register('email')}
                      type="email"
                      placeholder="vous@exemple.com"
                      className="w-full h-12 px-4 border border-[#E8E8E8] rounded-btn text-sm focus:outline-none focus:border-[#1E6B2E] transition-colors"
                    />
                    {emailForm.formState.errors.email && (
                      <p className="text-xs text-[#A32D2D] mt-1">{emailForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Mot de passe</label>
                    <div className="relative">
                      <input
                        {...emailForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full h-12 px-4 pr-11 border border-[#E8E8E8] rounded-btn text-sm focus:outline-none focus:border-[#1E6B2E] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#555555]"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {emailForm.formState.errors.password && (
                      <p className="text-xs text-[#A32D2D] mt-1">{emailForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#1E6B2E] text-white font-semibold rounded-btn hover:bg-[#0F3D1A] transition-colors disabled:opacity-60"
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ── REGISTER MODE ──────────────────────────────────────────────── */}
          {mode === 'register' && (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              {/* Nom complet */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Nom complet</label>
                <input
                  {...registerForm.register('full_name')}
                  type="text"
                  placeholder="Jean Mbemba"
                  autoComplete="name"
                  className="w-full h-12 px-4 border border-[#E8E8E8] rounded-btn text-sm focus:outline-none focus:border-[#1E6B2E] transition-colors"
                />
                {registerForm.formState.errors.full_name && (
                  <p className="text-xs text-[#A32D2D] mt-1">{registerForm.formState.errors.full_name.message}</p>
                )}
              </div>

              {/* Pays */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Pays</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRegCountry(!showRegCountry)}
                    className="w-full h-12 px-4 border border-[#E8E8E8] rounded-btn flex items-center gap-3 text-sm bg-white hover:border-[#1E6B2E] transition-colors"
                  >
                    <span className="text-base">{regCountry.flag}</span>
                    <span className="flex-1 text-left text-[#1A1A1A]">{regCountry.name}</span>
                    <ChevronDown size={14} className="text-[#888888]" />
                  </button>
                  {showRegCountry && (
                    <div className="absolute top-14 left-0 z-50 bg-white border border-[#E8E8E8] rounded-card shadow-card w-full max-h-56 overflow-y-auto">
                      {COUNTRY_CODES.map((c) => (
                        <button
                          key={c.iso}
                          type="button"
                          onClick={() => {
                            setRegCountry(c);
                            registerForm.setValue('country', c.iso);
                            setShowRegCountry(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#EAF3DE] flex items-center gap-3"
                        >
                          <span>{c.flag}</span>
                          <span className="flex-1">{c.name}</span>
                          <span className="text-[#888888] text-xs">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Téléphone (optionnel) */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Téléphone <span className="text-[#888888] font-normal">(optionnel)</span>
                </label>
                <div className="flex gap-2">
                  <span className="h-12 px-3 border border-[#E8E8E8] rounded-btn flex items-center text-sm font-semibold text-[#555555] bg-[#F8FAF8] select-none">
                    {regCountry.code}
                  </span>
                  <input
                    {...registerForm.register('phone')}
                    type="tel"
                    placeholder="06 XXX XXXX"
                    className="flex-1 h-12 px-4 border border-[#E8E8E8] rounded-btn text-sm focus:outline-none focus:border-[#1E6B2E] transition-colors"
                  />
                </div>
                {registerForm.formState.errors.phone && (
                  <p className="text-xs text-[#A32D2D] mt-1">{registerForm.formState.errors.phone.message}</p>
                )}
              </div>

              {/* Email (optionnel) */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Email <span className="text-[#888888] font-normal">(optionnel)</span>
                </label>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  className="w-full h-12 px-4 border border-[#E8E8E8] rounded-btn text-sm focus:outline-none focus:border-[#1E6B2E] transition-colors"
                />
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-[#A32D2D] mt-1">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Mot de passe</label>
                <div className="relative">
                  <input
                    {...registerForm.register('password')}
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 caractères"
                    autoComplete="new-password"
                    className="w-full h-12 px-4 pr-11 border border-[#E8E8E8] rounded-btn text-sm focus:outline-none focus:border-[#1E6B2E] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#555555]"
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-[#A32D2D] mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              {/* Plan info */}
              <div className="flex items-center gap-2 bg-[#EAF3DE] border border-[#C3DFA0] rounded-btn px-3 py-2.5 text-xs text-[#27500A]">
                <UserPlus size={13} className="flex-shrink-0" />
                <span>Compte créé en plan <strong>GRATUIT</strong> — 1 caméra, 7 jours d'historique</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#1E6B2E] text-white font-semibold rounded-btn hover:bg-[#0F3D1A] transition-colors disabled:opacity-60"
              >
                {loading ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-7 pt-5 border-t border-[#E8E8E8] text-center">
            {mode === 'login' ? (
              <>
                <p className="text-xs text-[#888888] mb-1">Pas encore de compte ?</p>
                <button
                  onClick={() => switchMode('register')}
                  className="text-xs text-[#1E6B2E] font-semibold hover:underline"
                >
                  Créer mon compte gratuitement
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-[#888888] mb-1">Déjà un compte ?</p>
                <button
                  onClick={() => switchMode('login')}
                  className="text-xs text-[#1E6B2E] font-semibold hover:underline"
                >
                  Se connecter
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-[#888888] mt-4">v1.0.0 — Aviora © 2026</p>
      </div>
    </div>
  );
}
