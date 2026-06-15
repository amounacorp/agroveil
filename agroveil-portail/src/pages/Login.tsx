import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestOTP, verifyOTP } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { COUNTRY_CODES } from '../utils/constants';

const phoneSchema = z.object({
  phone: z.string().min(6, 'Numéro invalide').max(15, 'Numéro trop long'),
});
type PhoneForm = z.infer<typeof phoneSchema>;

export function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountry, setShowCountry] = useState(false);
  const [fullPhone, setFullPhone] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const onPhoneSubmit = async ({ phone }: PhoneForm) => {
    setLoading(true);
    setError('');
    try {
      const full = `${selectedCountry.code}${phone.replace(/\s/g, '')}`;
      setFullPhone(full);
      await requestOTP(full);
      setStep('otp');
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
      setAuth(farmer, token);
      navigate('/');
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

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-card shadow-card border border-[#E8E8E8] p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#EAF3DE] rounded-full flex items-center justify-center mb-3">
            <Leaf size={32} className="text-[#1E6B2E]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E6B2E]">AgroVeil</h1>
          <h2 className="text-lg font-semibold text-[#1A1A1A] mt-1">Bienvenue</h2>
          <p className="text-sm text-[#888888] text-center mt-1">
            {step === 'phone'
              ? 'Entrez votre numéro pour recevoir un code'
              : `Code envoyé au ${fullPhone}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FCEBEB] border border-[#E24B4A] rounded-btn text-sm text-[#A32D2D]">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSubmit(onPhoneSubmit)}>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Numéro de téléphone</label>
            <div className="flex gap-2 mb-5">
              {/* Country selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountry(!showCountry)}
                  className="h-12 px-3 border border-[#E8E8E8] rounded-btn flex items-center gap-1 text-sm font-medium bg-white hover:border-[#1E6B2E] transition-colors"
                >
                  <span className="lowercase text-xs font-semibold text-[#555555]">{selectedCountry.name.slice(0, 2).toLowerCase()}</span>
                  <span>{selectedCountry.code}</span>
                  <ChevronDown size={14} className="text-[#888888]" />
                </button>
                {showCountry && (
                  <div className="absolute top-14 left-0 z-50 bg-white border border-[#E8E8E8] rounded-card shadow-card w-48">
                    {COUNTRY_CODES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => { setSelectedCountry(c); setShowCountry(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#EAF3DE] flex items-center gap-2"
                      >
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                        <span className="text-[#888888] ml-auto">{c.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Phone input */}
              <input
                {...register('phone')}
                type="tel"
                placeholder="06 XXX XXXX"
                className="flex-1 h-12 px-4 border border-[#E8E8E8] rounded-btn text-sm focus:outline-none focus:border-[#1E6B2E] transition-colors"
              />
            </div>
            {errors.phone && <p className="text-xs text-[#A32D2D] -mt-3 mb-4">{errors.phone.message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#1E6B2E] text-white font-semibold rounded-btn hover:bg-[#0F3D1A] transition-colors disabled:opacity-60"
            >
              {loading ? 'Envoi...' : 'Recevoir mon code'}
            </button>
          </form>
        ) : (
          <div>
            {/* OTP boxes */}
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
              {loading ? 'Vérification...' : 'Valider'}
            </button>
            <button
              onClick={resendOTP}
              disabled={countdown > 0 || loading}
              className="w-full text-sm text-center text-[#1E6B2E] disabled:text-[#888888] transition-colors"
            >
              {countdown > 0 ? `Renvoyer le code dans ${countdown}s` : 'Renvoyer le code'}
            </button>
            <button
              onClick={() => { setStep('phone'); setError(''); }}
              className="w-full text-sm text-center text-[#888888] mt-2 hover:text-[#1A1A1A]"
            >
              ← Modifier le numéro
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#E8E8E8] text-center">
          <p className="text-xs text-[#888888]">Pas encore de compte ?</p>
          <a
            href="https://wa.me/242064000000"
            className="text-xs text-[#25D366] font-medium mt-1 inline-block hover:underline"
          >
            Contactez-nous sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
