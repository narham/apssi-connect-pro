-- Master Schema for APSSI CONNECT (Complete Application Structure)
-- Purpose: Unified database for Anti-Fraud, Tournament Management, RBAC, and Scouting

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ORGANIZATIONAL STRUCTURE ====================

-- Table: provinces
CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: clubs
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    province_id UUID REFERENCES provinces(id) ON DELETE SET NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, province_id)
);

-- Table: teams (e.g., U-12, U-14 within a Club)
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    age_category TEXT CHECK (age_category IN ('U10', 'U12', 'U14', 'U16', 'SENIOR')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== USER MANAGEMENT & RBAC ====================

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('ADMIN', 'SCOUT', 'REGISTRAR', 'VIEWER')) DEFAULT 'REGISTRAR',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== PLAYER IDENTITY & ANTI-FRAUD ====================

-- Table: players
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    nik TEXT UNIQUE NOT NULL, -- Masked in UI for non-authorized roles
    kk_number TEXT,
    birth_date DATE NOT NULL,
    birth_place TEXT,
    parent_name TEXT,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    photo_url TEXT,
    
    -- Verification Signals
    dukcapil_status TEXT CHECK (dukcapil_status IN ('VALID MATCH', 'PARTIAL MATCH', 'NO MATCH')) DEFAULT 'NO MATCH',
    dukcapil_match_score INTEGER DEFAULT 0,
    consistency_score INTEGER DEFAULT 0,
    face_match_confidence INTEGER DEFAULT 0,
    
    -- Final Decision
    verification_status TEXT CHECK (verification_status IN ('VERIFIED', 'MANUAL REVIEW', 'REJECTED')) DEFAULT 'MANUAL REVIEW',
    is_over_age BOOLEAN DEFAULT FALSE,
    admin_override BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== TOURNAMENT MANAGEMENT ====================

-- Table: tournaments
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    format TEXT CHECK (format IN ('LEAGUE', 'KNOCKOUT', 'HYBRID')) DEFAULT 'LEAGUE',
    status TEXT CHECK (status IN ('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED')) DEFAULT 'PLANNED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: tournament_registrations (Teams participating in tournaments)
CREATE TABLE tournament_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    registration_status TEXT CHECK (registration_status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: tournament_groups (For group stages)
CREATE TABLE tournament_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., 'Group A'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== MATCHES & STATISTICS ====================

-- Table: matches
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    group_id UUID REFERENCES tournament_groups(id),
    home_team_id UUID REFERENCES teams(id),
    away_team_id UUID REFERENCES teams(id),
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    score_home INTEGER DEFAULT 0,
    score_away INTEGER DEFAULT 0,
    match_status TEXT CHECK (match_status IN ('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED')) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: player_match_stats
CREATE TABLE player_match_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    rating DECIMAL(3,2), -- AI-based performance rating
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== SCOUTING & PERFORMANCE ====================

-- Table: scout_reports
CREATE TABLE scout_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    scout_id UUID REFERENCES users(id) ON DELETE SET NULL,
    technical_score INTEGER CHECK (technical_score BETWEEN 0 AND 100),
    tactical_score INTEGER CHECK (tactical_score BETWEEN 0 AND 100),
    physical_score INTEGER CHECK (physical_score BETWEEN 0 AND 100),
    mental_score INTEGER CHECK (mental_score BETWEEN 0 AND 100),
    potential_rating TEXT CHECK (potential_rating IN ('ELITE', 'PROSPECT', 'AVERAGE', 'BELOW')),
    scout_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== AUDIT & SECURITY ====================

-- Table: verification_logs (Anti-Fraud Specific)
CREATE TABLE verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(id),
    action_type TEXT NOT NULL, -- 'VALIDATION', 'OVERRIDE', 'RE_VALIDATION'
    old_status TEXT,
    new_status TEXT,
    risk_score INTEGER,
    reason TEXT,
    payload JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: activity_logs (General System Audit)
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_category TEXT NOT NULL, -- 'TOURNAMENT', 'MATCH_UPDATE', 'USER_MGMT'
    action_description TEXT NOT NULL,
    ip_address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXING & PERFORMANCE ====================

CREATE INDEX idx_players_nik ON players(nik);
CREATE INDEX idx_players_club ON players(club_id);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_status ON players(verification_status);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_player_match_stats_player ON player_match_stats(player_id);
CREATE INDEX idx_scout_reports_player ON scout_reports(player_id);
CREATE INDEX idx_verification_logs_player ON verification_logs(player_id);

-- ==================== TRIGGERS & AUTOMATION ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers for modtime tracking
CREATE TRIGGER update_provinces_modtime BEFORE UPDATE ON provinces FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_clubs_modtime BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_teams_modtime BEFORE UPDATE ON teams FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_players_modtime BEFORE UPDATE ON players FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tournaments_modtime BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_matches_modtime BEFORE UPDATE ON matches FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_scout_reports_modtime BEFORE UPDATE ON scout_reports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
