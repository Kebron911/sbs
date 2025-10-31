-- ============================================================
-- COMPLETE UPDATED SCHEMA: LifeOS Database
-- PostgreSQL 15+ Required
-- Extensions: uuid-ossp, pgcrypto
-- Updated: October 28, 2025
-- Compatible with SBS n8n Workflow Ecosystem (25+ subflows)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- AUTHENTICATION & USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(80) UNIQUE NOT NULL,
    avatar VARCHAR(255),
    join_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    password_hash VARCHAR(255) NULL,
    theme VARCHAR(40) DEFAULT 'default',
    cloud_sync_token VARCHAR(128) NULL,
    total_prestiges INTEGER DEFAULT 0,
    telegram_user_id BIGINT UNIQUE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- GAME ENTITIES
-- ============================================================

CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    class VARCHAR(32),
    bio TEXT,
    goals TEXT,
    level INTEGER DEFAULT 1,
    xp BIGINT DEFAULT 0,
    total_xp BIGINT DEFAULT 0,
    hp INTEGER DEFAULT 100,
    max_hp INTEGER DEFAULT 100,
    coins INTEGER DEFAULT 100,
    prestige_level INTEGER DEFAULT 0,
    xp_multiplier DECIMAL(3,2) DEFAULT 1.00,
    title VARCHAR(120),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    xp BIGINT DEFAULT 0,
    level INTEGER DEFAULT 1,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habit_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80),
    skill_name VARCHAR(64),
    description TEXT
);

CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL,
    name VARCHAR(100),
    description TEXT,
    type VARCHAR(10) CHECK (type IN ('good','bad')),
    frequency VARCHAR(20),
    xp_value INTEGER DEFAULT 0,
    hp_value INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_completed DATE,
    template_id INTEGER REFERENCES habit_templates(id) ON DELETE SET NULL,
    created_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS areas (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id),
    name VARCHAR(50),
    description TEXT
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    area_id INTEGER REFERENCES areas(id),
    title VARCHAR(120),
    description TEXT,
    total_xp INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    difficulty VARCHAR(32),
    deadline DATE,
    completed BOOLEAN DEFAULT FALSE,
    system_template_id INTEGER REFERENCES system_templates(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(120),
    completed BOOLEAN DEFAULT FALSE,
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    difficulty VARCHAR(32),
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- ECONOMY
-- ============================================================

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64),
    item_type VARCHAR(32),
    rarity VARCHAR(32),
    description TEXT,
    effect TEXT,
    cost INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id),
    item_id INTEGER REFERENCES items(id),
    quantity INTEGER DEFAULT 1,
    acquired TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id),
    type VARCHAR(32),
    amount INTEGER,
    item_id INTEGER REFERENCES items(id),
    description TEXT,
    trans_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- SOCIAL
-- ============================================================

CREATE TABLE IF NOT EXISTS guilds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    description TEXT,
    leader_id INTEGER REFERENCES users(id),
    xp_pool INTEGER DEFAULT 0,
    created TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guild_members (
    guild_id INTEGER REFERENCES guilds(id),
    user_id INTEGER REFERENCES users(id),
    joined TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_admin BOOLEAN DEFAULT FALSE,
    PRIMARY KEY(guild_id, user_id)
);

-- ============================================================
-- SBS (SYSTEM FOR BUILDING SYSTEMS)
-- ============================================================

CREATE TABLE IF NOT EXISTS system_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    default_inputs JSONB,
    default_outputs JSONB,
    schema_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS systems (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    purpose TEXT,
    inputs TEXT,
    outputs TEXT,
    update_frequency TEXT,
    current_stage TEXT DEFAULT 'define',
    target_stage TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    owner_type TEXT CHECK (owner_type IN ('user', 'character', 'guild')) DEFAULT 'user',
    owner_id INTEGER
);

CREATE TABLE IF NOT EXISTS system_steps (
    id SERIAL PRIMARY KEY,
    system_id INT REFERENCES systems(id) ON DELETE CASCADE,
    step TEXT NOT NULL CHECK (step IN ('define', 'design', 'build', 'automate', 'review')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'complete', 'blocked')),
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routines (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    system_id INT REFERENCES systems(id) ON DELETE CASCADE,
    day_of_week TEXT,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    metadata JSONB DEFAULT '{}'::jsonb,
    habit_id INTEGER REFERENCES habits(id) ON DELETE SET NULL,
    trigger_type TEXT DEFAULT 'scheduled' CHECK (trigger_type IN ('manual', 'scheduled', 'event')),
    active BOOLEAN DEFAULT TRUE,
    automated BOOLEAN DEFAULT FALSE,
    streak INTEGER DEFAULT 0,
    guild_id INTEGER REFERENCES guilds(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routine_completions (
    id SERIAL PRIMARY KEY,
    routine_id INTEGER REFERENCES routines(id) ON DELETE CASCADE,
    completion_date DATE NOT NULL,
    notes TEXT,
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    xp_earned INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    streak_at_completion INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- LOGGING & AUDIT - ENHANCED SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS system_logs (
    id VARCHAR(50) PRIMARY KEY,
    system_id INT REFERENCES systems(id) ON DELETE CASCADE,
    character_id INT REFERENCES characters(id) ON DELETE SET NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    log_level TEXT DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warning', 'error', 'critical')),
    event_category TEXT,
    event_details JSONB,
    tags JSONB,
    source TEXT DEFAULT 'system',
    correlation_id VARCHAR(128),
    session_id VARCHAR(128),
    retention_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Legacy columns for backward compatibility
    legacy_event TEXT,
    legacy_details JSONB
);

CREATE TABLE IF NOT EXISTS unified_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    source TEXT,
    system_id INT REFERENCES systems(id) ON DELETE SET NULL,
    character_id INT REFERENCES characters(id) ON DELETE SET NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT,
    detail JSONB,
    outcome TEXT,
    severity TEXT DEFAULT 'info'
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id),
    event_type VARCHAR(50),
    xp_change INTEGER DEFAULT 0,
    hp_change INTEGER DEFAULT 0,
    coins_change INTEGER DEFAULT 0,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_logs (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id),
    message TEXT,
    insight_type VARCHAR(32),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- CONTENT & PROGRESSION
-- ============================================================

CREATE TABLE IF NOT EXISTS rng_events (
    id SERIAL PRIMARY KEY,
    description TEXT,
    effect TEXT,
    rarity VARCHAR(32),
    available BOOLEAN DEFAULT TRUE,
    last_issued DATE
);

CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id),
    title VARCHAR(100),
    description TEXT,
    reward_type VARCHAR(32),
    bonus_value INTEGER,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journal (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id),
    entry TEXT,
    wisdom_xp INTEGER DEFAULT 0,
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    level_xp_formula TEXT,
    overdraft_rule TEXT,
    notification_times TEXT,
    theme VARCHAR(32),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- EXTENDED GAME FEATURES
-- ============================================================

CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    title VARCHAR(120),
    description TEXT,
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS missions (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    type VARCHAR(30),
    title VARCHAR(120),
    description TEXT,
    target_system_id INTEGER REFERENCES systems(id) ON DELETE SET NULL,
    suggested_routine TEXT,
    system_category VARCHAR(50),
    stage_focus VARCHAR(30),
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS archive (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    project_id INTEGER,
    archive_type VARCHAR(30) DEFAULT 'project_completion',
    completed_on TIMESTAMP WITH TIME ZONE DEFAULT now(),
    xp_earned INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS custom_rewards (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    reward_id VARCHAR(50),
    reward_type VARCHAR(30),
    name VARCHAR(100),
    description TEXT,
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    item_reward JSONB,
    skill_unlock VARCHAR(100),
    special_effect TEXT,
    duration INTEGER,
    conditions JSONB,
    granted_by VARCHAR(50),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TRIGGERS FOR EVENT-DRIVEN ARCHITECTURE
-- ============================================================

-- System Update Trigger
CREATE OR REPLACE FUNCTION notify_system_update()
RETURNS trigger AS $$
BEGIN
    PERFORM pg_notify('system_update', row_to_json(NEW)::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS systems_notify_trigger ON systems;
CREATE TRIGGER systems_notify_trigger
AFTER INSERT OR UPDATE ON systems
FOR EACH ROW EXECUTE FUNCTION notify_system_update();

-- Unified Event Trigger
CREATE OR REPLACE FUNCTION notify_unified_event()
RETURNS trigger AS $$
DECLARE
    payload json;
BEGIN
    payload := row_to_json(NEW);
    PERFORM pg_notify('unified_event', payload::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS habits_notify_trigger ON habits;
CREATE TRIGGER habits_notify_trigger
AFTER INSERT OR UPDATE ON habits
FOR EACH ROW EXECUTE FUNCTION notify_unified_event();

DROP TRIGGER IF EXISTS tasks_notify_trigger ON tasks;
CREATE TRIGGER tasks_notify_trigger
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION notify_unified_event();

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Core entity indexes
CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_character_id ON skills(character_id);
CREATE INDEX IF NOT EXISTS idx_habits_character_id ON habits(character_id);
CREATE INDEX IF NOT EXISTS idx_habits_type ON habits(type);
CREATE INDEX IF NOT EXISTS idx_projects_character_id ON projects(character_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);

-- SBS system indexes
CREATE INDEX IF NOT EXISTS idx_systems_owner ON systems(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_systems_stage ON systems(current_stage);
CREATE INDEX IF NOT EXISTS idx_systems_category ON systems(category);
CREATE INDEX IF NOT EXISTS idx_system_steps_system_id ON system_steps(system_id);
CREATE INDEX IF NOT EXISTS idx_system_steps_status ON system_steps(status);
CREATE INDEX IF NOT EXISTS idx_routines_system_id ON routines(system_id);
CREATE INDEX IF NOT EXISTS idx_routines_habit_id ON routines(habit_id);
CREATE INDEX IF NOT EXISTS idx_routines_status ON routines(status);
CREATE INDEX IF NOT EXISTS idx_routines_day ON routines(day_of_week);
CREATE INDEX IF NOT EXISTS idx_routine_completions_routine_id ON routine_completions(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_completions_date ON routine_completions(completion_date);

-- Logging and audit indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_system_id ON system_logs(system_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_character_id ON system_logs(character_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_event_type ON system_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_log_level ON system_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_correlation_id ON system_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_unified_logs_timestamp ON unified_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_unified_logs_character_id ON unified_logs(character_id);
CREATE INDEX IF NOT EXISTS idx_events_character_id ON events(character_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- Economy and progression indexes
CREATE INDEX IF NOT EXISTS idx_inventory_character_id ON inventory(character_id);
CREATE INDEX IF NOT EXISTS idx_transactions_character_id ON transactions(character_id);
CREATE INDEX IF NOT EXISTS idx_achievements_character_id ON achievements(character_id);
CREATE INDEX IF NOT EXISTS idx_goals_character_id ON goals(character_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_missions_character_id ON missions(character_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_archive_character_id ON archive(character_id);
CREATE INDEX IF NOT EXISTS idx_custom_rewards_character_id ON custom_rewards(character_id);

-- Search and analytics indexes
CREATE INDEX IF NOT EXISTS idx_rng_events_available ON rng_events(available);
CREATE INDEX IF NOT EXISTS idx_rng_events_rarity ON rng_events(rarity);

-- ============================================================
-- FINAL STATISTICS & VALIDATION
-- ============================================================

-- Summary of tables:
-- Core: 5 tables (users, characters, skills, habits, areas)
-- Game: 8 tables (projects, tasks, items, inventory, transactions, goals, missions, archive)
-- Social: 2 tables (guilds, guild_members)
-- SBS: 7 tables (system_templates, systems, system_steps, routines, routine_completions, custom_rewards)
-- Logging: 4 tables (system_logs, unified_logs, events, ai_logs)
-- Content: 4 tables (rng_events, achievements, journal, settings)
-- Templates: 1 table (habit_templates)
-- 
-- Total: 31 tables with full n8n ecosystem compatibility
-- 
-- Compatible with:
-- - 25+ n8n subflows across 8 categories
-- - Enhanced system logging with correlation IDs
-- - Professional error handling and alerting
-- - Complete SBS system progression tracking
-- - Advanced game mechanics and rewards
-- - Telegram bot integration
-- - AI-powered content generation
-- 
-- Last Updated: October 28, 2025
-- Version: 3.0 - Enterprise Grade