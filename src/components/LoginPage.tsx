import React, { useState } from 'react';
import { Lock, User as UserIcon, Eye, EyeOff, ArrowRight, ShieldCheck, Cpu, Droplets, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { User } from '../types';

interface LoginPageProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLoginSuccess }) => {
  const [login, setLogin] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [recoveryLogin, setRecoveryLogin] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedLogin = login.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedLogin || !trimmedPass) {
      setError('Iltimos, login va parol maydonlarini to‘ldiring.');
      return;
    }

    const foundUser = users.find(
      (u) => u.login.toLowerCase() === trimmedLogin && u.password === trimmedPass
    );

    if (!foundUser) {
      setError('Login yoki parol noto‘g‘ri kiritildi. Demo hisoblardan birini tanlang.');
      return;
    }

    if (foundUser.status === 'Nofaol') {
      setError('Ushbu foydalanuvchi hisobi vaqtincha faolsizlantirilgan. Administratorga murojaat qiling.');
      return;
    }

    onLoginSuccess(foundUser);
  };

  const fillDemoAccount = (demoLogin: string, demoPass: string) => {
    setLogin(demoLogin);
    setPassword(demoPass);
    setError(null);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryLogin.trim()) return;
    setRecoverySent(true);
  };

  return (
    <div className="min-h-screen bg-[#090E17] text-slate-100 flex flex-col lg:flex-row relative overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Left Showcase Column */}
      <div className="lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative z-10 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <BrandLogo size="lg" />
          <div className="text-xs font-mono text-emerald-400 tracking-wide">
            DEMO MODE · IoT v2.4
          </div>
        </div>

        <div className="my-10 lg:my-0 max-w-xl">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
            Qishloq xo‘jaligida raqamli suv boshqaruvi
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-[1.15] mb-4">
            Har tomchi suv — hisobda. Har bir ekin — nazoratda.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            AqlliSuv — sug‘orish zonalari, tuproq namligi, havo harorati, suv oqimi va nasos-klapanlar
            holatini real vaqt rejimida nazorat qiluvchi intellektual agro-IoT platformasi.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                <Droplets className="w-4 h-4 shrink-0" />
                <span>32% gacha suv tejash</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tuproq namligi va ob-havo prognoziga asoslangan aniq me’yoriy sug‘orish.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm mb-1">
                <Cpu className="w-4 h-4 shrink-0" />
                <span>AI qarorlar tizimi</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                10 ta sektor bo‘yicha sug‘orish davomiyligi va quvur nosozliklarini aniqlash.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Avtomatik himoya</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Suv sizib chiqishi, bosim tushishi va yomg‘ir oldidan avtomatik bloklash.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-4 border-t border-slate-900">
          <span>Farg‘ona viloyati · 10 gektar tajriba-sanoat poligoni</span>
          <span className="font-mono">ESP32 / LoRaWAN / MQTT Tayyor Arxitektura</span>
        </div>
      </div>

      {/* Right Authentication Column */}
      <div className="lg:w-5/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Tizimga kirish</h2>
            <p className="text-sm text-slate-400 mt-1">
              Boshqaruv paneliga o‘tish uchun hisob ma’lumotlaringizni kiriting
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Login
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Masalan: admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-slate-300">
                  Parol
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(true);
                    setRecoverySent(false);
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Parolni unutdingizmi?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  aria-label="Parolni ko‘rsatish"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-500/15"
            >
              <span>Kirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">
                Tezkor demo hisoblar (Rollar bo‘yicha sinash):
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin', 'admin123')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  login === 'admin'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                    : 'bg-slate-900/60 border-slate-800/90 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold text-emerald-400">Administrator</div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">admin / admin123</div>
                <div className="text-[10px] text-slate-500 mt-1">To‘liq huquq</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('operator', 'operator123')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  login === 'operator'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                    : 'bg-slate-900/60 border-slate-800/90 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold text-cyan-400">Operator</div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">operator / operator123</div>
                <div className="text-[10px] text-slate-500 mt-1">Klapan va nasos</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('fermer', 'fermer123')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  login === 'fermer'
                    ? 'bg-amber-500/15 border-amber-500/50 text-white'
                    : 'bg-slate-900/60 border-slate-800/90 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold text-amber-400">Fermer</div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">fermer / fermer123</div>
                <div className="text-[10px] text-slate-500 mt-1">Kuzatuv va AI</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Parolni unutdingizmi Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white">Parolni tiklash</h3>
            <p className="text-xs text-slate-400 mt-1">
              Login yoki telefon raqamingizni kiriting. Tizim administratoriga parolni tiklash so‘rovi yuboriladi.
            </p>

            {recoverySent ? (
              <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>So‘rov muvaffaqiyatli yuborildi!</span>
                </div>
                <p>
                  Demo rejimda quyidagi tayyor parollardan foydalanishingiz mumkin:
                  <span className="block font-mono mt-1.5 text-slate-200">
                    • admin / admin123
                    <br />• operator / operator123
                    <br />• fermer / fermer123
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="mt-3 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
                >
                  Yopish
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    Login yoki telefon raqam
                  </label>
                  <input
                    type="text"
                    value={recoveryLogin}
                    onChange={(e) => setRecoveryLogin(e.target.value)}
                    placeholder="admin yoki +998 90 123 45 67"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-semibold text-slate-950 cursor-pointer"
                  >
                    Tiklash kodini yuborish
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
