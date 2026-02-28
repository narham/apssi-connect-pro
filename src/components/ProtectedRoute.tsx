import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2, Fingerprint } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Array<'ADMIN' | 'SCOUT' | 'REGISTRAR' | 'VIEWER'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles 
}) => {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center relative overflow-hidden group">
          <Fingerprint className="w-12 h-12 text-blue-500 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
            Authenticating Identity...
          </p>
        </div>
      </div>
    );
  }

  // 1. Not Authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Authorization
  if (requiredRoles && role && !requiredRoles.includes(role)) {
    toast.error("Unauthorized Access. Insufficient Permissions.");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
