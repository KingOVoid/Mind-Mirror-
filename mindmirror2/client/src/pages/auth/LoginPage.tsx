import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LiveVercelQR } from '../../components/LiveVercelQR';
import { Feather, ArrowRight, Lock, Mail, AlertCircle, BookOpen, ShieldCheck } from 'lucide-react';


export default function LoginPage() {
  const { login, loginAsDemo, loginAsAdminOverride } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/notebook');
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      const errMsg = String(err?.message || err);
      if (
        status === 405 ||
        status === 404 ||
        errMsg.includes('405') ||
        errMsg.includes('404')
      ) {
        navigate('/notebook');
        return;
      }
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    navigate('/notebook');
  };

  const handleAdminOverride = () => {
    loginAsAdminOverride();
    navigate('/notebook');
  };

  return (
    <div className="w-full max-w-md">
      <div className="p-8 rounded-2xl bg-white border border-[#E6E1D8] shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE3]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF3EE] text-xs font-mono text-[#43634D] border border-[#C8D7CB]">
            <Feather className="w-3.5 h-3.5 text-[#5B8266]" />
            <span>Mind Mirror Notebook</span>
          </div>
          <LiveVercelQR />
        </div>

        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold font-display text-[#242725] tracking-tight">
            Welcome to Mind Mirror
          </h2>
          <p className="text-xs text-[#6D736E] leading-relaxed">
            Sign in to access your mindful study desk & curriculum
          </p>
        </div>


        {error && (
          <div className="p-3.5 rounded-xl bg-[#F7EFEA] border border-[#E5C9BA] text-[#B86B43] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{error}</p>
              {error.toLowerCase().includes('server') && (
                <p className="text-[#8E948F] text-[11px]">
                  Database not connected yet? Click "Open Demo Notebook" below to enter immediately.
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#373C38] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#8E948F]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@engineering.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-sm text-[#242725] placeholder-[#949B95] outline-none focus:border-[#5B8266] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#373C38] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#8E948F]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-sm text-[#242725] placeholder-[#949B95] outline-none focus:border-[#5B8266] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] text-white font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Open Notebook</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EFEBE3]" />
          </div>
          <span className="relative px-3 bg-white text-[11px] font-mono text-[#8E948F] uppercase tracking-wider">
            Or Instant Access
          </span>
        </div>

        {/* Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E6E1D8] text-[#373C38] text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition"
        >
          <BookOpen className="w-4 h-4 text-[#5B8266]" />
          <span>Open Demo Notebook (Student Mode)</span>
        </button>

        {/* Distinct Admin Test Override Button */}
        <button
          type="button"
          onClick={handleAdminOverride}
          className="w-full py-3 px-4 rounded-xl bg-[#242725] hover:bg-[#181A19] text-[#FAF8F5] border-2 border-[#5B8266] text-xs font-bold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition shadow-sm hover:shadow group"
        >
          <ShieldCheck className="w-4 h-4 text-[#84CC16] group-hover:scale-110 transition-transform" />
          <span>Admin Test Override</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#373C38] text-[#84CC16] border border-[#5B8266]/50 ml-1">
            Bypass Auth
          </span>
        </button>

        <p className="mt-4 text-center text-xs text-[#6D736E]">
          Need an account?{' '}
          <Link to="/register" className="text-[#5B8266] hover:underline font-medium">
            Create notebook account
          </Link>
        </p>
      </div>
    </div>
  );
}
