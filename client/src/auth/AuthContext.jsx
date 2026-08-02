import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  login as loginApi,
  register as registerApi,
  getCurrentUser,
} from '../api/userService.js'
import { config } from '../services/config.js'
import { storage } from '../services/storage.js'
import { AuthContext } from './context.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.get(config.AUTH_USER_KEY))
  const [loading, setLoading] = useState(() => Boolean(storage.get(config.AUTH_TOKEN_KEY)))

  const persistSession = useCallback((token, nextUser) => {
    if (token) storage.set(config.AUTH_TOKEN_KEY, token)
    if (nextUser) {
      storage.set(config.AUTH_USER_KEY, nextUser)
    } else {
      storage.remove(config.AUTH_USER_KEY)
      storage.remove(config.AUTH_TOKEN_KEY)
    }
    setUser(nextUser)
  }, [])

  // On mount, if a token exists, confirm it is still valid and refresh the user.
  // (When there is no token, `loading` already initializes to false.)
  useEffect(() => {
    const token = storage.get(config.AUTH_TOKEN_KEY)
    if (!token) return
    let cancelled = false
    ;(async () => {
      try {
        const fresh = await getCurrentUser()
        if (!cancelled) {
          storage.set(config.AUTH_USER_KEY, fresh)
          setUser(fresh)
        }
      } catch {
        if (!cancelled) persistSession(null, null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [persistSession])

  const login = useCallback(
    async (username, password) => {
      const { token, user: loggedIn } = await loginApi(username, password)
      persistSession(token, loggedIn)
      return loggedIn
    },
    [persistSession],
  )

  const register = useCallback(
    async (payload) => {
      const { token, user: registered } = await registerApi(payload)
      persistSession(token, registered)
      return registered
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    persistSession(null, null)
  }, [persistSession])

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
