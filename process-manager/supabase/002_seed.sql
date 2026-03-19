-- ─────────────────────────────────────────────────────────────────────────────
-- Seed Data — Sample models, templates and instances
-- ─────────────────────────────────────────────────────────────────────────────

-- Teams
INSERT INTO teams (id, name, color, description) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Engineering', '#3b82f6', 'Engineering & maintenance team'),
  ('11111111-0000-0000-0000-000000000002', 'Safety', '#ef4444', 'Safety inspection team'),
  ('11111111-0000-0000-0000-000000000003', 'Operations', '#10b981', 'Operations team')
ON CONFLICT (id) DO NOTHING;

-- Vehicle SVG model template
INSERT INTO model_templates (id, name, description, model_type, model_category, model_file, points) VALUES (
  '22222222-0000-0000-0000-000000000001',
  'Forklift Inspection',
  'Standard forklift pre-operation inspection',
  'svg',
  'vehicle',
  '/models/forklift.svg',
  '[
    {
      "point_id": "engine",
      "label": "Engine",
      "coordinates": {"x": 55, "y": 35, "z": 0},
      "description": "Check engine oil, coolant and belts",
      "fields": [
        {"name": "oil_level", "label": "Oil Level", "field_type": "select", "required": true, "options": ["OK", "Low", "Critical"]},
        {"name": "coolant_level", "label": "Coolant Level", "field_type": "select", "required": true, "options": ["OK", "Low", "Critical"]},
        {"name": "notes", "label": "Notes", "field_type": "textarea", "required": false}
      ],
      "next_points": ["battery", "forks"]
    },
    {
      "point_id": "battery",
      "label": "Battery",
      "coordinates": {"x": 70, "y": 55, "z": 0},
      "description": "Check battery charge and connections",
      "fields": [
        {"name": "charge_level", "label": "Charge Level (%)", "field_type": "number", "required": true},
        {"name": "connections_ok", "label": "Connections OK?", "field_type": "checkbox", "required": true},
        {"name": "notes", "label": "Notes", "field_type": "textarea", "required": false}
      ],
      "next_points": ["tires"]
    },
    {
      "point_id": "forks",
      "label": "Forks",
      "coordinates": {"x": 15, "y": 50, "z": 0},
      "description": "Inspect forks for cracks and deformation",
      "fields": [
        {"name": "fork_condition", "label": "Fork Condition", "field_type": "select", "required": true, "options": ["Good", "Minor wear", "Needs repair", "Out of service"]},
        {"name": "fork_spread", "label": "Fork Spread (mm)", "field_type": "number", "required": false},
        {"name": "photo_taken", "label": "Photo Taken", "field_type": "checkbox", "required": false}
      ],
      "next_points": ["mast"]
    },
    {
      "point_id": "mast",
      "label": "Mast",
      "coordinates": {"x": 20, "y": 35, "z": 0},
      "description": "Check mast chains and rollers",
      "fields": [
        {"name": "chain_condition", "label": "Chain Condition", "field_type": "select", "required": true, "options": ["Good", "Needs lubrication", "Worn", "Replace"]},
        {"name": "mast_straightness", "label": "Mast Straight?", "field_type": "checkbox", "required": true}
      ],
      "next_points": ["tires"]
    },
    {
      "point_id": "tires",
      "label": "Tires",
      "coordinates": {"x": 45, "y": 80, "z": 0},
      "description": "Inspect all tires for wear and pressure",
      "fields": [
        {"name": "front_left", "label": "Front Left", "field_type": "select", "required": true, "options": ["OK", "Low pressure", "Worn", "Flat"]},
        {"name": "front_right", "label": "Front Right", "field_type": "select", "required": true, "options": ["OK", "Low pressure", "Worn", "Flat"]},
        {"name": "rear_left", "label": "Rear Left", "field_type": "select", "required": true, "options": ["OK", "Low pressure", "Worn", "Flat"]},
        {"name": "rear_right", "label": "Rear Right", "field_type": "select", "required": true, "options": ["OK", "Low pressure", "Worn", "Flat"]}
      ],
      "next_points": []
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Human body model template
INSERT INTO model_templates (id, name, description, model_type, model_category, model_file, points) VALUES (
  '22222222-0000-0000-0000-000000000002',
  'Worker Injury Assessment',
  'Body map for recording workplace injuries',
  'svg',
  'human',
  '/models/human.svg',
  '[
    {
      "point_id": "head",
      "label": "Head",
      "coordinates": {"x": 50, "y": 8, "z": 0},
      "fields": [
        {"name": "injury_type", "label": "Injury Type", "field_type": "select", "required": true, "options": ["Cut", "Bruise", "Fracture", "Burn", "Other"]},
        {"name": "severity", "label": "Severity", "field_type": "select", "required": true, "options": ["Minor", "Moderate", "Severe"]},
        {"name": "description", "label": "Description", "field_type": "textarea", "required": false}
      ],
      "next_points": ["torso"]
    },
    {
      "point_id": "left_arm",
      "label": "Left Arm",
      "coordinates": {"x": 25, "y": 35, "z": 0},
      "fields": [
        {"name": "injury_type", "label": "Injury Type", "field_type": "select", "required": true, "options": ["Cut", "Bruise", "Fracture", "Burn", "Other"]},
        {"name": "severity", "label": "Severity", "field_type": "select", "required": true, "options": ["Minor", "Moderate", "Severe"]},
        {"name": "description", "label": "Description", "field_type": "textarea", "required": false}
      ],
      "next_points": []
    },
    {
      "point_id": "right_arm",
      "label": "Right Arm",
      "coordinates": {"x": 75, "y": 35, "z": 0},
      "fields": [
        {"name": "injury_type", "label": "Injury Type", "field_type": "select", "required": true, "options": ["Cut", "Bruise", "Fracture", "Burn", "Other"]},
        {"name": "severity", "label": "Severity", "field_type": "select", "required": true, "options": ["Minor", "Moderate", "Severe"]},
        {"name": "description", "label": "Description", "field_type": "textarea", "required": false}
      ],
      "next_points": []
    },
    {
      "point_id": "torso",
      "label": "Torso",
      "coordinates": {"x": 50, "y": 38, "z": 0},
      "fields": [
        {"name": "injury_type", "label": "Injury Type", "field_type": "select", "required": true, "options": ["Cut", "Bruise", "Fracture", "Burn", "Other"]},
        {"name": "severity", "label": "Severity", "field_type": "select", "required": true, "options": ["Minor", "Moderate", "Severe"]},
        {"name": "description", "label": "Description", "field_type": "textarea", "required": false}
      ],
      "next_points": ["left_arm", "right_arm", "legs"]
    },
    {
      "point_id": "legs",
      "label": "Legs",
      "coordinates": {"x": 50, "y": 68, "z": 0},
      "fields": [
        {"name": "injury_type", "label": "Injury Type", "field_type": "select", "required": true, "options": ["Cut", "Bruise", "Fracture", "Burn", "Other"]},
        {"name": "severity", "label": "Severity", "field_type": "select", "required": true, "options": ["Minor", "Moderate", "Severe"]},
        {"name": "which_leg", "label": "Which Leg?", "field_type": "select", "required": true, "options": ["Left", "Right", "Both"]}
      ],
      "next_points": []
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Equipment model template
INSERT INTO model_templates (id, name, description, model_type, model_category, model_file, points) VALUES (
  '22222222-0000-0000-0000-000000000003',
  'Fire Extinguisher Check',
  'Monthly fire extinguisher inspection',
  'svg',
  'equipment',
  '/models/fire-extinguisher.svg',
  '[
    {
      "point_id": "pressure_gauge",
      "label": "Pressure Gauge",
      "coordinates": {"x": 50, "y": 25, "z": 0},
      "fields": [
        {"name": "pressure_ok", "label": "Pressure in Green Zone?", "field_type": "checkbox", "required": true},
        {"name": "reading", "label": "Gauge Reading (bar)", "field_type": "number", "required": false}
      ],
      "next_points": ["pin", "nozzle"]
    },
    {
      "point_id": "pin",
      "label": "Safety Pin",
      "coordinates": {"x": 35, "y": 20, "z": 0},
      "fields": [
        {"name": "pin_present", "label": "Pin Present & Intact?", "field_type": "checkbox", "required": true},
        {"name": "seal_intact", "label": "Seal Intact?", "field_type": "checkbox", "required": true}
      ],
      "next_points": ["body"]
    },
    {
      "point_id": "nozzle",
      "label": "Nozzle/Hose",
      "coordinates": {"x": 60, "y": 15, "z": 0},
      "fields": [
        {"name": "hose_condition", "label": "Hose Condition", "field_type": "select", "required": true, "options": ["Good", "Cracked", "Blocked", "Missing"]},
        {"name": "nozzle_clear", "label": "Nozzle Clear?", "field_type": "checkbox", "required": true}
      ],
      "next_points": ["body"]
    },
    {
      "point_id": "body",
      "label": "Cylinder Body",
      "coordinates": {"x": 50, "y": 55, "z": 0},
      "fields": [
        {"name": "corrosion", "label": "Signs of Corrosion?", "field_type": "checkbox", "required": true},
        {"name": "dents_damage", "label": "Dents or Damage?", "field_type": "checkbox", "required": true},
        {"name": "label_legible", "label": "Label Legible?", "field_type": "checkbox", "required": true},
        {"name": "last_service_date", "label": "Last Service Date", "field_type": "date", "required": false}
      ],
      "next_points": []
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Process Templates
INSERT INTO process_templates (id, name, description, model_template_id, template_points) VALUES (
  '33333333-0000-0000-0000-000000000001',
  'Daily Forklift Pre-Op Check',
  'Complete daily pre-operation forklift inspection',
  '22222222-0000-0000-0000-000000000001',
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO process_templates (id, name, description, model_template_id, template_points) VALUES (
  '33333333-0000-0000-0000-000000000002',
  'Workplace Injury Report',
  'Record and document a workplace injury',
  '22222222-0000-0000-0000-000000000002',
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO process_templates (id, name, description, model_template_id, template_points) VALUES (
  '33333333-0000-0000-0000-000000000003',
  'Monthly Fire Equipment Audit',
  'Monthly inspection of fire extinguishers',
  '22222222-0000-0000-0000-000000000003',
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Sample Process Instances
INSERT INTO process_instances (template_id, team_id, name, status, selected_points, field_values) VALUES (
  '33333333-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000001',
  'Forklift #FL-001 — March 19',
  'active',
  '["engine", "battery"]'::jsonb,
  '{"engine": {"oil_level": "OK", "coolant_level": "Low", "notes": "Top up coolant before shift"}, "battery": {"charge_level": 85, "connections_ok": true}}'::jsonb
);

INSERT INTO process_instances (template_id, team_id, name, status, selected_points, field_values) VALUES (
  '33333333-0000-0000-0000-000000000003',
  '11111111-0000-0000-0000-000000000002',
  'Building A — March 2026',
  'active',
  '[]'::jsonb,
  '{}'::jsonb
);
