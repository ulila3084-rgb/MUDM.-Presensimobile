import React, { useState } from 'react';
import { LogIn, ShieldAlert, KeyRound, User, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate standard network latency for a high-fidelity feel
    setTimeout(() => {
      const u = username.trim();
      const p = password.trim();

      if (u === 'MUDM' && p === '12345') {
        sessionStorage.setItem('loginPresensi', '1');
        onLoginSuccess();
      } else {
        setError('Username atau password admin salah!');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div id="login_screen" className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-50/40 to-emerald-100/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl shadow-teal-900/5 overflow-hidden transition-all duration-300">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-600 px-6 py-8 text-white relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
          <div className="mx-auto w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-inner">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold font-sans tracking-tight">Presensi Digital Guru</h1>
          <p className="text-xs text-teal-100 mt-1 font-mono uppercase tracking-widest">Ibtidaiyah MUDM</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-5">
          <div className="text-center">
            <h2 className="text-sm font-semibold text-slate-500">Sistem Autentikasi Admin</h2>
            <p className="text-xs text-slate-400 mt-0.5">Silakan masukkan akun administrator Madrasah</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs flex items-start gap-2 border border-red-100 animate-pulse">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Username field */}
            <div className="space-y-1.5">
              <label htmlFor="username_input" className="text-xs font-semibold text-slate-600 block">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  id="username_input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password_input" className="text-xs font-semibold text-slate-600 block">Password</label>
                <span className="text-[10px] text-slate-400 font-mono select-none">(12345)</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <KeyRound className="w-4.5 h-4.5" />
                </span>
                <input
                  id="password_input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all text-slate-800"
                />
                <button
                  type="button"
                  id="toggle_password_btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            id="login_submit_btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/60 text-white font-medium rounded-xl text-sm shadow-md shadow-teal-900/10 hover:shadow-lg hover:shadow-teal-900/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>

          <div className="text-center">
            <span className="text-[10px] text-slate-400">
              MUDM Ibtidaiyah Digital Attendance System &bull; v2.0
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
