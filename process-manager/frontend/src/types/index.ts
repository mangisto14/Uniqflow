// ── Model Templates ────────────────────────────────────────────────────────────

export type ModelType = 'svg' | '3d'
export type ModelCategory = 'vehicle' | 'equipment' | 'human'

export interface PointField {
  name: string
  label: string
  field_type: 'text' | 'number' | 'select' | 'date' | 'textarea' | 'checkbox'
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface ModelPoint {
  point_id: string
  label: string
  coordinates: { x: number; y: number; z: number }
  fields: PointField[]
  next_points: string[]
  description?: string
}

export interface ModelTemplate {
  id: string
  name: string
  description?: string
  model_type: ModelType
  model_category: ModelCategory
  model_file?: string
  points: ModelPoint[]
  created_at: string
  updated_at?: string
}

// ── Process Templates ──────────────────────────────────────────────────────────

export interface ProcessTemplate {
  id: string
  name: string
  description?: string
  model_template_id?: string
  template_points: ModelPoint[]
  created_at: string
}

// ── Process Instances ──────────────────────────────────────────────────────────

export type ProcessStatus = 'draft' | 'active' | 'completed' | 'cancelled'

export interface ProcessInstance {
  id: string
  template_id: string
  team_id?: string
  name?: string
  status: ProcessStatus
  selected_points: string[]
  field_values: Record<string, Record<string, unknown>>
  created_at: string
  updated_at?: string
}

// ── Teams ──────────────────────────────────────────────────────────────────────

export interface Team {
  id: string
  name: string
  color: string
  description?: string
  created_at: string
}

// ── Auth ───────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface AuthTokens {
  access_token: string
  token_type: string
  user: AuthUser
}

// ── Chat AI ────────────────────────────────────────────────────────────────────

export interface ChatResponse {
  suggestion: string
  field_hints: Record<string, string>
  warnings: string[]
  recommended_next_points: string[]
}

// ── Point Fields API ───────────────────────────────────────────────────────────

export interface PointFieldsResponse {
  point_id: string
  fields: PointField[]
  saved_values: Record<string, unknown>
  next_points: string[]
}
