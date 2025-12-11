import { useQuery } from '@tanstack/react-query'
import { APIClient } from '@/api/client'
import type { TableItem } from '@/types/common'

export const useGetServices = () =>
  useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await APIClient().get<TableItem[]>('/services')
      return response.data
    },
  })
