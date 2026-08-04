import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut, Bell, Settings, Sun, Moon, Home,
  CheckCheck, X, User, ChevronDown, Clock,
  LayoutDashboard, History, BarChart3
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import mitsLogo from "../assets/mits-logo.png";

const ROLE_CFG = {
  hod:     { label: "HOD",     color: "from-blue-600 to-blue-700",    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",     home: "/hod"     },
  vc:      { label: "VC",      color: "from-violet-600 to-purple-700", badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300", home: "/vc"      },
  faculty: { label: "Faculty", color: "from-emerald-600 to-emerald-700",badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",home: "/faculty" },
  admin:   { label: "Admin",   color: "from-rose-600 to-rose-700",    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",       home: "/admin"   },
};

const NAV_LINKS = {
  hod:     [{ label: "Dashboard", href: "/hod", icon: LayoutDashboard }, { label: "History", href: "/hod/history", icon: History }],
  faculty: [{ label: "Dashboard", href: "/faculty", icon: LayoutDashboard }, { label: "History", href: "/faculty/history", icon: History }],
  vc:      [{ label: "Dashboard", href: "/vc", icon: LayoutDashboard }, { label: "History", href: "/vc/history", icon: History }],
  admin:   [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
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

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Navbar({ title, subtitle }) {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDark, setIsDark] = useState(getInitialDark);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userMenuRef = useRef();
  const notifRef = useRef();

  useEffect(() => { applyDark(isDark); }, [isDark]);

  const api = useCallback(
    () => axios.create({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  useEffect(() => {
    if (!token) return;
    function fetchNotifs() {
      api().get("/api/notifications")
        .then(({ data }) => {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {});
    }
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 20000);
    return () => clearInterval(iv);
  }, [token, api]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function markAllRead() {
    try {
      await api().patch("/api/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  }

  async function handleNotifClick(n) {
    if (!n.read) {
      try {
        await api().patch(`/api/notifications/${n._id}/read`);
        setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, read: true } : item));
        setUnreadCount(c => Math.max(0, c - 1));
      } catch {}
    }
    setNotifOpen(false);
    if (user?.role === "faculty") navigate(n.type === "vc_approved" ? "/faculty/history" : "/faculty");
    else if (user?.role === "hod") navigate(["vc_approved", "vc_rejected"].includes(n.type) ? "/hod/history" : "/hod");
  }

  function handleLogout() {
    logout();
    navigate("/landing");
    toast.success("Logged out successfully");
  }

  const role = user?.role || "hod";
  const cfg = ROLE_CFG[role] || ROLE_CFG.hod;
  const navLinks = NAV_LINKS[role] || [];
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U";

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15" style={{ height: "60px" }}>

          {/* Left — Logo + Nav Links */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href={cfg.home} className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm bg-white">
                <img src={mitsLogo} alt="MITS" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">MITS Gwalior</p>
                <p className="text-blue-600 dark:text-blue-400 text-[10px] leading-tight font-medium">Feedback System</p>
              </div>
            </a>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href || (link.href !== cfg.home && location.pathname.startsWith(link.href));
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}>
                    <Icon size={15} />
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Center — Page title (on mobile) */}
          {title && (
            <div className="flex-1 text-center hidden sm:block md:hidden">
              <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{title}</p>
            </div>
          )}

          {/* Right — Actions */}
          <div className="flex items-center gap-1.5">

            {/* Theme toggle */}
            <button
              onClick={() => setIsDark(d => !d)}
              className="btn-icon w-9 h-9 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); }}
                className="btn-icon w-9 h-9 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white relative">
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification panel */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in overflow-hidden z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</p>
                      {unreadCount > 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead}
                          className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1">
                          <CheckCheck size={12} /> All read
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <Bell size={28} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No notifications yet</p>
                      </div>
                    ) : notifications.map(n => (
                      <button
                        key={n._id}
                        onClick={() => handleNotifClick(n)}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-slate-100 dark:border-slate-800/50
                          hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-blue-500" : "bg-transparent"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!n.read ? "font-semibold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                            {n.message}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock size={10} className="text-slate-400" />
                            <p className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                {/* Avatar */}
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
                ) : (
                  <div className={`w-7 h-7 bg-gradient-to-br ${cfg.color} rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                    {initials}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight max-w-[100px] truncate">
                    {user?.name?.split(" ")[0] || "User"}
                  </p>
                  <p className={`text-[10px] font-semibold ${cfg.badge} px-1.5 py-0.5 rounded-md inline-block`}>
                    {cfg.label}
                  </p>
                </div>
                <ChevronDown size={13} className={`text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in overflow-hidden z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    {user?.department && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5 truncate">{user.department}</p>
                    )}
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <a href={cfg.home}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <LayoutDashboard size={15} className="text-slate-400" /> Dashboard
                    </a>
                    <button
                      onClick={() => { setIsDark(d => !d); setUserMenuOpen(false); }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left">
                      {isDark ? <Sun size={15} className="text-slate-400" /> : <Moon size={15} className="text-slate-400" />}
                      {isDark ? "Light Mode" : "Dark Mode"}
                    </button>
                  </div>

                  <div className="p-1.5 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full text-left font-medium">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page title bar (when title prop is given) */}
      {(title || subtitle) && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2.5 bg-slate-50/80 dark:bg-slate-900/60">
          <div className="max-w-screen-2xl mx-auto flex items-center gap-3">
            <div>
              {title && <h1 className="font-semibold text-slate-900 dark:text-white text-base">{title}</h1>}
              {subtitle && <p className="text-slate-500 dark:text-slate-400 text-xs">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
