import { client } from './client'
import type { Team } from '../types'

export const teamsApi = {
  list: () => client.get<Team[]>('/teams').then((r) => r.data),
  get: (id: string) => client.get<Team>(`/teams/${id}`).then((r) => r.data),
  create: (data: Omit<Team, 'id' | 'created_at'>) =>
    client.post<Team>('/teams', data).then((r) => r.data),
  update: (id: string, data: Partial<Team>) =>
    client.put<Team>(`/teams/${id}`, data).then((r) => r.data),
  delete: (id: string) => client.delete(`/teams/${id}`),
}
