/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from '@tanstack/react-query'
import { APIClient, handleBackendError } from '@/api/client'
import type { AxiosError } from 'axios'

export const useGetReverseLookupTypes = () =>
  useQuery({
    queryKey: ['reverse-lookup-types'],
    queryFn: async () => {
      const response = await APIClient().get<string[]>(
        '/reverse-lookup/types',
      )
      return response.data
    },
  })

export const useGetReverseLookupFilters = () =>
  useQuery({
    queryKey: ['reverse-lookup-filters'],
    queryFn: async () => {
      const response = await APIClient().get<string[]>(
        '/reverse-lookup/filters',
      )
      return response.data
    },
  })

export function useReverseLookup() {
  return useMutation({
    mutationFn: (data: {
      pageIndex: number
      pageSize: number
      payload: any
    }) => {
      return APIClient().post(
        `/reverse-lookup?page=${data.pageIndex}&limit=${data.pageSize}`,
        data.payload,
      )
    },
    onError: (error: AxiosError) => {
      return handleBackendError(error)
    },
  })
}
