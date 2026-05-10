import { defineStore } from "pinia"
import * as authApi from "../api/auth"

const TOKEN_KEY = "tokboard_access_token"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    user: null,
    accessToken: localStorage.getItem(TOKEN_KEY),
    isLoading: false,
    error: null,
  }),
  actions: {
    setSession({ user, accessToken }) {
      this.isAuthenticated = true
      this.user = user
      this.accessToken = accessToken
      localStorage.setItem(TOKEN_KEY, accessToken)
      this.error = null
    },
    clearSession() {
      this.isAuthenticated = false
      this.user = null
      this.accessToken = null
      localStorage.removeItem(TOKEN_KEY)
    },
    async login(email, password) {
      this.isLoading = true
      this.error = null

      try {
        const result = await authApi.login(email, password)
        this.setSession(result)
        return result
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async register({ email, name, password }) {
      this.isLoading = true
      this.error = null

      try {
        const result = await authApi.register(email, name, password)
        this.setSession(result)
        return result
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async restore() {
      if (!this.accessToken) return null

      try {
        const result = await authApi.me(this.accessToken)
        this.isAuthenticated = true
        this.user = result.user
        return result.user
      } catch {
        try {
          const refreshed = await authApi.refresh()
          this.setSession(refreshed)
          return refreshed.user
        } catch {
          this.clearSession()
          return null
        }
      }
    },
    async logout() {
      try {
        await authApi.logout()
      } finally {
        this.clearSession()
      }
    }
  }
})
