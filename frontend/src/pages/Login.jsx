import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import SignatureUpload from "../components/SignatureUpload";
import { GraduationCap, ArrowLeft, CheckCircle } from "lucide-react";
import mitsLogo from "../assets/mits-logo.png";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [showSig, setShowSig] = useState(false);
  const [pending, setPending] = useState(null);
  const googleBtnRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) redirect(user.role);
  }, [user]);

  // Load Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE") return;

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => initGoogle();
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  function initGoogle() {
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: false,
    });
    renderGoogleButton();
  }

  function renderGoogleButton() {
    if (!window.google || !googleBtnRef.current) return;
    googleBtnRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      width: googleBtnRef.current.offsetWidth || 380,
      text: "signin_with",
      shape: "rectangular",
      logo_alignment: "left",
    });
  }

  function redirect(role) {
    const dest =
      role === "vc" ? "/vc"
      : role === "faculty" ? "/faculty"
      : role === "admin" ? "/admin"
      : "/hod";
    navigate(dest, { replace: true });
  }

  async function handleGoogleCredential({ credential }) {
    setGoogleLoading(true);
    try {
      const { data } = await axios.post("/api/auth/google", { credential });
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name?.split(" ")[0]}! 👋`);

      // New user with no department → complete profile first
      if (!data.user.department) {
        navigate("/profile-completion", { replace: true });
        return;
      }

      // Existing user with no signature → upload signature
      if (!data.user.hasSignature) {
        setPending(data);
        setShowSig(true);
      } else {
        redirect(data.user.role);
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Google sign-in failed. Make sure you're using your @mits.ac.in account.";
      toast.error(msg, { duration: 6000 });
    } finally {
      setGoogleLoading(false);
    }
  }

  function afterSig() {
    setShowSig(false);
    if (pending) {
      login(pending.user, pending.token);
      toast.success(`Welcome, ${pending.user.name?.split(" ")[0]}! 👋`);
      redirect(pending.user.role);
      setPending(null);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0a0f1e] overflow-hidden">
      {showSig && (
        <SignatureUpload token={pending?.token} onSaved={afterSig} onSkip={afterSig} />
      )}

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-violet-700 opacity-90" />
        <div className="absolute inset-0 bg-[#0a0f1e]/30" />
        <div className="absolute inset-0 bg-grid-dark opacity-20" />

        {/* Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float-slow" />

        <div className="relative flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/20 flex-shrink-0 shadow-lg">
              <img src={mitsLogo} alt="MITS" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white font-bold leading-tight">MITS Gwalior</p>
              <p className="text-white/60 text-xs">Faculty Feedback System</p>
            </div>
          </div>

          {/* Centre */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <GraduationCap size={36} className="text-white" />
            </div>

            <h2 className="text-4xl font-extrabold text-white mb-3 leading-tight">
              Welcome Back
            </h2>
            <p className="text-white/60 text-lg mb-8">
              Sign in with your institute Google account to continue
            </p>

            <div className="space-y-3">
              {[
                "Secure Google Sign-In with @mits.ac.in",
                "Auto role detection — HOD, Faculty, VC, Admin",
                "Access your personalized dashboard instantly",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                  <span className="text-white/80 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-white/40 text-xs">
            Automated Faculty Feedback Analysis System · MITS 2025–26
          </div>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center px-6 lg:px-10 py-5">
          <button
            onClick={() => navigate("/landing")}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 pb-8">
          <div className="w-full max-w-sm animate-fade-up">

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl">
                <img src={mitsLogo} alt="MITS" className="w-10 h-10 object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Sign in to your account</h1>
              <p className="text-slate-400 text-sm">Use your institute Google account to continue</p>
            </div>

            {/* Google button */}
            <div className="relative">
              {googleLoading && (
                <div className="absolute inset-0 rounded-xl z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing you in…
                  </div>
                </div>
              )}

              {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE" ? (
                <div
                  ref={googleBtnRef}
                  id="google-signin-btn"
                  className="w-full overflow-hidden rounded-xl"
                  style={{ minHeight: "44px" }}
                />
              ) : (
                <div className="w-full py-3 px-4 rounded-xl bg-white/10 border border-white/20 text-slate-400 text-sm text-center">
                  Google Sign-In not configured
                </div>
              )}
            </div>

            <p className="text-slate-600 text-xs text-center mt-5">
              By signing in you agree to MITS institutional policies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
