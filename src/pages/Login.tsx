import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Fingerprint, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, error } = await authService.signIn(email, password);
      
      if (error) throw error;
      
      if (user) {
        toast.success("Identity Verified. Access Granted.");
        // Check role and redirect
        const profile = await authService.getUserProfile(user.id);
        if (profile.role === 'ADMIN' || profile.role === 'SCOUT' || profile.role === 'REGISTRAR') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Access Denied. Invalid Credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-montserrat overflow-hidden relative">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-6 shadow-2xl relative group overflow-hidden">
            <Fingerprint className="w-10 h-10 text-blue-500 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
          </div>
          <h1 className="text-4xl font-oswald font-bold text-white uppercase tracking-tighter mb-2">
            APSSI <span className="text-blue-500">CONNECT</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
            Identity & Performance Ecosystem
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 glass-reflection shadow-2xl">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Secure Handshake</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Registry Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="admin@apssi.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Secure Key
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-blue-900/40 group overflow-hidden relative"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify Access
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter flex items-center gap-2">
              <Zap className="w-3 h-3 text-amber-500" /> E2E Encryption Active
            </p>
            <a href="#" className="text-[8px] text-blue-500/60 hover:text-blue-400 font-black uppercase tracking-tighter transition-colors">
              Request Uplink Access
            </a>
          </div>
        </div>

        {/* System Status Footnote */}
        <div className="text-center mt-8">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            APSSI Cloud Core: Operational
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
