import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Bell, ChevronDown, Upload, Check, X, Settings, CheckCheck, Archive, Sun, Moon, Home, Code2, LayoutDashboard } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ROLE_CFG = {
  hod:     { grad:"from-indigo-600 to-violet-600",  badge:"bg-indigo-100 text-indigo-700",  label:"HOD",     home:"/hod"     },
  vc:      { grad:"from-purple-600 to-indigo-600",  badge:"bg-purple-100 text-purple-700",  label:"VC",      home:"/vc"      },
  faculty: { grad:"from-emerald-600 to-teal-600",   badge:"bg-emerald-100 text-emerald-700",label:"Faculty", home:"/faculty" },
  admin:   { grad:"from-red-600 to-rose-600",       badge:"bg-red-100 text-red-700",        label:"Admin",   home:"/admin"   },
};

function getInitialDark() {
  try {
    const s = localStorage.getItem("theme");
    if (s) return s === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch { return false; }
}
function applyDark(dark) {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
}

export default function Navbar({ title, subtitle }) {
  const { user, token, logout, login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const fileRef   = useRef();

  const [dropOpen,    setDropOpen]    = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sigPreview,  setSigPreview]  = useState(user?.signatureImage || null);
  const [savingSig,   setSavingSig]   = useState(false);
  const [isDark,      setIsDark]      = useState(getInitialDark);
  const [notifications,  setNotifications]  = useState([]);
  const [unreadCount,    setUnreadCount]     = useState(0);
  const [showNotifs,     setShowNotifs]      = useState(false);

  useEffect(() => { applyDark(isDark); }, [isDark]);

  const api = useCallback(() => axios.create({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  useEffect(() => {
    if (!token) return;
    function fetchNotifs() {
      api().get("/api/notifications")
        .then(({ data }) => { setNotifications(data.notifications||[]); setUnreadCount(data.unreadCount||0); })
        .catch(() => {});
    }
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 15000);
    return () => clearInterval(iv);
  }, [token, api]);

  async function markAllRead() {
    try {
      await api().patch("/api/notifications/read-all");
      setNotifications(prev => prev.map(n => ({...n, read:true})));
      setUnreadCount(0);
    } catch {}
  }

  const role = user?.role || "hod";
  const cfg  = ROLE_CFG[role] || ROLE_CFG.hod;

  function handleLogout() {
    logout();
    // Redirect to main landing page
    window.location.href = "http://localhost:5176/landing";
  }

  function handleSigFile(e) {
    const file = e.target.files[0]; if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please upload PNG or JPG");
    if (file.size > 2*1024*1024) return toast.error("Image must be under 2MB");
    const reader = new FileReader();
    reader.onload = ev => setSigPreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleSaveSig() {
    if (!sigPreview) return;
    setSavingSig(true);
    try {
      await axios.post("/api/auth/signature", { signatureImage: sigPreview }, { headers: { Authorization: `Bearer ${token}` } });
      login({ ...user, signatureImage: sigPreview, hasSignature: true }, token);
      toast.success("Signature saved");
    } catch { toast.error("Failed to save signature"); }
    finally { setSavingSig(false); }
  }

  // Nav links — Home goes to DASHBOARD (user is logged in), not landing page
  const navLinks = [
    { label:"Dashboard", icon:LayoutDashboard, path:cfg.home,           exact:true  },
    { label:"Developer", icon:Code2,           path:"/developer",       exact:false },
    { label:"History",   icon:Archive,         path:`/${role}/history`, exact:false },
  ];

  function isActive(path, exact) {
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  }

  const closeAll = () => { setDropOpen(false); setShowNotifs(false); };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center gap-4">

            {/* ── Logo (left) ── */}
            <button onClick={() => navigate(cfg.home)}
              className={`w-8 h-8 bg-gradient-to-br ${cfg.grad} rounded-xl flex items-center justify-center text-white font-black text-sm shadow hover:scale-105 transition-all shrink-0`}>
              M
            </button>

            {/* ── Page title (left, after logo) ── */}
            <div className="hidden sm:flex items-center gap-2 text-sm min-w-0 flex-1">
              <span className="text-slate-400 dark:text-slate-500 font-medium text-xs uppercase tracking-widest">MITS</span>
              <span className="text-slate-300 dark:text-slate-600">›</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{title || "Dashboard"}</span>
              {subtitle && <><span className="text-slate-300 dark:text-slate-600">›</span><span className="text-slate-500 dark:text-slate-400 text-xs truncate">{subtitle}</span></>}
            </div>
            <div className="sm:hidden flex-1 font-semibold text-slate-700 dark:text-slate-200 text-sm truncate">{title}</div>

            {/* ── Nav links (RIGHT side, before actions) ── */}
            <nav className="hidden md:flex items-center gap-0.5 shrink-0">
              {navLinks.map(({ label, icon:Icon, path, exact }) => (
                <button key={label} onClick={() => navigate(path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive(path, exact)
                      ? `bg-gradient-to-br ${cfg.grad} text-white shadow-sm`
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}>
                  <Icon size={13} />{label}
                </button>
              ))}
            </nav>

            {/* ── Actions (far right) ── */}
            <div className="flex items-center gap-1 shrink-0">

              {/* Dark/Light */}
              <button onClick={() => setIsDark(d => !d)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 transition-all">
                {isDark ? <Sun size={15}/> : <Moon size={15}/>}
              </button>

              {/* Bell */}
              <div className="relative hidden sm:block">
                <button onClick={() => { setShowNotifs(o=>!o); setDropOpen(false); if(unreadCount>0) markAllRead(); }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative">
                  <Bell size={15}/>
                  {unreadCount>0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                      {unreadCount>9?"9+":unreadCount}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-elevated animate-scale-in z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Notifications</p>
                      {notifications.length>0 && (
                        <button onClick={markAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <CheckCheck size={12}/> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto scrollbar-thin">
                      {notifications.length===0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell size={24} className="text-slate-200 dark:text-slate-700 mx-auto mb-2"/>
                          <p className="text-xs text-slate-400">No notifications yet</p>
                        </div>
                      ) : notifications.map(n => (
                        <div key={n._id} className={`px-4 py-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${!n.read?"bg-indigo-50/50 dark:bg-indigo-900/20":""}`}>
                          <div className="flex items-start gap-2.5">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read?"bg-indigo-500":"bg-slate-200 dark:bg-slate-600"}`}/>
                            <div className="min-w-0">
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{n.message}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5"/>

              {/* User dropdown */}
              <div className="relative">
                <button onClick={() => { setDropOpen(o=>!o); setShowNotifs(false); }}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className={`w-7 h-7 bg-gradient-to-br ${cfg.grad} rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden`}>
                    {user?.signatureImage ? <img src={user.signatureImage} alt="sig" className="w-full h-full object-cover"/> : user?.name?.[0]?.toUpperCase()||"U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">{user?.name||"User"}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-tight">{cfg.label}</p>
                  </div>
                  <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${dropOpen?"rotate-180":""}`}/>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-elevated animate-scale-in z-50 overflow-hidden">
                    <div className={`bg-gradient-to-br ${cfg.grad} px-4 py-4`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg border border-white/30 overflow-hidden">
                          {user?.signatureImage ? <img src={user.signatureImage} alt="sig" className="w-full h-full object-cover"/> : user?.name?.[0]?.toUpperCase()||"U"}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm leading-tight">{user?.name}</p>
                          <p className="text-white/70 text-xs">{user?.email}</p>
                          <span className="mt-1 inline-block text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">{cfg.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
                      {user?.department && <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"><span>🏛️</span><span>{user.department}</span></div>}
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"><span>🎓</span><span>MITS Gwalior · Deemed University</span></div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"><span>📅</span><span>Academic Year 2025–26</span></div>
                    </div>
                    {[
                      { icon:LayoutDashboard, label:"Dashboard",        action:() => { navigate(cfg.home); closeAll(); } },
                      { icon:Archive,         label:"Report History",   action:() => { navigate(`/${role}/history`); closeAll(); } },
                      { icon:Code2,           label:"Developer Info",   action:() => { navigate("/developer"); closeAll(); } },
                      { icon:Settings,        label:"Profile & Signature", action:() => { setShowProfile(true); closeAll(); } },
                    ].map(({ icon:Icon, label, action }) => (
                      <div key={label} className="px-2 py-0.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <button onClick={action}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                          <Icon size={14} className="text-slate-400"/>
                          {label}
                        </button>
                      </div>
                    ))}
                    <div className="px-2 py-1.5">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                        <LogOut size={14}/> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile nav strip */}
          <div className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto scrollbar-none">
            {navLinks.map(({ label, icon:Icon, path, exact }) => (
              <button key={label} onClick={() => navigate(path)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive(path,exact) ? `bg-gradient-to-br ${cfg.grad} text-white shadow-sm` : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}>
                <Icon size={12}/>{label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {(dropOpen||showNotifs) && <div className="fixed inset-0 z-20" onClick={closeAll}/>}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md animate-scale-in overflow-hidden">
            <div className={`bg-gradient-to-br ${cfg.grad} px-6 py-5 flex items-center justify-between`}>
              <div>
                <h2 className="text-white font-bold text-lg">Profile & Settings</h2>
                <p className="text-white/70 text-xs mt-0.5">Manage your details and signature</p>
              </div>
              <button onClick={() => setShowProfile(false)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-colors">
                <X size={16}/>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Account Details</p>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2.5">
                  {[["Name",user?.name||"—"],["Email",user?.email||"—"],["Role",cfg.label],["Department",user?.department||"—"],["Institute","MITS Gwalior"]].map(([l,v]) => (
                    <div key={l} className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{l}</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Your Signature</p>
                <div onClick={() => fileRef.current.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${sigPreview?"border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20":"border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"}`}>
                  {sigPreview ? (
                    <div><img src={sigPreview} alt="Signature" className="max-h-16 mx-auto object-contain mb-2"/><p className="text-xs text-emerald-600 font-medium">Click to change</p></div>
                  ) : (
                    <div><Upload size={24} className="mx-auto text-slate-300 mb-2"/><p className="text-sm font-medium text-slate-500">Click to upload signature</p><p className="text-xs text-slate-400 mt-1">PNG or JPG · Max 2MB</p></div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleSigFile}/>
                </div>
                {sigPreview && (
                  <button onClick={handleSaveSig} disabled={savingSig} className="btn btn-success w-full">
                    <Check size={14}/>{savingSig?"Saving...":"Save Signature"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
