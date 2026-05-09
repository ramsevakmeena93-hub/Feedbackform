import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Users, Trash2, RefreshCw, Plus, Edit2, X, Cpu, Shield, Activity,
  Terminal, Circle, Download, Bookmark, BookmarkCheck, Copy, Check,
  Layers, Clock, Zap, Server, MemoryStick, Hash, ChevronDown, ChevronRight,
  Building2, GraduationCap, UserCheck
} from "lucide-react";

const ROLES = ["hod","vc","faculty","admin"];
const LEVEL_COLOR = { error:"text-red-400", warn:"text-yellow-400", info:"text-blue-400", log:"text-slate-300" };
const LEVEL_BG    = {
  error:"bg-red-500/20 text-red-300 border-red-500/30",
  warn:"bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  info:"bg-blue-500/20 text-blue-300 border-blue-500/30",
  log:"bg-slate-500/20 text-slate-300 border-slate-500/30"
};

const ROLE_ICON = { hod: Building2, faculty: Users, vc: GraduationCap, admin: Shield };
const ROLE_COLOR = {
  hod:     "bg-indigo-100 text-indigo-700 border-indigo-200",
  faculty: "bg-emerald-100 text-emerald-700 border-emerald-200",
  vc:      "bg-purple-100 text-purple-700 border-purple-200",
  admin:   "bg-red-100 text-red-700 border-red-200",
};

// Group users: departments → { hod, faculty[] }, then vc/admin separate
function groupByDepartment(users) {
  const depts = {};
  const special = []; // vc, admin

  users.forEach(u => {
    if (u.role === "vc" || u.role === "admin") { special.push(u); return; }
    const dept = u.department || "No Department";
    if (!depts[dept]) depts[dept] = { hod: null, faculty: [] };
    if (u.role === "hod") depts[dept].hod = u;
    else depts[dept].faculty.push(u);
  });

  return { depts, special };
}

// ── Heatmap: 24 hour buckets ──────────────────────────────────
function buildHeatmap(logs) {
  const hours = Array(24).fill(0);
  logs.filter(l => l.level === "error" || l.level === "warn").forEach(l => {
    const h = new Date(l.ts).getHours();
    hours[h]++;
  });
  return hours;
}

// ── Group identical messages ──────────────────────────────────
function groupLogs(logs) {
  const groups = [];
  const seen = new Map();
  logs.forEach(log => {
    const key = log.level + "|" + log.msg.slice(0, 80);
    if (seen.has(key)) {
      seen.get(key).count++;
      seen.get(key).lastTs = log.ts;
    } else {
      const entry = { ...log, count: 1, lastTs: log.ts };
      seen.set(key, entry);
      groups.push(entry);
    }
  });
  return groups;
}

// ── File Tree Component ───────────────────────────────────────
function FileTree({ nodes, openPath, collapsed, onToggleDir, onOpenFile, depth = 0 }) {
  if (!nodes || nodes.length === 0) return null;
  return (
    <div>
      {nodes.map(node => {
        if (node.type === 'dir') {
          const isOpen = !collapsed[node.path];
          return (
            <div key={node.path}>
              <button onClick={() => onToggleDir(node.path)}
                className="w-full flex items-center gap-1.5 px-3 py-1 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors text-left"
                style={{ paddingLeft: `${12 + depth*12}px` }}>
                <span className="text-xs">{isOpen ? "▾" : "▸"}</span>
                <span className="text-xs font-mono text-slate-400">📁 {node.name}</span>
              </button>
              {isOpen && <FileTree nodes={node.children} openPath={openPath} collapsed={collapsed} onToggleDir={onToggleDir} onOpenFile={onOpenFile} depth={depth+1}/>}
            </div>
          );
        }
        const isOpen = openPath === node.path;
        const ext = node.ext;
        const icon = ext==='.jsx'||ext==='.tsx'?"⚛️":ext==='.js'||ext==='.ts'?"📜":ext==='.json'?"{}":ext==='.md'?"📝":"📄";
        return (
          <button key={node.path} onClick={() => onOpenFile(node.path)}
            className={`w-full flex items-center gap-1.5 py-1 hover:bg-slate-800/50 transition-colors text-left ${isOpen?"bg-indigo-900/40 text-indigo-300":"text-slate-400 hover:text-slate-200"}`}
            style={{ paddingLeft: `${20 + depth*12}px` }}>
            <span className="text-xs">{icon}</span>
            <span className="text-xs font-mono truncate">{node.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);

  // Terminal
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterText, setFilterText] = useState("");
  const [groupMode, setGroupMode] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("log_bookmarks") || "[]"); } catch { return []; }
  });
  const [annotations, setAnnotations] = useState(() => {
    try { return JSON.parse(localStorage.getItem("log_annotations") || "{}"); } catch { return {}; }
  });
  const [annotatingId, setAnnotatingId] = useState(null);
  const [annotationText, setAnnotationText] = useState("");
  const terminalRef = useRef(null);
  const esRef = useRef(null);

  // AI panel
  const [selectedLog, setSelectedLog] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiFileContext, setAiFileContext] = useState(null);
  const [aiCodeContext, setAiCodeContext] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // User modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userForm, setUserForm] = useState({ name:"", email:"", password:"", role:"faculty", department:"" });
  const [collapsedDepts, setCollapsedDepts] = useState({});
  const [userSearch, setUserSearch] = useState("");

  // Code editor state
  const [editorSide, setEditorSide] = useState("backend");
  const [fileTree, setFileTree] = useState([]);
  const [openFile, setOpenFile] = useState(null); // { path, content, lines, side }
  const [editContent, setEditContent] = useState("");
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorDirty, setEditorDirty] = useState(false);
  const [jumpLine, setJumpLine] = useState(null);
  const [collapsedDirs, setCollapsedDirs] = useState({});
  const editorRef = useRef(null);

  // Git state
  const [gitStatus, setGitStatus] = useState(null);
  const [gitLog, setGitLog] = useState([]);
  const [commitMsg, setCommitMsg] = useState("");
  const [gitPushing, setGitPushing] = useState(false);
  const [showGit, setShowGit] = useState(false);

  const api = useCallback(() => axios.create({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  useEffect(() => { fetchStats(); fetchMetrics(); }, []);
  useEffect(() => { if (tab==="users") fetchUsers(); }, [tab]);
  useEffect(() => {
    if (tab==="logs") { connectStream(); fetchMetrics(); }
    else disconnectStream();
    return () => disconnectStream();
  }, [tab, token]);

  // Metrics polling every 5s when on logs tab
  useEffect(() => {
    if (tab !== "logs") return;
    const iv = setInterval(fetchMetrics, 5000);
    return () => clearInterval(iv);
  }, [tab]);

  useEffect(() => {
    if (autoScroll && terminalRef.current)
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [logs, autoScroll]);

  function connectStream() {
    if (esRef.current) return;
    setConnected(false);
    const es = new EventSource(`/api/logstream/stream?token=${token}`);
    esRef.current = es;
    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try {
        const entry = JSON.parse(e.data);
        setLogs(prev => { const n = [...prev, entry]; return n.length > 2000 ? n.slice(-2000) : n; });
      } catch {}
    };
    es.onerror = () => setConnected(false);
  }
  function disconnectStream() {
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    setConnected(false);
  }

  async function fetchStats() {
    try { const { data } = await api().get("/api/admin/stats"); setStats(data); } catch {}
  }
  async function fetchUsers() {
    try { const { data } = await api().get("/api/admin/users"); setUsers(data); } catch {}
  }
  async function fetchMetrics() {
    try { const { data } = await api().get("/api/admin/metrics"); setMetrics(data); } catch {}
  }

  async function fetchFileTree(side) {
    try { const { data } = await api().get(`/api/codeeditor/tree/${side}`); setFileTree(data.tree); } catch {}
  }
  async function openFileInEditor(filePath, side, line = null) {
    try {
      const { data } = await api().get(`/api/codeeditor/file/${side}?path=${encodeURIComponent(filePath)}`);
      setOpenFile({ path: filePath, lines: data.lines, side });
      setEditContent(data.content);
      setEditorDirty(false);
      setJumpLine(line);
      setTab("code");
    } catch(err) { toast.error("Cannot open file: " + (err.response?.data?.error || err.message)); }
  }
  async function saveFile() {
    if (!openFile) return;
    setEditorSaving(true);
    try {
      await api().post(`/api/codeeditor/file/${openFile.side}`, { filePath: openFile.path, content: editContent });
      setEditorDirty(false);
      toast.success("File saved ✓");
    } catch(err) { toast.error("Save failed: " + (err.response?.data?.error || err.message)); }
    finally { setEditorSaving(false); }
  }
  async function restoreFile() {
    if (!openFile || !window.confirm("Restore from backup?")) return;
    try {
      const { data } = await api().post(`/api/codeeditor/file/${openFile.side}/restore`, { filePath: openFile.path });
      setEditContent(data.content); setEditorDirty(false);
      toast.success("Restored from backup");
    } catch(err) { toast.error(err.response?.data?.error || "No backup found"); }
  }

  async function fetchGitStatus() {
    try { const { data } = await api().get("/api/codeeditor/git/status"); setGitStatus(data); } catch {}
  }
  async function fetchGitLog() {
    try { const { data } = await api().get("/api/codeeditor/git/log"); setGitLog(data.commits || []); } catch {}
  }
  async function handlePush() {
    if (!commitMsg.trim()) return toast.error("Enter a commit message");
    setGitPushing(true);
    try {
      const { data } = await api().post("/api/codeeditor/git/push", {
        message: commitMsg,
        files: openFile ? [`faculty-feedback-system/${openFile.side === 'frontend' ? 'frontend/src/' : 'backend/'}${openFile.path}`] : []
      });
      if (data.pushed) {
        toast.success(`✓ Pushed: ${data.lastCommit}`);
        setCommitMsg("");
        fetchGitStatus(); fetchGitLog();
      } else {
        toast("Nothing to commit");
      }
    } catch(err) { toast.error("Push failed: " + (err.response?.data?.error || err.message)); }
    finally { setGitPushing(false); }
  }

  useEffect(() => {
    if (tab === "code") { fetchFileTree(editorSide); fetchGitStatus(); fetchGitLog(); }
  }, [tab, editorSide]);

  // Jump to line after file opens
  useEffect(() => {
    if (jumpLine && editorRef.current) {
      const lines = editContent.split('\n');
      const charPos = lines.slice(0, jumpLine - 1).join('\n').length + 1;
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          editorRef.current.setSelectionRange(charPos, charPos + (lines[jumpLine-1]||"").length);
          // Scroll to line
          const lineHeight = 20;
          editorRef.current.scrollTop = (jumpLine - 5) * lineHeight;
        }
        setJumpLine(null);
      }, 100);
    }
  }, [jumpLine, openFile]);
  async function clearLogs() {
    try { await api().delete("/api/logstream/buffer"); setLogs([]); toast.success("Logs cleared"); } catch { toast.error("Failed"); }
  }
  function downloadLogs() {
    const text = logs.map(l => `[${l.ts}] [${l.level.toUpperCase()}] ${l.msg}`).join('\n');
    const blob = new Blob([text], { type:'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`logs-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  async function analyzeWithAI(logEntry) {
    setSelectedLog(logEntry); setAiSuggestion(""); setAiFileContext(null); setAiCodeContext(null); setAiLoading(true);
    try {
      const { data } = await api().post("/api/admin/ai-analyze", {
        message: logEntry.msg,
        level: logEntry.level,
        fileRef: logEntry.fileRef || null
      });
      setAiSuggestion(data.suggestion);
      setAiFileContext(data.fileContext || null);
      setAiCodeContext(data.surroundingCode || null);
    } catch { setAiSuggestion("AI service unavailable. Check backend."); }
    finally { setAiLoading(false); }
  }

  function toggleBookmark(log) {
    const key = log.id || log.ts;
    const exists = bookmarks.find(b => b.id === key);
    const next = exists ? bookmarks.filter(b => b.id !== key) : [...bookmarks, { id:key, ts:log.ts, level:log.level, msg:log.msg }];
    setBookmarks(next);
    localStorage.setItem("log_bookmarks", JSON.stringify(next));
  }
  function isBookmarked(log) { return bookmarks.some(b => b.id === (log.id || log.ts)); }

  function saveAnnotation(logId) {
    const next = { ...annotations, [logId]: annotationText };
    setAnnotations(next);
    localStorage.setItem("log_annotations", JSON.stringify(next));
    setAnnotatingId(null); setAnnotationText("");
    toast.success("Note saved");
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  async function handleSaveUser() {
    try {
      if (editUser) { await api().patch(`/api/admin/users/${editUser._id}`, userForm); toast.success("Updated"); }
      else { await api().post("/api/admin/users", userForm); toast.success("Created"); }
      setShowUserModal(false); setEditUser(null);
      setUserForm({ name:"", email:"", password:"", role:"faculty", department:"" });
      fetchUsers(); fetchStats();
    } catch(err) { toast.error(err.response?.data?.error || "Failed"); }
  }
  async function handleDeleteUser(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await api().delete(`/api/admin/users/${id}`); toast.success("Deleted"); fetchUsers(); fetchStats(); }
    catch(err) { toast.error(err.response?.data?.error || "Failed"); }
  }
  function openCreate() { setEditUser(null); setUserForm({ name:"", email:"", password:"", role:"faculty", department:"" }); setShowUserModal(true); }
  function openEdit(u) { setEditUser(u); setUserForm({ name:u.name, email:u.email, password:"", role:u.role, department:u.department||"" }); setShowUserModal(true); }

  const filteredLogs = (showBookmarks ? bookmarks.map(b => ({...b, id:b.id})) : logs).filter(l => {
    if (filterLevel !== "all" && l.level !== filterLevel) return false;
    if (filterText && !l.msg.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });
  const displayLogs = groupMode ? groupLogs(filteredLogs) : filteredLogs;
  const heatmap = buildHeatmap(logs);
  const maxHeat = Math.max(...heatmap, 1);
  const errorCount = logs.filter(l => l.level==="error").length;
  const warnCount  = logs.filter(l => l.level==="warn").length;

  const TABS = [
    { id:"overview", label:"Overview",     icon:Activity },
    { id:"users",    label:"Users",        icon:Users },
    { id:"logs",     label:"Runtime Logs", icon:Terminal },
    { id:"code",     label:"Code Editor",  icon:Cpu },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Admin Panel" subtitle="System Management" />
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">

        <div className="flex items-center justify-between">
          <h1 className="page-title flex items-center gap-2"><Shield size={22} className="text-red-600"/>Admin Dashboard</h1>
          <button onClick={() => { fetchStats(); fetchUsers(); fetchMetrics(); }} className="btn btn-ghost btn-sm"><RefreshCw size={14}/> Refresh</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {TABS.map(({ id, label, icon:Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab===id?"bg-white shadow text-slate-800":"text-slate-500 hover:text-slate-700"}`}>
              <Icon size={14}/>{label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab==="overview" && stats && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label:"Total Users",    value:stats.users,       color:"indigo", icon:"👥" },
                { label:"Reports",        value:stats.reports,     color:"emerald",icon:"📋" },
                { label:"Submissions",    value:stats.submissions, color:"violet", icon:"📤" },
                { label:"Error Logs",     value:stats.errorLogs,   color:"red",    icon:"🔴" },
              ].map(s => (
                <div key={s.label} className="card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{s.icon}</span>
                    <span className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card p-5">
                <p className="text-sm font-semibold text-slate-700 mb-3">Users by Role</p>
                {stats.usersByRole.map(r => (
                  <div key={r._id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-600 capitalize">{r._id}</span>
                    <span className="text-sm font-bold text-slate-800">{r.count}</span>
                  </div>
                ))}
              </div>
              {metrics && (
                <div className="card p-5">
                  <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Server size={14}/>Server Health</p>
                  {[
                    ["Uptime", `${Math.floor(metrics.uptime/3600)}h ${Math.floor((metrics.uptime%3600)/60)}m`],
                    ["Memory Used", `${metrics.memUsed} MB / ${metrics.memTotal} MB`],
                    ["RSS", `${metrics.rss} MB`],
                    ["Node.js", metrics.nodeVersion],
                    ["PID", metrics.pid],
                  ].map(([l,v]) => (
                    <div key={l} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-xs text-slate-500">{l}</span>
                      <span className="text-xs font-mono font-semibold text-slate-700">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS — grouped by department */}
        {tab==="users" && (() => {
          const searchedUsers = users.filter(u =>
            !userSearch ||
            u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
            (u.department||"").toLowerCase().includes(userSearch.toLowerCase())
          );
          const { depts, special } = groupByDepartment(searchedUsers);
          const deptNames = Object.keys(depts).sort();

          function toggleDept(d) { setCollapsedDepts(p => ({...p, [d]: !p[d]})); }

          function UserRow({ u, indent = false }) {
            const RIcon = ROLE_ICON[u.role] || Users;
            return (
              <div className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${indent ? "pl-10 bg-slate-50/50" : ""}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${u.role==="hod"?"bg-indigo-100":u.role==="faculty"?"bg-emerald-100":u.role==="vc"?"bg-purple-100":"bg-red-100"}`}>
                  <RIcon size={14} className={u.role==="hod"?"text-indigo-600":u.role==="faculty"?"text-emerald-600":u.role==="vc"?"text-purple-600":"text-red-600"}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLOR[u.role]}`}>{u.role}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <div className="text-xs text-slate-400 hidden sm:block">{new Date(u.createdAt).toLocaleDateString("en-IN")}</div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(u)} className="btn btn-ghost btn-sm p-1.5" title="Edit"><Edit2 size={13}/></button>
                  {u._id !== user?.id && (
                    <button onClick={() => handleDeleteUser(u._id, u.name)} className="btn btn-ghost btn-sm p-1.5 text-red-500 hover:text-red-700" title="Delete"><Trash2 size={13}/></button>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div className="space-y-4 animate-fade-in">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3">
                <input type="text" placeholder="Search users..." value={userSearch} onChange={e=>setUserSearch(e.target.value)}
                  className="input text-sm py-2 w-64"/>
                <span className="text-sm text-slate-500">{searchedUsers.length} users</span>
                <button onClick={openCreate} className="btn btn-primary btn-sm ml-auto"><Plus size={14}/>Add User</button>
              </div>

              {/* Special roles: VC + Admin */}
              {special.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-800 flex items-center gap-2">
                    <Shield size={14} className="text-slate-400"/>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">System Roles</span>
                    <span className="ml-auto text-xs text-slate-500">{special.length} user{special.length!==1?"s":""}</span>
                  </div>
                  {special.map(u => <UserRow key={u._id} u={u}/>)}
                </div>
              )}

              {/* Department groups */}
              {deptNames.map(dept => {
                const { hod, faculty } = depts[dept];
                const isOpen = !collapsedDepts[dept];
                const total = (hod?1:0) + faculty.length;
                return (
                  <div key={dept} className="card overflow-hidden">
                    {/* Department header — clickable to collapse */}
                    <button onClick={() => toggleDept(dept)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-slate-50 flex items-center gap-3 hover:from-indigo-100 transition-colors border-b border-slate-200">
                      <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 size={14} className="text-white"/>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-slate-800 text-sm">{dept}</p>
                        <p className="text-xs text-slate-500">
                          {hod ? `HOD: ${hod.name}` : "No HOD assigned"} · {faculty.length} faculty
                        </p>
                      </div>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{total}</span>
                      {isOpen ? <ChevronDown size={16} className="text-slate-400"/> : <ChevronRight size={16} className="text-slate-400"/>}
                    </button>

                    {isOpen && (
                      <div>
                        {/* HOD first */}
                        {hod && (
                          <div className="border-b border-slate-100">
                            <div className="px-4 py-1.5 bg-indigo-50/50">
                              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Head of Department</span>
                            </div>
                            <UserRow u={hod}/>
                          </div>
                        )}
                        {!hod && (
                          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
                            <p className="text-xs text-amber-600">⚠️ No HOD assigned to this department</p>
                          </div>
                        )}

                        {/* Faculty */}
                        {faculty.length > 0 && (
                          <div>
                            <div className="px-4 py-1.5 bg-emerald-50/50 border-b border-slate-100">
                              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Faculty Members ({faculty.length})</span>
                            </div>
                            {faculty.map(u => <UserRow key={u._id} u={u} indent/>)}
                          </div>
                        )}
                        {faculty.length === 0 && (
                          <div className="px-4 py-2 text-xs text-slate-400 italic">No faculty members in this department</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {deptNames.length === 0 && special.length === 0 && (
                <div className="card p-12 text-center text-slate-400">No users found</div>
              )}
            </div>
          );
        })()}

        {/* LOGS */}
        {tab==="logs" && (
          <div className="space-y-3 animate-fade-in">

            {/* ── UNIQUE FEATURE 1: Live Server Metrics Bar ── */}
            {metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { icon:Clock,      label:"Uptime",   value:`${Math.floor(metrics.uptime/3600)}h ${Math.floor((metrics.uptime%3600)/60)}m`, color:"text-emerald-400" },
                  { icon:MemoryStick,label:"Heap",     value:`${metrics.memUsed}/${metrics.memTotal} MB`, color:"text-blue-400" },
                  { icon:Server,     label:"RSS",      value:`${metrics.rss} MB`, color:"text-violet-400" },
                  { icon:Hash,       label:"Errors",   value:errorCount, color:"text-red-400" },
                  { icon:Zap,        label:"Warnings", value:warnCount,  color:"text-yellow-400" },
                ].map(m => (
                  <div key={m.label} className="bg-slate-900 rounded-xl px-3 py-2 flex items-center gap-2 border border-slate-800">
                    <m.icon size={13} className={m.color}/>
                    <div>
                      <p className="text-xs text-slate-500 font-mono leading-none">{m.label}</p>
                      <p className={`text-xs font-bold font-mono ${m.color}`}>{m.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── UNIQUE FEATURE 2: Error Frequency Heatmap ── */}
            <div className="bg-slate-900 rounded-2xl px-4 py-3 border border-slate-800">
              <p className="text-xs text-slate-500 font-mono mb-2">Error/Warn frequency by hour (today)</p>
              <div className="flex gap-0.5 items-end h-8">
                {heatmap.map((count, h) => (
                  <div key={h} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <div className="w-full rounded-sm transition-all"
                      style={{ height: `${Math.max(2, (count/maxHeat)*28)}px`, backgroundColor: count===0?"#1e293b":count<3?"#7c3aed":count<6?"#dc2626":"#ff0000", opacity: count===0?0.3:1 }}/>
                    {count > 0 && (
                      <div className="absolute bottom-full mb-1 bg-slate-700 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {h}:00 — {count} event{count!==1?"s":""}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-slate-600 font-mono">00:00</span>
                <span className="text-xs text-slate-600 font-mono">12:00</span>
                <span className="text-xs text-slate-600 font-mono">23:00</span>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-900 rounded-2xl px-4 py-3 border border-slate-800">
              <div className="flex items-center gap-1.5">
                <Circle size={8} className={connected?"text-emerald-400 fill-emerald-400":"text-red-400 fill-red-400"}/>
                <span className="text-xs text-slate-400 font-mono">{connected?"● Live":"○ Disconnected"}</span>
              </div>
              <div className="w-px h-4 bg-slate-700"/>
              <select value={filterLevel} onChange={e=>setFilterLevel(e.target.value)}
                className="bg-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 border border-slate-700 font-mono">
                <option value="all">All levels</option>
                <option value="error">error</option>
                <option value="warn">warn</option>
                <option value="info">info</option>
                <option value="log">log</option>
              </select>
              <input type="text" placeholder="Search logs..." value={filterText} onChange={e=>setFilterText(e.target.value)}
                className="bg-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1 border border-slate-700 font-mono w-44 placeholder-slate-600"/>
              <span className="text-xs text-slate-500 font-mono">{displayLogs.length} lines</span>
              <div className="ml-auto flex items-center gap-1.5">
                {/* UNIQUE: Group toggle */}
                <button onClick={() => setGroupMode(g=>!g)}
                  className={`text-xs px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${groupMode?"bg-indigo-600 text-white":"bg-slate-700 hover:bg-slate-600 text-slate-300"}`}>
                  <Layers size={11}/> Group
                </button>
                {/* UNIQUE: Bookmarks toggle */}
                <button onClick={() => setShowBookmarks(b=>!b)}
                  className={`text-xs px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${showBookmarks?"bg-amber-600 text-white":"bg-slate-700 hover:bg-slate-600 text-slate-300"}`}>
                  <Bookmark size={11}/> {bookmarks.length > 0 ? bookmarks.length : ""} Saved
                </button>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer px-2">
                  <input type="checkbox" checked={autoScroll} onChange={e=>setAutoScroll(e.target.checked)} className="accent-emerald-500"/>
                  Scroll
                </label>
                <button onClick={downloadLogs} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg flex items-center gap-1">
                  <Download size={11}/> Export
                </button>
                <button onClick={clearLogs} className="text-xs bg-red-900/50 hover:bg-red-900 text-red-400 px-3 py-1 rounded-lg flex items-center gap-1">
                  <Trash2 size={11}/> Clear
                </button>
              </div>
            </div>

            {/* Terminal + AI panel */}
            <div className="flex gap-3 items-start">
              <div className={`bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden ${selectedLog?"flex-1":"w-full"}`}>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"/>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"/>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"/>
                  </div>
                  <span className="text-xs text-slate-500 font-mono ml-2">
                    {showBookmarks ? "📌 Bookmarked Logs" : "server.js — MITS Feedback System"}
                  </span>
                  <span className="ml-auto text-xs text-slate-600 font-mono">
                    {groupMode && <span className="text-indigo-400 mr-2">grouped</span>}
                    Click <span className="text-red-400">ERROR</span>/<span className="text-yellow-400">WARN</span> → AI fix
                  </span>
                </div>

                <div ref={terminalRef} className="h-[55vh] overflow-y-auto font-mono text-xs leading-relaxed p-3 space-y-0.5"
                  onScroll={e => { const el=e.target; setAutoScroll(el.scrollHeight-el.scrollTop-el.clientHeight < 30); }}>
                  {displayLogs.length === 0 && (
                    <div className="text-slate-600 italic p-2">
                      {showBookmarks ? "No bookmarked logs yet. Click 🔖 on any log line to save it." : "Waiting for logs..."}
                    </div>
                  )}
                  {displayLogs.map((log, i) => {
                    const time = new Date(log.ts).toLocaleTimeString("en-IN",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"});
                    const ms   = new Date(log.ts).getMilliseconds().toString().padStart(3,"0");
                    const isClickable = log.level==="error" || log.level==="warn";
                    const isSelected  = selectedLog?.id === log.id;
                    const logId = log.id || log.ts;
                    const note  = annotations[logId];
                    return (
                      <div key={logId+i} className={`group rounded transition-colors ${isSelected?"bg-indigo-900/40 ring-1 ring-indigo-500/50":log.level==="error"?"bg-red-950/30 hover:bg-red-950/50":log.level==="warn"?"bg-yellow-950/20 hover:bg-yellow-950/40":"hover:bg-white/5"}`}>
                        <div className="flex gap-2 px-2 py-0.5 items-start">
                          <span className="text-slate-600 shrink-0 select-none mt-0.5">{time}.{ms}</span>
                          <span className={`shrink-0 w-12 text-center rounded px-1 border text-xs font-bold mt-0.5 ${LEVEL_BG[log.level]||LEVEL_BG.log}`}>
                            {log.level.toUpperCase()}
                          </span>
                          {/* UNIQUE: Group count badge */}
                          {groupMode && log.count > 1 && (
                            <span className="shrink-0 bg-slate-700 text-slate-300 text-xs rounded-full px-1.5 font-bold mt-0.5">×{log.count}</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <span onClick={() => isClickable && analyzeWithAI(log)}
                              className={`break-all whitespace-pre-wrap ${LEVEL_COLOR[log.level]||LEVEL_COLOR.log} ${isClickable?"cursor-pointer":""}`}>
                              {log.msg}
                            </span>
                            {log.fileRef && (
                              <button onClick={() => openFileInEditor(log.fileRef.file, log.fileRef.side, log.fileRef.line)}
                                className="block mt-0.5 text-indigo-400 hover:text-indigo-300 hover:underline text-xs font-mono transition-colors">
                                📄 {log.fileRef.file}:{log.fileRef.line} → Open in Editor
                              </button>
                            )}
                          </div>
                          {/* Action buttons — show on hover */}
                          <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* UNIQUE: Bookmark */}
                            <button onClick={() => toggleBookmark(log)} title="Bookmark" className="text-slate-500 hover:text-amber-400 transition-colors">
                              {isBookmarked(log) ? <BookmarkCheck size={11} className="text-amber-400"/> : <Bookmark size={11}/>}
                            </button>
                            {/* UNIQUE: Copy */}
                            <button onClick={() => copyToClipboard(log.msg)} title="Copy" className="text-slate-500 hover:text-slate-300 transition-colors">
                              <Copy size={11}/>
                            </button>
                            {/* UNIQUE: Annotate */}
                            <button onClick={() => { setAnnotatingId(logId); setAnnotationText(note||""); }} title="Add note" className="text-slate-500 hover:text-indigo-400 transition-colors">
                              <span className="text-xs">📝</span>
                            </button>
                            {/* AI button for errors */}
                            {isClickable && (
                              <button onClick={() => analyzeWithAI(log)} title="AI Fix" className="text-slate-500 hover:text-indigo-400 transition-colors">
                                <Cpu size={11}/>
                              </button>
                            )}
                          </div>
                        </div>
                        {/* UNIQUE: Annotation display */}
                        {note && (
                          <div className="mx-2 mb-1 px-2 py-1 bg-indigo-950/40 border-l-2 border-indigo-500 rounded-r text-xs text-indigo-300 font-sans">
                            📝 {note}
                          </div>
                        )}
                        {/* UNIQUE: Annotation input */}
                        {annotatingId === logId && (
                          <div className="mx-2 mb-1 flex gap-1">
                            <input autoFocus type="text" value={annotationText} onChange={e=>setAnnotationText(e.target.value)}
                              onKeyDown={e=>{if(e.key==="Enter")saveAnnotation(logId);if(e.key==="Escape")setAnnotatingId(null);}}
                              placeholder="Add a note... (Enter to save)"
                              className="flex-1 bg-slate-800 text-slate-200 text-xs rounded px-2 py-1 border border-indigo-500/50 font-sans outline-none"/>
                            <button onClick={() => saveAnnotation(logId)} className="text-xs bg-indigo-600 text-white px-2 rounded">Save</button>
                            <button onClick={() => setAnnotatingId(null)} className="text-xs text-slate-500 px-1">✕</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {connected && <div className="px-2 py-0.5 text-slate-600 animate-pulse select-none">▊</div>}
                </div>
              </div>

              {/* AI Analysis Panel */}
              {selectedLog && (
                <div className="w-96 shrink-0 bg-slate-900 rounded-2xl border border-indigo-500/30 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-indigo-950/50 border-b border-indigo-500/20">
                    <div className="flex items-center gap-2">
                      <Cpu size={14} className="text-indigo-400"/>
                      <span className="text-xs font-semibold text-indigo-300">AI Error Analysis</span>
                    </div>
                    <button onClick={() => setSelectedLog(null)} className="text-slate-500 hover:text-slate-300"><X size={14}/></button>
                  </div>
                  <div className="px-4 py-3 border-b border-slate-800">
                    <p className="text-xs text-slate-500 mb-1 font-mono">Analyzing:</p>
                    <p className={`text-xs font-mono break-all ${LEVEL_COLOR[selectedLog.level]}`}>
                      {selectedLog.msg.length > 150 ? selectedLog.msg.slice(0,150)+"..." : selectedLog.msg}
                    </p>
                  </div>
                  <div className="px-4 py-4 overflow-y-auto max-h-[55vh]">
                    {aiLoading ? (
                      <div className="flex flex-col items-center gap-3 py-8">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
                        <p className="text-xs text-indigo-400 font-mono">Reading file & analyzing...</p>
                      </div>
                    ) : aiSuggestion ? (
                      <div className="space-y-3">
                        {/* File location */}
                        {aiFileContext && (
                          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3">
                            <p className="text-xs text-red-300 font-mono font-bold mb-1">📍 Error Location</p>
                            <p className="text-xs text-red-200 font-mono">{aiFileContext.file} : line {aiFileContext.line}</p>
                            <button onClick={() => openFileInEditor(aiFileContext.file, selectedLog?.fileRef?.side || 'backend', aiFileContext.line)}
                              className="mt-2 w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1">
                              🔧 Open File & Fix
                            </button>
                          </div>
                        )}

                        {/* Code context */}
                        {aiCodeContext && (
                          <div>
                            <p className="text-xs text-slate-500 font-mono mb-1">Code at error:</p>
                            <pre className="text-xs bg-slate-800 rounded-xl p-3 overflow-x-auto text-slate-300 font-mono leading-5 border border-slate-700">
                              {aiCodeContext.split('\n').map((line, i) => (
                                <div key={i} className={line.includes('►') ? "bg-red-900/50 text-red-300 -mx-3 px-3" : ""}>
                                  {line}
                                </div>
                              ))}
                            </pre>
                          </div>
                        )}

                        {/* AI suggestion */}
                        <div>
                          <p className="text-xs font-semibold text-indigo-300 mb-1">✨ AI Fix Suggestion</p>
                          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                            {aiSuggestion.replace(/```[\s\S]*?```/g, '').replace(/\*\*/g, '').trim()}
                          </div>
                          {/* Extract code blocks */}
                          {aiSuggestion.match(/```[\s\S]*?```/g)?.map((block, i) => (
                            <pre key={i} className="mt-2 text-xs bg-slate-900 text-emerald-400 rounded-xl p-3 overflow-x-auto font-mono border border-slate-700">
                              {block.replace(/```\w*\n?/g, '').replace(/```/g, '').trim()}
                            </pre>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => copyToClipboard(aiSuggestion)}
                            className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                            {copied ? <><Check size={10} className="text-emerald-400"/> Copied!</> : <><Copy size={10}/> Copy</>}
                          </button>
                          <button onClick={() => analyzeWithAI(selectedLog)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1.5 flex items-center gap-1">
                            <RefreshCw size={10}/> Re-analyze
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="px-4 pb-3 text-xs text-slate-600 italic">Click any red/yellow line to analyze</div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* CODE EDITOR */}
        {tab==="code" && (
          <div className="space-y-3 animate-fade-in">
            {/* Toolbar */}
            <div className="flex items-center gap-3 bg-slate-900 rounded-2xl px-4 py-3 border border-slate-800">
              <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                {["backend","frontend"].map(s => (
                  <button key={s} onClick={() => setEditorSide(s)}
                    className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${editorSide===s?"bg-indigo-600 text-white":"text-slate-400 hover:text-slate-200"}`}>
                    {s}
                  </button>
                ))}
              </div>
              {openFile && (
                <>
                  <span className="text-xs text-slate-400 font-mono flex-1 truncate">
                    {editorDirty && <span className="text-amber-400 mr-1">●</span>}
                    {openFile.side}/{openFile.path}
                  </span>
                  <button onClick={restoreFile} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    ↩ Restore
                  </button>
                  <button onClick={saveFile} disabled={editorSaving || !editorDirty}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition-colors">
                    {editorSaving ? "Saving..." : "💾 Save"}
                  </button>
                </>
              )}
              {/* Git toggle */}
              <button onClick={() => { setShowGit(g=>!g); fetchGitStatus(); fetchGitLog(); }}
                className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${showGit?"bg-orange-600 text-white":"bg-slate-700 hover:bg-slate-600 text-slate-300"}`}>
                🐙 Git {gitStatus && gitStatus.status ? <span className="bg-orange-500 text-white text-xs rounded-full px-1 leading-none ml-1">{gitStatus.status.split('\n').filter(Boolean).length}</span> : ""}
              </button>
            </div>

            <div className="flex gap-3 h-[70vh]">
              {/* File tree */}
              <div className="w-56 shrink-0 bg-slate-950 rounded-2xl border border-slate-800 overflow-y-auto">
                <div className="px-3 py-2 border-b border-slate-800 text-xs text-slate-500 font-mono uppercase tracking-widest">
                  {editorSide}/
                </div>
                <FileTree
                  nodes={fileTree}
                  openPath={openFile?.path}
                  collapsed={collapsedDirs}
                  onToggleDir={d => setCollapsedDirs(p=>({...p,[d]:!p[d]}))}
                  onOpenFile={p => openFileInEditor(p, editorSide)}
                />
              </div>

              {/* Editor */}
              <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
                {openFile ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800 shrink-0">
                      <span className="text-xs text-slate-400 font-mono">{openFile.path}</span>
                      <span className="ml-auto text-xs text-slate-600 font-mono">{editContent.split('\n').length} lines</span>
                    </div>
                    <div className="flex flex-1 overflow-hidden">
                      {/* Line numbers */}
                      <div className="w-12 bg-slate-900/50 border-r border-slate-800 overflow-hidden shrink-0 pt-3 pb-3 text-right pr-2">
                        {editContent.split('\n').map((_, i) => (
                          <div key={i} className="text-xs text-slate-600 font-mono leading-5 select-none">{i+1}</div>
                        ))}
                      </div>
                      {/* Code textarea */}
                      <textarea
                        ref={editorRef}
                        value={editContent}
                        onChange={e => { setEditContent(e.target.value); setEditorDirty(true); }}
                        onKeyDown={e => {
                          // Tab inserts 2 spaces
                          if (e.key === 'Tab') {
                            e.preventDefault();
                            const s = e.target.selectionStart, end = e.target.selectionEnd;
                            const v = editContent;
                            setEditContent(v.substring(0,s) + '  ' + v.substring(end));
                            setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s+2; }, 0);
                          }
                          // Ctrl+S saves
                          if ((e.ctrlKey||e.metaKey) && e.key==='s') { e.preventDefault(); saveFile(); }
                        }}
                        spellCheck={false}
                        className="flex-1 bg-transparent text-slate-200 font-mono text-xs leading-5 p-3 resize-none outline-none overflow-auto"
                        style={{ tabSize: 2 }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-600">
                    <Cpu size={32} className="opacity-30"/>
                    <p className="text-sm font-mono">Select a file from the tree to edit</p>
                    <p className="text-xs font-mono opacity-60">Or click "Open in Editor" from a log error</p>
                  </div>
                )}
              </div>
            </div>

            {/* Git Panel */}
            {showGit && (
              <div className="bg-slate-950 rounded-2xl border border-orange-500/30 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
                  <span className="text-sm font-semibold text-orange-300">🐙 Git — Push to GitHub</span>
                  {gitStatus && (
                    <span className="text-xs text-slate-500 font-mono ml-2">
                      branch: <span className="text-emerald-400">{gitStatus.branch}</span>
                      {" · "}<span className="text-slate-400">{gitStatus.remote?.replace('https://github.com/','')}</span>
                    </span>
                  )}
                  <button onClick={() => { fetchGitStatus(); fetchGitLog(); }} className="ml-auto text-slate-500 hover:text-slate-300"><RefreshCw size={13}/></button>
                </div>
                <div className="grid sm:grid-cols-2 gap-0 divide-x divide-slate-800">
                  {/* Changed files + commit */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Changed Files</p>
                    {gitStatus?.status ? (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {gitStatus.status.split('\n').filter(Boolean).map((line, i) => {
                          const st = line.slice(0,2).trim();
                          const file = line.slice(3);
                          const color = st==='M'?"text-amber-400":st==='??'?"text-emerald-400":st==='D'?"text-red-400":"text-slate-300";
                          const label = st==='M'?"modified":st==='??'?"new":st==='D'?"deleted":"changed";
                          return (
                            <div key={i} className="flex items-center gap-2 font-mono text-xs">
                              <span className={`${color} w-16 shrink-0`}>{label}</span>
                              <span className="text-slate-400 truncate">{file}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-400 font-mono">✓ Working tree clean</p>
                    )}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <input type="text" placeholder="Commit message (e.g. fix: resolve auth error)"
                        value={commitMsg} onChange={e=>setCommitMsg(e.target.value)}
                        onKeyDown={e=>e.key==='Enter'&&handlePush()}
                        className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-700 font-mono placeholder-slate-600 outline-none focus:border-orange-500"/>
                      <button onClick={handlePush} disabled={gitPushing||!commitMsg.trim()}
                        className="w-full text-xs bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                        {gitPushing?<><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>Pushing...</>:<>🚀 Commit &amp; Push to GitHub</>}
                      </button>
                      {gitStatus?.lastCommit && <p className="text-xs text-slate-600 font-mono">Last: {gitStatus.lastCommit}</p>}
                    </div>
                  </div>
                  {/* Recent commits */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Recent Commits</p>
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {gitLog.map((c,i) => (
                        <div key={c.hash} className={`flex gap-2 items-start ${i===0?"opacity-100":"opacity-60"}`}>
                          <span className="text-xs font-mono text-indigo-400 shrink-0 mt-0.5">{c.hash}</span>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-300 font-mono truncate">{c.subject}</p>
                            <p className="text-xs text-slate-600">{c.author} · {c.time}</p>
                          </div>
                        </div>
                      ))}
                      {gitLog.length===0&&<p className="text-xs text-slate-600 font-mono">No commits yet</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{editUser?"Edit User":"Add User"}</h2>
              <button onClick={() => setShowUserModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={16}/></button>
            </div>
            {[["Name","text","name","Full name"],["Email","email","email","email@mits.ac.in"],["Password","password","password",editUser?"Leave blank to keep":"Password"]].map(([label,type,field,ph]) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">{label}</label>
                <input type={type} className="input" placeholder={ph} value={userForm[field]} onChange={e=>setUserForm(p=>({...p,[field]:e.target.value}))}/>
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Department</label>
              <input list="dept-list" className="input" placeholder="e.g. Computer Science"
                value={userForm.department} onChange={e=>setUserForm(p=>({...p,department:e.target.value}))}/>
              <datalist id="dept-list">
                {[...new Set(users.filter(u=>u.department).map(u=>u.department))].sort().map(d=>(
                  <option key={d} value={d}/>
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Role</label>
              <select className="input" value={userForm.role} onChange={e=>setUserForm(p=>({...p,role:e.target.value}))}>
                {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowUserModal(false)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={handleSaveUser} className="btn btn-primary flex-1">{editUser?"Save":"Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
