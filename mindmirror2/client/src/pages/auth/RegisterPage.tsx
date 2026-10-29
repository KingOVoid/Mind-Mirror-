import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LiveVercelQR } from '../../components/LiveVercelQR';
import { Sparkles, ArrowRight, Lock, Mail, User, GraduationCap, AlertCircle, BookOpen } from 'lucide-react';

export default function RegisterPage() {
  const { register, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('CSE (AI & ML)');
  const [semester, setSemester] = useState('Semester 5');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        fullName,
        email,
        password,
        college: college || 'PSG College of Technology',
        course: course || 'BE CSE (AI & ML)',
        semester: semester || 'Semester 5',
      });
      navigate('/notebook');
    } catch (err: any) {
      console.warn('Registration fallback trigger:', err);
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
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-40 w-full max-w-lg isolate">
      <div className="relative z-40 p-8 rounded-2xl bg-[#FFFFFF] border-2 border-[#E6E1D8] shadow-[0_20px_50px_rgba(0,0,0,0.12)] space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE3]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF3EE] text-xs font-mono text-[#43634D] border border-[#C8D7CB]">
            <Sparkles className="w-3.5 h-3.5 text-[#5B8266]" />
            <span>Create Cognitive Profile</span>
          </div>
          <LiveVercelQR />
        </div>

        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold font-display text-[#242725] tracking-tight">
            Join Mind Mirror
          </h2>
          <p className="text-xs text-[#6D736E] leading-relaxed">
            Anti-gravity study engine tailored to engineering students
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#F7EFEA] border border-[#E5C9BA] text-[#B86B43] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{error}</p>
              {error.toLowerCase().includes('server') && (
                <p className="text-[#8E948F] text-[11px]">
                  Database connection error. Check terminal logs or verify your PostgreSQL DATABASE_URL in .env.
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#373C38] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-[#8E948F]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-sm text-[#242725] placeholder-[#949B95] outline-none focus:border-[#5B8266] focus:bg-white transition"
                />
              </div>
            </div>

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
                  placeholder="sarah@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-sm text-[#242725] placeholder-[#949B95] outline-none focus:border-[#5B8266] focus:bg-white transition"
                />
              </div>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-sm text-[#242725] placeholder-[#949B95] outline-none focus:border-[#5B8266] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#373C38] uppercase tracking-wider mb-1.5">
                College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="PSG College of Technology"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-sm text-[#242725] placeholder-[#949B95] outline-none focus:border-[#5B8266] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#373C38] uppercase tracking-wider mb-1.5">
                Engineering Discipline
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-[#8E948F]" />
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="BE CSE (AI & ML)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-sm text-[#242725] placeholder-[#949B95] outline-none focus:border-[#5B8266] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-[#5B8266] hover:bg-[#4A6D54] text-white font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Launch Profile & Notebook</span>
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

        <button
          type="button"
          onClick={() => {
            loginAsDemo();
            navigate('/notebook');
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E6E1D8] text-[#373C38] text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition"
        >
          <BookOpen className="w-4 h-4 text-[#5B8266]" />
          <span>Open Demo Notebook (Bypass Database)</span>
        </button>

        <p className="mt-4 text-center text-xs text-[#6D736E]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#5B8266] hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
