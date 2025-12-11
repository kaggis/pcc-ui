import { useQuery } from '@tanstack/react-query'
import { APIClient } from '@/api/client'
import type { TableItem } from '@/types/common'

export const useGetDomains = () =>
  useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const response = await APIClient().get<TableItem[]>('/domains')
      return response.data
    },
  })
