import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  AlertCircle, 
  Lock, 
  RefreshCw, 
  Clock, 
  Zap, 
  Fingerprint, 
  Database 
} from "lucide-react";
import { ConnectionStatus } from "@/services/apiConnectionManager";

interface ApiConnectionStatusProps {
  status: ConnectionStatus;
  lastChecked?: string;
  onReconnect?: () => void;
}

const ApiConnectionStatus: React.FC<ApiConnectionStatusProps> = ({ 
  status, 
  lastChecked, 
  onReconnect 
}) => {
  const [isPulsing, setIsPulsing] = useState(true);

  const getStatusConfig = (status: ConnectionStatus) => {
    switch (status) {
      case "CONNECTED":
        return {
          icon: <Wifi className="w-4 h-4 text-emerald-500" />,
          label: "CONNECTED",
          desc: "DUKCAPIL Uplink Stable",
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/20",
          glow: "shadow-[0_0_10px_rgba(16,185,129,0.2)]"
        };
      case "DISCONNECTED":
        return {
          icon: <WifiOff className="w-4 h-4 text-slate-500" />,
          label: "OFFLINE",
          desc: "Local Mode Only",
          color: "text-slate-500",
          bgColor: "bg-slate-500/10",
          borderColor: "border-slate-500/20",
          glow: ""
        };
      case "TIMEOUT":
        return {
          icon: <Clock className="w-4 h-4 text-amber-500" />,
          label: "TIMEOUT",
          desc: "Latency Threshold Exceeded",
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
          glow: "shadow-[0_0_10px_rgba(245,158,11,0.2)]"
        };
      case "UNREACHABLE":
        return {
          icon: <AlertCircle className="w-4 h-4 text-destructive" />,
          label: "UNREACHABLE",
          desc: "DUKCAPIL API Down",
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/20",
          glow: "shadow-[0_0_10px_rgba(239,68,68,0.2)]"
        };
      case "UNAUTHORIZED":
        return {
          icon: <Lock className="w-4 h-4 text-amber-500" />,
          label: "INVALID TOKEN",
          desc: "JWT Session Expired",
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
          glow: "shadow-[0_0_10px_rgba(245,158,11,0.2)]"
        };
      case "ERROR":
        return {
          icon: <Zap className="w-4 h-4 text-destructive" />,
          label: "SERVER ERROR",
          desc: "Registry Logic Failure",
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/20",
          glow: "shadow-[0_0_10px_rgba(239,68,68,0.2)]"
        };
      default:
        return {
          icon: <Database className="w-4 h-4 text-blue-500" />,
          label: "INITIALIZING",
          desc: "Syncing Handshake...",
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/20",
          glow: ""
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`p-4 rounded-xl border ${config.borderColor} ${config.bgColor} ${config.glow} transition-all duration-500 group relative overflow-hidden`}>
      {/* Background Pulse Animation */}
      {status === "CONNECTED" && isPulsing && (
        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
      )}
      
      <div className="flex items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center shadow-inner`}>
            {config.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.color}`}>
                {config.label}
              </span>
              {status === "CONNECTED" && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
            <p className="text-sm font-oswald font-bold text-white uppercase tracking-tight mt-0.5">
              {config.desc}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {onReconnect && (
            <button 
              onClick={onReconnect}
              className="p-2 bg-slate-900/50 hover:bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all micro-tap"
              title="Refresh Connection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status !== "CONNECTED" ? "animate-spin" : ""}`} />
            </button>
          )}
          {lastChecked && (
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
              Last Sync: {new Date(lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      {/* Security Protocol Indicator */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/50 border border-white/5">
            <ShieldCheck className="w-3 h-3 text-blue-500" />
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">SSL/HTTPS POST</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/50 border border-white/5">
            <Lock className="w-3 h-3 text-amber-500" />
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">JWT AUTH</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/50 border border-white/5">
          <Fingerprint className="w-3 h-3 text-blue-400" />
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">RSA ENCRYPTED PAYLOAD</span>
        </div>
      </div>
    </div>
  );
};

export default ApiConnectionStatus;
