import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { Building2, Phone, BookOpen, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import mitsLogo from "../assets/mits-logo.png";

const DEPARTMENTS = [
  "Computer Science & Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Information Technology",
  "Chemical Engineering",
  "MBA",
  "MCA",
  "Other"
];

export default function ProfileCompletion() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    department: user?.department || "",
    phone: "",
    designation: ""
  });
  const [saving, setSaving] = useState(false);

  function redirect(role) {
    const dest = role === "vc" ? "/vc"
      : role === "faculty" ? "/faculty"
      : role === "admin" ? "/admin" : "/hod";
    navigate(dest, { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.department) { toast.error("Please select your department"); return; }
    setSaving(true);
    try {
      const api = axios.create({ headers: { Authorization: `Bearer ${token}` } });
      await api.patch("/api/auth/profile", form).catch(() => {});
      const updatedUser = { ...user, department: form.department };
      login(updatedUser, token);
      toast.success("Profile completed! Welcome 🎉");
      redirect(user?.role || "faculty");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-violet-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Sparkles size={28} className="text-white" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <CheckCircle size={12} /> Google Sign-In Successful!
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-slate-400 text-sm">
            Welcome, <span className="text-white font-semibold">{user?.name?.split(" ")[0]}</span>! Help us set up your workspace.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 mb-6">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <p className="text-white font-semibold text-sm">{user?.name}</p>
              <p className="text-slate-400 text-xs">{user?.email}</p>
            </div>
            <span className="ml-auto px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold capitalize">
              {user?.role || "faculty"}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Building2 size={12} /> Department *
              </label>
              <select
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all appearance-none cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.05)' }}
                required>
                <option value="" disabled style={{ background: '#111827' }}>Select your department</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d} style={{ background: '#111827' }}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <BookOpen size={12} /> Designation (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Assistant Professor"
                value={form.designation}
                onChange={e => setForm({ ...form, designation: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Phone size={12} /> Phone (Optional)
              </label>
              <input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => redirect(user?.role || "faculty")}
                className="flex-1 py-3 rounded-xl border border-white/15 text-slate-400 hover:text-white hover:border-white/25 text-sm font-semibold transition-all">
                Skip for now
              </button>
              <button type="submit" disabled={saving}
                className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-lg">
                {saving
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                  : <>Complete Profile <ArrowRight size={14} /></>}
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          <img src={mitsLogo} alt="MITS" className="w-5 h-5 object-contain opacity-40" />
          <p className="text-slate-700 text-xs">MITS Faculty Feedback System · 2025–26</p>
        </div>
      </div>
    </div>
  );
}
