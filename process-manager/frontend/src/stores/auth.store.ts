import { create } from 'zustand'
import type { AuthUser } from '../types'
import { client } from '../api/client'

interface AuthState {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  loadFromStorage: () => {
    const token = localStorage.getItem('access_token')
    const raw = localStorage.getItem('user')
    if (token && raw) {
      set({ token, user: JSON.parse(raw) })
    }
  },

  login: async (email, password) => {
    const res = await client.post('/auth/login', { email, password })
    const { access_token, user } = res.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token: access_token, user })
  },

  register: async (email, password, name) => {
    const res = await client.post('/auth/register', { email, password, name })
    const { access_token, user } = res.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token: access_token, user })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },
}))
