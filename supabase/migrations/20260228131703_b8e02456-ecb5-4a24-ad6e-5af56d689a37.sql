
-- 1. Role enum
CREATE TYPE public.app_role AS ENUM (
  'super_admin', 'provincial_admin', 'match_commissioner', 'data_operator', 'scout'
);

-- 2. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. user_roles RLS policies
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 5. Provinces
CREATE TABLE public.provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read provinces" ON public.provinces
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage provinces" ON public.provinces
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'provincial_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'provincial_admin'));

-- 6. Clubs
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  province_id UUID REFERENCES public.provinces(id),
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read clubs" ON public.clubs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage clubs" ON public.clubs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'provincial_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'provincial_admin'));

-- 7. Teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  age_category TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read teams" ON public.teams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage teams" ON public.teams
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'provincial_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'provincial_admin'));

-- 8. Players
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  nik TEXT NOT NULL,
  kk_number TEXT,
  birth_date DATE NOT NULL,
  birth_place TEXT,
  parent_name TEXT,
  club_id UUID REFERENCES public.clubs(id),
  team_id UUID REFERENCES public.teams(id),
  photo_url TEXT,
  dukcapil_status TEXT NOT NULL DEFAULT 'NO MATCH',
  dukcapil_match_score NUMERIC NOT NULL DEFAULT 0,
  consistency_score NUMERIC NOT NULL DEFAULT 0,
  face_match_confidence NUMERIC NOT NULL DEFAULT 0,
  verification_status TEXT NOT NULL DEFAULT 'MANUAL REVIEW',
  is_over_age BOOLEAN NOT NULL DEFAULT false,
  admin_override BOOLEAN NOT NULL DEFAULT false,
  override_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read players" ON public.players
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and operators can manage players" ON public.players
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'provincial_admin') OR
    public.has_role(auth.uid(), 'data_operator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'provincial_admin') OR
    public.has_role(auth.uid(), 'data_operator')
  );

-- 9. Tournaments
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  season TEXT,
  province_id UUID REFERENCES public.provinces(id),
  status TEXT NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tournaments" ON public.tournaments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage tournaments" ON public.tournaments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'provincial_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'provincial_admin'));

-- 10. Matches
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  home_team_id UUID REFERENCES public.teams(id) NOT NULL,
  away_team_id UUID REFERENCES public.teams(id) NOT NULL,
  match_date TIMESTAMPTZ,
  venue TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  commissioner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read matches" ON public.matches
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and commissioners can manage matches" ON public.matches
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'provincial_admin') OR
    public.has_role(auth.uid(), 'match_commissioner') OR
    public.has_role(auth.uid(), 'data_operator')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'provincial_admin') OR
    public.has_role(auth.uid(), 'match_commissioner') OR
    public.has_role(auth.uid(), 'data_operator')
  );

-- 11. Match Events
CREATE TABLE public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id),
  event_type TEXT NOT NULL,
  minute INTEGER,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read match events" ON public.match_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and commissioners can manage match events" ON public.match_events
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'provincial_admin') OR
    public.has_role(auth.uid(), 'match_commissioner')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'provincial_admin') OR
    public.has_role(auth.uid(), 'match_commissioner')
  );

-- 12. Verification Logs
CREATE TABLE public.verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  risk_score NUMERIC DEFAULT 0,
  reason TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read verification logs" ON public.verification_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and operators can create verification logs" ON public.verification_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'provincial_admin') OR
    public.has_role(auth.uid(), 'data_operator')
  );
