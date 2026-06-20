import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setApiError('');
    setIsLoading(true);
    try {
      const res = await login(data);
      setAuth(res.user, res.access_token);
      navigate('/admin');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src={`${import.meta.env.BASE_URL}logo_aviora.png`} alt="Aviora" className="h-16 w-auto mb-3" />
            <p className="text-sm font-medium text-[#555555]">Admin Console</p>
            <p className="text-xs text-[#888888] mt-1 text-center">
              Accès réservé à l'équipe Aviora
            </p>
          </div>

          {apiError && (
            <div className="flex items-center gap-2 bg-[#FCEBEB] border border-[#E24B4A] text-[#A32D2D] text-sm px-3 py-2.5 rounded-lg mb-5">
              <AlertCircle size={16} className="flex-shrink-0" />
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#555555] mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="admin@Aviora.com"
                className="w-full border border-[#E8E8E8] rounded-btn px-3 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#1E6B2E]/30 focus:border-[#1E6B2E] transition-colors"
              />
              {errors.email && (
                <p className="text-xs text-[#A32D2D] mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#555555] mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full border border-[#E8E8E8] rounded-btn px-3 py-2.5 pr-10 text-sm text-[#1A1A1A] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#1E6B2E]/30 focus:border-[#1E6B2E] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#555555]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[#A32D2D] mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1E6B2E] hover:bg-[#17521F] text-white font-bold text-sm py-3 rounded-btn transition-colors disabled:opacity-60 mt-2"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Demo hint */}
          <p className="text-[10px] text-[#888888] text-center mt-4">
            Mode démo : admin@Aviora.com / admin123
          </p>
        </div>

        <p className="text-center text-[11px] text-[#888888] mt-4">v1.0.0 — Aviora © 2026</p>
      </div>
    </div>
  );
}
