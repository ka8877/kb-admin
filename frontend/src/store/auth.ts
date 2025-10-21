import { create } from 'zustand'

export type AuthUser = {
  id: string
  name: string
  email?: string
  roles?: string[]
}

export interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  setToken: (token: string | null) => void
  setUser: (user: AuthUser | null) => void
  clear: () => void
}

const TOKEN_KEY = 'access_token'

const initialToken = (() => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
})()

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: initialToken,
  user: null,
  setToken: (token) => {
    set({ accessToken: token })
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token)
      else localStorage.removeItem(TOKEN_KEY)
    } catch {
      // ignore
    }
  },
  setUser: (user) => set({ user }),
  clear: () => {
    set({ accessToken: null, user: null })
    try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
  },
}))
