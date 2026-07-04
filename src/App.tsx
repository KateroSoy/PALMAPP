/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from 'react';
import { Scale, Shield, Key, Eye, EyeOff, LogIn, ArrowLeft, Fingerprint, Wifi, WifiOff } from 'lucide-react';
import MarketingPage from './components/MarketingPage';
import AppShell from './components/AppShell';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Login form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleDemoLogin = (role?: string) => {
    setIsLoggedIn(true);
    setShowLoginScreen(false);
  };

  const handleCredentialsLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginError('Mohon isi semua field!');
      return;
    }

    // Simple robust credential matching for demo
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      setShowLoginScreen(false);
      setLoginError('');
    } else if (username === 'kasir' && password === 'kasir123') {
      setIsLoggedIn(true);
      setShowLoginScreen(false);
      setLoginError('');
    } else {
      setLoginError('Username atau Password salah! Gunakan quick-login demo di bawah.');
    }
  };

  // If logged in, show the core app shell
  if (isLoggedIn) {
    return <AppShell onLogout={() => setIsLoggedIn(false)} />;
  }

  // If showing login screen, render a beautiful card login
  if (showLoginScreen) {
    return (
      <div className="min-h-screen bg-[#F7FAF3] flex flex-col justify-center items-center p-4 text-[#102018] font-sans relative">
        {toastMessage && (
          <div className="fixed top-6 z-50 bg-[#102018] border border-[#C6F24A]/20 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-pulse">
            <Fingerprint className="w-5 h-5 text-[#C6F24A] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
        {/* Background blobs */}
        <div className="absolute top-12 left-12 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-12 right-12 w-80 h-80 bg-lime-100 rounded-full blur-3xl opacity-50"></div>

        <div className="w-full max-w-md bg-white border border-[#E6EBDD] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative z-10 text-left animate-slideUpFadeIn">
          
          {/* Back button */}
          <button
            onClick={() => {
              setShowLoginScreen(false);
              setLoginError('');
            }}
            className="text-xs text-[#66736B] hover:text-[#123C2B] font-bold flex items-center gap-1 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Landing Page
          </button>

          {/* Logo Head */}
          <div className="text-center space-y-1">
            <div className="bg-[#123C2B] text-white p-3 rounded-2xl w-fit mx-auto shadow-md">
              <Scale className="w-6 h-6 text-[#C6F24A]" />
            </div>
            <h1 className="font-display font-extrabold text-xl tracking-tight text-emerald-950 pt-2">Rampalm OS Login</h1>
            <p className="text-xs text-[#66736B]">Portal ERP jembatan timbang, kasir, dan penagihan RAM Kelapa Sawit</p>
          </div>

          {/* Form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 font-bold">
                ⚠️ {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#102018]/80 mb-1">Username Operator</label>
              <input
                type="text"
                placeholder="Contoh: admin atau kasir"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#1F6B4A] font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-[#102018]/80">Kata Sandi / Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#1F6B4A] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[#66736B] hover:text-[#102018]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#123C2B] text-white hover:bg-emerald-950 font-black text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[#C6F24A]" />
              Masuk ke Workspace RAM
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#E6EBDD]"></div>
              <span className="flex-shrink mx-3 text-[10px] text-[#66736B] font-bold uppercase">Atau</span>
              <div className="flex-grow border-t border-[#E6EBDD]"></div>
            </div>

            <button
              type="button"
              onClick={() => showToastMessage('Biometric authentication coming soon')}
              className="w-full bg-white hover:bg-[#F7FAF3] text-[#123C2B] border border-[#E6EBDD] hover:border-[#123C2B]/25 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-emerald-700" />
              Masuk dengan Sidik Jari (Biometrik)
            </button>
          </form>

          {/* Demo account helper block */}
          <div className="border-t border-[#E6EBDD] pt-4 space-y-2.5 text-center">
            <span className="text-[10px] text-[#66736B] uppercase font-bold tracking-wider block">Demo Instant Quick Access</span>
            
            <div className="grid grid-cols-2 gap-2 text-[10px] font-black">
              <button
                onClick={() => handleDemoLogin()}
                className="bg-[#F7FAF3] hover:bg-[#E6EBDD]/40 border border-[#E6EBDD] text-emerald-950 px-3 py-2 rounded-xl transition-all"
              >
                Owner Demo (Full)
              </button>
              <button
                onClick={() => {
                  setUsername('kasir');
                  setPassword('kasir123');
                  setIsLoggedIn(true);
                  setShowLoginScreen(false);
                }}
                className="bg-[#F7FAF3] hover:bg-[#E6EBDD]/40 border border-[#E6EBDD] text-emerald-950 px-3 py-2 rounded-xl transition-all"
              >
                Kasir Demo
              </button>
            </div>
            <span className="text-[9px] text-[#66736B] block">
              *Gunakan kredensial <b>admin</b> / <b>admin123</b> atau klik tombol cepat di atas untuk langsung masuk.
            </span>
            
            <div className="border-t border-[#E6EBDD]/60 pt-3.5 flex items-center justify-between text-[9px] text-[#66736B] font-bold">
              <span className="uppercase tracking-wider">Status Koneksi RAM:</span>
              <div className="flex items-center gap-1.5 bg-[#F7FAF3] border border-[#E6EBDD]/40 px-2.5 py-1 rounded-full shadow-xs">
                {isOnline ? (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-black text-emerald-800 flex items-center gap-1 font-mono">
                      <Wifi className="w-3 h-3 text-emerald-600" /> ONLINE (CLOUD)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="font-black text-amber-700 flex items-center gap-1 font-mono">
                      <WifiOff className="w-3 h-3 text-amber-600" /> OFFLINE (LOKAL)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Default: Show the public marketing page
  return (
    <MarketingPage
      onLoginClick={() => setShowLoginScreen(true)}
      onDemoClick={() => handleDemoLogin()}
    />
  );
}
