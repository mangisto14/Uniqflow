import { client } from './client'
import type { ModelTemplate, ModelCategory } from '../types'

export const modelsApi = {
  list: (category?: ModelCategory) =>
    client.get<ModelTemplate[]>('/models', { params: category ? { category } : {} }).then((r) => r.data),

  get: (id: string) =>
    client.get<ModelTemplate>(`/models/${id}`).then((r) => r.data),

  create: (data: Omit<ModelTemplate, 'id' | 'created_at' | 'updated_at'>) =>
    client.post<ModelTemplate>('/models', data).then((r) => r.data),

  update: (id: string, data: Partial<ModelTemplate>) =>
    client.put<ModelTemplate>(`/models/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    client.delete(`/models/${id}`),
}
