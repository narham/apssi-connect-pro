import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ECardDashboard from "./pages/ECardDashboard";
import IdentityVerification from "./pages/IdentityVerification";
import MatchStatistics from "./pages/MatchStatistics";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPlayers from "./pages/admin/AdminPlayers";
import AdminVerification from "./pages/admin/AdminVerification";
import AdminStatistics from "./pages/admin/AdminStatistics";
import AdminClubs from "./pages/admin/AdminClubs";
import AdminScouts from "./pages/admin/AdminScouts";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import TournamentDashboard from "./pages/admin/TournamentDashboard";
import TournamentSchedule from "./pages/admin/TournamentSchedule";
import TournamentBracket from "./pages/admin/TournamentBracket";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/e-card" element={<ECardDashboard />} />
          <Route path="/register" element={<IdentityVerification />} />
          <Route path="/stats" element={<MatchStatistics />} />

          {/* Admin Panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="players" element={<AdminPlayers />} />
            <Route path="verification" element={<AdminVerification />} />
            <Route path="statistics" element={<AdminStatistics />} />
            <Route path="clubs" element={<AdminClubs />} />
            <Route path="scouts" element={<AdminScouts />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="tournament" element={<TournamentDashboard />} />
            <Route path="tournament/schedule" element={<TournamentSchedule />} />
            <Route path="tournament/bracket" element={<TournamentBracket />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
