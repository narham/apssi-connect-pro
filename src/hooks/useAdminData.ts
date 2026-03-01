import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { playerService } from '@/services/playerService';

// ── Dashboard Stats ──
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: async () => {
      const [players, clubs, tournaments, matches, pendingPlayers, userRoles] = await Promise.all([
        supabase.from('players').select('id', { count: 'exact', head: true }),
        supabase.from('clubs').select('id', { count: 'exact', head: true }),
        supabase.from('tournaments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true }).eq('verification_status', 'MANUAL REVIEW'),
        supabase.from('user_roles').select('role'),
      ]);

      const roleCounts = {
        super_admin: 0,
        provincial_admin: 0,
        match_commissioner: 0,
        data_operator: 0,
        scout: 0,
      };
      (userRoles.data ?? []).forEach((r: any) => {
        if (r.role in roleCounts) roleCounts[r.role as keyof typeof roleCounts]++;
      });

      return {
        totalPlayers: players.count ?? 0,
        totalClubs: clubs.count ?? 0,
        activeTournaments: tournaments.count ?? 0,
        totalMatches: matches.count ?? 0,
        pendingVerifications: pendingPlayers.count ?? 0,
        scoutCount: roleCounts.scout,
        roleCounts,
      };
    },
    staleTime: 30_000,
  });
};

// ── Verification Queue (latest 5 pending players) ──
export const useVerificationQueue = () => {
  return useQuery({
    queryKey: ['admin', 'verification-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, full_name, club_id, verification_status, created_at, clubs(name)')
        .in('verification_status', ['MANUAL REVIEW'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15_000,
  });
};

// ── Recent Verification Logs ──
export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['admin', 'recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verification_logs')
        .select('id, action_type, old_status, new_status, reason, created_at, player_id, players(full_name)')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15_000,
  });
};

// ── Players List (paginated, filterable) ──
export const usePlayers = (opts?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const search = opts?.search ?? '';
  const status = opts?.status ?? 'ALL';
  const page = opts?.page ?? 0;
  const limit = opts?.limit ?? 20;

  return useQuery({
    queryKey: ['admin', 'players', search, status, page, limit],
    queryFn: async () => {
      let query = supabase
        .from('players')
        .select('id, full_name, nik, birth_date, birth_place, club_id, verification_status, consistency_score, photo_url, created_at, clubs(name, province_id, provinces:province_id(name))', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,nik.ilike.%${search}%`);
      }

      if (status && status !== 'ALL') {
        query = query.eq('verification_status', status);
      }

      query = query.range(page * limit, (page + 1) * limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
    staleTime: 15_000,
  });
};

// ── Player Detail ──
export const usePlayerDetail = (playerId: string | null) => {
  return useQuery({
    queryKey: ['admin', 'player-detail', playerId],
    queryFn: () => playerService.getPlayerById(playerId!),
    enabled: !!playerId,
  });
};

// ── Verification Players (for Verification Center) ──
export const useVerificationPlayers = () => {
  return useQuery({
    queryKey: ['admin', 'verification-players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select(`
          id, full_name, nik, birth_date, birth_place, club_id, verification_status,
          consistency_score, dukcapil_match_score, face_match_confidence, dukcapil_status,
          is_over_age, photo_url, created_at, parent_name, kk_number,
          clubs(name),
          verification_logs(id, action_type, old_status, new_status, reason, created_at, admin_id)
        `)
        .eq('verification_status', 'MANUAL REVIEW')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15_000,
  });
};

// ── Verification Stats ──
export const useVerificationStats = () => {
  return useQuery({
    queryKey: ['admin', 'verification-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const [pending, approvedToday, rejectedToday, highRisk] = await Promise.all([
        supabase.from('players').select('id', { count: 'exact', head: true }).eq('verification_status', 'MANUAL REVIEW'),
        supabase.from('verification_logs').select('id', { count: 'exact', head: true }).eq('new_status', 'VERIFIED').gte('created_at', todayISO),
        supabase.from('verification_logs').select('id', { count: 'exact', head: true }).eq('new_status', 'REJECTED').gte('created_at', todayISO),
        supabase.from('players').select('id', { count: 'exact', head: true }).eq('verification_status', 'MANUAL REVIEW').lt('consistency_score', 40),
      ]);

      return {
        pending: pending.count ?? 0,
        approvedToday: approvedToday.count ?? 0,
        rejectedToday: rejectedToday.count ?? 0,
        highRisk: highRisk.count ?? 0,
      };
    },
    staleTime: 15_000,
  });
};

// ── Clubs List ──
export const useClubs = () => {
  return useQuery({
    queryKey: ['admin', 'clubs'],
    queryFn: async () => {
      const { data: clubs, error } = await supabase
        .from('clubs')
        .select('id, name, logo_url, province_id, provinces:province_id(name)')
        .order('name');

      if (error) throw error;

      const { data: playerCounts } = await supabase
        .from('players')
        .select('club_id');

      const countMap: Record<string, number> = {};
      (playerCounts ?? []).forEach((p: any) => {
        if (p.club_id) countMap[p.club_id] = (countMap[p.club_id] || 0) + 1;
      });

      return (clubs ?? []).map((club: any) => ({
        ...club,
        playerCount: countMap[club.id] || 0,
        provinceName: club.provinces?.name ?? 'Unknown',
      }));
    },
    staleTime: 30_000,
  });
};
