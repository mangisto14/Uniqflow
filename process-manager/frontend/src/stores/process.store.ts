import { create } from 'zustand'
import type { ProcessInstance } from '../types'
import { processInstancesApi } from '../api/processes.api'

interface ProcessState {
  instances: ProcessInstance[]
  current: ProcessInstance | null
  loading: boolean
  fetchAll: (teamId?: string) => Promise<void>
  fetchOne: (id: string) => Promise<void>
  setCurrent: (p: ProcessInstance | null) => void
  updateLocal: (updated: ProcessInstance) => void
}

export const useProcessStore = create<ProcessState>((set) => ({
  instances: [],
  current: null,
  loading: false,

  fetchAll: async (teamId) => {
    set({ loading: true })
    const data = await processInstancesApi.list(teamId)
    set({ instances: data, loading: false })
  },

  fetchOne: async (id) => {
    set({ loading: true })
    const data = await processInstancesApi.get(id)
    set({ current: data, loading: false })
  },

  setCurrent: (p) => set({ current: p }),

  updateLocal: (updated) =>
    set((s) => ({
      instances: s.instances.map((i) => (i.id === updated.id ? updated : i)),
      current: s.current?.id === updated.id ? updated : s.current,
    })),
}))
