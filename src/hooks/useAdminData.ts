import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

// ── Players List ──
export const usePlayers = (searchQuery?: string) => {
  return useQuery({
    queryKey: ['admin', 'players', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('players')
        .select('id, full_name, nik, birth_date, birth_place, club_id, verification_status, consistency_score, photo_url, created_at, clubs(name, province_id, provinces:province_id(name))')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,nik.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
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

      // Get player counts per club
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
