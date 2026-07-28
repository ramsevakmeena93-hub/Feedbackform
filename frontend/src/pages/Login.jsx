import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import SignatureUpload from "../components/SignatureUpload";
import { Eye, EyeOff, ArrowRight, GraduationCap, Building2, Users } from "lucide-react";

const ROLES = {
  hod:     { label:"Head of Department", icon: Building2,    grad:"from-indigo-600 to-violet-600",   ring:"ring-indigo-500",  desc:"Manage faculty feedback pipeline" },
  vc:      { label:"Vice Chancellor",    icon: GraduationCap,grad:"from-purple-600 to-indigo-600",   ring:"ring-purple-500",  desc:"Review and approve submissions" },
  faculty: { label:"Faculty Member",     icon: Users,         grad:"from-emerald-600 to-teal-600",    ring:"ring-emerald-500", desc:"View your feedback reports" },
};

export default function Login({ appRole }) {
  const [form, setForm]           = useState({ email:"", password:"" });
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showSig, setShowSig]     = useState(false);
  const [pending, setPending]     = useState(null);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const cfg = ROLES[appRole] || ROLES.hod;
  const Icon = cfg.icon;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", form);
      if (appRole && data.user.role !== appRole) {
        toast.error(`This portal is for ${cfg.label} only`); return;
      }
      if (!data.user.hasSignature) {
        setPending(data); setShowSig(true);
      } else {
        login(data.user, data.token);
        navigate(
          data.user.role === "vc" ? "/vc" :
          data.user.role === "faculty" ? "/faculty" :
          data.user.role === "admin" ? "/admin" : "/hod"
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  }

  function afterSig() {
    setShowSig(false);
    login(pending.user, pending.token);
    navigate(
      pending.user.role === "vc" ? "/vc" :
      pending.user.role === "faculty" ? "/faculty" :
      pending.user.role === "admin" ? "/admin" : "/hod"
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {showSig && <SignatureUpload token={pending.token} onSaved={afterSig} onSkip={afterSig} />}

      {/* Top nav bar */}
      <header className="w-full bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <a href="/landing" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">MITS Feedback System</p>
              <p className="text-slate-400 text-xs hidden sm:block">Gwalior · Deemed University</p>
            </div>
          </a>
          <a href="/landing" className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors">
            ← Back to Home
          </a>
        </div>
      </header>

      <div className="flex flex-1">
      <div className={`hidden lg:flex lg:w-[45%] bg-gradient-to-br ${cfg.grad} flex-col justify-between p-12 relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-black/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30">
            <span className="text-white font-black text-base">M</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MITS Gwalior</p>
            <p className="text-white/60 text-xs">Deemed University</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative">
          <div className="w-16 h-16 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20 mb-8">
            <Icon size={32} className="text-white" />
          </div>
          <h2 className="text-white text-3xl font-bold mb-3 leading-tight">{cfg.label}<br />Portal</h2>
          <p className="text-white/70 text-base mb-8">{cfg.desc}</p>
          <div className="flex flex-col gap-3">
            {["AI-powered comment analysis","Real-time FFI tracking","Secure approval pipeline"].map(f => (
              <div key={f} className="flex items-center gap-2.5 text-white/80 text-sm">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/40 text-xs">Automated Faculty Feedback Analysis System · 2025–26</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">

          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className={`w-14 h-14 bg-gradient-to-br ${cfg.grad} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <Icon size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">{cfg.label}</h1>
            <p className="text-slate-500 text-sm">MITS Gwalior</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Email Address</label>
              <input type="email" className="input" placeholder="your@mits.ac.in"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} className="input pr-11" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className={`w-full btn bg-gradient-to-r ${cfg.grad} text-white py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:opacity-95 hover:-translate-y-px transition-all duration-200 disabled:opacity-50 mt-2`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">Sign In <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Create account</Link>
            </p>
          </div>

          <p className="text-center text-slate-400 text-xs mt-8">
            Dept. of Computer Science & Technology · MITS Gwalior
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
