import { client } from './client'
import type {
  ProcessTemplate,
  ProcessInstance,
  ProcessStatus,
  PointFieldsResponse,
} from '../types'

export const processTemplatesApi = {
  list: () => client.get<ProcessTemplate[]>('/process-templates').then((r) => r.data),
  get: (id: string) => client.get<ProcessTemplate>(`/process-templates/${id}`).then((r) => r.data),
  create: (data: Omit<ProcessTemplate, 'id' | 'created_at'>) =>
    client.post<ProcessTemplate>('/process-templates', data).then((r) => r.data),
  update: (id: string, data: Partial<ProcessTemplate>) =>
    client.put<ProcessTemplate>(`/process-templates/${id}`, data).then((r) => r.data),
  delete: (id: string) => client.delete(`/process-templates/${id}`),
}

export const processInstancesApi = {
  list: (teamId?: string) =>
    client
      .get<ProcessInstance[]>('/processes', { params: teamId ? { team_id: teamId } : {} })
      .then((r) => r.data),

  get: (id: string) => client.get<ProcessInstance>(`/processes/${id}`).then((r) => r.data),

  create: (data: { template_id: string; team_id?: string; name?: string }) =>
    client.post<ProcessInstance>('/processes', data).then((r) => r.data),

  update: (id: string, data: { status?: ProcessStatus; selected_points?: string[]; field_values?: Record<string, unknown> }) =>
    client.patch<ProcessInstance>(`/processes/${id}`, data).then((r) => r.data),

  delete: (id: string) => client.delete(`/processes/${id}`),

  getPointFields: (processId: string, pointId: string) =>
    client.get<PointFieldsResponse>(`/processes/${processId}/points/${pointId}/fields`).then((r) => r.data),

  savePointFields: (processId: string, pointId: string, values: Record<string, unknown>) =>
    client
      .post<PointFieldsResponse>(`/processes/${processId}/points/${pointId}/fields`, { field_values: values })
      .then((r) => r.data),
}
