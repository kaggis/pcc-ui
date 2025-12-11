import type { ApiResponseErr } from '@/types/common'
import axios, { AxiosError } from 'axios'

const BACKEND_API = import.meta.env.VITE_API_ENDPOINT

export const APIClient = (token?: string) => {
  // if token is provided create a client with auth header
  const client = token
    ? axios.create({
        baseURL: `${BACKEND_API}`,
        headers: { Authorization: `Bearer ${token}` },
      })
    : axios.create({
        baseURL: `${BACKEND_API}`,
      })

  client.defaults.headers.common['Content-Type'] = 'application/json'
  return client
}

export function handleBackendError(error: AxiosError) {
  console.error('Backend error', error)
  if (error.response) {
    return error.response.data as ApiResponseErr
  }
}
