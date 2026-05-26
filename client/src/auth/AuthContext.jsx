import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginApi, register as registerApi } from '../api/userService.js'
import { config } from '../services/config.js'
import { storage } from '../services/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = storage.get(config.AUTH_USER_KEY)
    setUser(saved)
    setLoading(false)
  }, [])

  const persistUser = useCallback((nextUser) => {
    if (nextUser) {
      storage.set(config.AUTH_USER_KEY, nextUser)
    } else {
      storage.remove(config.AUTH_USER_KEY)
    }
    setUser(nextUser)
  }, [])

  const login = useCallback(
    async (username, password) => {
      const loggedIn = await loginApi(username, password)
      persistUser(loggedIn)
      return loggedIn
    },
    [persistUser],
  )

  const register = useCallback(
    async (payload) => {
      const registered = await registerApi(payload)
      persistUser(registered)
      return registered
    },
    [persistUser],
  )

  const logout = useCallback(() => {
    persistUser(null)
  }, [persistUser])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
