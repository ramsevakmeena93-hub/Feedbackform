import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, X, Building2, Users, GraduationCap, Shield } from "lucide-react";

const PORTALS = [
  { role:"hod",     label:"Head of Department", icon:Building2,     port:5173, grad:"from-indigo-600 to-violet-600" },
  { role:"faculty", label:"Faculty Member",      icon:Users,         port:5175, grad:"from-emerald-600 to-teal-600"  },
  { role:"vc",      label:"Vice Chancellor",     icon:GraduationCap, port:5174, grad:"from-purple-600 to-indigo-600" },
  { role:"admin",   label:"System Admin",        icon:Shield,        port:5177, grad:"from-red-600 to-rose-600"      },
];

export default function Landing() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [loginRole, setLoginRole] = useState(PORTALS[0]);
  const [form, setForm]           = useState({ email:"", password:"" });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") setShowLogin(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  function openLogin(portal) {
    setLoginRole(portal);
    setForm({ email:"", password:"" });
    setShowLogin(true);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", form);
      if (data.user.role !== loginRole.role) {
        toast.error(`This portal is for ${loginRole.label} only`);
        return;
      }
      const cur = window.location.port;
      if (String(loginRole.port) === String(cur)) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate(data.user.role === "vc" ? "/vc" : data.user.role === "faculty" ? "/faculty" : "/hod");
      } else {
        window.location.href = `http://localhost:${loginRole.port}/?token=${data.token}&user=${encodeURIComponent(JSON.stringify(data.user))}`;
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  }

  const cfg  = PORTALS.find(p => p.role === loginRole.role) || PORTALS[0];
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">

      {/* NAVBAR */}
      <header className="w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow">M</div>
              <div>
                <p className="font-bold text-slate-900 text-sm leading-tight">MITS Feedback System</p>
                <p className="text-slate-400 text-xs hidden sm:block">Gwalior · Deemed University</p>
              </div>
            </div>
            <nav className="flex items-center gap-1">
              <a href="#home" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">Home</a>
              <a href="/developer" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">Developer</a>
              <button onClick={() => openLogin(PORTALS[0])}
                className="ml-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                Login
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="home" className="flex-1 flex items-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-32 left-16 w-80 h-80 bg-indigo-600 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-24 right-16 w-96 h-96 bg-violet-600 rounded-full blur-3xl opacity-10"></div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-24 relative z-10 w-full">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-indigo-500/15 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full border border-indigo-500/25 mb-8">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
              Academic Year 2025–26 · MITS Gwalior
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Faculty Feedback<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Analysis System
              </span>
            </h1>
            <p className="text-slate-300 text-base leading-relaxed max-w-xl mx-auto mb-10">
              AI-powered platform that reads student feedback PDFs, classifies comments, tracks FFI scores, and manages the HOD → Faculty → VC approval pipeline.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
              {PORTALS.map(portal => {
                const PIcon = portal.icon;
                return (
                  <button key={portal.role} onClick={() => openLogin(portal)}
                    className={`group bg-gradient-to-br ${portal.grad} rounded-2xl p-6 text-left text-white hover:scale-105 hover:shadow-2xl transition-all duration-200 shadow-lg`}>
                    <PIcon size={28} className="mb-4 opacity-90" />
                    <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">{portal.role}</p>
                    <p className="font-bold text-base mb-1">{portal.label}</p>
                    <p className="text-white/60 text-xs flex items-center gap-1 mt-3 group-hover:text-white transition-colors">
                      Sign in <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2025 MITS Gwalior · Automated Faculty Feedback Analysis System</p>
          <p>Dept. of Computer Science & Technology · 2025–26</p>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative">
            <button onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X size={16} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 bg-gradient-to-br ${cfg.grad} rounded-xl flex items-center justify-center shadow-sm`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base">{cfg.label}</p>
                <p className="text-slate-400 text-xs">MITS Gwalior</p>
              </div>
            </div>
            {/* Portal switcher */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
              {PORTALS.map(p => (
                <button key={p.role} onClick={() => setLoginRole(p)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${loginRole.role === p.role ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
                  {p.role.toUpperCase()}
                </button>
              ))}
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" className="input" placeholder="your@mits.ac.in"
                  value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input type={showPass?"text":"password"} className="input pr-10" placeholder="••••••••"
                    value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
                  <button type="button" onClick={() => setShowPass(s=>!s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                    {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className={`w-full btn bg-gradient-to-r ${cfg.grad} text-white py-2.5 rounded-xl font-semibold text-sm shadow hover:opacity-95 transition-all disabled:opacity-50`}>
                {loading
                  ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</span>
                  : <span className="flex items-center justify-center gap-2">Sign In <ArrowRight size={14}/></span>}
              </button>
            </form>
            <p className="text-center text-xs text-slate-400 mt-5">
              No account?{" "}
              <a href={`http://localhost:${loginRole.port}/register`} className="text-indigo-600 font-semibold hover:underline">Register</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
