import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogIn, X, Building2, Users, GraduationCap, Shield, Mail, Github, Linkedin, UserPlus, Zap, Code2, Brain, GitCommit } from "lucide-react";
import mitsLogo from "../assets/mits-logo.png";
import { useAuth } from "../context/AuthContext";
import SignatureUpload from "../components/SignatureUpload";

const PORTALS = [
  { role:"hod",     label:"Head of Department", icon:Building2,     port:5173, color:"from-blue-600 to-blue-800",       hex:"#2563eb" },
  { role:"faculty", label:"Faculty Member",      icon:Users,         port:5175, color:"from-emerald-600 to-emerald-800", hex:"#059669" },
  { role:"vc",      label:"Vice Chancellor",     icon:GraduationCap, port:5174, color:"from-violet-600 to-violet-800",   hex:"#7c3aed" },
  { role:"admin",   label:"System Admin",        icon:Shield,        port:5177, color:"from-rose-600 to-rose-800",       hex:"#e11d48" },
];

const SKILLS = [
  { name:"React.js",  pct:92, color:"#61dafb" },
  { name:"Node.js",   pct:88, color:"#68a063" },
  { name:"MongoDB",   pct:80, color:"#47a248" },
  { name:"AI / ML",   pct:75, color:"#a855f7" },
  { name:"Tailwind",  pct:95, color:"#38bdf8" },
  { name:"PDF-lib",   pct:85, color:"#f59e0b" },
];

const COMMITS = [
  { msg:"feat: AI comment classifier integrated",   time:"2m ago",  color:"#22c55e" },
  { msg:"fix: PDF signature stamping on all pages", time:"1h ago",  color:"#3b82f6" },
  { msg:"feat: VC approval pipeline complete",      time:"3h ago",  color:"#a855f7" },
  { msg:"refactor: pdfGenerator v4 clean rewrite",  time:"1d ago",  color:"#f59e0b" },
  { msg:"feat: HOD dashboard CSV upload flow",      time:"2d ago",  color:"#22c55e" },
];

// ── Particle canvas background ────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const particles = Array.from({length:60}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4,
      r: Math.random()*1.5+0.5, a: Math.random()
    }));
    let raf;
    function draw() {
      ctx.clearRect(0,0,W,H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>W) p.vx*=-1;
        if (p.y<0||p.y>H) p.vy*=-1;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle = `rgba(99,102,241,${p.a*0.6})`;
        ctx.fill();
      });
      // draw lines between close particles
      for (let i=0;i<particles.length;i++) {
        for (let j=i+1;j<particles.length;j++) {
          const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
          const dist=Math.sqrt(dx*dx+dy*dy);
          if (dist<100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x,particles[i].y);
            ctx.lineTo(particles[j].x,particles[j].y);
            ctx.strokeStyle=`rgba(99,102,241,${(1-dist/100)*0.15})`;
            ctx.lineWidth=0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    const ro = new ResizeObserver(() => { W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; });
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"/>;
}

// ── 3D tilt card ──────────────────────────────────────────────
function TiltCard({ children, className="" }) {
  const ref = useRef(null);
  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left - r.width/2;
    const y = e.clientY - r.top  - r.height/2;
    ref.current.style.transform = `perspective(600px) rotateY(${x/20}deg) rotateX(${-y/20}deg) scale(1.02)`;
  }
  function onLeave() { ref.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)"; }
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      className={`transition-transform duration-200 ${className}`} style={{transformStyle:"preserve-3d"}}>
      {children}
    </div>
  );
}

// ── Glitch text ───────────────────────────────────────────────
function GlitchText({ text, className="" }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => { setGlitch(true); setTimeout(()=>setGlitch(false), 150); }, 3000+Math.random()*2000);
    return () => clearInterval(iv);
  }, []);
  return (
    <span className={`relative inline-block ${className}`}>
      {text}
      {glitch && <>
        <span className="absolute inset-0 text-cyan-400 opacity-80" style={{clipPath:"inset(30% 0 50% 0)",transform:"translateX(-2px)"}}>{text}</span>
        <span className="absolute inset-0 text-red-400 opacity-80"  style={{clipPath:"inset(60% 0 20% 0)",transform:"translateX(2px)"}}>{text}</span>
      </>}
    </span>
  );
}

// ── Animated skill bar ────────────────────────────────────────
function SkillBar({ name, pct, color, delay=0 }) {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) setTimeout(()=>setWidth(pct), delay); }, {threshold:0.3});
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [pct, delay]);
  return (
    <div ref={ref} className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-white/60 text-xs font-mono">{name}</span>
        <span className="text-xs font-bold" style={{color}}>{width}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{width:`${width}%`, background:`linear-gradient(90deg, ${color}88, ${color})`}}/>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [modal, setModal]         = useState(null);
  const [portal, setPortal]       = useState(PORTALS[0]);
  const [form, setForm]           = useState({ name:"", email:"", password:"", department:"", role:"hod" });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [clock, setClock]         = useState("");
  const [commitIdx, setCommitIdx] = useState(0);

  const [showSig, setShowSig] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null);

  // typewriter
  const roles = ["Full Stack Developer","AI Enthusiast","React · Node.js · MongoDB","MITS Gwalior · B.Tech CST"];
  const [roleIdx, setRoleIdx]     = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping]       = useState(true);

  useEffect(() => {
    const target = roles[roleIdx];
    let t;
    if (typing) {
      if (displayed.length < target.length) t = setTimeout(()=>setDisplayed(target.slice(0,displayed.length+1)), 55);
      else t = setTimeout(()=>setTyping(false), 2000);
    } else {
      if (displayed.length > 0) t = setTimeout(()=>setDisplayed(displayed.slice(0,-1)), 25);
      else { setRoleIdx(i=>(i+1)%roles.length); setTyping(true); }
    }
    return ()=>clearTimeout(t);
  }, [displayed, typing, roleIdx]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const portalParam = params.get("portal");
    if (portalParam) {
      const p = PORTALS.find(x => x.role === portalParam);
      if (p) {
        openModal("login", p);
      }
    }
  }, []);

  useEffect(()=>{
    const tick=()=>setClock(new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}));
    tick(); const iv=setInterval(tick,1000); return ()=>clearInterval(iv);
  },[]);

  // rotating commits
  useEffect(()=>{
    const iv=setInterval(()=>setCommitIdx(i=>(i+1)%COMMITS.length),2500);
    return ()=>clearInterval(iv);
  },[]);

  function openModal(type, p) {
    setPortal(p||PORTALS[0]);
    setForm({name:"",email:"",password:"",department:"",role:p?.role||"hod"});
    setShowPass(false); setModal(type);
  }

  async function handleLogin(e) {
    e.preventDefault(); setLoading(true);
    try {
      const {data} = await axios.post("/api/auth/login",{email:form.email,password:form.password});
      if (data.user.role!==portal.role){toast.error(`This portal is for ${portal.label} only`);return;}
      
      if (data.user.role !== 'admin' && !data.user.hasSignature) {
        setPendingAuth(data);
        setModal(null);
        setShowSig(true);
      } else {
        login(data.user, data.token);
        navigate(data.user.role==="vc"?"/vc":data.user.role==="faculty"?"/faculty":data.user.role==="admin"?"/admin":"/hod");
      }
    } catch(err){toast.error(err.response?.data?.error||"Invalid credentials");}
    finally{setLoading(false);}
  }

  async function handleDemoLogin(role, email) {
    setLoading(true);
    try {
      const p = PORTALS.find(x => x.role === role) || PORTALS[0];
      setPortal(p);
      const {data} = await axios.post("/api/auth/login", { email, password: "mits123" });
      
      if (data.user.role !== 'admin' && !data.user.hasSignature) {
        setPendingAuth(data);
        setModal(null);
        setShowSig(true);
      } else {
        login(data.user, data.token);
        navigate(data.user.role === "vc" ? "/vc" : data.user.role === "faculty" ? "/faculty" : data.user.role === "admin" ? "/admin" : "/hod");
      }
      toast.success(`Logged in as ${p.label}!`);
    } catch(err) {
      toast.error(err.response?.data?.error || "Demo login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post("/api/auth/register",{name:form.name,email:form.email,password:form.password,role:form.role,department:form.department});
      toast.success("Account created! Please login."); setModal("login");
    } catch(err){toast.error(err.response?.data?.error||"Registration failed");}
    finally{setLoading(false);}
  }

  const PIcon = portal.icon;
  const commit = COMMITS[commitIdx];

  return (
    <div className="min-h-screen bg-[#080b14] text-white flex flex-col overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-[#080b14]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={mitsLogo} alt="MITS" className="h-9 w-auto object-contain rounded opacity-90"/>
            <div className="hidden sm:block">
              <p className="font-bold text-white text-sm leading-tight">Faculty Feedback System</p>
              <p className="text-white/30 text-xs">MITS Gwalior · Deemed University</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>openModal("register")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-sm font-semibold transition-all hover:bg-white/5">
              <UserPlus size={14}/> Sign Up
            </button>
            <button onClick={()=>openModal("login")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-900/50">
              <LogIn size={14}/> Sign In
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO with particle canvas ── */}
      <section className="relative overflow-hidden py-20 px-6">
        <ParticleCanvas/>
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 via-transparent to-[#080b14] pointer-events-none"/>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"/>
            Academic Year 2025–26 · MITS Gwalior
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Faculty Feedback<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-violet-400">
              Analysis System
            </span>
          </h1>
          <p className="text-white/40 text-base max-w-xl mx-auto">AI-powered platform for managing faculty feedback — from CSV upload to VC approval.</p>
        </div>
      </section>

      {/* ── PORTAL CARDS ── */}
      <section className="px-6 pb-16 max-w-7xl mx-auto w-full">
        <p className="text-white/20 text-xs font-bold uppercase tracking-widest text-center mb-6">Choose Your Portal</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PORTALS.map(p => {
            const Icon = p.icon;
            return (
              <TiltCard key={p.role}>
                <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col gap-4 transition-colors duration-300 cursor-pointer h-full"
                  style={{boxShadow:`0 0 0 0 ${p.hex}00`}}>
                  <div className={`w-11 h-11 bg-gradient-to-br ${p.color} rounded-xl flex items-center justify-center shadow-lg`}
                    style={{boxShadow:`0 4px 20px ${p.hex}40`}}>
                    <Icon size={20} className="text-white"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Portal</p>
                    <p className="text-white font-bold text-base">{p.label}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>openModal("login",p)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r ${p.color} text-white text-xs font-bold hover:opacity-90 transition-opacity`}>
                      <LogIn size={12}/> Sign In
                    </button>
                    <button onClick={()=>openModal("register",p)}
                      className="flex items-center justify-center px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10 text-white/40 hover:text-white/80 text-xs transition-all">
                      <UserPlus size={12}/>
                    </button>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* ── DEMO CREDENTIALS ── */}
      <section className="px-6 pb-16 max-w-7xl mx-auto w-full">
        <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"/>
            <h2 className="font-bold text-lg text-white">One-Click Demo Access</h2>
            <span className="text-white/30 text-xs font-mono ml-auto">password: mits123</span>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { role:"hod",     name:"Dr. Anita Verma", email:"wegegjgdgdscg98@gmail.com" },
              { role:"faculty", name:"Tanuja Sharma",   email:"tanuja.sharma@mits.ac.in" },
              { role:"vc",      name:"ajaymeena",       email:"ramsevakmeena93@gmail.com" },
              { role:"admin",   name:"System Admin",    email:"admin@mits.ac.in" },
            ].map(c => (
              <button key={c.role} onClick={() => handleDemoLogin(c.role, c.email)}
                className="bg-gradient-to-br from-white/[0.02] to-white/[0.04] hover:from-white/[0.04] hover:to-white/[0.08] border border-white/10 hover:border-white/20 rounded-2xl p-4 text-left transition-all hover:scale-[1.02] duration-200 flex flex-col justify-between h-32 group">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{c.role} account</p>
                  <p className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors truncate">{c.name}</p>
                  <p className="text-xs text-white/40 truncate font-mono mt-0.5">{c.email}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold mt-auto text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  <Zap size={12} className="fill-current animate-pulse"/> One-Click Login
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEVELOPER + GUIDED BY ── */}
      <section className="px-6 pb-16 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-5 gap-4 max-w-5xl mx-auto">

          {/* ── Developer card ── */}
          <TiltCard className="lg:col-span-3">
            <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden h-full"
              style={{boxShadow:"0 0 40px rgba(99,102,241,0.08)"}}>
              {/* animated border glow */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{background:"linear-gradient(135deg,rgba(99,102,241,0.1),transparent 50%,rgba(168,85,247,0.05))"}}/>

              {/* terminal top bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]"/>
                <span className="w-3 h-3 rounded-full bg-[#febc2e]"/>
                <span className="w-3 h-3 rounded-full bg-[#28c840]"/>
                <span className="ml-3 text-white/20 text-xs font-mono">~/developer/ajay-meena</span>
                <span className="ml-auto font-mono text-xs" style={{color:"#22c55e"}}>{clock}</span>
              </div>

              <div className="p-5">
                <div className="flex gap-4 mb-5">
                  {/* avatar with ring animation */}
                  <div className="shrink-0 relative">
                    <div className="absolute inset-0 rounded-xl animate-ping opacity-20"
                      style={{background:"linear-gradient(135deg,#6366f1,#a855f7)",animationDuration:"3s"}}/>
                    <div className="relative w-16 h-16 rounded-xl p-0.5"
                      style={{background:"linear-gradient(135deg,#6366f1,#a855f7)"}}>
                      <div className="w-full h-full rounded-[10px] overflow-hidden bg-[#0d1117]">
                        <img src="/ajay-meena.png" alt="Ajay Meena" className="w-full h-full object-cover"
                          onError={e=>{e.target.style.display="none";e.target.parentElement.innerHTML='<div class="w-full h-full flex items-center justify-center text-white font-black text-2xl bg-gradient-to-br from-indigo-600 to-violet-700">A</div>';}}/>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22c55e] rounded-full border-2 border-[#0d1117] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"/>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <GlitchText text="Ajay Meena" className="text-white font-bold text-lg"/>
                    <div className="flex items-center gap-1.5 mt-0.5 h-5">
                      <span className="text-indigo-400 text-xs font-mono">&gt; </span>
                      <span className="text-cyan-400 text-xs font-mono">{displayed}</span>
                      <span className="w-0.5 h-3.5 bg-cyan-400 animate-pulse"/>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {["React","Node.js","MongoDB","AI/ML","Tailwind","PDF-lib"].map((s,i)=>(
                        <span key={s} className="px-2 py-0.5 text-[10px] font-bold rounded border font-mono"
                          style={{
                            color:["#61dafb","#68a063","#47a248","#a855f7","#38bdf8","#f59e0b"][i],
                            borderColor:["#61dafb","#68a063","#47a248","#a855f7","#38bdf8","#f59e0b"][i]+"33",
                            background:["#61dafb","#68a063","#47a248","#a855f7","#38bdf8","#f59e0b"][i]+"0d",
                          }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* skill bars */}
                <div className="space-y-2 mb-4">
                  {SKILLS.map((s,i)=><SkillBar key={s.name} {...s} delay={i*100}/>)}
                </div>

                {/* live commit feed */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GitCommit size={11} className="text-white/30"/>
                    <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">Latest Activity</span>
                  </div>
                  <div className="flex items-start gap-2 transition-all duration-500">
                    <span className="w-2 h-2 rounded-full mt-1 shrink-0 animate-pulse" style={{background:commit.color}}/>
                    <div className="min-w-0">
                      <p className="text-white/70 text-xs font-mono truncate">{commit.msg}</p>
                      <p className="text-white/25 text-[10px] mt-0.5">{commit.time}</p>
                    </div>
                  </div>
                </div>

                {/* info row */}
                <div className="flex gap-4 pt-3 border-t border-white/5 mb-4">
                  {[["B.Tech CST","Branch"],["2nd Year","Year"],["MITS","Institute"]].map(([v,l])=>(
                    <div key={l}>
                      <p className="text-white font-bold text-xs">{v}</p>
                      <p className="text-white/25 text-[10px] font-mono">{l}</p>
                    </div>
                  ))}
                </div>

                {/* contact */}
                <div className="flex gap-2">
                  {[
                    {href:"mailto:25tc1aj7@mitsgwl.ac.in", icon:Mail,     label:"Email",    c:"#6366f1"},
                    {href:"https://www.linkedin.com/in/ajay-meena-607a7b376", icon:Linkedin, label:"LinkedIn", c:"#0ea5e9", target:"_blank"},
                    {href:"https://github.com/ramsevakmeena93-hub", icon:Github, label:"GitHub", c:"#e2e8f0", target:"_blank"},
                  ].map(({href,icon:Icon,label,c,target})=>(
                    <a key={label} href={href} target={target} rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:scale-105"
                      style={{color:c,borderColor:c+"33",background:c+"0d"}}>
                      <Icon size={11}/>{label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </TiltCard>

          {/* ── Guided By card ── */}
          <TiltCard className="lg:col-span-2">
            <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden h-full"
              style={{boxShadow:"0 0 40px rgba(168,85,247,0.06)"}}>
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{background:"linear-gradient(135deg,rgba(168,85,247,0.08),transparent)"}}/>

              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]"/>
                <span className="w-3 h-3 rounded-full bg-[#febc2e]"/>
                <span className="w-3 h-3 rounded-full bg-[#28c840]"/>
                <span className="ml-3 text-white/20 text-xs font-mono">~/supervisor</span>
              </div>

              <div className="p-5 flex flex-col h-[calc(100%-44px)]">
                <p className="text-violet-400/60 text-[10px] font-mono mb-4">
                  <span className="text-white/20">// </span>guided_by.json
                </p>

                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-xl animate-pulse opacity-30"
                    style={{background:"linear-gradient(135deg,#7c3aed,#a855f7)",animationDuration:"4s"}}/>
                  <div className="relative w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-2xl"
                    style={{background:"linear-gradient(135deg,#7c3aed,#a855f7)",boxShadow:"0 4px 20px rgba(124,58,237,0.4)"}}>
                    P
                  </div>
                </div>

                <GlitchText text="Prof. [Guide Name]" className="text-white font-bold text-base"/>
                <p className="text-violet-400 text-xs font-mono mt-0.5">Project Supervisor</p>

                <div className="mt-4 space-y-2 flex-1">
                  {[
                    ["department", "Dept. of CST"],
                    ["institute",  "MITS Gwalior"],
                    ["session",    "2025–26"],
                    ["role",       "Project Guide"],
                  ].map(([k,v])=>(
                    <div key={k} className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-violet-400/60">{k}:</span>
                      <span className="text-white/60">"{v}"</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Zap size={11} className="text-yellow-400"/>
                    <span className="text-white/30 text-[10px] font-mono">Project Status</span>
                    <span className="ml-auto text-[10px] font-bold text-green-400 font-mono">● ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-5 px-6 text-center">
        <p className="text-white/20 text-xs font-mono">
          © 2025 Madhav Institute of Technology &amp; Science, Gwalior · Faculty Feedback Analysis System
        </p>
      </footer>

      {/* ── LOGIN MODAL ── */}
      {modal === "login" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={e=>{if(e.target===e.currentTarget)setModal(null);}}>
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            style={{boxShadow:`0 0 60px ${portal.hex}30`}}>
            <div className={`bg-gradient-to-r ${portal.color} px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                  <PIcon size={18} className="text-white"/>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{portal.label}</p>
                  <p className="text-white/60 text-xs font-mono">sign_in.exe</p>
                </div>
              </div>
              <button onClick={()=>setModal(null)} className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors">
                <X size={14}/>
              </button>
            </div>
            <div className="px-4 pt-4">
              <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                {PORTALS.map(p=>(
                  <button key={p.role} onClick={()=>setPortal(p)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all font-mono ${portal.role===p.role?"bg-white/15 text-white":"text-white/25 hover:text-white/50"}`}>
                    {p.role}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-6 py-5">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/30 mb-1.5 uppercase tracking-widest font-mono">Email</label>
                  <input type="email" placeholder="your@mits.ac.in"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
                    value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/30 mb-1.5 uppercase tracking-widest font-mono">Password</label>
                  <div className="relative">
                    <input type={showPass?"text":"password"} placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                      value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
                    <button type="button" onClick={()=>setShowPass(s=>!s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 p-1">
                      {showPass?<EyeOff size={14}/>:<Eye size={14}/>}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r ${portal.color} text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50`}>
                  {loading?<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>:<><LogIn size={14}/>Sign In</>}
                </button>
              </form>
              <p className="text-center text-xs text-white/25 mt-4 font-mono">
                no_account?{" "}
                <button onClick={()=>setModal("register")} className="text-indigo-400 font-bold hover:underline">register()</button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── REGISTER MODAL ── */}
      {modal === "register" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={e=>{if(e.target===e.currentTarget)setModal(null);}}>
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            style={{boxShadow:`0 0 60px ${portal.hex}30`}}>
            <div className={`bg-gradient-to-r ${portal.color} px-6 py-4 flex items-center justify-between`}>
              <div>
                <p className="text-white font-bold text-sm">Create Account</p>
                <p className="text-white/60 text-xs font-mono">register.exe</p>
              </div>
              <button onClick={()=>setModal(null)} className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors">
                <X size={14}/>
              </button>
            </div>
            <div className="px-6 py-5">
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-white/30 mb-1.5 uppercase tracking-widest font-mono">Role</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    value={form.role} onChange={e=>{setForm({...form,role:e.target.value});setPortal(PORTALS.find(p=>p.role===e.target.value)||PORTALS[0]);}}>
                    {PORTALS.map(p=><option key={p.role} value={p.role} className="bg-[#0d1117]">{p.label}</option>)}
                  </select>
                </div>
                {[["Full Name","name","text","Dr. Full Name"],["Email","email","email","your@mits.ac.in"],["Department","department","text","Computer Science & Technology"],["Password","password","password","Min 6 characters"]].map(([label,field,type,ph])=>(
                  <div key={field}>
                    <label className="block text-[10px] font-bold text-white/30 mb-1.5 uppercase tracking-widest font-mono">{label}</label>
                    <input type={field==="password"?(showPass?"text":"password"):type} placeholder={ph}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                      value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} required={field!=="department"}/>
                  </div>
                ))}
                <button type="submit" disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r ${portal.color} text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 mt-1`}>
                  {loading?<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating...</>:<><UserPlus size={14}/>Create Account</>}
                </button>
              </form>
              <p className="text-center text-xs text-white/25 mt-4 font-mono">
                have_account?{" "}
                <button onClick={()=>setModal("login")} className="text-indigo-400 font-bold hover:underline">login()</button>
              </p>
            </div>
          </div>
        </div>
      )}

      {showSig && pendingAuth && (
        <SignatureUpload
          token={pendingAuth.token}
          onSaved={(sigImg) => {
            setShowSig(false);
            const updatedUser = { ...pendingAuth.user, hasSignature: true, signatureImage: sigImg };
            login(updatedUser, pendingAuth.token);
            navigate(updatedUser.role === "vc" ? "/vc" : updatedUser.role === "faculty" ? "/faculty" : updatedUser.role === "admin" ? "/admin" : "/hod");
          }}
          onSkip={() => {
            setShowSig(false);
            login(pendingAuth.user, pendingAuth.token);
            navigate(pendingAuth.user.role === "vc" ? "/vc" : pendingAuth.user.role === "faculty" ? "/faculty" : pendingAuth.user.role === "admin" ? "/admin" : "/hod");
          }}
        />
      )}

    </div>
  );
}
