import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type PlayerRow = Tables<'players'>;
export type PlayerInsert = TablesInsert<'players'>;
export type PlayerUpdate = TablesUpdate<'players'>;

export const playerService = {
  /**
   * Fetch all players with optional filtering
   */
  async getPlayers(searchQuery?: string) {
    let query = supabase
      .from('players')
      .select(`
        *,
        clubs (name),
        teams (age_category)
      `);

    if (searchQuery) {
      query = query.or(`full_name.ilike.%${searchQuery}%,nik.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get a single player with verification history
   */
  async getPlayerById(id: string) {
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        clubs (name),
        verification_logs (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update player verification status and log the action
   */
  async updateVerificationStatus(
    playerId: string, 
    update: PlayerUpdate,
    log: {
      action_type: string;
      admin_id?: string;
      old_status?: string;
      new_status?: string;
      reason?: string;
      payload?: any;
    }
  ) {
    // 1. Update the player record
    const { data: player, error: playerError } = await supabase
      .from('players')
      .update(update)
      .eq('id', playerId)
      .select()
      .single();

    if (playerError) throw playerError;

    // 2. Create an audit log entry
    const { error: logError } = await supabase
      .from('verification_logs')
      .insert({
        player_id: playerId,
        action_type: log.action_type,
        admin_id: log.admin_id,
        old_status: log.old_status,
        new_status: log.new_status,
        reason: log.reason,
        payload: log.payload,
        risk_score: update.consistency_score || 0
      });

    if (logError) throw logError;

    return player;
  },

  /**
   * Perform an admin override
   */
  async performAdminOverride(
    playerId: string,
    newStatus: 'VERIFIED' | 'MANUAL REVIEW' | 'REJECTED',
    reason: string,
    adminId: string,
    oldStatus: string
  ) {
    return this.updateVerificationStatus(
      playerId,
      {
        verification_status: newStatus,
        admin_override: true,
        override_reason: reason
      },
      {
        action_type: 'OVERRIDE',
        admin_id: adminId,
        old_status: oldStatus,
        new_status: newStatus,
        reason: reason
      }
    );
  }
};
