export interface ISvgPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  fieldType?: string;
  fields?: Record<string, unknown>[];
}

export interface ISvgTemplate {
  id: string;
  name: string;
  description?: string;
  svgContent: string;
  thumbnail?: string;
  pointsConfig: ISvgPoint[];
  isActive: boolean;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ISvgTemplateSummary {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: { id: string; name: string };
}
