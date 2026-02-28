

# Database Schema Setup for APSSI CONNECT Admin Panel

## Overview
Create the complete database schema with tables for provinces, clubs, teams, players, tournaments, matches, match results, and verification logs. All tables will have Row-Level Security (RLS) enabled with role-based access control using a `user_roles` table and a `has_role` security definer function.

## Database Architecture

```text
+----------------+     +------------+     +----------+
|  user_roles    |     |  provinces  |---->|  clubs   |
+----------------+     +------------+     +----------+
| user_id (FK)   |                            |
| role (enum)    |                            v
+----------------+                        +----------+
                                          |  teams   |
                                          +----------+
                                              |
                                              v
+------------------+     +-----------+    +----------+
| verification_logs|<----|  players  |--->|  clubs   |
+------------------+     +-----------+    +----------+
                              |
              +---------------+---------------+
              v                               v
      +----------------+            +------------------+
      | match_players  |            | tournaments      |
      +----------------+            +------------------+
              ^                            |
              |                            v
      +----------------+            +------------------+
      |   matches      |----------->| tournament       |
      +----------------+            |   (FK)           |
                                    +------------------+
```

## Migration Steps (Single Migration)

### 1. Role System
- Create `app_role` enum: `super_admin`, `provincial_admin`, `match_commissioner`, `data_operator`, `scout`
- Create `user_roles` table with `user_id` (references `auth.users`) and `role`
- Create `has_role()` security definer function to avoid RLS recursion

### 2. Core Tables
- **provinces** -- id, name, timestamps
- **clubs** -- id, name, province_id (FK), logo_url, timestamps
- **teams** -- id, club_id (FK), age_category, name, timestamps
- **players** -- id, full_name, nik, kk_number, birth_date, birth_place, parent_name, club_id (FK), team_id (FK), photo_url, dukcapil_status, dukcapil_match_score, consistency_score, face_match_confidence, verification_status, is_over_age, admin_override, override_reason, timestamps
- **tournaments** -- id, name, season, province_id (FK), status, start_date, end_date, timestamps
- **matches** -- id, tournament_id (FK), home_team_id (FK), away_team_id (FK), match_date, venue, status, home_score, away_score, commissioner_id, timestamps
- **match_events** -- id, match_id (FK), player_id (FK), event_type (goal/card/sub), minute, details, timestamps
- **verification_logs** -- id, player_id (FK), admin_id, action_type, old_status, new_status, risk_score, reason, payload, timestamp

### 3. RLS Policies
All tables will have RLS enabled. Access rules:
- **Authenticated users**: Can SELECT most tables (read access for the app)
- **super_admin / provincial_admin**: Full CRUD on all operational tables
- **match_commissioner**: INSERT/UPDATE on matches, match_events
- **data_operator**: INSERT/UPDATE on players, matches
- **scout**: SELECT only on players, matches, match_events
- **user_roles**: Only super_admin can manage; users can read their own role

### 4. Code Updates
- Remove the manual `src/lib/supabase.ts` client (use `@/integrations/supabase/client` everywhere)
- Update `src/services/playerService.ts` and `src/services/authService.ts` to import from `@/integrations/supabase/client`
- The `src/integrations/supabase/types.ts` will auto-regenerate after migration

## Technical Details

### Role Enum Values
```sql
create type public.app_role as enum (
  'super_admin', 'provincial_admin', 
  'match_commissioner', 'data_operator', 'scout'
);
```

### Security Definer Function
```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer
set search_path = public
as $$ select exists (
  select 1 from public.user_roles 
  where user_id = _user_id and role = _role
) $$;
```

### Files to Modify
1. **New migration** -- Single SQL migration with all tables, RLS, and functions
2. **src/services/playerService.ts** -- Switch import to `@/integrations/supabase/client`
3. **src/services/authService.ts** -- Switch import to `@/integrations/supabase/client`
4. **src/lib/supabase.ts** -- Remove or keep as legacy; update references

