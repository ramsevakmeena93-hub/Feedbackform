import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogIn, X, Building2, Users, GraduationCap, Shield, Mail, Github, Linkedin, UserPlus, ChevronRight, MapPin, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import mitsLogo from "../assets/mits-logo.png";
import campusImg from "../assets/mits-campus2.png";

// Fallback campus image URL (actual MITS building)
const CAMPUS_IMG = campusImg;

const PORTALS = [
  { role:"hod",     label:"Head of Department", icon:Building2,     color:"from-blue-600 to-blue-800",       hex:"#2563eb" },
  { role:"faculty", label:"Faculty Member",      icon:Users,         color:"from-emerald-600 to-emerald-800", hex:"#059669" },
  { role:"vc",      label:"Vice Chancellor",     icon:GraduationCap, color:"from-violet-600 to-violet-800",   hex:"#7c3aed" },
  { role:"admin",   label:"System Admin",        icon:Shield,        color:"from-rose-600 to-rose-800",       hex:"#e11d48" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [modal, setModal]       = useState(null);
  const [portal, setPortal]     = useState(PORTALS[0]);
  const [form, setForm]         = useState({ name:"", email:"", password:"", department:"", role:"hod" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  function openModal(type, p) {
    setPortal(p || PORTALS[0]);
    setForm({ name:"", email:"", password:"", department:"", role: p?.role || "hod" });
    setShowPass(false);
    setModal(type);
  }

  async function handleLogin(e) {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", { email: form.email, password: form.password });
      if (data.user.role !== portal.role) { toast.error(`This portal is for ${portal.label} only`); return; }
      login(data.user, data.token);
      setModal(null);
      navigate(data.user.role==="vc"?"/vc":data.user.role==="faculty"?"/faculty":data.user.role==="admin"?"/admin":"/hod");
    } catch(err) { toast.error(err.response?.data?.error || "Invalid credentials"); }
    finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post("/api/auth/register", { name:form.name, email:form.email, password:form.password, role:form.role, department:form.department });
      toast.success("Account created! Please login."); setModal("login");
    } catch(err) { toast.error(err.response?.data?.error || "Registration failed"); }
    finally { setLoading(false); }
  }

  const PIcon = portal.icon;

  return (
    <div className="min-h-screen bg-white flex flex-col text-[14px]">

      {/* ── NAVBAR ── */}
      <header className="bg-[#0d1b3e] sticky top-0 z-50 h-13">
        <div className="w-full px-10 h-13 flex items-center justify-between" style={{height:"52px"}}>
          <div className="flex items-center gap-2.5">
            <img src={mitsLogo} alt="MITS" className="h-9 w-auto object-contain rounded"/>
            <div>
              <p className="text-white font-bold text-sm leading-tight">MITS Gwalior</p>
              <p className="text-blue-300 text-xs leading-tight">Faculty Feedback System</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-0.5">
            <a href="#home" className="px-4 py-1.5 text-sm font-semibold text-white border-b-2 border-blue-400">Home</a>
            <button onClick={() => navigate("/how-it-works")} className="px-4 py-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors">How It Works</button>
          </nav>
          <button onClick={() => openModal("login")}
            className="flex items-center gap-2 px-4 py-1.5 border border-white/30 hover:bg-white/10 text-white text-sm font-semibold rounded-lg transition-all">
            <LogIn size={14}/> Login
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section id="home" className="bg-[#0d1b3e] relative overflow-hidden">
        <div className="w-full px-10 py-8 grid lg:grid-cols-2 gap-6 items-center min-h-[300px]">
          {/* Left */}
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2">
              Your Feedback,<br/>
              <span className="text-blue-400">Shapes Our Future</span>
            </h1>
            <div className="w-12 h-1 bg-blue-400 mb-4 rounded"/>
            <p className="text-white/65 text-sm leading-relaxed mb-6 max-w-sm">
              Share your valuable feedback about faculty, courses, and learning experience.
              Together, we build a better academic environment.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button onClick={() => navigate("/how-it-works")}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition-all shadow-md">
                How It Works
              </button>
              <button onClick={() => openModal("login")}
                className="flex items-center gap-2 px-5 py-2 border border-white/30 hover:bg-white/10 text-white font-semibold text-sm rounded-lg transition-all">
                <LogIn size={14}/> Login
              </button>
            </div>
          </div>
          {/* Right — campus photo */}
          <div className="relative hidden lg:block">
            <div className="rounded-2xl overflow-hidden shadow-2xl h-64" style={{clipPath:"polygon(6% 0%, 100% 0%, 100% 100%, 0% 100%)"}}>
              <img src={CAMPUS_IMG} alt="MITS Campus" className="w-full h-full object-cover"
                onError={e=>{e.target.src="https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80";}}/>
            </div>
            <div className="absolute bottom-3 right-2 bg-white rounded-xl shadow-xl p-3 max-w-[190px]">
              <p className="text-blue-600 text-xl font-black leading-none mb-1">"</p>
              <p className="text-slate-700 text-xs font-medium leading-snug">Honest feedback leads to real improvement.</p>
              <p className="text-blue-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                <span>♥</span> Thank you for contributing!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTAL CARDS ── */}
      <section className="py-6 bg-slate-50">
        <div className="w-full px-10">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-[#0d1b3e]">Access Your Portal</h2>
            <div className="w-10 h-0.5 bg-blue-500 mx-auto mt-1.5 rounded"/>
          </div>
          <div className="grid sm:grid-cols-4 gap-3">
            {PORTALS.map(p => {
              const Icon = p.icon;
              return (
                <div key={p.role} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center hover:shadow-md transition-shadow group cursor-pointer"
                  onClick={() => openModal("login", p)}>
                  <div className={`w-10 h-10 bg-gradient-to-br ${p.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow group-hover:scale-110 transition-transform`}>
                    <Icon size={18} className="text-white"/>
                  </div>
                  <p className="font-bold text-slate-800 text-sm mb-2">{p.label}</p>
                  <button className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 mx-auto">
                    Sign In <ChevronRight size={11}/>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GUIDED BY + DEVELOPER ── */}
      <section className="py-6 bg-white">
        <div className="w-full px-10 grid lg:grid-cols-2 gap-6">

          {/* Guided By */}
          <div>
            <h3 className="font-bold text-[#0d1b3e] text-base mb-1">Guided By</h3>
            <div className="w-8 h-0.5 bg-blue-500 mb-4 rounded"/>
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border-2 border-blue-100">
                <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&q=80" alt="Guide" className="w-full h-full object-cover"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm">Prof. [Guide Name]</p>
                <p className="text-blue-600 font-semibold text-xs">Project Guide &amp; Supervisor</p>
                <p className="text-slate-500 text-xs mt-0.5">Department of Computer Science &amp; Technology</p>
                <p className="text-slate-500 text-xs">MITS Gwalior</p>
              </div>
              <div className="hidden sm:block bg-blue-50 border border-blue-100 rounded-xl p-3 max-w-[160px] shrink-0">
                <p className="text-blue-600 text-xl font-black leading-none">"</p>
                <p className="text-slate-600 text-xs leading-relaxed mt-1">
                  Feedback is the foundation of growth and excellence.
                </p>
              </div>
            </div>
          </div>

          {/* Developer */}
          <div>
            <h3 className="font-bold text-[#0d1b3e] text-base mb-1">Developer</h3>
            <div className="w-8 h-0.5 bg-blue-500 mb-4 rounded"/>
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border-2 border-blue-100">
                <img src="/ajay-meena.png" alt="Ajay Meena" className="w-full h-full object-cover"
                  onError={e=>{e.target.src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80";}}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm">Ajay Meena</p>
                <p className="text-blue-600 font-semibold text-xs">Full Stack Developer</p>
                <p className="text-slate-500 text-xs mt-0.5">B.Tech CST | 2nd Year</p>
                <p className="text-slate-500 text-xs">MITS Gwalior</p>
              </div>
              <div className="hidden sm:block shrink-0">
                <div className="flex gap-2 mb-2">
                  {[
                    {href:"https://github.com/ramsevakmeena93-hub", Icon:Github, bg:"bg-slate-100 hover:bg-slate-200 text-slate-700"},
                    {href:"https://www.linkedin.com/in/ajay-meena-607a7b376", Icon:Linkedin, bg:"bg-blue-100 hover:bg-blue-200 text-blue-700"},
                    {href:"mailto:25tc1aj7@mitsgwl.ac.in", Icon:Mail, bg:"bg-indigo-100 hover:bg-indigo-200 text-indigo-700"},
                  ].map(({href,Icon,bg})=>(
                    <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                      className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center transition-colors`}>
                      <Icon size={14}/>
                    </a>
                  ))}
                </div>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[160px]">
                  Passionate about building impactful solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0d1b3e] text-white mt-auto">
        <div className="w-full px-10 py-7 grid sm:grid-cols-4 gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <img src={mitsLogo} alt="MITS" className="h-7 w-auto object-contain rounded opacity-90"/>
              <div>
                <p className="font-bold text-xs leading-tight">MITS Gwalior</p>
                <p className="text-blue-300 text-xs leading-tight">Faculty Feedback System</p>
              </div>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">Together we create an environment of learning, growth and excellence.</p>
          </div>
          <div>
            <p className="font-bold text-xs mb-2.5 uppercase tracking-widest text-white/60">Quick Links</p>
            {["About Us","How It Works","Privacy Policy","Contact Us"].map(l => (
              <div key={l} className="flex items-center justify-between py-1 border-b border-white/10">
                <span className="text-white/55 text-xs">{l}</span>
                <ChevronRight size={11} className="text-white/30"/>
              </div>
            ))}
          </div>
          <div>
            <p className="font-bold text-xs mb-2.5 uppercase tracking-widest text-white/60">Contact Us</p>
            <div className="space-y-2">
              {[
                {Icon:MapPin, text:"Gwalior, Madhya Pradesh, India"},
                {Icon:Mail,   text:"feedback@mitsgwalior.ac.in"},
                {Icon:Phone,  text:"+91 751 240 0900"},
              ].map(({Icon,text})=>(
                <div key={text} className="flex items-start gap-2">
                  <Icon size={12} className="text-blue-400 shrink-0 mt-0.5"/>
                  <span className="text-white/55 text-xs">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-bold text-xs mb-2.5 uppercase tracking-widest text-white/60">Developed By</p>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">&lt;/&gt;</div>
              <div>
                <p className="font-bold text-sm">Ajay Meena</p>
                <p className="text-white/50 text-xs">B.Tech CST | 2nd Year</p>
                <p className="text-white/50 text-xs">MITS Gwalior</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-3 text-center">
          <p className="text-white/35 text-xs">© 2025 Madhav Institute of Technology &amp; Science, Gwalior. All rights reserved.</p>
        </div>
      </footer>

      {/* ── LOGIN MODAL ── */}
      {modal === "login" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={e=>{if(e.target===e.currentTarget)setModal(null);}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden">
            <div className={`bg-gradient-to-r ${portal.color} px-5 py-3.5 flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                  <PIcon size={16} className="text-white"/>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{portal.label}</p>
                  <p className="text-white/60 text-xs">MITS Gwalior</p>
                </div>
              </div>
              <button onClick={()=>setModal(null)} className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors">
                <X size={13}/>
              </button>
            </div>
            <div className="px-4 pt-3">
              <div className="flex gap-0.5 bg-slate-100 rounded-xl p-0.5">
                {PORTALS.map(p=>(
                  <button key={p.role} onClick={()=>setPortal(p)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${portal.role===p.role?"bg-white shadow text-slate-800":"text-slate-400 hover:text-slate-600"}`}>
                    {p.role.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 py-4">
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Email</label>
                  <input type="email" placeholder="your@mits.ac.in"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <input type={showPass?"text":"password"} placeholder="••••••••"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
                    <button type="button" onClick={()=>setShowPass(s=>!s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5">
                      {showPass?<EyeOff size={13}/>:<Eye size={13}/>}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r ${portal.color} text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50`}>
                  {loading?<><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>:<><LogIn size={13}/>Sign In</>}
                </button>
              </form>
              <p className="text-center text-xs text-slate-400 mt-3">
                No account?{" "}
                <button onClick={()=>setModal("register")} className="text-blue-600 font-bold hover:underline">Register</button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── REGISTER MODAL ── */}
      {modal === "register" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={e=>{if(e.target===e.currentTarget)setModal(null);}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden">
            <div className={`bg-gradient-to-r ${portal.color} px-5 py-3.5 flex items-center justify-between`}>
              <div>
                <p className="text-white font-bold text-sm">Create Account</p>
                <p className="text-white/60 text-xs">Register as {portal.label}</p>
              </div>
              <button onClick={()=>setModal(null)} className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white">
                <X size={13}/>
              </button>
            </div>
            <div className="px-5 py-4">
              <form onSubmit={handleRegister} className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Role</label>
                  <select className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={form.role} onChange={e=>{setForm({...form,role:e.target.value});setPortal(PORTALS.find(p=>p.role===e.target.value)||PORTALS[0]);}}>
                    {PORTALS.map(p=><option key={p.role} value={p.role}>{p.label}</option>)}
                  </select>
                </div>
                {[["Full Name","name","text","Dr. Full Name"],["Email","email","email","your@mits.ac.in"],["Department","department","text","Dept. of CST"],["Password","password","password","Min 6 chars"]].map(([label,field,type,ph])=>(
                  <div key={field}>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">{label}</label>
                    <input type={field==="password"?(showPass?"text":"password"):type} placeholder={ph}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} required={field!=="department"}/>
                  </div>
                ))}
                <button type="submit" disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r ${portal.color} text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 mt-1`}>
                  {loading?<><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating...</>:<><UserPlus size={13}/>Create Account</>}
                </button>
              </form>
              <p className="text-center text-xs text-slate-400 mt-3">
                Already have an account?{" "}
                <button onClick={()=>setModal("login")} className="text-blue-600 font-bold hover:underline">Sign In</button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
