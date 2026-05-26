import { config } from './config.js'

class StorageService {
  constructor(prefix = config.STORAGE_PREFIX) {
    this.prefix = prefix
  }

  #key(name) {
    return `${this.prefix}${name}`
  }

  get(name) {
    try {
      const raw = localStorage.getItem(this.#key(name))
      if (raw == null) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  set(name, value) {
    try {
      localStorage.setItem(this.#key(name), JSON.stringify(value))
      return true
    } catch {
      return false
    }
  }

  remove(name) {
    try {
      localStorage.removeItem(this.#key(name))
      return true
    } catch {
      return false
    }
  }
}

export const storage = new StorageService()
