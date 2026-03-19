-- ─────────────────────────────────────────────────────────────────────────────
-- Process Manager — Initial Schema
-- Run this in Supabase → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#3b82f6',
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Model Templates (SVG / 3D interactive models)
CREATE TABLE IF NOT EXISTS model_templates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  description    TEXT,
  model_type     TEXT NOT NULL DEFAULT 'svg' CHECK (model_type IN ('svg', '3d')),
  model_category TEXT NOT NULL DEFAULT 'vehicle' CHECK (model_category IN ('vehicle', 'equipment', 'human')),
  model_file     TEXT,        -- URL to SVG or 3D file
  points         JSONB NOT NULL DEFAULT '[]',
  -- points schema: [{point_id, label, coordinates:{x,y,z}, fields:[{name,label,field_type,required,options}], next_points:[]}]
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Process Templates
CREATE TABLE IF NOT EXISTS process_templates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  description      TEXT,
  model_template_id UUID REFERENCES model_templates(id) ON DELETE SET NULL,
  template_points  JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Process Instances
CREATE TABLE IF NOT EXISTS process_instances (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id      UUID NOT NULL REFERENCES process_templates(id) ON DELETE RESTRICT,
  team_id          UUID REFERENCES teams(id) ON DELETE SET NULL,
  name             TEXT,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','completed','cancelled')),
  selected_points  JSONB NOT NULL DEFAULT '[]',   -- [point_id, ...]
  field_values     JSONB NOT NULL DEFAULT '{}',   -- {point_id: {field_name: value}}
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_model_templates_updated_at BEFORE UPDATE ON model_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_process_templates_updated_at BEFORE UPDATE ON process_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_process_instances_updated_at BEFORE UPDATE ON process_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_process_instances_template ON process_instances(template_id);
CREATE INDEX IF NOT EXISTS idx_process_instances_team ON process_instances(team_id);
CREATE INDEX IF NOT EXISTS idx_process_instances_status ON process_instances(status);
CREATE INDEX IF NOT EXISTS idx_model_templates_category ON model_templates(model_category);
