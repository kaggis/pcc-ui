import { useQuery } from '@tanstack/react-query'
import { APIClient } from '@/api/client'
import type { TableItem } from '@/types/common'

export const useGetProviders = () =>
  useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await APIClient().get<TableItem[]>('/providers')
      return response.data
    },
  })
