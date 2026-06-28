import { Capacitor } from '@capacitor/core'

const isAndroid = Capacitor.getPlatform() === 'android'
const isProd = import.meta.env.PROD

// Use production endpoint if built for prod; otherwise fallback to local/Android IP logic
export const API = isProd
  ? '/api'
  : isAndroid 
    ? 'http://10.204.181.184:5000/api' 
    : 'http://localhost:5000/api'

export function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const combinedHeaders = {
    ...authHeaders(),
    ...(options?.headers || {}),
  }
  const res = await fetch(`${API}${path}`, { ...options, headers: combinedHeaders })
  const data = await res.json()
  if (!res.ok) {
    console.error(`[apiFetch] Request to ${path} failed:`, data.error || `Status ${res.status}`);
    throw new Error(data.error || `Error ${res.status}`)
  }
  return data as T
}
