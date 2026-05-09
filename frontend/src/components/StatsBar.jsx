import { FileText, CheckCircle, Clock, AlertCircle, ThumbsUp, AlertTriangle } from "lucide-react";

const CARDS = [
  { key:"total",        label:"Total Reports",   icon:FileText,      color:"text-indigo-600",  bg:"bg-indigo-50",  border:"border-indigo-100" },
  { key:"processed",    label:"Processed",        icon:CheckCircle,   color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-100" },
  { key:"pending",      label:"Pending",          icon:Clock,         color:"text-amber-600",   bg:"bg-amber-50",   border:"border-amber-100" },
  { key:"errors",       label:"Errors",           icon:AlertCircle,   color:"text-red-600",     bg:"bg-red-50",     border:"border-red-100" },
  { key:"totalAppreciation", label:"Appreciation",icon:ThumbsUp,      color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-100" },
  { key:"totalAttention",    label:"Needs Attention",icon:AlertTriangle,color:"text-amber-600", bg:"bg-amber-50",   border:"border-amber-100" },
];

export default function StatsBar({ total=0, processed=0, pending=0, errors=0, totalAppreciation=0, totalAttention=0 }) {
  const vals = { total, processed, pending, errors, totalAppreciation, totalAttention };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map(({ key, label, icon:Icon, color, bg, border }) => (
        <div key={key} className={`card-hover p-4 border ${border} animate-fade-in`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center`}>
              <Icon size={15} className={color} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${color} leading-none mb-1`}>{vals[key]}</p>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
        </div>
      ))}
    </div>
  );
}
