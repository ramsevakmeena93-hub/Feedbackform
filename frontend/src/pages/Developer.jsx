import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const TECH = ["React 18","Node.js","Express","MongoDB","HuggingFace AI","pdfjs-dist","Tailwind CSS","JWT Auth","pdf-lib"];

export default function Developer() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      {/* Same Navbar as all other pages — keeps HOD/VC/Faculty connected */}
      <Navbar title="Developer Info" subtitle="About this system" />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Hero card */}
        <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-4xl shrink-0 border border-white/20">🏛️</div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold mb-1">Automated Faculty Feedback Analysis System</h1>
              <p className="text-indigo-300 text-sm mb-1">Madhav Institute of Technology & Science, Gwalior (Deemed University)</p>
              <p className="text-slate-400 text-xs">Department of Computer Science & Technology · Academic Year 2025–26</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-8 mb-6">
            {TECH.map(t => (
              <span key={t} className="bg-white/10 border border-white/15 text-white/90 text-xs px-3 py-1.5 rounded-full font-medium">{t}</span>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ["Backend",   "Node.js + Express + MongoDB"],
              ["Frontend",  "React 18 + Vite + Tailwind CSS"],
              ["AI Engine", "HuggingFace + pdfjs-dist + pdf-lib"],
            ].map(([label, val]) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-indigo-300 font-semibold text-sm mb-1">{label}</p>
                <p className="text-slate-300 text-sm">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-5">System Pipeline</h2>
          <div className="space-y-3">
            {[
              ["01","HOD uploads CSV",      "Google Drive PDF links extracted automatically"],
              ["02","AI Analysis",          "HuggingFace classifies comments as appreciation or attention"],
              ["03","HOD Review",           "Sequential review — OK button sends to faculty dashboard"],
              ["04","Faculty Confirms",     "Faculty reads report and acknowledges with one click"],
              ["05","Send to VC",           "HOD sends all faculty-approved reports to Vice Chancellor"],
              ["06","VC Approves",          "VC reviews, approves or rejects. Final PDF with signatures generated"],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-2xl font-black text-indigo-200 dark:text-indigo-800 leading-none w-8 shrink-0">{n}</span>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{title}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portals */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-5">Portals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ["HOD Portal",     "localhost:5173","Upload CSV, review reports, manage pipeline"],
              ["Faculty Portal", "localhost:5175","View feedback, acknowledge reports"],
              ["VC Portal",      "localhost:5174","Review submissions, approve or reject"],
            ].map(([name, url, desc]) => (
              <div key={name} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{name}</p>
                <p className="text-indigo-600 dark:text-indigo-400 text-xs font-mono mb-2">{url}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Logged in as */}
        {user && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-5 flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Logged in as {user.name}</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">{user.role?.toUpperCase()} · {user.department || "MITS Gwalior"}</p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
