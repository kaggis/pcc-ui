import { AxiosError } from 'axios'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { APIClient, handleBackendError } from '@/api/client'
import type { ApiResponsePaged, Prefix, PrefixStats } from '@/types/common'

export const useGetPrefixById = ({ id }: { id?: string }) =>
  useQuery({
    queryKey: ['prefix', id],
    queryFn: async () => {
      const response = await APIClient().get<Prefix>(`/prefixes/${id}`)
      return response.data
    },
    enabled: !!id,
  })

export const useGetAllPrefixes = () => {
  return useInfiniteQuery({
    queryKey: ['prefixes'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await APIClient().get<ApiResponsePaged<Prefix>>(
        `/prefixes?page=${pageParam}`,
      )
      return response.data
    },
    getNextPageParam: (lastPage) => {
      const nextPageLink = lastPage.links.find((link) => link.rel === 'next')
      if (nextPageLink) {
        const nextPage = new URL(nextPageLink.href).searchParams.get('page')
        return nextPage ? parseInt(nextPage, 10) : undefined
      }
      return undefined
    },
  })
}

export const useGetStatisticsByPrefixId = ({ id }: { id?: string }) =>
  useQuery({
    queryKey: ['statistics', id],
    queryFn: async () => {
      const response = await APIClient().get<PrefixStats>(
        `/prefixes/${id}/statistics`,
      )
      return response.data
    },
    enabled: !!id,
  })

export function useAddPrefix() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Prefix>) => {
      return APIClient().post<Prefix>('/prefixes', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prefixes'] })
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error)
    },
  })
}

export function useUpdatePrefix() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string; payload: Partial<Prefix> }) => {
      const response = await APIClient().request<Prefix>({
        method: 'PATCH',
        url: `/prefixes/${data.id}`,
        data: data.payload,
      })
      if (response.status === 200) {
        queryClient.invalidateQueries({ queryKey: ['prefixes'] })
        queryClient.invalidateQueries({ queryKey: ['prefix', data.id] })
      }
      return response.data
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error)
    },
  })
}

export function useDeletePrefix() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await APIClient().delete(`/prefixes/${id}`)
      if (response.status === 200) {
        queryClient.invalidateQueries({ queryKey: ['prefixes'] })
        queryClient.invalidateQueries({ queryKey: ['prefix', id] })
      }
      return response.data
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error)
    },
  })
}

export function useUpdateStatisticsByPrefixId() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string; payload: Partial<PrefixStats> }) => {
      const response = await APIClient().post<PrefixStats>(
        `/prefixes/${data.id}/statistics`,
        data.payload,
      )
      if (response.status === 200) {
        queryClient.invalidateQueries({
          queryKey: ['statistics', data.id],
        })
      }
      return response.data
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error)
    },
  })
}
