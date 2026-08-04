import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Wrench } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <Wrench size={28}/>
        </div>
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <p className="text-slate-400 text-sm">Under reconstruction — new panel coming soon.</p>
        <p className="text-slate-500 text-xs">Logged in as: {user?.name} ({user?.email})</p>
        <button onClick={() => { logout(); navigate("/landing"); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-semibold mx-auto transition-colors">
          <LogOut size={14}/> Sign Out
        </button>
      </div>
    </div>
  );
}
