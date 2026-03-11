export enum ShareType {
  ALL_DATA = 'ALL_DATA',
  FILTERED = 'FILTERED',
  DIGEST = 'DIGEST',
}

export interface ISharingRule {
  id: string;
  stepId: string;
  targetTeamId: string;
  shareType: ShareType;
  filterConfig?: { include?: string[]; exclude?: string[] };
  template?: string;
  isActive: boolean;
}
