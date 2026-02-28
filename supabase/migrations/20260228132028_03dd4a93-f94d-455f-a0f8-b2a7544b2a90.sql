
-- Fix: Change all RESTRICTIVE SELECT policies to PERMISSIVE

-- clubs
DROP POLICY IF EXISTS "Authenticated users can read clubs" ON public.clubs;
CREATE POLICY "Authenticated users can read clubs"
  ON public.clubs FOR SELECT TO authenticated USING (true);

-- match_events
DROP POLICY IF EXISTS "Authenticated users can read match events" ON public.match_events;
CREATE POLICY "Authenticated users can read match events"
  ON public.match_events FOR SELECT TO authenticated USING (true);

-- matches
DROP POLICY IF EXISTS "Authenticated users can read matches" ON public.matches;
CREATE POLICY "Authenticated users can read matches"
  ON public.matches FOR SELECT TO authenticated USING (true);

-- players
DROP POLICY IF EXISTS "Authenticated users can read players" ON public.players;
CREATE POLICY "Authenticated users can read players"
  ON public.players FOR SELECT TO authenticated USING (true);

-- provinces
DROP POLICY IF EXISTS "Authenticated users can read provinces" ON public.provinces;
CREATE POLICY "Authenticated users can read provinces"
  ON public.provinces FOR SELECT TO authenticated USING (true);

-- teams
DROP POLICY IF EXISTS "Authenticated users can read teams" ON public.teams;
CREATE POLICY "Authenticated users can read teams"
  ON public.teams FOR SELECT TO authenticated USING (true);

-- tournaments
DROP POLICY IF EXISTS "Authenticated users can read tournaments" ON public.tournaments;
CREATE POLICY "Authenticated users can read tournaments"
  ON public.tournaments FOR SELECT TO authenticated USING (true);

-- verification_logs
DROP POLICY IF EXISTS "Authenticated users can read verification logs" ON public.verification_logs;
CREATE POLICY "Authenticated users can read verification logs"
  ON public.verification_logs FOR SELECT TO authenticated USING (true);

-- user_roles own-row read
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
