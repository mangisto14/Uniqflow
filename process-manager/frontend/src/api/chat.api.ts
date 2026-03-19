import { client } from './client'
import type { ChatResponse, PointField } from '../types'

export const chatApi = {
  getPointSuggestion: (params: {
    process_id: string
    point_id: string
    point_label: string
    fields: PointField[]
    field_values: Record<string, unknown>
    process_context?: Record<string, unknown>
  }) =>
    client.post<ChatResponse>('/chat', {
      ...params,
      process_context: params.process_context ?? {},
    }).then((r) => r.data),
}
